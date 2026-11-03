
import mongoose from 'mongoose'

const emailLogSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        'order_confirmation',
        'payment_failed',
        'abandoned_cart_one_day',
        'abandoned_cart_one_week',
      ],
    },

    subject: {
      type: String,
      required: true,
    },

    provider: {
      type: String,
      enum: ['resend'],
      default: 'resend',
    },

    status: {
      type: String,
      enum: ['queued', 'sending', 'sent', 'failed'],
      default: 'queued',
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },

    guestCart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GuestCart',
      default: null,
    },

    providerEmailId: {
      type: String,
      default: null,
    },

    // Unique logical key to prevent duplicate emails.
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    attemptCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastError: {
      type: String,
      default: null,
    },

    sentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

emailLogSchema.index({ recipient: 1, createdAt: -1 })
emailLogSchema.index({ status: 1, createdAt: 1 })
emailLogSchema.index({ order: 1, type: 1 })
emailLogSchema.index({ guestCart: 1, type: 1 })

export default mongoose.model('EmailLog', emailLogSchema)
