
export const shopCategories = [
  {
    label: 'View all',
    slug: '',
    productCategories: [],
  },
  {
    label: 'Dresses & skirts',
    slug: 'dresses-and-skirts',
    productCategories: ['Dresses', 'Skirts'],
    subcategories: ['Dresses', 'Skirts'],
  },
  {
    label: 'Knits & tops',
    slug: 'knits-and-tops',
    productCategories: ['Knits', 'Tops'],
  },
  {
    label: 'Blazers',
    slug: 'blazers',
    productCategories: ['Blazers'],
  },
  {
    label: 'Jackets & coats',
    slug: 'jackets-and-coats',
    productCategories: ['Jackets', 'Coats'],
  },
  {
    label: 'Trousers & shorts',
    slug: 'trousers-and-shorts',
    productCategories: ['Trousers', 'Shorts'],
  },
  {
    label: 'Swim',
    slug: 'swim',
    productCategories: ['Swim'],
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
