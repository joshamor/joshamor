import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Search,
  Package,
  AlertTriangle,
  CircleCheck,
  CircleX,
  RefreshCw,
  ChevronRight,
  History as HistoryIcon,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  getAdminInventory,
  getAdminInventorySettings,
  updateAdminGlobalLowStockThreshold,
  updateAdminProductLowStockThreshold,
  updateAdminVariantStock,
  updateAdminVariantSku,
  bulkUpdateAdminVariantStock,
  getAdminInventoryHistory
} from '../../services/api'

const LOW_STOCK_THRESHOLD = 5
const MAX_BULK_UPDATES = 100

const stockFilters = [
  { label: 'All items', value: 'all' },
  { label: 'In stock', value: 'in-stock' },
  { label: 'Low stock', value: 'low-stock' },
  { label: 'Out of stock', value: 'out-of-stock' },
]

function getStockStatus(stock, threshold = LOW_STOCK_THRESHOLD) {
  if (stock === 0) return 'out-of-stock'
  if (stock <= threshold) return 'low-stock'
  return 'in-stock'
}

function getEffectiveThreshold(item) {
  return Number.isInteger(item.lowStockThreshold) && item.lowStockThreshold >= 0
    ? item.lowStockThreshold
    : LOW_STOCK_THRESHOLD
}

function StockLabel({ stock, threshold }) {
  const status = getStockStatus(stock, threshold)

  const styles = {
    'in-stock': 'bg-neutral-100 text-neutral-700',
    'low-stock': 'bg-amber-50 text-amber-700',
    'out-of-stock': 'bg-red-50 text-red-600',
  }

  const labels = {
    'in-stock': 'In stock',
    'low-stock': 'Low stock',
    'out-of-stock': 'Out of stock',
  }

  return (
    <span
      className={`inline-flex whitespace-nowrap px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

function StockSummary({ label, value, icon: Icon, description }) {
  return (
    <div className="border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.16em] text-neutral-400">
            {label}
          </p>

          <p className="mt-3 text-2xl font-medium tabular-nums">
            {value}
          </p>
        </div>

        <Icon size={18} className="text-neutral-400" />
      </div>

      <p className="mt-3 text-xs text-neutral-400">{description}</p>
    </div>
  )
}

export default function AdminInventory() {
  const navigate = useNavigate()

  const [inventory, setInventory] = useState([])
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Global and product-level low-stock thresholds.
  const [globalThreshold, setGlobalThreshold] = useState(5)
  const [thresholdInput, setThresholdInput] = useState('5')
  const [thresholdSaving, setThresholdSaving] = useState(false)
  const [thresholdMessage, setThresholdMessage] = useState('')
  const [productThresholdInputs, setProductThresholdInputs] = useState({})
  const [productThresholdSaving, setProductThresholdSaving] = useState({})
  const [productThresholdMessages, setProductThresholdMessages] = useState({})

  // Inline stock editor.
  const [editingVariantId, setEditingVariantId] = useState(null)
  const [stockEditForm, setStockEditForm] = useState({
    operation: 'set',
    quantity: '',
    reason: '',
  })
  const [stockSaving, setStockSaving] = useState(false)
  const [stockEditError, setStockEditError] = useState('')
  const [stockUpdateMessage, setStockUpdateMessage] = useState('')

  // Inline SKU editor.
  const [editingSkuVariantId, setEditingSkuVariantId] = useState(null)
  const [skuInput, setSkuInput] = useState('')
  const [skuSaving, setSkuSaving] = useState(false)
  const [skuError, setSkuError] = useState('')
  const [skuUpdateMessage, setSkuUpdateMessage] = useState('')

  // Bulk selection and update editor.
  const [selectedVariantIds, setSelectedVariantIds] = useState([])
  const [bulkPanelOpen, setBulkPanelOpen] = useState(false)
  const [bulkMode, setBulkMode] = useState('same')
  const [bulkOperation, setBulkOperation] = useState('adjust')
  const [bulkQuantity, setBulkQuantity] = useState('')
  const [bulkIndividualQuantities, setBulkIndividualQuantities] = useState({})
  const [bulkReason, setBulkReason] = useState('')
  const [bulkSaving, setBulkSaving] = useState(false)
  const [bulkError, setBulkError] = useState('')
  const [bulkUpdateMessage, setBulkUpdateMessage] = useState('')


  //History State
  // Stock adjustment history
  const [historyVariant, setHistoryVariant] = useState(null)
  const [historyEntries, setHistoryEntries] = useState([])

  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')


  const loadInventory = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await getAdminInventory()
      setInventory(result.data.inventory || [])
    } catch (err) {
      setError(err.message || 'Unable to load inventory.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  useEffect(() => {
    let isMounted = true

    const loadSettings = async () => {
      try {
        const response = await getAdminInventorySettings()
        const threshold = response?.data?.lowStockThreshold ?? 5

        if (isMounted) {
          setGlobalThreshold(threshold)
          setThresholdInput(String(threshold))
        }
      } catch (settingsError) {
        console.error('Failed to load inventory settings:', settingsError)
      }
    }

    loadSettings()

    return () => {
      isMounted = false
    }
  }, [])

  const loadVariantHistory = useCallback(async (item, page = 1) => {
    if (!item?.productId || !item?.variantId) return

    setHistoryLoading(true)
    setHistoryError('')

    try {
      const result = await getAdminInventoryHistory(item.productId, {
        variantId: item.variantId,
        page,
        limit: 20,
      })

      const payload = result?.data ?? result

      const entries = Array.isArray(payload?.history)
        ? payload.history
        : []

      const pagination = payload?.pagination ?? {}

      setHistoryEntries(entries)

      setHistoryPagination({
        page: Number(pagination.page) || page,
        limit: Number(pagination.limit) || 20,
        total: Number(pagination.total ?? entries.length),
        totalPages: Number(pagination.totalPages) ||
          (entries.length > 0 ? 1 : 0),
      })
    } catch (error) {
      setHistoryError(
        error.message || 'Unable to load stock adjustment history.'
      )

      setHistoryEntries([])
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const handleOpenHistory = (item) => {
    setHistoryVariant(item)
    setHistoryEntries([])

    setHistoryPagination({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    })

    loadVariantHistory(item, 1)
  }



  const handleCloseHistory = () => {
    setHistoryVariant(null)
    setHistoryEntries([])
    setHistoryError('')
  }

  const handleSaveGlobalThreshold = async () => {
    const threshold = Number(thresholdInput)

    if (!Number.isInteger(threshold) || threshold < 0) {
      setThresholdMessage('Enter a valid non-negative whole number.')
      return
    }

    try {
      setThresholdSaving(true)
      setThresholdMessage('')

      const response = await updateAdminGlobalLowStockThreshold(threshold)
      const savedThreshold = response?.data?.lowStockThreshold ?? threshold

      setGlobalThreshold(savedThreshold)
      setThresholdInput(String(savedThreshold))
      setThresholdMessage('Global threshold updated successfully.')

      await loadInventory()
    } catch (saveError) {
      setThresholdMessage(
        saveError.message || 'Failed to update global threshold.'
      )
    } finally {
      setThresholdSaving(false)
    }
  }

  const handleSaveProductThreshold = async (
    productId,
    currentOverride = null,
    resetToGlobal = false
  ) => {
    const rawValue = resetToGlobal
      ? ''
      : productThresholdInputs[productId] ?? (currentOverride ?? '')

    const threshold = String(rawValue).trim() === ''
      ? null
      : Number(rawValue)

    if (
      threshold !== null &&
      (!Number.isInteger(threshold) || threshold < 0)
    ) {
      setProductThresholdMessages(prev => ({
        ...prev,
        [productId]: 'Enter a valid non-negative whole number.',
      }))
      return
    }

    try {
      setProductThresholdSaving(prev => ({
        ...prev,
        [productId]: true,
      }))

      setProductThresholdMessages(prev => ({
        ...prev,
        [productId]: '',
      }))

      await updateAdminProductLowStockThreshold(productId, threshold)

      setProductThresholdInputs(prev => ({
        ...prev,
        [productId]: threshold === null ? '' : String(threshold),
      }))

      setProductThresholdMessages(prev => ({
        ...prev,
        [productId]: threshold === null
          ? 'Product now uses the global threshold.'
          : 'Product threshold updated successfully.',
      }))

      await loadInventory()
    } catch (saveError) {
      setProductThresholdMessages(prev => ({
        ...prev,
        [productId]: saveError.message || 'Failed to update product threshold.',
      }))
    } finally {
      setProductThresholdSaving(prev => ({
        ...prev,
        [productId]: false,
      }))
    }
  }

  const summary = useMemo(() => {
    const total = inventory.length
    const outOfStock = inventory.filter(item => item.stock === 0).length
    const lowStock = inventory.filter(
      item => item.stock > 0 && item.stock <= getEffectiveThreshold(item)
    ).length
    const inStock = inventory.filter(
      item => item.stock > getEffectiveThreshold(item)
    ).length
    const totalUnits = inventory.reduce(
      (totalStock, item) => totalStock + item.stock,
      0
    )

    return {
      total,
      outOfStock,
      lowStock,
      inStock,
      totalUnits,
    }
  }, [inventory])

  const filteredInventory = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()

    return inventory.filter(item => {
      const matchesSearch =
        !searchTerm ||
        item.productName?.toLowerCase().includes(searchTerm) ||
        item.productSlug?.toLowerCase().includes(searchTerm) ||
        item.sku?.toLowerCase().includes(searchTerm) ||
        item.color?.toLowerCase().includes(searchTerm) ||
        item.size?.toLowerCase().includes(searchTerm)

      const matchesFilter =
        activeFilter === 'all' ||
        getStockStatus(item.stock, getEffectiveThreshold(item)) === activeFilter

      return matchesSearch && matchesFilter
    })
  }, [inventory, search, activeFilter])

  const selectedInventoryItems = useMemo(
    () => inventory.filter(item =>
      selectedVariantIds.includes(String(item.variantId))
    ),
    [inventory, selectedVariantIds]
  )

  const allVisibleSelected =
    filteredInventory.length > 0 &&
    filteredInventory.every(item =>
      selectedVariantIds.includes(String(item.variantId))
    )

  const productsWithInventory = useMemo(
    () => Array.from(
      new Map(
        inventory.map(item => [String(item.productId), item])
      ).values()
    ),
    [inventory]
  )

  // Inline stock editing handlers.
  const handleOpenStockEditor = (item) => {
    setEditingVariantId(item.variantId)
    setStockEditForm({
      operation: 'set',
      quantity: String(item.stock),
      reason: '',
    })
    setStockEditError('')
    setStockUpdateMessage('')
  }

  const handleSaveStock = async (item) => {
    const { operation, quantity, reason } = stockEditForm

    if (!quantity.trim()) {
      setStockEditError('Enter a stock quantity.')
      return
    }

    const parsedQuantity = Number(quantity)

    if (!Number.isInteger(parsedQuantity)) {
      setStockEditError('Stock quantity must be a whole number.')
      return
    }

    if (operation === 'set' && parsedQuantity < 0) {
      setStockEditError('Stock quantity cannot be negative.')
      return
    }

    if (operation === 'adjust' && parsedQuantity === 0) {
      setStockEditError('Adjustment quantity cannot be zero.')
      return
    }

    if (!reason.trim()) {
      setStockEditError('Please provide a reason for this stock update.')
      return
    }

    if (reason.trim().length > 200) {
      setStockEditError('Reason cannot exceed 200 characters.')
      return
    }

    try {
      setStockSaving(true)
      setStockEditError('')
      setStockUpdateMessage('')

      await updateAdminVariantStock(item.productId, item.variantId, {
        operation,
        quantity: parsedQuantity,
        reason: reason.trim(),
      })

      setEditingVariantId(null)
      setStockUpdateMessage(`Stock updated successfully for ${item.sku}.`)
      await loadInventory()
    } catch (saveError) {
      setStockEditError(saveError.message || 'Unable to update stock.')
    } finally {
      setStockSaving(false)
    }
  }

  const handleCancelStockEdit = () => {
    setEditingVariantId(null)
    setStockEditError('')
  }

  // Inline SKU editing handlers.
  const handleOpenSkuEditor = (item) => {
    setEditingSkuVariantId(item.variantId)
    setSkuInput(item.sku || '')
    setSkuError('')
    setSkuUpdateMessage('')
  }

  const handleSaveSku = async (item) => {
    const trimmedSku = skuInput.trim()

    if (!trimmedSku) {
      setSkuError('SKU cannot be empty.')
      return
    }

    try {
      setSkuSaving(true)
      setSkuError('')
      setSkuUpdateMessage('')

      await updateAdminVariantSku(item.productId, item.variantId, trimmedSku)

      setEditingSkuVariantId(null)
      setSkuInput('')
      setSkuUpdateMessage(
        `SKU updated successfully to ${trimmedSku.toUpperCase()}.`
      )

      await loadInventory()
    } catch (saveError) {
      setSkuError(saveError.message || 'Unable to update SKU.')
    } finally {
      setSkuSaving(false)
    }
  }

  const handleCancelSkuEdit = () => {
    setEditingSkuVariantId(null)
    setSkuInput('')
    setSkuError('')
  }

  // Bulk selection handlers.
  const handleToggleVariant = (variantId) => {
    const id = String(variantId)

    setSelectedVariantIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    )
  }

  const handleToggleAllVisible = () => {
    const visibleIds = filteredInventory.map(item => String(item.variantId))

    const everyVisibleSelected =
      visibleIds.length > 0 &&
      visibleIds.every(id => selectedVariantIds.includes(id))

    if (everyVisibleSelected) {
      setSelectedVariantIds(prev =>
        prev.filter(selectedId => !visibleIds.includes(selectedId))
      )
    } else {
      setSelectedVariantIds(prev =>
        [...new Set([...prev, ...visibleIds])]
      )
    }
  }

  const handleOpenBulkEditor = () => {
    if (selectedInventoryItems.length === 0) {
      setBulkError('Select at least one inventory variant.')
      return
    }

    if (selectedInventoryItems.length > MAX_BULK_UPDATES) {
      setBulkError(`You can update up to ${MAX_BULK_UPDATES} variants at a time.`)
      return
    }

    setBulkIndividualQuantities(
      Object.fromEntries(
        selectedInventoryItems.map(item => [String(item.variantId), ''])
      )
    )
    setBulkQuantity('')
    setBulkReason('')
    setBulkOperation('adjust')
    setBulkMode('same')
    setBulkError('')
    setBulkUpdateMessage('')
    setBulkPanelOpen(true)
  }

  const handleSaveBulkStock = async () => {
    if (selectedInventoryItems.length === 0) {
      setBulkError('Select at least one inventory variant.')
      return
    }

    if (selectedInventoryItems.length > MAX_BULK_UPDATES) {
      setBulkError(`You can update up to ${MAX_BULK_UPDATES} variants at a time.`)
      return
    }

    const trimmedReason = bulkReason.trim()

    if (!trimmedReason) {
      setBulkError('Please provide a reason for this bulk update.')
      return
    }

    if (trimmedReason.length > 200) {
      setBulkError('Reason cannot exceed 200 characters.')
      return
    }

    let updates

    if (bulkMode === 'same') {
      if (bulkQuantity.trim() === '') {
        setBulkError('Enter a quantity for the selected variants.')
        return
      }

      const quantity = Number(bulkQuantity)

      if (!Number.isInteger(quantity)) {
        setBulkError('Quantity must be a whole number.')
        return
      }

      if (bulkOperation === 'set' && quantity < 0) {
        setBulkError('Set quantity cannot be negative.')
        return
      }

      if (bulkOperation === 'adjust' && quantity === 0) {
        setBulkError('Adjustment quantity cannot be zero.')
        return
      }

      updates = selectedInventoryItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity,
      }))
    } else {
      updates = []

      for (const item of selectedInventoryItems) {
        const rawQuantity = bulkIndividualQuantities[String(item.variantId)] ?? ''

        if (String(rawQuantity).trim() === '') {
          setBulkError(`Enter a quantity for ${item.sku}.`)
          return
        }

        const quantity = Number(rawQuantity)

        if (!Number.isInteger(quantity)) {
          setBulkError(`Quantity for ${item.sku} must be a whole number.`)
          return
        }

        if (bulkOperation === 'set' && quantity < 0) {
          setBulkError(`Set quantity for ${item.sku} cannot be negative.`)
          return
        }

        if (bulkOperation === 'adjust' && quantity === 0) {
          setBulkError(`Adjustment for ${item.sku} cannot be zero.`)
          return
        }

        updates.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity,
        })
      }
    }

    try {
      setBulkSaving(true)
      setBulkError('')
      setBulkUpdateMessage('')

      await bulkUpdateAdminVariantStock(
        bulkOperation,
        updates,
        trimmedReason
      )

      const updatedCount = updates.length
      setBulkPanelOpen(false)
      setSelectedVariantIds([])
      setBulkUpdateMessage(
        `Successfully updated stock for ${updatedCount} variant${updatedCount === 1 ? '' : 's'}.`
      )
      await loadInventory()
    } catch (saveError) {
      setBulkError(saveError.message || 'Unable to complete the bulk stock update.')
    } finally {
      setBulkSaving(false)
    }
  }

  function openProduct(productId) {
    navigate(`/admin/products/${productId}`)
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[9px] uppercase tracking-[0.2em] text-neutral-400">
            Workspace / Operations
          </p>

          <h1 className="font-[var(--font-display)] text-3xl md:text-4xl">
            Inventory
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            Monitor stock levels and manage product variants.
          </p>
        </div>

        <button
          type="button"
          onClick={loadInventory}
          disabled={loading}
          className="flex items-center justify-center gap-2 border border-neutral-200 px-5 py-3 text-[10px] uppercase tracking-[0.14em] transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={13}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh inventory
        </button>
      </div>

      {/* Global inventory settings */}
      <section className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Inventory Settings
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Configure when product variants should be flagged as low stock.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label
              htmlFor="globalLowStockThreshold"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Global low-stock threshold
            </label>

            <input
              id="globalLowStockThreshold"
              type="number"
              min="0"
              step="1"
              value={thresholdInput}
              onChange={event => setThresholdInput(event.target.value)}
              className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveGlobalThreshold}
            disabled={thresholdSaving}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {thresholdSaving ? 'Saving...' : 'Save threshold'}
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Products without their own threshold use the global default of{' '}
          <span className="font-semibold">{globalThreshold}</span> units.
        </p>

        {thresholdMessage && (
          <p className="mt-3 text-sm text-gray-600" role="status">
            {thresholdMessage}
          </p>
        )}
      </section>

      {/* Product-specific threshold settings */}
      <section className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Product Thresholds
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Set individual low-stock thresholds for products or let them inherit the global default.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-3 pr-4 font-medium">Product</th>
                <th className="py-3 pr-4 font-medium">Threshold</th>
                <th className="py-3 pr-4 font-medium">Custom value</th>
                <th className="py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {productsWithInventory.map(product => {
                const productId = String(product.productId)
                const customThreshold = product.productLowStockThreshold
                const usesGlobal = product.usesGlobalThreshold ?? customThreshold == null

                return (
                  <tr key={productId} className="border-b border-gray-100">
                    <td className="py-4 pr-4">
                      <p className="font-medium text-gray-900">
                        {product.productName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {product.productSlug}
                      </p>
                    </td>

                    <td className="py-4 pr-4">
                      {usesGlobal ? (
                        <span className="text-gray-600">
                          Global ({globalThreshold})
                        </span>
                      ) : (
                        <span className="font-medium text-gray-900">
                          Custom ({customThreshold})
                        </span>
                      )}
                    </td>

                    <td className="py-4 pr-4">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={
                          productThresholdInputs[productId] ??
                          (customThreshold ?? '')
                        }
                        placeholder={`Global: ${globalThreshold}`}
                        onChange={event =>
                          setProductThresholdInputs(prev => ({
                            ...prev,
                            [productId]: event.target.value,
                          }))
                        }
                        className="w-28 rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                        aria-label={`Low-stock threshold for ${product.productName}`}
                      />
                    </td>

                    <td className="py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleSaveProductThreshold(productId, customThreshold)
                          }
                          disabled={productThresholdSaving[productId]}
                          className="rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                          {productThresholdSaving[productId] ? 'Saving...' : 'Save'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSaveProductThreshold(productId, customThreshold, true)
                          }
                          disabled={usesGlobal || productThresholdSaving[productId]}
                          className="rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Use global
                        </button>
                      </div>

                      {productThresholdMessages[productId] && (
                        <p className="mt-2 text-xs text-gray-600" role="status">
                          {productThresholdMessages[productId]}
                        </p>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Inventory summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StockSummary
          label="Total variants"
          value={summary.total}
          icon={Package}
          description={`${summary.totalUnits} total units across all variants`}
        />

        <StockSummary
          label="In stock"
          value={summary.inStock}
          icon={CircleCheck}
          description="Above each product's low-stock threshold"
        />

        <StockSummary
          label="Low stock"
          value={summary.lowStock}
          icon={AlertTriangle}
          description="Above zero and at or below each product's threshold"
        />

        <StockSummary
          label="Out of stock"
          value={summary.outOfStock}
          icon={CircleX}
          description="Variants with zero available units"
        />
      </div>

      {/* Stock filters */}
      <div className="flex gap-6 overflow-x-auto border-b border-neutral-200">
        {stockFilters.map(filter => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
            className={`whitespace-nowrap border-b pb-3 text-[10px] uppercase tracking-[0.12em] transition-colors ${
              activeFilter === filter.value
                ? 'border-black text-black'
                : 'border-transparent text-neutral-400 hover:text-black'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Inventory search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
        />

        <input
          type="search"
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search product, SKU, colour or size..."
          className="h-12 w-full border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none transition-colors focus:border-neutral-500"
        />
      </div>

      {/* Update notifications */}
      {stockUpdateMessage && (
        <p className="border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600" role="status">
          {stockUpdateMessage}
        </p>
      )}

      {skuUpdateMessage && (
        <p className="border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600" role="status">
          {skuUpdateMessage}
        </p>
      )}

      {bulkUpdateMessage && (
        <p className="border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600" role="status">
          {bulkUpdateMessage}
        </p>
      )}

      {/* Bulk selection toolbar */}
      <section className="flex flex-col justify-between gap-4 border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-neutral-900">
            {selectedVariantIds.length} variants selected
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Select individual variants or all visible results.
          </p>
          {selectedVariantIds.length > MAX_BULK_UPDATES && (
            <p className="mt-2 text-xs text-red-600">
              Select no more than {MAX_BULK_UPDATES} variants for one bulk update.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleAllVisible}
            disabled={filteredInventory.length === 0}
            className="border border-neutral-200 px-4 py-2 text-[10px] uppercase tracking-wider text-neutral-600 hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {allVisibleSelected ? 'Deselect visible' : 'Select visible'}
          </button>

          <button
            type="button"
            onClick={() => setSelectedVariantIds([])}
            disabled={selectedVariantIds.length === 0 || bulkSaving}
            className="border border-neutral-200 px-4 py-2 text-[10px] uppercase tracking-wider text-neutral-600 hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear selection
          </button>

          <button
            type="button"
            onClick={handleOpenBulkEditor}
            disabled={selectedVariantIds.length === 0 || selectedVariantIds.length > MAX_BULK_UPDATES || bulkSaving}
            className="bg-neutral-900 px-4 py-2 text-[10px] uppercase tracking-wider text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Bulk update
          </button>
        </div>
      </section>

      {/* Bulk update panel */}
      {bulkPanelOpen && (
        <section className="space-y-5 border border-neutral-200 bg-white p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-sm font-medium text-neutral-900">
                Bulk stock update
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Updating {selectedInventoryItems.length} selected variant{selectedInventoryItems.length === 1 ? '' : 's'}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setBulkPanelOpen(false)
                setBulkError('')
              }}
              disabled={bulkSaving}
              className="text-xs text-neutral-500 underline underline-offset-4 hover:text-black disabled:opacity-50"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="bulkOperation" className="mb-2 block text-[10px] uppercase tracking-wider text-neutral-500">
                Operation
              </label>
              <select
                id="bulkOperation"
                value={bulkOperation}
                onChange={event => setBulkOperation(event.target.value)}
                disabled={bulkSaving}
                className="h-11 w-full border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-500"
              >
                <option value="set">Set exact quantity</option>
                <option value="adjust">Adjust existing stock</option>
              </select>
            </div>

            <div>
              <label htmlFor="bulkMode" className="mb-2 block text-[10px] uppercase tracking-wider text-neutral-500">
                Quantity method
              </label>
              <select
                id="bulkMode"
                value={bulkMode}
                onChange={event => setBulkMode(event.target.value)}
                disabled={bulkSaving}
                className="h-11 w-full border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-500"
              >
                <option value="same">Same quantity for all selected</option>
                <option value="individual">Individual quantity per variant</option>
              </select>
            </div>
          </div>

          {bulkMode === 'same' ? (
            <div className="max-w-sm">
              <label htmlFor="bulkQuantity" className="mb-2 block text-[10px] uppercase tracking-wider text-neutral-500">
                {bulkOperation === 'set' ? 'New stock quantity' : 'Adjustment quantity'}
              </label>
              <input
                id="bulkQuantity"
                type="number"
                step="1"
                min={bulkOperation === 'set' ? 0 : undefined}
                value={bulkQuantity}
                onChange={event => setBulkQuantity(event.target.value)}
                disabled={bulkSaving}
                placeholder={bulkOperation === 'adjust' ? 'e.g. 5 or -2' : 'Enter exact quantity'}
                className="h-11 w-full border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-500"
              />
              <p className="mt-1 text-[10px] text-neutral-400">
                {bulkOperation === 'adjust'
                  ? 'Positive adds stock; negative removes stock.'
                  : 'Replaces the current stock quantity for every selected variant.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                Quantity by variant
              </p>
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {selectedInventoryItems.map(item => (
                  <div
                    key={item.variantId}
                    className="grid grid-cols-1 gap-3 border border-neutral-100 p-3 sm:grid-cols-[1fr_160px] sm:items-center"
                  >
                    <div>
                      <p className="text-xs font-medium text-neutral-800">{item.productName}</p>
                      <p className="mt-1 text-[10px] text-neutral-500">
                        {item.sku} · {item.color} · {item.size} · Current: {item.stock}
                      </p>
                    </div>
                    <input
                      type="number"
                      step="1"
                      min={bulkOperation === 'set' ? 0 : undefined}
                      value={bulkIndividualQuantities[String(item.variantId)] ?? ''}
                      onChange={event =>
                        setBulkIndividualQuantities(prev => ({
                          ...prev,
                          [String(item.variantId)]: event.target.value,
                        }))
                      }
                      disabled={bulkSaving}
                      placeholder={bulkOperation === 'adjust' ? 'e.g. 5 or -2' : 'New quantity'}
                      aria-label={`Bulk quantity for ${item.sku}`}
                      className="h-10 w-full border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-xl">
            <label htmlFor="bulkReason" className="mb-2 block text-[10px] uppercase tracking-wider text-neutral-500">
              Reason for update
            </label>
            <input
              id="bulkReason"
              type="text"
              maxLength={200}
              value={bulkReason}
              onChange={event => setBulkReason(event.target.value)}
              disabled={bulkSaving}
              placeholder="e.g. Weekly stock replenishment"
              className="h-11 w-full border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-500"
            />
            <p className="mt-1 text-[10px] text-neutral-400">
              {bulkReason.length}/200 characters. The reason is stored in inventory history.
            </p>
          </div>

          {bulkError && (
            <p className="text-xs text-red-600" role="alert">{bulkError}</p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveBulkStock}
              disabled={bulkSaving || selectedInventoryItems.length === 0}
              className="bg-neutral-900 px-5 py-3 text-[10px] uppercase tracking-wider text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bulkSaving ? 'Updating...' : `Update ${selectedInventoryItems.length} variants`}
            </button>
            <button
              type="button"
              onClick={() => {
                setBulkPanelOpen(false)
                setBulkError('')
              }}
              disabled={bulkSaving}
              className="border border-neutral-200 px-5 py-3 text-[10px] uppercase tracking-wider text-neutral-600 hover:border-neutral-400 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {/* Inventory table */}
      <div className="border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.14em]">
              Stock overview
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              {filteredInventory.length} of {inventory.length} variants
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-neutral-400">
            <RefreshCw size={16} className="animate-spin" />
            Loading inventory...
          </div>
        ) : error ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={loadInventory}
              className="mt-4 text-[10px] uppercase tracking-[0.14em] underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <Package size={24} className="text-neutral-300" />
            <p className="mt-4 text-sm text-neutral-500">
              {inventory.length === 0
                ? 'No inventory variants found.'
                : 'No variants match your search or filter.'}
            </p>
            <p className="mt-2 text-xs text-neutral-400">
              {inventory.length === 0
                ? 'Add product variants and their stock quantities to see them here.'
                : 'Try changing your search or selecting another stock filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="w-12 px-5 py-3">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={handleToggleAllVisible}
                      disabled={filteredInventory.length === 0}
                      aria-label="Select all visible variants"
                      className="h-4 w-4 cursor-pointer accent-black disabled:cursor-not-allowed"
                    />
                  </th>
                  <th className="px-5 py-3 text-[9px] font-normal uppercase tracking-[0.12em] text-neutral-400">
                    Product
                  </th>
                  <th className="px-5 py-3 text-[9px] font-normal uppercase tracking-[0.12em] text-neutral-400">
                    SKU
                  </th>
                  <th className="px-5 py-3 text-[9px] font-normal uppercase tracking-[0.12em] text-neutral-400">
                    Colour
                  </th>
                  <th className="px-5 py-3 text-[9px] font-normal uppercase tracking-[0.12em] text-neutral-400">
                    Size
                  </th>
                  <th className="px-5 py-3 text-[9px] font-normal uppercase tracking-[0.12em] text-neutral-400">
                    Available
                  </th>
                  <th className="px-5 py-3 text-[9px] font-normal uppercase tracking-[0.12em] text-neutral-400">
                    Status
                  </th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredInventory.map((item, index) => (
                  <Fragment key={`${item.productId}-${item.variantId || item.sku}-${index}`}>
                    <tr
                      onClick={() => openProduct(item.productId)}
                      className="cursor-pointer border-b border-neutral-100 last:border-0 transition-colors hover:bg-neutral-50"
                    >
                      <td
                        className="px-5 py-4"
                        onClick={event => event.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedVariantIds.includes(String(item.variantId))}
                          onChange={() => handleToggleVariant(item.variantId)}
                          aria-label={`Select ${item.productName}, ${item.color}, size ${item.size}`}
                          className="h-4 w-4 cursor-pointer accent-black"
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-11 shrink-0 overflow-hidden bg-neutral-100">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package size={16} className="text-neutral-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="max-w-[220px] truncate text-xs font-medium text-neutral-800">
                              {item.productName}
                            </p>
                            <p className="mt-1 text-[10px] text-neutral-400">
                              {item.productStatus}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td
                        className="px-5 py-4"
                        onClick={event => event.stopPropagation()}
                      >
                        {editingSkuVariantId === item.variantId ? (
                          <form
                            onSubmit={event => {
                              event.preventDefault()
                              handleSaveSku(item)
                            }}
                            className="min-w-[180px] space-y-2"
                          >
                            <input
                              type="text"
                              value={skuInput}
                              onChange={event => {
                                setSkuInput(event.target.value)
                                setSkuError('')
                              }}
                              maxLength={100}
                              autoFocus
                              placeholder="Enter SKU"
                              className="w-full border border-neutral-300 bg-white px-3 py-2 text-xs uppercase outline-none focus:border-black"
                            />
                            {skuError && (
                              <p className="text-[10px] text-red-600" role="alert">
                                {skuError}
                              </p>
                            )}
                            <div className="flex items-center gap-3">
                              <button
                                type="submit"
                                disabled={skuSaving}
                                className="text-[10px] font-medium uppercase tracking-wider text-black disabled:opacity-50"
                              >
                                {skuSaving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelSkuEdit}
                                disabled={skuSaving}
                                className="text-[10px] uppercase tracking-wider text-neutral-400 hover:text-black disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex flex-col items-start gap-2">
                            <span className="text-xs text-neutral-600">{item.sku}</span>
                            <button
                              type="button"
                              onClick={() => handleOpenSkuEditor(item)}
                              className="text-[9px] uppercase tracking-[0.12em] text-neutral-400 transition-colors hover:text-black"
                            >
                              Edit SKU
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs text-neutral-600">
                        {item.color}
                      </td>
                      <td className="px-5 py-4 text-xs text-neutral-600">
                        {item.size}
                      </td>
                      <td className="px-5 py-4 text-xs font-medium tabular-nums text-neutral-800">
                        {item.stock}
                      </td>
                      <td className="px-5 py-4">
                        <StockLabel
                          stock={item.stock}
                          threshold={getEffectiveThreshold(item)}
                        />
                      </td>
                      <td
                        className="px-5 py-4 text-right"
                        onClick={event => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleOpenStockEditor(item)}
                          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-neutral-500 transition-colors hover:text-black"
                        >
                          Edit stock
                          <ChevronRight size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleOpenHistory(item)
                          }}
                          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-neutral-400 transition-colors hover:text-black"
                        >
                          <HistoryIcon size={13} />
                          History
                        </button>
                      </td>
                    </tr>

                    {editingVariantId === item.variantId && (
                      <tr className="border-b border-neutral-200 bg-neutral-50">
                        <td colSpan={8} className="px-5 py-6">
                          <form
                            onSubmit={event => {
                              event.preventDefault()
                              handleSaveStock(item)
                            }}
                            className="space-y-5"
                          >
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                              <div>
                                <h3 className="text-sm font-medium text-neutral-900">
                                  Update stock
                                </h3>
                                <p className="mt-1 text-xs text-neutral-500">
                                  {item.productName} · {item.color} · {item.size}
                                </p>
                                <p className="mt-1 text-xs text-neutral-400">
                                  SKU: {item.sku} · Current stock: {item.stock}
                                </p>
                              </div>
                              <p className="text-xs text-neutral-500">
                                Every update is recorded in inventory history.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <div>
                                <label
                                  htmlFor={`stock-operation-${item.variantId}`}
                                  className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-neutral-500"
                                >
                                  Operation
                                </label>
                                <select
                                  id={`stock-operation-${item.variantId}`}
                                  value={stockEditForm.operation}
                                  onChange={event => {
                                    const operation = event.target.value
                                    setStockEditForm(prev => ({
                                      ...prev,
                                      operation,
                                      quantity: operation === 'adjust' ? '' : String(item.stock),
                                    }))
                                    setStockEditError('')
                                  }}
                                  className="h-11 w-full border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-500"
                                >
                                  <option value="set">Set exact quantity</option>
                                  <option value="adjust">Adjust existing stock</option>
                                </select>
                              </div>

                              <div>
                                <label
                                  htmlFor={`stock-quantity-${item.variantId}`}
                                  className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-neutral-500"
                                >
                                  {stockEditForm.operation === 'set' ? 'New quantity' : 'Adjustment quantity'}
                                </label>
                                <input
                                  id={`stock-quantity-${item.variantId}`}
                                  type="number"
                                  step="1"
                                  min={stockEditForm.operation === 'set' ? 0 : undefined}
                                  value={stockEditForm.quantity}
                                  onChange={event => {
                                    setStockEditForm(prev => ({
                                      ...prev,
                                      quantity: event.target.value,
                                    }))
                                    setStockEditError('')
                                  }}
                                  placeholder={stockEditForm.operation === 'adjust' ? 'e.g. 5 or -2' : 'Enter new quantity'}
                                  className="h-11 w-full border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-500"
                                />
                                <p className="mt-1 text-[10px] text-neutral-400">
                                  {stockEditForm.operation === 'adjust'
                                    ? 'Positive adds stock; negative removes stock.'
                                    : 'Enter the exact quantity currently available.'}
                                </p>
                              </div>

                              <div>
                                <label
                                  htmlFor={`stock-reason-${item.variantId}`}
                                  className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-neutral-500"
                                >
                                  Reason
                                </label>
                                <input
                                  id={`stock-reason-${item.variantId}`}
                                  type="text"
                                  maxLength={200}
                                  value={stockEditForm.reason}
                                  onChange={event => {
                                    setStockEditForm(prev => ({
                                      ...prev,
                                      reason: event.target.value,
                                    }))
                                    setStockEditError('')
                                  }}
                                  placeholder="e.g. New stock received"
                                  className="h-11 w-full border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-500"
                                />
                                <p className="mt-1 text-[10px] text-neutral-400">
                                  {stockEditForm.reason.length}/200 characters
                                </p>
                              </div>
                            </div>

                            {stockEditError && (
                              <p className="text-xs text-red-600" role="alert">
                                {stockEditError}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-3">
                              <button
                                type="submit"
                                disabled={stockSaving}
                                className="bg-neutral-900 px-5 py-3 text-[10px] uppercase tracking-[0.12em] text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {stockSaving ? 'Saving...' : 'Save stock'}
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelStockEdit}
                                disabled={stockSaving}
                                className="border border-neutral-200 px-5 py-3 text-[10px] uppercase tracking-[0.12em] text-neutral-600 transition-colors hover:border-neutral-400 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stock adjustment history drawer */}
        {historyVariant && (
          <div
            className="fixed inset-0 z-[100] flex justify-end bg-black/40"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                handleCloseHistory()
              }
            }}
          >
            <section
              className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="inventory-history-title"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-neutral-200 px-5 py-5 sm:px-7">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-neutral-400">
                    Inventory / Audit trail
                  </p>

                  <h2
                    id="inventory-history-title"
                    className="mt-2 text-lg font-medium text-neutral-900"
                  >
                    Stock adjustment history
                  </h2>

                  <p className="mt-2 text-xs text-neutral-500">
                    {historyVariant.productName} · {historyVariant.color} · {historyVariant.size}
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    SKU: {historyVariant.sku}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseHistory}
                  aria-label="Close stock history"
                  className="border border-neutral-200 p-2 text-neutral-500 hover:text-black"
                >
                  <X size={17} />
                </button>
              </div>

              {/* History content */}
              <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">

                {/* Summary */}
                <div className="mb-5 grid grid-cols-2 gap-3">
                  <div className="border border-neutral-200 p-4">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-neutral-400">
                      Current stock
                    </p>

                    <p className="mt-2 text-2xl font-medium tabular-nums">
                      {inventory.find(
                        item =>
                          String(item.variantId) === String(historyVariant.variantId)
                      )?.stock ?? historyVariant.stock}
                    </p>
                  </div>

                  <div className="border border-neutral-200 p-4">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-neutral-400">
                      Recorded updates
                    </p>

                    <p className="mt-2 text-2xl font-medium tabular-nums">
                      {historyPagination.total}
                    </p>
                  </div>
                </div>

                {/* Loading */}
                {historyLoading ? (
                  <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-neutral-400">
                    <RefreshCw size={16} className="animate-spin" />
                    Loading stock history...
                  </div>
                ) : historyError ? (
                  <div className="flex min-h-48 flex-col items-center justify-center text-center">
                    <p className="text-sm text-red-600">
                      {historyError}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        loadVariantHistory(
                          historyVariant,
                          historyPagination.page
                        )
                      }
                      className="mt-4 text-[10px] uppercase tracking-[0.14em] underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : historyEntries.length === 0 ? (
                  <div className="flex min-h-48 flex-col items-center justify-center border border-dashed border-neutral-200 px-5 text-center">
                    <HistoryIcon size={22} className="text-neutral-300" />

                    <p className="mt-3 text-sm text-neutral-600">
                      No stock adjustment history found.
                    </p>

                    <p className="mt-2 max-w-sm text-xs leading-5 text-neutral-400">
                      Stock changes recorded after inventory history tracking was enabled will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyEntries.map((entry, index) => {
                      const change = Number(entry.change) || 0

                      const changeLabel = change > 0
                        ? `+${change}`
                        : String(change)

                      const performedBy =
                        entry.performedBy?.email || 'Admin'

                      const createdAt = entry.createdAt
                        ? new Date(entry.createdAt)
                        : null

                      const formattedDate =
                        createdAt && !Number.isNaN(createdAt.getTime())
                          ? new Intl.DateTimeFormat('en-NG', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            }).format(createdAt)
                          : 'Date unavailable'

                      return (
                        <article
                          key={entry._id || `${entry.variantId}-${entry.createdAt}-${index}`}
                          className="border border-neutral-200 p-4 sm:p-5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <span className="inline-flex border border-neutral-200 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-neutral-600">
                                {entry.operation === 'set'
                                  ? 'Set quantity'
                                  : 'Stock adjustment'}
                              </span>

                              <p className="mt-2 text-xs text-neutral-500">
                                {formattedDate}
                              </p>
                            </div>

                            <p
                              className={`text-lg font-medium tabular-nums ${
                                change > 0
                                  ? 'text-emerald-700'
                                  : change < 0
                                    ? 'text-red-600'
                                    : 'text-neutral-700'
                              }`}
                            >
                              {changeLabel} units
                            </p>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-2 border-y border-neutral-100 py-3">
                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-neutral-400">
                                Previous
                              </p>

                              <p className="mt-1 text-sm font-medium tabular-nums">
                                {entry.previousStock}
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-neutral-400">
                                Change
                              </p>

                              <p className="mt-1 text-sm font-medium tabular-nums">
                                {changeLabel}
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-neutral-400">
                                New stock
                              </p>

                              <p className="mt-1 text-sm font-medium tabular-nums">
                                {entry.newStock}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-[9px] uppercase tracking-wider text-neutral-400">
                              Reason
                            </p>

                            <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">
                              {entry.reason || 'No reason provided'}
                            </p>
                          </div>

                          <p className="mt-3 text-[10px] text-neutral-400">
                            Performed by: {performedBy}
                          </p>
                        </article>
                      )
                    })}
                  </div>
                )}

                {/* Pagination */}
                {!historyLoading &&
                  !historyError &&
                  historyPagination.totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4">
                      <p className="text-xs text-neutral-500">
                        Page {historyPagination.page} of {historyPagination.totalPages}
                        {' · '}
                        {historyPagination.total} records
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            loadVariantHistory(
                              historyVariant,
                              historyPagination.page - 1
                            )
                          }
                          disabled={
                            historyLoading ||
                            historyPagination.page <= 1
                          }
                          className="border border-neutral-200 px-3 py-2 text-xs text-neutral-600 hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Previous
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            loadVariantHistory(
                              historyVariant,
                              historyPagination.page + 1
                            )
                          }
                          disabled={
                            historyLoading ||
                            historyPagination.page >= historyPagination.totalPages
                          }
                          className="border border-neutral-200 px-3 py-2 text-xs text-neutral-600 hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </section>
          </div>
        )}

      </div>
    </div>
  )
}
