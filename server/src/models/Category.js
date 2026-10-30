
import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
    },

    seo: {
      title: {
        type: String,
        default: '',
      },
      description: {
        type: String,
        default: '',
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

categorySchema.index({ slug: 1 }, { unique: true })

export default mongoose.model('Category', categorySchema)
