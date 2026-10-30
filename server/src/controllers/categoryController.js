
import Category from '../models/Category.js'
import Product from '../models/Product.js'

export async function getCategories(req, res, next) {
  try {
    const categories = await Category.aggregate([
      {
        $match: {
          isActive: true,
        },
      },
      {
        $lookup: {
          from: 'products',
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$category', '$$categoryId'] },
                    { $eq: ['$status', 'published'] },
                  ],
                },
              },
            },
            { $count: 'total' },
          ],
          as: 'productCount',
        },
      },
      {
        $addFields: {
          productCount: {
            $ifNull: [
              { $arrayElemAt: ['$productCount.total', 0] },
              0,
            ],
          },
        },
      },
      {
        $sort: {
          displayOrder: 1,
          name: 1,
        },
      },
      {
        $project: {
          name: 1,
          slug: 1,
          description: 1,
          seo: 1,
          displayOrder: 1,
          productCount: 1,
        },
      },
    ])

    res.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    next(error)
  }
}

export async function getCategoryBySlug(req, res, next) {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    }).lean()

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      })
    }

    const productCount = await Product.countDocuments({
      category: category._id,
      status: 'published',
    })

    res.json({
      success: true,
      data: {
        ...category,
        productCount,
      },
    })
  } catch (error) {
    next(error)
  }
}
