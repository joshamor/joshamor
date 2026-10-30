
import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: '',
    },
  },
  { _id: false }
)

const colorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    hex: {
      type: String,
      default: '#000000',
    },
    images: [imageSchema],
  },
  { _id: false }
)

const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true }
)

const productSchema = new mongoose.Schema(
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
      required: true,
    },
    legacyId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    isPlaceholder: {
      type: Boolean,
      default: false,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: 'NGN',
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    images: [imageSchema],

    colors: [colorSchema],

    sizes: [{
      type: String,
    }],
    // Temporary compatibility field for the existing storefront.
    // Replace with stock-derived availability once real inventory is entered.
    availableSizes: [{
      type: String,
    }],
    variants: [variantSchema],

    features: [String],

    material: String,

    madeIn: String,

    care: String,

    details: [
      {
        label: String,
        value: String,
      },
    ],

    delivery: {
      heading: String,
      paragraphs: [String],
    },

    matchingProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
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
  },
  {
    timestamps: true,
  }
)

productSchema.index({ slug: 1 }, { unique: true })
productSchema.index({ category: 1, status: 1 })
productSchema.index({ publishedAt: -1, status: 1 })

export default mongoose.model('Product', productSchema)
