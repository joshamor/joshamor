
import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { getProducts } from '../services/api'
import ProductGrid from '../components/products/ProductGrid'
import ShopFilterDrawer from '../components/products/ShopFilterDrawer'
import ShopCategoryNavigation from '../components/products/ShopCategoryNavigation'

import {
  getShopCategoryOrDefault,
} from '../data/shopCategories'

import SEO from '../components/SEO'
import './shop.css'

const INITIAL_FILTERS = {
  sort: 'Standard',
  colors: [],
  sizes: [],
}

function matchesColor(product, selectedColors) {
  if (!selectedColors.length) return true

  const normalizeColor = (name) =>
    name.toLowerCase() === 'dark brown'
      ? 'brown'
      : name.toLowerCase()

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
        (a, b) =>
          new Date(b.publishedAt || b.createdAt) -
          new Date(a.publishedAt || a.createdAt)
      )

    case 'Oldest':
      return result.sort(
        (a, b) =>
          new Date(a.publishedAt || a.createdAt) -
          new Date(b.publishedAt || b.createdAt)
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

  const shopTitle = category.seoTitle
  const shopDescription = category.seoDescription

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [subcategory, setSubcategory] = useState(null)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  // Redirect invalid category URLs.
  useEffect(() => {
    if (categorySlug && category.slug !== categorySlug) {
      navigate('/shop', { replace: true })
    }
  }, [categorySlug, category, navigate])

  // Reset filters and subcategory when changing categories.
  useEffect(() => {
    setFilters(INITIAL_FILTERS)
    setSubcategory(null)
  }, [categorySlug])

  // Fetch published products from MongoDB.
  useEffect(() => {
    let isActive = true

    async function loadProducts() {
      // Avoid fetching all products while an invalid URL redirects.
      if (categorySlug && category.slug !== categorySlug) return

      setLoading(true)
      setError('')

      try {
        const options = {
          limit: 50,
        }

        if (category.slug) {
          options.category = category.slug
        }

        const result = await getProducts(options)

        if (isActive) {
          setProducts(result.data || [])
        }
      } catch (err) {
        if (isActive) {
          setError(err.message || 'Unable to load products.')
          setProducts([])
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      isActive = false
    }
  }, [categorySlug, category.slug, retryCount])

  const visibleProducts = useMemo(() => {
    const subcategoryProducts = products.filter((product) => {
      if (!subcategory) return true
      return product.category === subcategory
    })

    const filtered = subcategoryProducts.filter((product) =>
      matchesColor(product, filters.colors) &&
      matchesSize(product, filters.sizes)
    )

    return sortProducts(filtered, filters.sort)
  }, [products, subcategory, filters])

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

        {loading ? (
          <div className="shop-empty">
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="shop-empty">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Try again
            </button>
          </div>
        ) : visibleProducts.length > 0 ? (
          <ProductGrid
            products={visibleProducts}
            columns={5}
          />
        ) : (
          <div className="shop-empty">
            <p>
              {products.length === 0
                ? 'No products are currently available.'
                : 'No products match your selected filters.'}
            </p>

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
