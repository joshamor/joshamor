
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import Category from '../models/Category.js'

const editableFields = [
  'name',
  'slug',
  'description',
  'price',
  'currency',
  'category',
  'images',
  'colors',
  'sizes',
  'availableSizes',
  'variants',
  'features',
  'material',
  'madeIn',
  'care',
  'details',
  'delivery',
  'matchingProducts',
  'featured',
  'seo',
]

function slugify(value = '') {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function pickEditableFields(body, { creating = false } = {}) {
  const data = {}

  for (const field of editableFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = body[field]
    }
  }

  if (creating && !data.slug && data.name) {
    data.slug = slugify(data.name)
  } else if (data.slug) {
    data.slug = slugify(data.slug)
  }

  return data
}

async function validateReferences(data) {
  if (data.category !== undefined) {
    if (!mongoose.isValidObjectId(data.category)) {
      return 'Please select a valid product category.'
    }

    const categoryExists = await Category.exists({ _id: data.category })

    if (!categoryExists) {
      return 'The selected category does not exist.'
    }
  }

  if (data.matchingProducts !== undefined) {
    if (!Array.isArray(data.matchingProducts)) {
      return 'Matching products must be an array.'
    }

    const invalidId = data.matchingProducts.some(
      id => !mongoose.isValidObjectId(id)
    )

    if (invalidId) {
      return 'One or more matching product IDs are invalid.'
    }
  }

  return null
}

function handleDatabaseError(error, res) {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A product with this slug already exists.',
    })
  }

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: error.message,
    })
  }

  return res.status(500).json({
    success: false,
    message: 'Unable to save the product right now.',
  })
}

// POST /api/admin/products
export async function createProduct(req, res, next) {
  try {
    const data = pickEditableFields(req.body, { creating: true })

    const referenceError = await validateReferences(data)

    if (referenceError) {
      return res.status(400).json({
        success: false,
        message: referenceError,
      })
    }

    const product = await Product.create({
      ...data,
      status: 'draft',
      publishedAt: null,
      isPlaceholder: false,
    })

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('matchingProducts', 'name slug price images status')

    return res.status(201).json({
      success: true,
      message: 'Product created successfully as a draft.',
      data: { product: populatedProduct },
    })
  } catch (error) {
    if (error.code === 11000 || error.name === 'ValidationError' || error.name === 'CastError') {
      return handleDatabaseError(error, res)
    }

    next(error)
  }
}

// PATCH /api/admin/products/:id
export async function updateProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    const data = pickEditableFields(req.body)

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No editable product fields were provided.',
      })
    }

    const referenceError = await validateReferences(data)

    if (referenceError) {
      return res.status(400).json({
        success: false,
        message: referenceError,
      })
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('category', 'name slug')
      .populate('matchingProducts', 'name slug price images status')

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: { product },
    })
  } catch (error) {
    if (error.code === 11000 || error.name === 'ValidationError' || error.name === 'CastError') {
      return handleDatabaseError(error, res)
    }

    next(error)
  }
}
