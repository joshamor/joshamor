
import mongoose from 'mongoose'

import Order from '../models/Order.js'

import {
  verifyFlutterwaveTransaction,
  verifyFlutterwaveTransactionByReference,
} from '../services/flutterwaveService.js'

import {
  finalizeFlutterwavePayment,
} from '../services/paymentFinalizationService.js'

import {
  sendOrderConfirmation,
} from '../services/orderEmailService.js'

async function sendConfirmationSafely(orderId) {
  try {
    const result = await sendOrderConfirmation(orderId)

    if (result.sent) return 'sent'
    if (result.inProgress) return 'sending'

    return 'pending'
  } catch (error) {
    console.error(
      `Order confirmation email failed for ${orderId}:`,
      error.message
    )

    return 'failed'
  }
}

export const verifyGuestFlutterwavePayment = async (
  req,
  res,
  next
) => {
  try {
    const { guestCartId, orderId } = req.params

    const { transactionId, txRef } = req.body || {}


    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      typeof guestCartId !== 'string' ||
      guestCartId.length < 8 ||
      guestCartId.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order or guest cart ID.',
      })
    }

    if (
      typeof txRef !== 'string' ||
      !txRef.trim() ||
      txRef.length > 200
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid payment reference is required.',
      })
    }

    if (
      transactionId !== undefined &&
      transactionId !== null &&
      !/^\d+$/.test(String(transactionId))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Flutterwave transaction ID.',
      })
    }

    // Confirm that this order belongs to this guest cart.
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

    // Confirm that the reference belongs to a saved
    // Flutterwave payment attempt on this order.
    const attempt = order.paymentAttempts.find(
      item =>
        item.provider === 'flutterwave' &&
        item.reference === txRef.trim()
    )

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Flutterwave payment attempt not found.',
      })
    }

    // Retrieve the authoritative transaction from Flutterwave.
    const transaction = transactionId
      ? await verifyFlutterwaveTransaction(transactionId)
      : await verifyFlutterwaveTransactionByReference(
          txRef.trim()
        )

    // Validate transaction identity.
    if (
      transaction.tx_ref !== attempt.reference ||
      (
        transactionId &&
        String(transaction.id) !== String(transactionId)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Flutterwave transaction does not match this order.',
      })
    }

    const status = String(
      transaction.status || ''
    ).toLowerCase()

    // Handle successful payment.
    if (status === 'successful') {
      if (!transaction.id) {
        return res.status(400).json({
          success: false,
          message: 'Flutterwave did not return a valid transaction ID.',
        })
      }

      const finalization = await finalizeFlutterwavePayment({
        orderId: order._id,
        guestCartId,
        txRef: attempt.reference,
        transaction,
      })

      // The transaction has been verified and finalized.
      // Now send the confirmation outside the MongoDB transaction.
      if (
        finalization.type === 'success' ||
        finalization.type === 'already_finalized'
      ) {
        const confirmationEmailStatus =
          await sendConfirmationSafely(order._id)

        return res.status(200).json({
          success: true,
          message: 'Payment successfully verified.',
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            orderStatus: finalization.order.orderStatus,
            paymentStatus: finalization.order.paymentStatus,
            paidAt: finalization.order.paidAt,
            confirmationEmailStatus,
            alreadyFinalized:
              finalization.type === 'already_finalized',
          },
        })
      }

      // Payment succeeded, but the order needs administrative review.
      return res.status(200).json({
        success: true,
        message: 'Payment received. Your order requires additional review.',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          orderStatus: finalization.order.orderStatus,
          paymentStatus: finalization.order.paymentStatus,
          requiresManualReview: true,
          requiresRefund:
            finalization.type === 'duplicate_payment' ||
            finalization.type === 'inventory_review',
          stockIssues: finalization.stockIssues || [],
        },
      })
    }

    // Handle failed, cancelled and pending transactions.
    const now = new Date()

    if (status === 'failed' || status === 'cancelled') {
      attempt.status = status === 'cancelled'
        ? 'cancelled'
        : 'failed'

      attempt.providerTransactionId = transaction.id
        ? String(transaction.id)
        : null

      attempt.providerReference = transaction.flw_ref || null
      attempt.paymentMethod = transaction.payment_type || null
      attempt.chargedAmount = Number.isFinite(
        Number(transaction.charged_amount)
      )
        ? Number(transaction.charged_amount)
        : null

      attempt.verifiedAt = now
      attempt.completedAt = now

      attempt.failureCode =
        status === 'cancelled'
          ? 'CUSTOMER_CANCELLED'
          : 'FLUTTERWAVE_PAYMENT_FAILED'

      attempt.failureMessage =
        transaction.processor_response ||
        `Flutterwave transaction ${status}.`

      if (order.paymentStatus !== 'successful') {
        order.paymentStatus = 'failed'
      }

      await order.save()

      return res.status(200).json({
        success: true,
        message: status === 'cancelled'
          ? 'Payment was cancelled.'
          : 'Payment was unsuccessful.',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          attemptStatus: attempt.status,
          retryAllowed:
            order.orderStatus === 'pending_payment' &&
            order.paymentStatus !== 'successful',
        },
      })
    }

    // The transaction is still pending or has an unknown state.
    // Never deduct inventory until its status is successful.
    return res.status(200).json({
      success: true,
      message: 'Payment is still being processed.',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        attemptStatus: 'initiated',
        retryAllowed: false,
      },
    })
  } catch (error) {
    next(error)
  }
}
