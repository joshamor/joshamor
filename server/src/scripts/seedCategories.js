
import 'dotenv/config'
import mongoose from 'mongoose'
import Category from '../models/Category.js'

const categories = [
  {
    name: 'Casual Wear',
    slug: 'casual-wear',
    description: 'Contemporary casual wear from JOSH AMOR.',
    seo: {
      title: 'Casual Wear | JOSH AMOR',
      description:
        'Explore contemporary casual wear from JOSH AMOR.',
    },
    isActive: true,
    displayOrder: 1,
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Considered accessories from JOSH AMOR.',
    seo: {
      title: 'Accessories | JOSH AMOR',
      description:
        'Discover accessories designed to complement your wardrobe.',
    },
    isActive: true,
    displayOrder: 2,
  },
]

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    for (const category of categories) {
      await Category.updateOne(
        { slug: category.slug },
        { $set: category },
        { upsert: true }
      )
    }

    console.log('Categories seeded successfully.')
  } catch (error) {
    console.error('Category seeding failed:', error)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

seedCategories()
