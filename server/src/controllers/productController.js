import Product from '../models/Product.js'
import Category from '../models/Category.js'

const NEW_ARRIVALS_DAYS = 30
const MAX_LIMIT = 50

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// GET /api/products
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      sort = 'newest',
      q = '',
    } = req.query

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 12)
    )

    const filter = {
      status: 'published',
      isPlaceholder: { $ne: true },
    }

    // Category filtering
    if (category === 'new-arrivals') {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - NEW_ARRIVALS_DAYS)

      filter.publishedAt = { $gte: cutoff, $ne: null }
    } else if (category) {
      const categoryDocument = await Category.findOne({
        slug: category,
        isActive: true,
      })

      if (!categoryDocument) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        })
      }

      filter.category = categoryDocument._id
    }

    // Search by product name or description
    if (q.trim()) {
      const searchRegex = new RegExp(escapeRegex(q.trim()), 'i')

      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
      ]
    }

    // Sorting
    const sortOptions = {
      newest: { publishedAt: -1, createdAt: -1 },
      oldest: { publishedAt: 1 },
      'price-low': { price: 1 },
      'price-high': { price: -1 },
    }

    const sortBy = sortOptions[sort] || sortOptions.newest

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Product.countDocuments(filter),
    ])

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/products/:slug
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      status: 'published',
      isPlaceholder: { $ne: true },
    })
      .populate('category', 'name slug')
      .populate({
        path: 'matchingProducts',
        match: {
          status: 'published',
          isPlaceholder: { $ne: true },
        },
        select: 'name slug price currency images colors category',
        populate: {
          path: 'category',
          select: 'name slug',
        },
      })
      .lean()

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      })
    }

    res.status(200).json({
      success: true,
      data: product,
    })
  } catch (error) {
    next(error)
  }
}
