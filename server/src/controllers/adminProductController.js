
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


// Check whether a product has the minimum information required to publish.
function getPublishingErrors(product) {
  const errors = []

  if (!product.name?.trim()) {
    errors.push('Product name is required.')
  }

  if (!product.slug?.trim()) {
    errors.push('Product slug is required.')
  }

  if (!product.description?.trim()) {
    errors.push('Product description is required.')
  }

  if (typeof product.price !== 'number' || product.price <= 0) {
    errors.push('Product price must be greater than zero.')
  }

  if (!product.category) {
    errors.push('A product category is required.')
  }

  if (!product.images?.length) {
    errors.push('At least one product image is required.')
  }

  if (!product.images?.some(image => image?.url?.trim())) {
    errors.push('At least one valid product image URL is required.')
  }

  if (!product.colors?.length) {
    errors.push('At least one product colour is required.')
  }

  if (!product.sizes?.length) {
    errors.push('At least one product size is required.')
  }

  if (product.isPlaceholder) {
    errors.push('Placeholder products cannot be published.')
  }

  return errors
}

// PATCH /api/admin/products/:id/publish
export async function publishProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    if (product.status === 'archived') {
      return res.status(400).json({
        success: false,
        message: 'Restore this product to draft before publishing it.',
      })
    }

    const errors = getPublishingErrors(product)

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'This product is not ready to be published.',
        errors,
      })
    }

    // Only assign publishedAt the first time the product is published.
    if (!product.publishedAt) {
      product.publishedAt = new Date()
    }

    product.status = 'published'
    await product.save()

    return res.status(200).json({
      success: true,
      message: 'Product published successfully.',
      data: { product },
    })
  } catch (error) {
    next(error)
  }
}

// PATCH /api/admin/products/:id/unpublish
export async function unpublishProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    if (product.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Only published products can be unpublished.',
      })
    }

    product.status = 'draft'
    await product.save()

    return res.status(200).json({
      success: true,
      message: 'Product unpublished successfully.',
      data: { product },
    })
  } catch (error) {
    next(error)
  }
}

// PATCH /api/admin/products/:id/archive
export async function archiveProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    product.status = 'archived'
    await product.save()

    return res.status(200).json({
      success: true,
      message: 'Product archived successfully.',
      data: { product },
    })
  } catch (error) {
    next(error)
  }
}

// PATCH /api/admin/products/:id/restore
export async function restoreProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    if (product.status !== 'archived') {
      return res.status(400).json({
        success: false,
        message: 'Only archived products can be restored.',
      })
    }

    product.status = 'draft'
    await product.save()

    return res.status(200).json({
      success: true,
      message: 'Product restored to drafts successfully.',
      data: { product },
    })
  } catch (error) {
    next(error)
  }
}
