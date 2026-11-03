
import crypto from 'node:crypto'

import Order from '../models/Order.js'
import FlutterwaveWebhookEvent from '../models/FlutterwaveWebhookEvent.js'

import {
  verifyFlutterwaveTransaction,
} from '../services/flutterwaveService.js'

import {
  finalizeFlutterwavePayment,
} from '../services/paymentFinalizationService.js'

import {
  sendOrderConfirmation,
} from '../services/orderEmailService.js'

function safeCompare(valueA, valueB) {
  if (
    typeof valueA !== 'string' ||
    typeof valueB !== 'string' ||
    !valueA ||
    !valueB
  ) {
    return false
  }

  const bufferA = Buffer.from(valueA)
  const bufferB = Buffer.from(valueB)

  return (
    bufferA.length === bufferB.length &&
    crypto.timingSafeEqual(bufferA, bufferB)
  )
}

function verifyWebhookSignature(req) {
  const secretHash = process.env.FLW_SECRET_HASH

  if (!secretHash) {
    return false
  }

  // Flutterwave v3: compare the configured secret hash.
  const legacySignature = req.get('verif-hash')

  if (legacySignature) {
    return safeCompare(legacySignature, secretHash)
  }

  // HMAC-SHA256 format used by newer webhook integrations.
  const signature = req.get('flutterwave-signature')

  if (!signature || !Buffer.isBuffer(req.rawBody)) {
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', secretHash)
    .update(req.rawBody)
    .digest('base64')

  return safeCompare(signature, expectedSignature)
}

async function sendConfirmationSafely(orderId) {
  try {
    return await sendOrderConfirmation(orderId)
  } catch (error) {
    console.error(
      `Webhook order confirmation email failed for ${orderId}:`,
      error.message
    )

    // Email failure must not cause Flutterwave to retry
    // an already completed payment.
    return {
      sent: false,
      error: error.message,
    }
  }
}

async function markEventProcessed(eventRecord) {
  await FlutterwaveWebhookEvent.findByIdAndUpdate(
    eventRecord._id,
    {
      $set: {
        status: 'processed',
        processedAt: new Date(),
        lastError: null,
      },
    }
  )
}

export const handleFlutterwaveWebhook = async (req, res) => {
  // Reject requests without a valid Flutterwave signature.
  if (!verifyWebhookSignature(req)) {
    console.warn(
      '[Flutterwave Webhook] Signature verification failed.'
    )

    return res.status(401).json({
      success: false,
      message: 'Invalid Flutterwave webhook signature.',
    })
  }

  const payload = req.body || {}
  const eventType = payload.event || payload.type || 'unknown'
  const data = payload.data || {}

  const transactionId = data.id
    ? String(data.id)
    : null

  const txRef = typeof data.tx_ref === 'string'
    ? data.tx_ref.trim()
    : null

  // Use the transaction and status to identify a unique delivery.
  const eventKey = crypto
    .createHash('sha256')
    .update(
      `${eventType}:${transactionId || ''}:${data.status || ''}:${txRef || ''}`
    )
    .digest('hex')

  let eventRecord

  try {
    try {
      eventRecord = await FlutterwaveWebhookEvent.create({
        eventKey,
        providerEventId: transactionId,
        eventType,
        transactionId,
        txRef,
        status: 'received',
      })
    } catch (error) {
      if (error.code !== 11000) {
        throw error
      }

      eventRecord = await FlutterwaveWebhookEvent.findOne({
        eventKey,
      })
    }

    if (!eventRecord) {
      throw new Error('Unable to record Flutterwave webhook event.')
    }

    // A previously processed delivery must not run again.
    if (eventRecord.status === 'processed') {
      return res.sendStatus(200)
    }

    // Do not process an event already being handled by
    // another request, unless its processing lock is stale.
    const staleBefore = new Date(Date.now() - 2 * 60 * 1000)

    const claimedEvent = await FlutterwaveWebhookEvent.findOneAndUpdate(
      {
        _id: eventRecord._id,
        $or: [
          { status: { $in: ['received', 'failed'] } },
          {
            status: 'processing',
            updatedAt: { $lt: staleBefore },
          },
        ],
      },
      {
        $set: {
          status: 'processing',
          lastError: null,
        },
        $inc: {
          attemptCount: 1,
        },
      },
      { new: true }
    )

    if (!claimedEvent) {
      // Another worker is processing it.
      // Acknowledge this duplicate delivery.
      return res.sendStatus(200)
    }

    // We only process completed payment events here.
    // Other Flutterwave event types are acknowledged and ignored.
    if (eventType !== 'charge.completed') {
      await markEventProcessed(claimedEvent)
      return res.sendStatus(200)
    }

    if (!transactionId || !/^\d+$/.test(transactionId) || !txRef) {
      await markEventProcessed(claimedEvent)
      return res.sendStatus(200)
    }

    // Find the exact order and payment attempt.
    const order = await Order.findOne({
      paymentAttempts: {
        $elemMatch: {
          provider: 'flutterwave',
          reference: txRef,
        },
      },
    }).select('_id guestCartId')

    // This may be an unrelated transaction from the account.
    if (!order) {
      await markEventProcessed(claimedEvent)
      return res.sendStatus(200)
    }

    // Do not trust the webhook payload as payment proof.
    // Retrieve the authoritative transaction directly from Flutterwave.
    const transaction = await verifyFlutterwaveTransaction(
      transactionId
    )

    // Ensure the verified transaction matches the webhook
    // and the saved payment attempt.
    if (
      String(transaction.id) !== transactionId ||
      transaction.tx_ref !== txRef
    ) {
      throw new Error(
        'Verified transaction does not match the webhook event.'
      )
    }

    const transactionStatus = String(
      transaction.status || ''
    ).toLowerCase()

    if (transactionStatus === 'successful') {
      const finalization = await finalizeFlutterwavePayment({
        orderId: order._id,
        guestCartId: order.guestCartId,
        txRef,
        transaction,
      })

      // Only a properly fulfilled order needs the normal
      // customer order confirmation.
      if (
        finalization.type === 'success' ||
        finalization.type === 'already_finalized'
      ) {
        await sendConfirmationSafely(order._id)
      }

      // Payment review cases are recorded for admin action.
      if (
        finalization.type === 'inventory_review' ||
        finalization.type === 'duplicate_payment'
      ) {
        console.error(
          `Flutterwave payment requires manual review: ${order._id}`,
          finalization.type
        )
      }
    } else if (
      transactionStatus === 'failed' ||
      transactionStatus === 'cancelled'
    ) {
      const currentOrder = await Order.findById(order._id)

      if (currentOrder) {
        const attempt = currentOrder.paymentAttempts.find(
          item =>
            item.provider === 'flutterwave' &&
            item.reference === txRef
        )

        if (attempt && currentOrder.paymentStatus !== 'successful') {
          attempt.status = transactionStatus === 'cancelled'
            ? 'cancelled'
            : 'failed'

          attempt.providerTransactionId = transactionId
          attempt.providerReference = transaction.flw_ref || null
          attempt.paymentMethod = transaction.payment_type || null
          attempt.verifiedAt = new Date()
          attempt.completedAt = new Date()

          attempt.failureCode =
            transactionStatus === 'cancelled'
              ? 'CUSTOMER_CANCELLED'
              : 'FLUTTERWAVE_PAYMENT_FAILED'

          attempt.failureMessage =
            transaction.processor_response ||
            `Flutterwave transaction ${transactionStatus}.`

          currentOrder.paymentStatus = 'failed'

          await currentOrder.save()
        }
      }
    }

    // Pending transactions are acknowledged without changing
    // payment status or inventory.
    await markEventProcessed(claimedEvent)

    return res.sendStatus(200)
  } catch (error) {
    console.error(
      '[Flutterwave Webhook] Processing failed:',
      error
    )

    if (eventRecord?._id) {
      await FlutterwaveWebhookEvent.findByIdAndUpdate(
        eventRecord._id,
        {
          $set: {
            status: 'failed',
            lastError: error.message || 'Webhook processing failed.',
          },
        }
      ).catch(logError => {
        console.error(
          'Unable to update webhook event:',
          logError.message
        )
      })
    }

    // A non-200 response allows Flutterwave to retry
    // according to its webhook retry configuration.
    return res.status(500).json({
      success: false,
      message: 'Webhook processing failed.',
    })
  }
}
