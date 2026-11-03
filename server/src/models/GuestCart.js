
import mongoose from 'mongoose'

const guestCartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be a whole number.',
      },
    },
  },
  { _id: false }
)

const guestCartSchema = new mongoose.Schema(
  {
    // Anonymous identifier generated and stored in localStorage.
    guestCartId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },

    emailCapturedAt: {
      type: Date,
      default: null,
    },

    // Customer must be able to opt out of abandoned-cart emails.
    abandonedEmailConsent: {
      type: Boolean,
      default: false,
    },

    items: {
      type: [guestCartItemSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ['active', 'abandoned', 'converted'],
      default: 'active',
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
    },

    checkoutStartedAt: {
      type: Date,
      default: null,
    },

    abandonedAt: {
      type: Date,
      default: null,
    },

    convertedAt: {
      type: Date,
      default: null,
    },
    pendingOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },

    reminders: {
      oneDaySentAt: {
        type: Date,
        default: null,
      },

      oneWeekSentAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
)

guestCartSchema.index({
  status: 1,
  lastActivityAt: 1,
})

guestCartSchema.index({
  email: 1,
  status: 1,
})

export default mongoose.model('GuestCart', guestCartSchema)
