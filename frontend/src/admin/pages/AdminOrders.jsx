
import { useCallback, useEffect, useState } from 'react'
import {
  Search,
  RefreshCw,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAdminOrders } from '../../services/api'

const ORDER_STATUSES = [
  { label: 'All order statuses', value: '' },
  { label: 'Pending payment', value: 'pending_payment' },
  { label: 'Processing', value: 'processing' },
  { label: 'Fulfilled', value: 'fulfilled' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Abandoned', value: 'abandoned' },
  { label: 'Payment review', value: 'payment_review' },
]

const PAYMENT_STATUSES = [
  { label: 'All payment statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Successful', value: 'successful' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
]

const SORT_OPTIONS = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'Highest total', value: 'highest_total' },
  { label: 'Lowest total', value: 'lowest_total' },
]

function formatCurrency(amount, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

function formatDate(date) {
  if (!date) return '—'

  return new Intl.DateTimeFormat('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function StatusLabel({ status, type = 'order' }) {
  const orderStyles = {
    pending_payment: 'bg-amber-50 text-amber-700',
    processing: 'bg-blue-50 text-blue-700',
    fulfilled: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-600',
    abandoned: 'bg-neutral-100 text-neutral-500',
    payment_review: 'bg-purple-50 text-purple-700',
  }

  const paymentStyles = {
    pending: 'bg-amber-50 text-amber-700',
    successful: 'bg-emerald-50 text-emerald-700',
    failed: 'bg-red-50 text-red-600',
    refunded: 'bg-neutral-100 text-neutral-600',
  }

  const styles = type === 'payment' ? paymentStyles : orderStyles

  const label = (status || 'unknown')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase())

  return (
    <span
      className={`inline-flex whitespace-nowrap px-2.5 py-1 text-[9px] uppercase tracking-[0.1em] ${
        styles[status] || 'bg-neutral-100 text-neutral-600'
      }`}
    >
      {label}
    </span>
  )
}

export default function AdminOrders() {
const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  const [filters, setFilters] = useState({
    search: '',
    orderStatus: '',
    paymentStatus: '',
    startDate: '',
    endDate: '',
    sort: 'newest',
  })

  const [appliedFilters, setAppliedFilters] = useState(filters)

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const loadOrders = useCallback(async (page = 1) => {
    setLoading(true)
    setError('')

    try {
      const result = await getAdminOrders({
        ...appliedFilters,
        page,
        limit: pagination.limit,
      })

      const data = result?.data || {}

      setOrders(data.orders || [])

      setPagination({
        page: Number(data.pagination?.page) || page,
        limit: Number(data.pagination?.limit) || 20,
        total: Number(data.pagination?.total) || 0,
        totalPages: Number(data.pagination?.totalPages) || 0,
      })
    } catch (err) {
      setError(err.message || 'Unable to load orders.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [appliedFilters, pagination.limit])

  useEffect(() => {
    loadOrders(1)
  }, [loadOrders])

  const handleFilterChange = (event) => {
    const { name, value } = event.target

    setFilters(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSearch = (event) => {
    event.preventDefault()
    setAppliedFilters({ ...filters })
  }

  const handleClearFilters = () => {
    const cleared = {
      search: '',
      orderStatus: '',
      paymentStatus: '',
      startDate: '',
      endDate: '',
      sort: 'newest',
    }

    setFilters(cleared)
    setAppliedFilters(cleared)
  }

  const hasActiveFilters = Object.entries(appliedFilters).some(
    ([key, value]) => key === 'sort'
      ? value !== 'newest'
      : Boolean(value)
  )

  return (
    <div className="space-y-8">

      {/* Page heading */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[9px] uppercase tracking-[0.2em] text-neutral-400">
            Workspace / Operations
          </p>

          <h1 className="font-[var(--font-display)] text-3xl md:text-4xl">
            Orders
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            View and manage customer orders and fulfilment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadOrders(pagination.page)}
          disabled={loading}
          className="flex items-center justify-center gap-2 border border-neutral-200 px-5 py-3 text-[10px] uppercase tracking-[0.14em] transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={13}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh orders
        </button>
      </div>

      {/* Orders summary */}
      <section className="border border-neutral-200 bg-white p-5">
        <p className="text-[9px] uppercase tracking-[0.16em] text-neutral-400">
          Total orders
        </p>

        <p className="mt-3 text-3xl font-medium tabular-nums">
          {pagination.total.toLocaleString('en-NG')}
        </p>

        <p className="mt-2 text-xs text-neutral-400">
          Orders matching your current filters
        </p>
      </section>

      {/* Filters */}
      <section className="space-y-5 border border-neutral-200 bg-white p-5">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.14em]">
            Find orders
          </h2>

          <p className="mt-1 text-xs text-neutral-400">
            Search by order number or customer details.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">

          <div className="relative">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              type="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search order number, name, email or phone..."
              className="h-12 w-full border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none transition-colors focus:border-neutral-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

            <div>
              <label
                htmlFor="orderStatus"
                className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-neutral-400"
              >
                Order status
              </label>

              <select
                id="orderStatus"
                name="orderStatus"
                value={filters.orderStatus}
                onChange={handleFilterChange}
                className="h-11 w-full border border-neutral-200 bg-white px-3 text-xs outline-none focus:border-neutral-500"
              >
                {ORDER_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="paymentStatus"
                className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-neutral-400"
              >
                Payment status
              </label>

              <select
                id="paymentStatus"
                name="paymentStatus"
                value={filters.paymentStatus}
                onChange={handleFilterChange}
                className="h-11 w-full border border-neutral-200 bg-white px-3 text-xs outline-none focus:border-neutral-500"
              >
                {PAYMENT_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="sort"
                className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-neutral-400"
              >
                Sort by
              </label>

              <select
                id="sort"
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="h-11 w-full border border-neutral-200 bg-white px-3 text-xs outline-none focus:border-neutral-500"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-neutral-400"
              >
                From date
              </label>

              <input
                id="startDate"
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="h-11 w-full border border-neutral-200 bg-white px-3 text-xs outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-neutral-400"
              >
                To date
              </label>

              <input
                id="endDate"
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                min={filters.startDate || undefined}
                className="h-11 w-full border border-neutral-200 bg-white px-3 text-xs outline-none focus:border-neutral-500"
              />
            </div>

          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-neutral-900 px-5 py-3 text-[10px] uppercase tracking-[0.12em] text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
            >
              Apply filters
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters && !filters.search}
              className="border border-neutral-200 px-5 py-3 text-[10px] uppercase tracking-[0.12em] text-neutral-600 transition-colors hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear filters
            </button>
          </div>

        </form>
      </section>

      {/* Orders table */}
      <section className="border border-neutral-200 bg-white">

        <div className="flex flex-col justify-between gap-2 border-b border-neutral-200 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.14em]">
              Order overview
            </h2>

            <p className="mt-1 text-xs text-neutral-400">
              {orders.length} orders on this page · {pagination.total} total
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-neutral-400">
            <RefreshCw size={16} className="animate-spin" />
            Loading orders...
          </div>
        ) : error ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => loadOrders(pagination.page)}
              className="mt-4 text-[10px] uppercase tracking-[0.14em] underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <ShoppingBag size={24} className="text-neutral-300" />

            <p className="mt-4 text-sm text-neutral-500">
              No orders found.
            </p>

            <p className="mt-2 text-xs text-neutral-400">
              {hasActiveFilters || filters.search
                ? 'Try adjusting your search or filters.'
                : 'Customer orders will appear here once they are placed.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  {[
                    'Order',
                    'Customer',
                    'Items',
                    'Total',
                    'Order status',
                    'Payment',
                    'Date',
                  ].map(label => (
                    <th
                      key={label}
                      className="px-5 py-3 text-[9px] font-normal uppercase tracking-[0.12em] text-neutral-400"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {orders.map(order => (
                  <tr
                    key={order._id}
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        navigate(`/admin/orders/${order._id}`)
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={`View order ${order.orderNumber}`}
                    className="cursor-pointer border-b border-neutral-100 last:border-0 transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-neutral-500"
                  >
                    <td className="px-5 py-4">
                      <p className="text-xs font-medium text-neutral-900">
                        {order.orderNumber}
                      </p>

                      <p className="mt-1 text-[10px] text-neutral-400">
                        {order.itemCount ?? 0} units
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-xs font-medium text-neutral-800">
                        {[
                          order.customer?.firstName,
                          order.customer?.lastName,
                        ].filter(Boolean).join(' ') || 'Guest customer'}
                      </p>

                      <p className="mt-1 text-[10px] text-neutral-400">
                        {order.customer?.email || 'No email'}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-xs text-neutral-600">
                      {order.items?.length || 0} product
                      {(order.items?.length || 0) === 1 ? '' : 's'}
                    </td>

                    <td className="px-5 py-4 text-xs font-medium tabular-nums text-neutral-900">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusLabel status={order.orderStatus} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusLabel
                        status={order.paymentStatus}
                        type="payment"
                      />
                    </td>

                    <td className="px-5 py-4 text-xs text-neutral-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 0 && (
          <div className="flex flex-col justify-between gap-4 border-t border-neutral-200 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-xs text-neutral-400">
              Page {pagination.page} of {pagination.totalPages}
              {' · '}
              {pagination.total} orders
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadOrders(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="flex items-center gap-2 border border-neutral-200 px-3 py-2 text-[10px] uppercase tracking-wider text-neutral-600 hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={13} />
                Previous
              </button>

              <button
                type="button"
                onClick={() => loadOrders(pagination.page + 1)}
                disabled={
                  pagination.page >= pagination.totalPages || loading
                }
                className="flex items-center gap-2 border border-neutral-200 px-3 py-2 text-[10px] uppercase tracking-wider text-neutral-600 hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}

      </section>
    </div>
  )
}
