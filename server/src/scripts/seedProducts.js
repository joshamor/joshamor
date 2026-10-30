import dotenv from 'dotenv'
import mongoose from 'mongoose'

import Product from '../models/Product.js'
import Category from '../models/Category.js'
import products from '../data/products.js'

dotenv.config()

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')
}

const toImageObjects = (images = [], productName = '') => {
  return images
    .filter(Boolean)
    .map((item, index) => {
      // Existing placeholder images are URL strings.
      if (typeof item === 'string') {
        return {
          url: item,
          alt: `${productName} - image ${index + 1}`,
        }
      }

      return {
        url: item.url,
        alt: item.alt || `${productName} - image ${index + 1}`,
      }
    })
}

const migrateProduct = (product, categoryId) => {
  const images = toImageObjects(product.images || [], product.name)

  const colors = (product.colors || []).map((color) => ({
    name: color.name,
    hex: color.hex,
    images: toImageObjects(color.images || [], product.name),
  }))

  return {
    legacyId: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    currency: product.currency || 'NGN',
    category: categoryId,
    images,
    colors,
    sizes: product.sizes || [],
    availableSizes: product.availableSizes || [],
    variants: [],
    features: product.features || [],
    material: product.material || '',
    madeIn: product.madeIn || '',
    care: product.care || '',
    details: product.details || [],
    delivery: product.delivery || {
      heading: '',
      paragraphs: [],
    },
    matchingProducts: [],
    featured: product.featured || false,

    // Nothing is published during the initial migration.
    status: 'draft',
    publishedAt: null,

    isPlaceholder: product.isPlaceholder === true,

    seo: {
      title: '',
      description: '',
    },
  }
}

const seedProducts = async () => {
  await connectDB()

  const categories = await Category.find({
    slug: { $in: ['casual-wear', 'accessories'] },
  })

  const categoryMap = new Map(
    categories.map((category) => [category.name, category._id])
  )

  const missingCategories = [
    ...new Set(
      products
        .map((product) => product.category)
        .filter((name) => !categoryMap.has(name))
    ),
  ]

  if (missingCategories.length) {
    throw new Error(
      `Missing categories in MongoDB: ${missingCategories.join(', ')}`
    )
  }

  // First pass: import products without matching-product references.
  for (const product of products) {
    const categoryId = categoryMap.get(product.category)
    const productData = migrateProduct(product, categoryId)

    await Product.updateOne(
      { slug: product.slug },
      {
        $set: {
          ...productData,
          createdAt: product.createdAt
            ? new Date(product.createdAt)
            : new Date(),
        },
      },
      { upsert: true }
    )

    console.log(`Imported: ${product.name}`)
  }

  // Second pass: resolve matching products using their legacy IDs.
  for (const product of products) {
    const matchingIds = product.matchingProducts || []

    const matchingProducts = await Product.find({
      legacyId: { $in: matchingIds },
    }).select('_id')

    await Product.updateOne(
      { slug: product.slug },
      {
        $set: {
          matchingProducts: matchingProducts.map((item) => item._id),
        },
      }
    )
  }

  console.log(`\nSuccessfully imported ${products.length} products.`)
  console.log('All imported products are still drafts.')

  await mongoose.disconnect()
}

seedProducts().catch(async (error) => {
  console.error('Product import failed:', error.message)

  await mongoose.disconnect()
  process.exit(1)
})
