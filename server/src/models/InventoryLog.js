
import mongoose from 'mongoose'

const inventoryLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
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

    color: {
      type: String,
      required: true,
    },

    size: {
      type: String,
      required: true,
    },

    operation: {
      type: String,
      enum: ['set', 'adjust'],
      required: true,
    },

    previousStock: {
      type: Number,
      required: true,
      min: 0,
    },

    change: {
      type: Number,
      required: true,
    },

    newStock: {
      type: Number,
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    // We'll populate this with the authenticated admin's ID.
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

inventoryLogSchema.index({ product: 1, createdAt: -1 })
inventoryLogSchema.index({ variantId: 1, createdAt: -1 })

export default mongoose.model('InventoryLog', inventoryLogSchema)
