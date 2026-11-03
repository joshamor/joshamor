
import mongoose from 'mongoose'
import { randomBytes } from 'node:crypto'

import Order from '../models/Order.js'
import Product from '../models/Product.js'
import GuestCart from '../models/GuestCart.js'
import InventoryLog from '../models/InventoryLog.js'
import { initializeFlutterwavePayment } from '../services/flutterwaveService.js'
import { sendOrderConfirmation } from '../services/orderEmailService.js'

function httpError(status, message, details = []) {
  const error = new Error(message)
  error.status = status
  error.details = details
  return error
}

function createSimulationReference() {
  return `SIM-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`
}

async function sendOrderConfirmationSafely(orderId) {
  try {
    const result = await sendOrderConfirmation(orderId)

    if (result.sent) return 'sent'
    if (result.inProgress) return 'sending'

    return 'pending'
  } catch (error) {
    console.error(
      `Order confirmation email failed for order ${orderId}:`,
      error.message
    )

    return 'failed'
  }
}


export const initializeFlutterwaveCheckout = async (req, res, next) => {
  const { guestCartId, orderId } = req.params

  try {
    if (
      typeof guestCartId !== 'string' ||
      guestCartId.length < 8 ||
      guestCartId.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid guest cart ID.',
      })
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.',
      })
    }

    const order = await Order.findOne({
      _id: orderId,
      guestCartId,
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
    }

    if (order.paymentStatus === 'successful') {
      return res.status(409).json({
        success: false,
        message: 'This order has already been paid.',
      })
    }

    if (order.orderStatus !== 'pending_payment') {
      return res.status(409).json({
        success: false,
        message: 'This order is not available for payment.',
      })
    }

    if (
      !Number.isFinite(order.totalAmount) ||
      order.totalAmount <= 0 ||
      order.currency !== 'NGN'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount or currency.',
      })
    }

    const now = new Date()

    // Reuse an existing, unexpired Flutterwave checkout session.
    const existingAttempt = [...order.paymentAttempts]
      .reverse()
      .find(attempt =>
        attempt.provider === 'flutterwave' &&
        attempt.status === 'initiated' &&
        attempt.checkoutUrl &&
        attempt.expiresAt &&
        attempt.expiresAt > now
      )

    if (existingAttempt) {
      return res.status(200).json({
        success: true,
        message: 'Existing Flutterwave checkout session retrieved.',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          reference: existingAttempt.reference,
          checkoutUrl: existingAttempt.checkoutUrl,
          expiresAt: existingAttempt.expiresAt,
          reused: true,
        },
      })
    }

    // If another request is currently initializing a session,
    // don't create another payment reference immediately.
    const initializingAttempt = [...order.paymentAttempts]
      .reverse()
      .find(attempt =>
        attempt.provider === 'flutterwave' &&
        attempt.status === 'initiated' &&
        !attempt.checkoutUrl &&
        attempt.initiatedAt &&
        now.getTime() - new Date(attempt.initiatedAt).getTime() < 120000
      )

    if (initializingAttempt) {
      return res.status(409).json({
        success: false,
        message: 'Payment session is being initialized. Please retry shortly.',
      })
    }

    // Expire previous incomplete checkout attempts.
    for (const attempt of order.paymentAttempts) {
      if (
        attempt.provider === 'flutterwave' &&
        attempt.status === 'initiated' &&
        attempt.expiresAt &&
        attempt.expiresAt <= now
      ) {
        attempt.status = 'cancelled'
        attempt.failureCode = 'CHECKOUT_SESSION_EXPIRED'
        attempt.failureMessage = 'Flutterwave checkout session expired.'
        attempt.completedAt = now
      }
    }

    // Each new payment attempt must receive a unique reference.
    const reference = `JA-${order.orderNumber}-${randomBytes(12)
      .toString('hex')
      .toUpperCase()}`

    const expiresAt = new Date(
      now.getTime() + 30 * 60 * 1000
    )

    // Persist the attempt before calling Flutterwave.
    order.paymentAttempts.push({
      provider: 'flutterwave',
      reference,
      amount: order.totalAmount,
      currency: order.currency,
      status: 'initiated',
      initiatedAt: now,
      expiresAt,
    })

    order.paymentStatus = 'pending'

    await order.save()

    const paymentAttempt = order.paymentAttempts.find(
      attempt => attempt.reference === reference
    )

    try {
      const checkout = await initializeFlutterwavePayment({
        amount: order.totalAmount,
        currency: order.currency,
        reference,
        customer: order.customer,
        orderNumber: order.orderNumber,
        orderId: order._id,
        guestCartId,

      })

      paymentAttempt.checkoutUrl = checkout.checkoutUrl

      await order.save()

      return res.status(201).json({
        success: true,
        message: 'Flutterwave checkout initialized successfully.',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          reference,
          checkoutUrl: checkout.checkoutUrl,
          expiresAt,
          reused: false,
        },
      })
    } catch (error) {
      paymentAttempt.status = 'failed'
      paymentAttempt.failureCode = 'INITIALIZATION_FAILED'
      paymentAttempt.failureMessage =
        error.message || 'Flutterwave initialization failed.'
      paymentAttempt.completedAt = new Date()

      // Keep the order available for another payment attempt.
      order.paymentStatus = 'failed'

      await order.save()

      console.error(
        `Flutterwave initialization failed for ${order.orderNumber}:`,
        error.message
      )

      return res.status(502).json({
        success: false,
        message: 'Unable to initialize payment. Please try again.',
      })
    }
  } catch (error) {
    next(error)
  }
}


export const simulateGuestPayment = async (req, res, next) => {
  // Simulation must never be available in production.
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.ENABLE_PAYMENT_SIMULATION !== 'true'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Payment simulation is disabled.',
    })
  }

  const { guestCartId, orderId } = req.params
  const { outcome } = req.body || {}

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order ID.',
    })
  }

  if (!['success', 'failure'].includes(outcome)) {
    return res.status(400).json({
      success: false,
      message: 'Outcome must be success or failure.',
    })
  }

  const session = await mongoose.startSession()

  let result = null

  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: orderId,
        guestCartId,
      }).session(session)

      if (!order) {
        throw httpError(404, 'Order not found.')
      }

      // Idempotency: never deduct stock twice.
      if (order.paymentStatus === 'successful') {
        result = {
          alreadyPaid: true,
          order,
        }

        return
      }

      if (order.orderStatus !== 'pending_payment') {
        throw httpError(
          409,
          'This order is no longer awaiting payment.'
        )
      }

      const reference = createSimulationReference()
      const now = new Date()

      // Simulate a failed transaction.
      if (outcome === 'failure') {
        order.paymentAttempts.push({
          provider: 'simulation',
          reference,
          amount: order.totalAmount,
          currency: order.currency,
          status: 'failed',
          simulationOutcome: 'failure',
          failureCode: 'SIMULATED_FAILURE',
          failureMessage: 'This payment was intentionally simulated as failed.',
          initiatedAt: now,
          completedAt: now,
        })

        order.paymentStatus = 'failed'

        await order.save({ session })

        result = {
          success: false,
          outcome: 'failure',
          order,
          reference,
        }

        return
      }

      // Simulated success: revalidate inventory before charging
      // the order and changing any stock.
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

      // Validate all variants before applying any deductions.
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

      if (stockIssues.length > 0) {
        order.paymentAttempts.push({
          provider: 'simulation',
          reference,
          amount: order.totalAmount,
          currency: order.currency,
          status: 'failed',
          simulationOutcome: 'failure',
          failureCode: 'INVENTORY_UNAVAILABLE',
          failureMessage: 'Inventory could not be confirmed at payment time.',
          initiatedAt: now,
          completedAt: now,
        })

        order.paymentStatus = 'failed'

        await order.save({ session })

        result = {
          success: false,
          outcome: 'inventory_failure',
          order,
          reference,
          stockIssues,
        }

        return
      }

      // All stock is available. Apply deductions.
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
          reason: `Order ${order.orderNumber} - successful payment`,
          performedBy: null,
        })
      }

      // Save each affected product within the transaction.
      for (const product of new Set(
        stockChanges.map(change => change.product)
      )) {
        await product.save({ session })
      }

      // Record every stock deduction in inventory history.
      if (inventoryLogs.length > 0) {
        await InventoryLog.create(inventoryLogs, {
          session,
          ordered: true,
        })
      }

      // Record the successful payment.
      order.paymentAttempts.push({
        provider: 'simulation',
        reference,
        amount: order.totalAmount,
        currency: order.currency,
        status: 'successful',
        simulationOutcome: 'success',
        initiatedAt: now,
        completedAt: now,
      })

      order.paymentStatus = 'successful'
      order.orderStatus = 'processing'
      order.paidAt = now

      await order.save({ session })

      // Convert the guest cart and prevent abandoned-cart reminders.
      const cart = await GuestCart.findOne({
        guestCartId,
      }).session(session)

      if (cart) {
        cart.status = 'converted'
        cart.convertedAt = now
        cart.pendingOrder = order._id

        await cart.save({ session })
      }

      result = {
        success: true,
        outcome: 'success',
        order,
        reference,
      }
    })

    if (!result) {
      throw httpError(500, 'Unable to process the simulated payment.')
    }

    if (result.alreadyPaid) {
      const confirmationEmailStatus =
        await sendOrderConfirmationSafely(result.order._id)

      return res.status(200).json({
        success: true,
        message: 'This order has already been paid.',
        data: {
          orderId: result.order._id,
          orderNumber: result.order.orderNumber,
          orderStatus: result.order.orderStatus,
          paymentStatus: result.order.paymentStatus,
          alreadyPaid: true,
          confirmationEmailStatus,
        },
      })
    }

    if (result.outcome === 'inventory_failure') {
      return res.status(409).json({
        success: false,
        message: 'Payment could not be completed because stock is no longer available.',
        data: {
          orderId: result.order._id,
          orderNumber: result.order.orderNumber,
          paymentStatus: result.order.paymentStatus,
          reference: result.reference,
          stockIssues: result.stockIssues,
        },
      })
    }

    if (result.outcome === 'failure') {
      return res.status(200).json({
        success: true,
        message: 'The simulated payment failed.',
        data: {
          orderId: result.order._id,
          orderNumber: result.order.orderNumber,
          orderStatus: result.order.orderStatus,
          paymentStatus: result.order.paymentStatus,
          reference: result.reference,
          retryAllowed: true,
        },
      })
    }

    const confirmationEmailStatus =
      await sendOrderConfirmationSafely(result.order._id)

    return res.status(200).json({
      success: true,
      message: 'Simulated payment completed successfully.',
      data: {
        orderId: result.order._id,
        orderNumber: result.order.orderNumber,
        orderStatus: result.order.orderStatus,
        paymentStatus: result.order.paymentStatus,
        reference: result.reference,
        paidAt: result.order.paidAt,
        confirmationEmailStatus,
      },
    })
  } catch (error) {
    next(error)
  } finally {
    await session.endSession()
  }
}
