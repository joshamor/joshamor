
import mongoose from 'mongoose'


const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  publicId: {
    type: String,
    default: null,
  },
  width: {
    type: Number,
    default: null,
  },
  height: {
    type: Number,
    default: null,
  },
  format: {
    type: String,
    default: '',
  },
}, { _id: false })


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


const variantSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  color: {
    type: String,
    required: true,
    trim: true,
  },
  size: {
    type: String,
    required: true,
    trim: true,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: 'Stock must be a whole number.',
    },
  },
}, { _id: true })



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
      required: function () {
        return this.status === 'published'
      },
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
      min: 0,
      required: function () {
        return this.status === 'published'
      },
    },

    currency: {
      type: String,
      default: 'NGN',
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: function () {
        return this.status === 'published'
      },
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
    lowStockThreshold: {
      type: Number,
      min: 0,
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
