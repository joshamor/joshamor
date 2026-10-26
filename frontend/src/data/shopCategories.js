
export const shopCategories = [
  {
    label: 'View all',
    slug: '',
    productCategories: [],
  },
  {
    label: 'New Arrivals',
    slug: 'new-arrivals',
    productCategories: ['New Arrivals'],
    subcategories: [''],
  },
  {
    label: 'Casual Wear',
    slug: 'casual-wear',
    productCategories: ['Casual Wear'],
  },
  {
    label: 'Accessories',
    slug: 'accessories',
    productCategories: ['Accessories'],
  },
]

export const getShopCategoryPath = (category) =>
  category?.slug ? `/shop/${category.slug}` : '/shop'

export const getShopCategory = (slug) =>
  shopCategories.find((category) => category.slug === slug)
