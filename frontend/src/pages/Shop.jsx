
import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import products from '../data/products'
import ProductGrid from '../components/products/ProductGrid'
import ShopFilterDrawer from '../components/products/ShopFilterDrawer'
import {
  getShopCategoryOrDefault,
  getProductsForCategory,
} from '../data/shopCategories'

import ShopCategoryNavigation from
  '../components/products/ShopCategoryNavigation'
import './shop.css'
import SEO from '../components/SEO'

const INITIAL_FILTERS = {
  sort: 'Standard',
  colors: [],
  sizes: [],
}


function matchesColor(product, selectedColors) {
  if (!selectedColors.length) return true

  const normalizeColor = (name) =>
    name.toLowerCase() === 'dark brown' ? 'brown' : name.toLowerCase()

  return (product.colors || []).some((color) =>
    selectedColors.some(
      (selected) =>
        normalizeColor(selected) === normalizeColor(color.name)
    )
  )
}



function matchesSize(product, selectedSizes) {
  if (!selectedSizes.length) return true

  return (product.availableSizes || []).some((size) =>
    selectedSizes.includes(size)
  )
}

function sortProducts(items, sort) {
  const result = [...items]

  switch (sort) {
    case 'Latest':
      return result.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    case 'Oldest':
      return result.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      )
    case 'Price: Low to High':
      return result.sort((a, b) => a.price - b.price)
    case 'Price: High to Low':
      return result.sort((a, b) => b.price - a.price)
    case 'A-Z':
      return result.sort((a, b) => a.name.localeCompare(b.name))
    case 'Z-A':
      return result.sort((a, b) => b.name.localeCompare(a.name))
    default:
      return result
  }
}

export default function Shop() {
  const { categorySlug } = useParams()
  const navigate = useNavigate()

  const category = getShopCategoryOrDefault(categorySlug)

  const categoryTitle =
    category?.title ||
    category?.name ||
    category?.label ||
    'Shop All'

  const shopTitle = category.seoTitle
  const shopDescription = category.seoDescription

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [subcategory, setSubcategory] = useState(null)

  // Reset the subcategory when navigating to a different category.
  useEffect(() => {
    if (
      categorySlug &&
      category.slug !== categorySlug
    ) {
      navigate('/shop', { replace: true })
    }
  }, [categorySlug, category, navigate])


  // Redirect invalid category URLs instead of displaying all products.
  useEffect(() => {
    if (categorySlug && !category) {
      navigate('/shop', { replace: true })
    }
  }, [categorySlug, category, navigate])

  const visibleProducts = useMemo(() => {
    // Don't show all products while an invalid URL is being redirected.
    if (categorySlug && !category) return []


    const categoryProducts = getProductsForCategory(products, category)


    const subcategoryProducts = categoryProducts.filter((product) => {
      if (!subcategory) return true
      return product.category === subcategory
    })

    const filtered = subcategoryProducts.filter((product) =>
      matchesColor(product, filters.colors) &&
      matchesSize(product, filters.sizes)
    )

    return sortProducts(filtered, filters.sort)
  }, [categorySlug, category, subcategory, filters])

  return (
  <>
      <SEO
        title={shopTitle}
        description={shopDescription}
      />

    <main className="shop-page">
      <ShopCategoryNavigation
        category={category}
        subcategory={subcategory}
        onSubcategoryChange={setSubcategory}
      />

      <div className="shop-toolbar">
        <button
          type="button"
          className="shop-filter-trigger"
          onClick={() => setDrawerOpen(true)}
        >
          Filter &amp; Sort

          {(filters.colors.length + filters.sizes.length > 0) && (
            <span>
              {' '}({filters.colors.length + filters.sizes.length})
            </span>
          )}
        </button>
      </div>

      {visibleProducts.length > 0 ? (
        <ProductGrid products={visibleProducts} columns={5} />
      ) : (
        <div className="shop-empty">
          <p>No products match your selected filters.</p>

          <button
            type="button"
            onClick={() => {
              setFilters(INITIAL_FILTERS)
              setSubcategory(null)
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      <ShopFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onApply={setFilters}
        resultCount={visibleProducts.length}
      />
      </main>
  </>
  )
}
