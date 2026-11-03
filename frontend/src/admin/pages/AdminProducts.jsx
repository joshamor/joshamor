
import { useCallback, useEffect, useState } from 'react'
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Upload,
  EyeOff,
  Archive,
  RotateCcw,
} from 'lucide-react'


import {
  getAdminProducts,
  publishAdminProduct,
  unpublishAdminProduct,
  archiveAdminProduct,
  restoreAdminProduct,
} from '../../services/api'
import { shopCategories } from '../../data/shopCategories'
import { useNavigate } from 'react-router-dom'


const statusFilters = [
  { label: 'All products', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Archived', value: 'archived' },
]

function formatPrice(price, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price || 0)
}

function StatusLabel({ status }) {
  const styles = {
    published: 'bg-neutral-900 text-white',
    draft: 'bg-neutral-100 text-neutral-600',
    archived: 'bg-neutral-200 text-neutral-500',
  }

  return (
    <span
      className={`inline-flex px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] ${
        styles[status] || styles.draft
      }`}
    >
      {status}
    </span>
  )
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const navigate = useNavigate()
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')


  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await getAdminProducts({
        search,
        status,
        category,
        page: pagination.page,
        limit: pagination.limit,
      })

      setProducts(result.data.products || [])
      setPagination(result.data.pagination)
    } catch (err) {
      setError(err.message || 'Unable to load products.')
    } finally {
      setLoading(false)
    }
  }, [search, status, category, pagination.page, pagination.limit])

  async function handleProductAction(product, action) {
    const actionKey = `${product._id}-${action}`

    const confirmations = {
      unpublish: 'Are you sure you want to unpublish this product?',
      archive: 'Are you sure you want to archive this product?',
    }

    if (
      confirmations[action] &&
      !window.confirm(confirmations[action])
    ) {
      return
    }

    const actions = {
      publish: publishAdminProduct,
      unpublish: unpublishAdminProduct,
      archive: archiveAdminProduct,
      restore: restoreAdminProduct,
    }

    const successMessages = {
      publish: 'Product published successfully.',
      unpublish: 'Product unpublished and moved to drafts.',
      archive: 'Product archived successfully.',
      restore: 'Product restored to drafts.',
    }

    const apiAction = actions[action]

    if (!apiAction) return

    setActionLoading(actionKey)
    setActionMessage('')
    setActionError('')

    try {
      await apiAction(product._id)

      setActionMessage(successMessages[action])

      await loadProducts()
    } catch (err) {
      setActionError(err.message || 'Unable to update product.')
    } finally {
      setActionLoading('')
    }
  }


  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  function changeStatus(nextStatus) {
    setStatus(nextStatus)
    setPagination(current => ({ ...current, page: 1 }))
  }

  function changeCategory(event) {
    setCategory(event.target.value)
    setPagination(current => ({ ...current, page: 1 }))
  }

  function changeSearch(event) {
    setSearch(event.target.value)
    setPagination(current => ({ ...current, page: 1 }))
  }

  const categories = shopCategories.filter(
    item => item.productCategories?.length
  )

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[9px] uppercase tracking-[0.2em] text-neutral-400">
            Workspace / Catalogue
          </p>

          <h1 className="font-[var(--font-display)] text-3xl md:text-4xl">
            Products
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            Manage your product catalogue and publication status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center justify-center gap-2 bg-[#151515] px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-700"
        >
          <Plus size={14} />
          Add product
        </button>
      </div>

      {/* Status filters */}
      <div className="flex gap-6 overflow-x-auto border-b border-neutral-200">
        {statusFilters.map(filter => (
          <button
            key={filter.value}
            type="button"
            onClick={() => changeStatus(filter.value)}
            className={`whitespace-nowrap border-b pb-3 text-[10px] uppercase tracking-[0.12em] transition-colors ${
              status === filter.value
                ? 'border-black text-black'
                : 'border-transparent text-neutral-400 hover:text-black'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search and category filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />

          <input
            type="search"
            value={search}
            onChange={changeSearch}
            placeholder="Search products..."
            className="h-12 w-full border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none transition-colors focus:border-neutral-500"
          />
        </div>

        <select
          value={category}
          onChange={changeCategory}
          className="h-12 border border-neutral-200 bg-white px-4 text-[10px] uppercase tracking-[0.1em] text-neutral-600 outline-none focus:border-neutral-500 sm:min-w-[190px]"
        >
          <option value="">All categories</option>

          {categories.map(item => (
            <option
              key={item.slug}
              value={item.slug}
            >
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {(actionMessage || actionError) && (
        <div
          className={`border px-4 py-3 text-xs ${
            actionError
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-neutral-200 bg-neutral-50 text-neutral-700'
          }`}
        >
          {actionError || actionMessage}
        </div>
      )}


      {/* Product list */}
      <div className="border border-neutral-200 bg-white">
        <div className="hidden grid-cols-[minmax(220px,2fr)_1fr_120px_110px] gap-5 border-b border-neutral-200 px-6 py-4 md:grid">
          {['Product', 'Category', 'Price', 'Status'].map(label => (
            <p
              key={label}
              className="text-[9px] uppercase tracking-[0.15em] text-neutral-400"
            >
              {label}
            </p>
          ))}
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-neutral-400">
            Loading products...
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={loadProducts}
              className="mt-4 text-[10px] uppercase tracking-[0.15em] underline"
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-[var(--font-display)] text-xl">
              No products found
            </p>

            <p className="mt-2 text-sm text-neutral-400">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          products.map(product => {
            const image =
              product.images?.[0]?.url ||
              product.images?.[0] ||
              product.colors?.[0]?.images?.[0]?.url ||
              product.colors?.[0]?.images?.[0]

            const categoryName =
              typeof product.category === 'object'
                ? product.category?.name
                : product.category

            return (
              <div
                key={product._id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/admin/products/${product._id}`)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    navigate(`/admin/products/${product._id}`)
                  }
                }}
                className="grid cursor-pointer gap-4 border-b border-neutral-100 px-5 py-5 transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-1 focus-visible:outline-neutral-900 last:border-b-0 md:grid-cols-[minmax(220px,2fr)_1fr_120px_110px] md:items-center md:gap-5 md:px-6"
              >
                {/* Product details */}
                <div className="flex min-w-0 items-center gap-4">
                  <div className="h-[76px] w-[62px] shrink-0 bg-neutral-100">
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[8px] uppercase tracking-wider text-neutral-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm text-neutral-900">
                      {product.name}
                    </p>

                    <p className="mt-1 text-[10px] text-neutral-400">
                      {product.slug}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.isPlaceholder && (
                        <span className="text-[8px] uppercase tracking-[0.12em] text-amber-700">
                          Placeholder
                        </span>
                      )}

                      {product.featured && (
                        <span className="text-[8px] uppercase tracking-[0.12em] text-neutral-500">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <p className="mb-1 text-[9px] uppercase tracking-wider text-neutral-400 md:hidden">
                    Category
                  </p>

                  <p className="text-xs text-neutral-600">
                    {categoryName || 'Uncategorised'}
                  </p>
                </div>

                {/* Price */}
                <div>
                  <p className="mb-1 text-[9px] uppercase tracking-wider text-neutral-400 md:hidden">
                    Price
                  </p>

                  <p className="text-xs text-neutral-700">
                    {formatPrice(product.price, product.currency)}
                  </p>
                </div>

                {/* Status */}
                {/* Status and actions */}
                <div>
                  <p className="mb-2 text-[9px] uppercase tracking-wider text-neutral-400 md:hidden">
                    Status
                  </p>

                  <StatusLabel status={product.status} />

                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.status === 'draft' && (

                      <button
                        type="button"
                        disabled={Boolean(actionLoading)}
                        onClick={event => {
                          event.stopPropagation()
                          handleProductAction(product, 'publish')
                        }}
                        className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-neutral-700 transition-colors hover:text-black disabled:opacity-40"
                      >
                        <Upload size={12} />
                        {actionLoading === `${product._id}-publish`
                          ? 'Publishing...'
                          : 'Publish'}
                      </button>
                    )}

                    {product.status === 'published' && (
                      <button
                        type="button"
                        disabled={Boolean(actionLoading)}
                        onClick={event => {
                          event.stopPropagation()
                          handleProductAction(product, 'unpublish')
                        }}
                        className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-neutral-700 transition-colors hover:text-black disabled:opacity-40"
                      >
                        <EyeOff size={12} />
                        {actionLoading === `${product._id}-unpublish`
                          ? 'Unpublishing...'
                          : 'Unpublish'}
                      </button>
                    )}

                    {product.status === 'archived' ? (
                      <button
                        type="button"
                        disabled={Boolean(actionLoading)}
                        onClick={event => {
                          event.stopPropagation()
                          handleProductAction(product, 'restore')
                        }}
                        className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-neutral-700 transition-colors hover:text-black disabled:opacity-40"
                      >
                        <RotateCcw size={12} />
                        {actionLoading === `${product._id}-restore`
                          ? 'Restoring...'
                          : 'Restore'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={Boolean(actionLoading)}
                        onClick={event => {
                          event.stopPropagation()
                          handleProductAction(product, 'archive')
                        }}
                        className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-neutral-400 transition-colors hover:text-red-600 disabled:opacity-40"
                      >
                        <Archive size={12} />
                        {actionLoading === `${product._id}-archive`
                          ? 'Archiving...'
                          : 'Archive'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && pagination.total > 0 && (
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-[10px] uppercase tracking-[0.1em] text-neutral-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1}
            {' – '}
            {Math.min(
              pagination.page * pagination.limit,
              pagination.total
            )}
            {' of '}
            {pagination.total} products
          </p>

          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination(current => ({
                  ...current,
                  page: current.page - 1,
                }))
              }
              className="flex items-center gap-2 text-[9px] uppercase tracking-[0.12em] text-neutral-600 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            <span className="text-xs tabular-nums text-neutral-500">
              {pagination.page} / {Math.max(pagination.pages, 1)}
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.pages}
              onClick={() =>
                setPagination(current => ({
                  ...current,
                  page: current.page + 1,
                }))
              }
              className="flex items-center gap-2 text-[9px] uppercase tracking-[0.12em] text-neutral-600 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
