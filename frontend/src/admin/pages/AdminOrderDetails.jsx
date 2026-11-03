
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  RefreshCw,
  Package,
  User,
  MapPin,
  CreditCard,
  CalendarDays,
  FileText
} from 'lucide-react'

import {
  getAdminOrderById,
  addAdminOrderNote,
  updateAdminOrderStatus,
} from '../../services/api'

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
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
      className={`inline-flex px-2.5 py-1 text-[9px] uppercase tracking-[0.1em] ${
        styles[status] || 'bg-neutral-100 text-neutral-600'
      }`}
    >
      {label}
    </span>
  )
}

function DetailSection({ icon: Icon, title, children }) {
  return (
    <section className="border border-neutral-200 bg-white">
      <div className="flex items-center gap-3 border-b border-neutral-200 px-5 py-4">
        <Icon size={15} className="text-neutral-400" />
        <h2 className="text-[10px] uppercase tracking-[0.14em]">
          {title}
        </h2>
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-neutral-100 py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between">
      <span className="text-xs text-neutral-400">{label}</span>
      <span className="text-xs text-neutral-700 sm:max-w-[65%] sm:text-right">
        {value || '—'}
      </span>
    </div>
  )
}

export default function AdminOrderDetails() {
  const { id } = useParams()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [note, setNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [noteError, setNoteError] = useState('')
  const [noteSuccess, setNoteSuccess] = useState('')

  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [statusError, setStatusError] = useState('')
  const [statusSuccess, setStatusSuccess] = useState('')

  const loadOrder = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await getAdminOrderById(id)
      setOrder(result?.data?.order || null)
    } catch (err) {
      setError(err.message || 'Unable to load this order.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  const handleAddNote = async (event) => {
    event.preventDefault()

    const trimmedNote = note.trim()

    if (!trimmedNote) {
      setNoteError('Please enter a note.')
      return
    }

    if (trimmedNote.length > 2000) {
      setNoteError('Notes cannot exceed 2,000 characters.')
      return
    }

    setSavingNote(true)
    setNoteError('')
    setNoteSuccess('')

    try {
      await addAdminOrderNote(id, trimmedNote)

      setNote('')
      setNoteSuccess('Internal note added successfully.')

      await loadOrder()
    } catch (err) {
      setNoteError(err.message || 'Unable to add note.')
    } finally {
      setSavingNote(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    const actionLabel = newStatus === 'fulfilled'
      ? 'mark this order as fulfilled'
      : 'cancel this order'

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel}?`
    )

    if (!confirmed) return

    setUpdatingStatus(true)
    setStatusError('')
    setStatusSuccess('')

    try {
      await updateAdminOrderStatus(id, newStatus)

      setStatusSuccess(
        newStatus === 'fulfilled'
          ? 'Order marked as fulfilled successfully.'
          : 'Order cancelled successfully.'
      )

      await loadOrder()
    } catch (err) {
      setStatusError(err.message || 'Unable to update order status.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  useEffect(() => {
    loadOrder()
  }, [loadOrder])


  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-neutral-400">
        <RefreshCw size={16} className="animate-spin" />
        Loading order...
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-neutral-500 hover:text-black"
        >
          <ArrowLeft size={13} />
          Back to orders
        </Link>

        <div className="border border-red-100 bg-white p-8 text-center">
          <p className="text-sm text-red-600">
            {error || 'Order not found.'}
          </p>

          <button
            type="button"
            onClick={loadOrder}
            className="mt-5 text-[10px] uppercase tracking-[0.14em] underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const customerName = [
    order.customer?.firstName,
    order.customer?.lastName,
  ].filter(Boolean).join(' ') || 'Guest customer'

  const address = order.shippingAddress || {}
  const shipping = order.shipping || {}
  const items = order.items || []

  return (
    <div className="mx-auto max-w-6xl space-y-8">

      {/* Header */}
      <div>
        <Link
          to="/admin/orders"
          className="mb-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-neutral-500 transition-colors hover:text-black"
        >
          <ArrowLeft size={13} />
          Back to orders
        </Link>

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-[9px] uppercase tracking-[0.2em] text-neutral-400">
              Workspace / Orders / Details
            </p>

            <h1 className="font-[var(--font-display)] text-3xl md:text-4xl">
              {order.orderNumber}
            </h1>

            <p className="mt-3 text-xs text-neutral-400">
              Placed {formatDate(order.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrder}
            className="flex items-center justify-center gap-2 border border-neutral-200 px-5 py-3 text-[10px] uppercase tracking-[0.14em] transition-colors hover:border-black"
          >
            <RefreshCw size={13} />
            Refresh order
          </button>
        </div>
      </div>

      {/* Status summary */}
      <section className="grid grid-cols-1 gap-px border border-neutral-200 bg-neutral-200 sm:grid-cols-2">
        <div className="bg-white p-5">
          <p className="mb-3 text-[9px] uppercase tracking-[0.14em] text-neutral-400">
            Order status
          </p>
          <StatusLabel status={order.orderStatus} />
        </div>

        <div className="bg-white p-5">
          <p className="mb-3 text-[9px] uppercase tracking-[0.14em] text-neutral-400">
            Payment status
          </p>
          <StatusLabel status={order.paymentStatus} type="payment" />
        </div>
      </section>

      {/* Order actions */}
      <section className="border border-neutral-200 bg-white p-5">
        <div className="mb-5">
          <h2 className="text-[10px] uppercase tracking-[0.14em]">
            Order actions
          </h2>

          <p className="mt-2 text-xs leading-6 text-neutral-400">
            Manage the fulfilment status of this order.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {order.orderStatus === 'processing' &&
            order.paymentStatus === 'successful' && (
              <button
                type="button"
                onClick={() => handleStatusUpdate('fulfilled')}
                disabled={updatingStatus}
                className="bg-neutral-900 px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {updatingStatus ? 'Updating...' : 'Mark as fulfilled'}
              </button>
            )}

          {((
            order.orderStatus === 'pending_payment' &&
            ['pending', 'failed'].includes(order.paymentStatus)
          ) || (
            order.orderStatus === 'processing' &&
            order.paymentStatus === 'refunded'
          )) && (
            <button
              type="button"
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={updatingStatus}
              className="border border-red-200 px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-red-600 transition-colors hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {updatingStatus ? 'Updating...' : 'Cancel order'}
            </button>
          )}

          {!(
            (
              order.orderStatus === 'processing' &&
              order.paymentStatus === 'successful'
            ) ||
            (
              order.orderStatus === 'pending_payment' &&
              ['pending', 'failed'].includes(order.paymentStatus)
            ) ||
            (
              order.orderStatus === 'processing' &&
              order.paymentStatus === 'refunded'
            )
          ) && (
            <p className="text-xs text-neutral-400">
              No actions are currently available for this order.
            </p>
          )}
        </div>

        {statusError && (
          <p className="mt-4 text-xs text-red-600">
            {statusError}
          </p>
        )}

        {statusSuccess && (
          <p className="mt-4 text-xs text-emerald-700">
            {statusSuccess}
          </p>
        )}
      </section>

      {/* Main details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Customer */}
        <DetailSection icon={User} title="Customer information">
          <DetailRow label="Name" value={customerName} />
          <DetailRow label="Email" value={order.customer?.email} />
          <DetailRow label="Phone" value={order.customer?.phone} />
        </DetailSection>

        {/* Shipping */}
        <DetailSection icon={MapPin} title="Shipping information">
          <DetailRow label="Address" value={address.address} />
          <DetailRow label="Apartment" value={address.apartment} />
          <DetailRow label="City" value={address.city} />
          <DetailRow label="State" value={address.state} />
          <DetailRow label="Country" value={address.country} />
          <DetailRow label="Postal code" value={address.postalCode} />
          <DetailRow label="Shipping method" value={shipping.name || shipping.method} />
          <DetailRow
            label="Shipping cost"
            value={formatCurrency(order.shippingAmount, order.currency)}
          />
        </DetailSection>

      </div>

      {/* Items */}
      <DetailSection icon={Package} title="Order items">
        <div className="space-y-0">
          {items.map((item, index) => (
            <div
              key={item._id || `${item.productName}-${index}`}
              className="flex gap-4 border-b border-neutral-100 py-5 last:border-0"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.productName || 'Product'}
                  className="h-24 w-20 shrink-0 bg-neutral-100 object-cover"
                />
              ) : (
                <div className="flex h-24 w-20 shrink-0 items-center justify-center bg-neutral-100">
                  <Package size={20} className="text-neutral-300" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-neutral-900">
                  {item.productName}
                </p>

                <p className="mt-2 text-[10px] text-neutral-400">
                  {item.color || '—'} / {item.size || '—'}
                </p>

                <p className="mt-1 text-[10px] text-neutral-400">
                  SKU: {item.sku || '—'}
                </p>

                <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs">
                  <span className="text-neutral-500">
                    Qty: {item.quantity}
                  </span>

                  <span className="font-medium tabular-nums">
                    {formatCurrency(item.lineTotal, order.currency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DetailSection>

      {/* Order totals */}
      <DetailSection icon={CreditCard} title="Order summary">
        <DetailRow
          label="Subtotal"
          value={formatCurrency(order.subtotal, order.currency)}
        />
        <DetailRow
          label="Shipping"
          value={formatCurrency(order.shippingAmount, order.currency)}
        />
        <DetailRow
          label="Discount"
          value={formatCurrency(order.discountAmount, order.currency)}
        />
        <DetailRow
          label="Tax"
          value={formatCurrency(order.taxAmount, order.currency)}
        />

        <div className="flex items-center justify-between border-t border-neutral-200 pt-5">
          <span className="text-[10px] uppercase tracking-[0.14em]">
            Total
          </span>

          <span className="text-lg font-medium tabular-nums">
            {formatCurrency(order.totalAmount, order.currency)}
          </span>
        </div>
      </DetailSection>

      {/* Payment history */}
      <DetailSection icon={CreditCard} title="Payment history">
        {!order.paymentAttempts?.length ? (
          <p className="text-xs text-neutral-400">
            No payment attempts recorded for this order.
          </p>
        ) : (
          <div className="space-y-6">
            {order.paymentAttempts.map((attempt, index) => (
              <div
                key={attempt._id || index}
                className="border-b border-neutral-100 pb-6 last:border-0 last:pb-0"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-medium capitalize text-neutral-900">
                      {attempt.provider || 'Payment provider'}
                    </p>

                    <p className="mt-1 text-[10px] text-neutral-400">
                      Attempt {index + 1}
                    </p>
                  </div>

                  <StatusLabel
                    status={attempt.status}
                    type="payment"
                  />
                </div>

                <div className="mt-4">
                  <DetailRow
                    label="Amount"
                    value={formatCurrency(
                      attempt.amount,
                      attempt.currency || order.currency
                    )}
                  />

                  <DetailRow
                    label="Reference"
                    value={attempt.reference}
                  />

                  <DetailRow
                    label="Provider reference"
                    value={attempt.providerReference}
                  />

                  <DetailRow
                    label="Transaction ID"
                    value={attempt.providerTransactionId}
                  />

                  <DetailRow
                    label="Payment method"
                    value={attempt.paymentMethod}
                  />

                  <DetailRow
                    label="Initiated"
                    value={formatDate(attempt.initiatedAt)}
                  />

                  <DetailRow
                    label="Completed"
                    value={formatDate(attempt.completedAt)}
                  />

                  <DetailRow
                    label="Verified"
                    value={formatDate(attempt.verifiedAt)}
                  />

                  {attempt.failureCode && (
                    <DetailRow
                      label="Failure code"
                      value={attempt.failureCode}
                    />
                  )}

                  {attempt.failureMessage && (
                    <DetailRow
                      label="Failure message"
                      value={attempt.failureMessage}
                    />
                  )}

                  {attempt.requiresRefund && (
                    <p className="mt-3 text-xs text-amber-700">
                      This payment attempt requires a refund.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DetailSection>

      {/* Internal notes */}
      <DetailSection icon={FileText} title="Internal notes">
        <div className="space-y-5">

          {order.internalNotes ? (
            <div className="whitespace-pre-wrap border border-neutral-100 bg-neutral-50 p-4 text-xs leading-7 text-neutral-600">
              {order.internalNotes}
            </div>
          ) : (
            <p className="text-xs text-neutral-400">
              No internal notes have been added to this order.
            </p>
          )}

          <div className="border-t border-neutral-100 pt-5">
            <h3 className="mb-3 text-[10px] uppercase tracking-[0.14em]">
              Add a note
            </h3>

            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={note}
                onChange={event => {
                  setNote(event.target.value)
                  setNoteError('')
                  setNoteSuccess('')
                }}
                rows={4}
                maxLength={2000}
                placeholder="Write an internal note about this order..."
                className="w-full resize-y border border-neutral-200 bg-white p-4 text-xs leading-6 outline-none transition-colors focus:border-neutral-500"
              />

              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-[10px] text-neutral-400">
                  {note.length}/2000 characters
                </p>

                <button
                  type="submit"
                  disabled={savingNote || !note.trim()}
                  className="bg-neutral-900 px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {savingNote ? 'Saving note...' : 'Add internal note'}
                </button>
              </div>

              {noteError && (
                <p className="text-xs text-red-600">{noteError}</p>
              )}

              {noteSuccess && (
                <p className="text-xs text-emerald-700">{noteSuccess}</p>
              )}
            </form>
          </div>
        </div>
      </DetailSection>

      {/* Timeline */}
      <DetailSection icon={CalendarDays} title="Order timeline">
        <DetailRow label="Order created" value={formatDate(order.createdAt)} />
        <DetailRow label="Payment completed" value={formatDate(order.paidAt)} />
        <DetailRow label="Cancelled" value={formatDate(order.cancelledAt)} />
        <DetailRow label="Abandoned" value={formatDate(order.abandonedAt)} />
        <DetailRow label="Terms accepted" value={formatDate(order.termsAcceptedAt)} />
      </DetailSection>

    </div>
  )
}
