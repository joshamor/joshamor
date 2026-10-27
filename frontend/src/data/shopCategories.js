
export const NEW_ARRIVALS_DAYS = 30

export const shopCategories = [
  {
    label: 'View all',
    slug: '',
    productCategories: [],
    seoTitle: 'Shop All Collections',
    seoDescription:
      'Explore contemporary fashion, considered wardrobe essentials and the latest collections from JOSH AMOR.',
  },
  {
    label: 'New Arrivals',
    slug: 'new-arrivals',
    productCategories: [],
    isNewArrivals: true,
    seoTitle: 'New Arrivals',
    seoDescription:
      'Discover the latest arrivals from JOSH AMOR, featuring contemporary silhouettes and considered wardrobe essentials.',
  },
  {
    label: 'Casual Wear',
    slug: 'casual-wear',
    productCategories: ['Casual Wear'],
    seoTitle: 'Casual Wear',
    seoDescription:
      'Explore contemporary casual wear from JOSH AMOR, designed for a considered modern wardrobe.',
  },
  {
    label: 'Accessories',
    slug: 'accessories',
    productCategories: ['Accessories'],
    seoTitle: 'Accessories',
    seoDescription:
      'Discover accessories from JOSH AMOR, designed to complement a considered contemporary wardrobe.',
  },
]

export const getShopCategoryPath = (category) =>
  category?.slug ? `/shop/${category.slug}` : '/shop'

export const getShopCategory = (slug) =>
  shopCategories.find((category) => category.slug === slug)

export const getShopCategoryOrDefault = (slug) =>
  getShopCategory(slug) || shopCategories[0]

export function isNewArrival(product, now = new Date()) {
  if (!product?.createdAt) return false

  const createdAt = new Date(product.createdAt)
  if (Number.isNaN(createdAt.getTime())) return false

  const cutoff = new Date(
    now.getTime() - NEW_ARRIVALS_DAYS * 24 * 60 * 60 * 1000
  )

  return createdAt <= now && createdAt >= cutoff
}

export function getProductsForCategory(products, category) {
  if (category?.isNewArrivals) {
    return products.filter((product) => isNewArrival(product))
  }

  if (!category?.productCategories?.length) {
    return products
  }

  return products.filter((product) =>
    category.productCategories.includes(product.category)
  )
}
