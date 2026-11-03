
import mongoose from 'mongoose'

import Order from '../models/Order.js'
import Product from '../models/Product.js'
import GuestCart from '../models/GuestCart.js'
import InventoryLog from '../models/InventoryLog.js'

function httpError(status, message, details = []) {
  const error = new Error(message)
  error.status = status
  error.details = details
  return error
}

export async function finalizeFlutterwavePayment({
  orderId,
  guestCartId,
  txRef,
  transaction,
}) {
  const session = await mongoose.startSession()

  let outcome = null

  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: orderId,
        guestCartId,
      }).session(session)

      if (!order) {
        throw httpError(404, 'Order not found.')
      }

      const attempt = order.paymentAttempts.find(
        item =>
          item.provider === 'flutterwave' &&
          item.reference === txRef
      )

      if (!attempt) {
        throw httpError(404, 'Flutterwave payment attempt not found.')
      }

      // Independently validate the verified transaction.
      if (
        transaction.tx_ref !== attempt.reference ||
        transaction.status !== 'successful'
      ) {
        throw httpError(
          400,
          'Flutterwave transaction does not match the payment attempt.'
        )
      }

      const verifiedAmount = Number(transaction.amount)
      const expectedAmount = Number(attempt.amount)

      if (
        !Number.isFinite(verifiedAmount) ||
        verifiedAmount + 0.01 < expectedAmount
      ) {
        throw httpError(400, 'Verified payment amount is insufficient.')
      }

      const verifiedCurrency = String(
        transaction.currency || ''
      ).toUpperCase()

      if (
        verifiedCurrency !== attempt.currency ||
        verifiedCurrency !== order.currency
      ) {
        throw httpError(400, 'Verified payment currency does not match the order.')
      }

      const now = new Date()
      const transactionId = String(transaction.id)

      // Same transaction already finalized.
      if (
        attempt.status === 'successful' &&
        order.paymentStatus === 'successful' &&
        attempt.providerTransactionId === transactionId
      ) {
        outcome = {
          type: 'already_finalized',
          order,
        }

        return
      }

      // A different attempt has already paid for this order.
      // Record the second capture and flag it for a refund.
      if (order.paymentStatus === 'successful') {
        attempt.status = 'successful'
        attempt.providerTransactionId = transactionId
        attempt.providerReference = transaction.flw_ref || null
        attempt.paymentMethod = transaction.payment_type || null
        attempt.chargedAmount = verifiedAmount
        attempt.verifiedAt = now
        attempt.completedAt = now
        attempt.requiresRefund = true

        order.internalNotes = [
          order.internalNotes,
          `Potential duplicate Flutterwave payment requires refund review. Reference: ${txRef}`,
        ].filter(Boolean).join('\n')

        await order.save({ session })

        outcome = {
          type: 'duplicate_payment',
          order,
        }

        return
      }

      // Only pending or previously abandoned orders can
      // normally proceed through payment finalization.
      if (
        !['pending_payment', 'abandoned'].includes(order.orderStatus)
      ) {
        // Payment has been captured, but the order cannot be fulfilled.
        attempt.status = 'successful'
        attempt.providerTransactionId = transactionId
        attempt.providerReference = transaction.flw_ref || null
        attempt.paymentMethod = transaction.payment_type || null
        attempt.chargedAmount = verifiedAmount
        attempt.verifiedAt = now
        attempt.completedAt = now
        attempt.requiresRefund = true

        order.paymentStatus = 'successful'
        order.orderStatus = 'payment_review'
        order.paidAt = now

        order.internalNotes = [
          order.internalNotes,
          `Verified Flutterwave payment requires manual order review. Reference: ${txRef}`,
        ].filter(Boolean).join('\n')

        const cart = await GuestCart.findOne({
          guestCartId,
        }).session(session)

        if (cart) {
          cart.status = 'converted'
          cart.convertedAt = now
          cart.pendingOrder = order._id
          await cart.save({ session })
        }

        await order.save({ session })

        outcome = {
          type: 'payment_review',
          order,
        }

        return
      }

      // Retrieve products associated with the order.
      const productIds = [
        ...new Set(
          order.items.map(item => item.product.toString())
        ),
      ]

      const products = await Product.find({
        _id: { $in: productIds },
      }).session(session)

      const productMap = new Map(
        products.map(product => [
          product._id.toString(),
          product,
        ])
      )

      const stockIssues = []
      const stockChanges = []

      // Validate all variants before deducting anything.
      for (const item of order.items) {
        const product = productMap.get(
          item.product.toString()
        )

        const variant = product?.variants.id(item.variantId)

        if (!product || !variant) {
          stockIssues.push({
            productId: item.product,
            variantId: item.variantId,
            reason: 'variant_unavailable',
          })

          continue
        }

        if (variant.stock < item.quantity) {
          stockIssues.push({
            productId: item.product,
            variantId: item.variantId,
            sku: variant.sku,
            requested: item.quantity,
            available: variant.stock,
            reason: 'insufficient_stock',
          })

          continue
        }

        stockChanges.push({
          product,
          variant,
          quantity: item.quantity,
          previousStock: variant.stock,
        })
      }

      // Flutterwave has already captured payment.
      // Never describe this as a failed payment.
      if (stockIssues.length > 0) {
        attempt.status = 'successful'
        attempt.providerTransactionId = transactionId
        attempt.providerReference = transaction.flw_ref || null
        attempt.paymentMethod = transaction.payment_type || null
        attempt.chargedAmount = verifiedAmount
        attempt.verifiedAt = now
        attempt.completedAt = now
        attempt.requiresRefund = true
        attempt.failureCode = 'INVENTORY_UNAVAILABLE_AFTER_PAYMENT'

        order.paymentStatus = 'successful'
        order.orderStatus = 'payment_review'
        order.paidAt = now

        order.internalNotes = [
          order.internalNotes,
          `Payment captured but inventory allocation failed. Refund or manual fulfilment review required. Reference: ${txRef}`,
        ].filter(Boolean).join('\n')

        const cart = await GuestCart.findOne({
          guestCartId,
        }).session(session)

        if (cart) {
          cart.status = 'converted'
          cart.convertedAt = now
          cart.pendingOrder = order._id
          await cart.save({ session })
        }

        await order.save({ session })

        outcome = {
          type: 'inventory_review',
          order,
          stockIssues,
        }

        return
      }

      // Stock is available. Apply all deductions atomically.
      const inventoryLogs = []

      for (const change of stockChanges) {
        const {
          product,
          variant,
          quantity,
          previousStock,
        } = change

        const newStock = previousStock - quantity

        variant.stock = newStock

        inventoryLogs.push({
          product: product._id,
          variantId: variant._id,
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          operation: 'adjust',
          previousStock,
          change: -quantity,
          newStock,
          reason: `Order ${order.orderNumber} - Flutterwave payment`,
          performedBy: null,
        })
      }

      const uniqueProducts = [
        ...new Map(
          stockChanges.map(change => [
            change.product._id.toString(),
            change.product,
          ])
        ).values(),
      ]

      for (const product of uniqueProducts) {
        await product.save({ session })
      }

      if (inventoryLogs.length > 0) {
        await InventoryLog.create(inventoryLogs, {
          session,
          ordered: true,
        })
      }

      // Record verified payment information.
      attempt.status = 'successful'
      attempt.providerTransactionId = transactionId
      attempt.providerReference = transaction.flw_ref || null
      attempt.paymentMethod = transaction.payment_type || null
      attempt.chargedAmount = verifiedAmount
      attempt.verifiedAt = now
      attempt.completedAt = now
      attempt.requiresRefund = false
      attempt.failureCode = null
      attempt.failureMessage = null

      // Finalize order.
      order.paymentStatus = 'successful'
      order.orderStatus = 'processing'
      order.paidAt = now

      // Convert the guest cart to stop abandoned-cart reminders.
      const cart = await GuestCart.findOne({
        guestCartId,
      }).session(session)

      if (cart) {
        cart.status = 'converted'
        cart.convertedAt = now
        cart.pendingOrder = order._id
        await cart.save({ session })
      }

      await order.save({ session })

      outcome = {
        type: 'success',
        order,
      }
    })

    if (!outcome) {
      throw httpError(500, 'Unable to finalize the payment.')
    }

    return outcome
  } finally {
    await session.endSession()
  }
}
