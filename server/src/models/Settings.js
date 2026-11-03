
import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
    },

    inventory: {
      lowStockThreshold: {
        type: Number,
        required: true,
        min: 0,
        default: 5,
      },
    },
  },
  { timestamps: true }
)

export default mongoose.model('Settings', settingsSchema)
