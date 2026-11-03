
import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
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

    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      required: true,
    },

    size: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: '',
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isInteger,
    },

    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
)

const paymentAttemptSchema = new mongoose.Schema(
  {
    // Simulation now; Flutterwave when real payments are enabled.
    provider: {
      type: String,
      enum: ['simulation', 'flutterwave'],
      required: true,
    },

    // Server-generated reference. For Flutterwave,
    // this will also be sent as tx_ref.
    reference: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        'initiated',
        'successful',
        'failed',
        'cancelled',
      ],
      default: 'initiated',
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: 'NGN',
    },

    // Flutterwave transaction identifiers.
    providerTransactionId: {
      type: String,
      default: null,
    },

    providerReference: {
      type: String,
      default: null,
    },

    paymentMethod: {
      type: String,
      default: null,
    },
    checkoutUrl: {
      type: String,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
    chargedAmount: {
      type: Number,
      default: null,
      min: 0,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    requiresRefund: {
      type: Boolean,
      default: false,
    },

    // Used only by the development payment simulator.
    simulationOutcome: {
      type: String,
      enum: ['success', 'failure', null],
      default: null,
    },

    failureCode: {
      type: String,
      default: null,
    },

    failureMessage: {
      type: String,
      default: null,
    },

    initiatedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Links this order back to its anonymous cart.
    guestCartId: {
      type: String,
      required: true,
      index: true,
    },

    customer: {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      firstName: {
        type: String,
        required: true,
        trim: true,
      },

      lastName: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    shippingAddress: {
      country: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      apartment: {
        type: String,
        default: '',
      },

      postalCode: {
        type: String,
        default: '',
      },
    },

    shipping: {
      method: {
        type: String,
        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      amount: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: items => items.length > 0,
        message: 'An order must contain at least one item.',
      },
    },

    // All monetary values are calculated by the backend.
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: 'NGN',
      uppercase: true,
    },
    termsAcceptedAt: {
      type: Date,
      required: true,
    },

    orderStatus: {
      type: String,
      enum: [
        'pending_payment',
        'processing',
        'fulfilled',
        'cancelled',
        'abandoned',
        'payment_review',
      ],
      default: 'pending_payment',
    },

    paymentStatus: {
      type: String,
      enum: [
        'pending',
        'successful',
        'failed',
        'refunded',
      ],
      default: 'pending',
    },

    // Keep every attempt so failed payments can be retried.
    paymentAttempts: {
      type: [paymentAttemptSchema],
      default: [],
    },

    paidAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    abandonedAt: {
      type: Date,
      default: null,
    },

    internalNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

// Admin order listings and customer order lookup.
orderSchema.index({
  'customer.email': 1,
  createdAt: -1,
})

orderSchema.index({
  orderStatus: 1,
  paymentStatus: 1,
  createdAt: -1,
})

export default mongoose.model('Order', orderSchema)
