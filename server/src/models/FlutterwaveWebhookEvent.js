import mongoose from 'mongoose'

const flutterwaveWebhookEventSchema = new mongoose.Schema(
  {
    eventKey: {
      type: String,
      required: true,
      unique: true,
    },

    providerEventId: {
      type: String,
      default: null,
    },

    eventType: {
      type: String,
      default: null,
    },

    transactionId: {
      type: String,
      default: null,
    },

    txRef: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ['received', 'processing', 'processed', 'failed'],
      default: 'received',
    },

    attemptCount: {
      type: Number,
      default: 0,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    lastError: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
)

flutterwaveWebhookEventSchema.index({
  status: 1,
  updatedAt: 1,
})

export default mongoose.model(
  'FlutterwaveWebhookEvent',
  flutterwaveWebhookEventSchema
)
