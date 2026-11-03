
import GuestCart from '../models/GuestCart.js'
import Order from '../models/Order.js'
import mongoose from 'mongoose'

import { sendAbandonedCartReminder } from './abandonedCartEmailService.js'

// Configuration is stored in environment variables.
// Production defaults: first reminder after 24 hours,
// second reminder 7 days after the first reminder.
const SCAN_INTERVAL_MS = Number(
  process.env.ABANDONED_CART_SCAN_INTERVAL_MS || 300000
)

const INACTIVE_MINUTES = Number(
  process.env.ABANDONED_CART_INACTIVE_MINUTES || 1440
)

const SECOND_REMINDER_DELAY_MINUTES = Number(
  process.env.ABANDONED_CART_SECOND_REMINDER_DELAY_MINUTES || 10080
)

const BATCH_SIZE = Number(
  process.env.ABANDONED_CART_BATCH_SIZE || 50
)

let intervalId = null
let isRunning = false

function validateConfig() {
  const valid =
    Number.isFinite(SCAN_INTERVAL_MS) &&
    SCAN_INTERVAL_MS >= 10000 &&
    Number.isFinite(INACTIVE_MINUTES) &&
    INACTIVE_MINUTES > 0 &&
    Number.isFinite(SECOND_REMINDER_DELAY_MINUTES) &&
    SECOND_REMINDER_DELAY_MINUTES > 0 &&
    Number.isInteger(BATCH_SIZE) &&
    BATCH_SIZE > 0

  if (!valid) {
    throw new Error('Invalid abandoned-cart scheduler configuration.')
  }
}

async function markInactiveCartsAbandoned(now, inactiveCutoff) {
  const candidates = await GuestCart.find({
    status: 'active',
    'items.0': { $exists: true },
    lastActivityAt: { $lte: inactiveCutoff },
  })
    .select('_id lastActivityAt pendingOrder')
    .sort({ lastActivityAt: 1 })
    .limit(BATCH_SIZE)
    .lean()

  let markedCount = 0

  for (const candidate of candidates) {
    try {
      // Only update the cart if it has not received new activity
      // since we selected it.
      const abandonedCart = await GuestCart.findOneAndUpdate(
        {
          _id: candidate._id,
          status: 'active',
          lastActivityAt: candidate.lastActivityAt,
          'items.0': { $exists: true },
        },
        {
          $set: {
            status: 'abandoned',
            abandonedAt: candidate.lastActivityAt || now,
          },
        },
        { new: true }
      )

      if (!abandonedCart) continue

      markedCount += 1

      // Close any checkout order that is still awaiting payment.
      // Successful orders are never changed.
      if (abandonedCart.pendingOrder) {
        await Order.updateOne(
          {
            _id: abandonedCart.pendingOrder,
            orderStatus: 'pending_payment',
            paymentStatus: { $ne: 'successful' },
          },
          {
            $set: {
              orderStatus: 'abandoned',
              abandonedAt: abandonedCart.abandonedAt || now,
            },
          }
        )
      }
    } catch (error) {
      console.error(
        `Failed to mark guest cart ${candidate._id} as abandoned:`,
        error.message
      )
    }
  }

  return markedCount
}

async function processFirstReminders(now, inactiveCutoff) {
  const carts = await GuestCart.find({
    status: 'abandoned',
    email: { $type: 'string', $ne: '' },
    abandonedEmailConsent: true,
    'items.0': { $exists: true },
    lastActivityAt: { $lte: inactiveCutoff },
    'reminders.oneDaySentAt': null,
  })
    .sort({ abandonedAt: 1 })
    .limit(BATCH_SIZE)
    .select('_id')
    .lean()

  let sentCount = 0
  let failedCount = 0

  for (const cart of carts) {
    try {
      const result = await sendAbandonedCartReminder(
        cart._id,
        'abandoned_cart_one_day'
      )

      if (result.sent) sentCount += 1
    } catch (error) {
      failedCount += 1

      console.error(
        `First abandoned-cart reminder failed for ${cart._id}:`,
        error.message
      )
    }
  }

  return { sentCount, failedCount }
}

async function processSecondReminders(now) {
  const secondReminderCutoff = new Date(
    now.getTime() -
    SECOND_REMINDER_DELAY_MINUTES * 60 * 1000
  )

  const carts = await GuestCart.find({
    status: 'abandoned',
    email: { $type: 'string', $ne: '' },
    abandonedEmailConsent: true,
    'items.0': { $exists: true },
    'reminders.oneDaySentAt': {
      $ne: null,
      $lte: secondReminderCutoff,
    },
    'reminders.oneWeekSentAt': null,
  })
    .sort({ 'reminders.oneDaySentAt': 1 })
    .limit(BATCH_SIZE)
    .select('_id')
    .lean()

  let sentCount = 0
  let failedCount = 0

  for (const cart of carts) {
    try {
      const result = await sendAbandonedCartReminder(
        cart._id,
        'abandoned_cart_one_week'
      )

      if (result.sent) sentCount += 1
    } catch (error) {
      failedCount += 1

      console.error(
        `Second abandoned-cart reminder failed for ${cart._id}:`,
        error.message
      )
    }
  }

  return { sentCount, failedCount }
}

export async function runAbandonedCartSweep() {
  if (mongoose.connection.readyState !== 1) {
    console.warn(
      '[Abandoned Cart Scheduler] Skipped: MongoDB is not connected.'
    )

    return {
      skipped: true,
      reason: 'MongoDB is not connected.',
    }
  }
  if (isRunning) {
    return {
      skipped: true,
      reason: 'A previous scheduler run is still active.',
    }
  }

  isRunning = true

  try {
    const now = new Date()

    const inactiveCutoff = new Date(
      now.getTime() -
      INACTIVE_MINUTES * 60 * 1000
    )

    const abandonedCount = await markInactiveCartsAbandoned(
      now,
      inactiveCutoff
    )

    const firstReminderResults = await processFirstReminders(
      now,
      inactiveCutoff
    )

    const secondReminderResults = await processSecondReminders(now)

    const summary = {
      abandonedCount,
      firstRemindersSent: firstReminderResults.sentCount,
      firstRemindersFailed: firstReminderResults.failedCount,
      secondRemindersSent: secondReminderResults.sentCount,
      secondRemindersFailed: secondReminderResults.failedCount,
    }


    return summary
  } catch (error) {
    console.error(
      '[Abandoned Cart Scheduler] Sweep failed:',
      error
    )

    throw error
  } finally {
    isRunning = false
  }
}

export function startAbandonedCartScheduler() {
  if (intervalId) {

    return
  }

  validateConfig()



  // Run once immediately when the server starts.
  runAbandonedCartSweep().catch(error => {
    console.error(
      '[Abandoned Cart Scheduler] Initial run failed:',
      error.message
    )
  })

  intervalId = setInterval(() => {
    runAbandonedCartSweep().catch(error => {
      console.error(
        '[Abandoned Cart Scheduler] Scheduled run failed:',
        error.message
      )
    })
  }, SCAN_INTERVAL_MS)

  // Allow the Node.js process to exit normally during shutdown.
  intervalId.unref?.()
}

export function stopAbandonedCartScheduler() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
