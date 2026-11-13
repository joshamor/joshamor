
const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '')

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: options.credentials || 'same-origin',
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  })

  let result

  try {
    result = await response.json()
  } catch {
    throw new Error('The server returned an invalid response.')
  }

  if (!response.ok || result.success === false) {
    const error = new Error(
      result.message || 'Something went wrong.'
    )

    error.status = response.status
    error.details = result.details || result.errors || []

    throw error
  }

  return result
}

// Keep the existing storefront's product shape working
// while MongoDB becomes the source of product data.


function imageUrls(images = []) {
  return images
    .map(image => typeof image === 'string' ? image : image?.url)
    .filter(Boolean)
}

export function adaptProduct(product) {
  if (!product) return null

  // Map variants first so we can extract sizes from them
  const variants = (product.variants || []).map(variant => ({
    ...variant,
    id: variant._id,
    stock: Number(variant.stock) || 0,
  }))

  // Derive available sizes from variants that have stock > 0 (or all variant sizes)
  const derivedSizes = [...new Set(variants.filter(v => v.stock > 0).map(v => v.size))]

  return {
    ...product,

    // Preserve compatibility with the existing cart.
    id: product.legacyId || product._id,
    _id: product._id,

    category:
      typeof product.category === 'object'
        ? product.category?.name || ''
        : product.category,

    images: imageUrls(product.images),

    colors: (product.colors || []).map(color => ({
      ...color,
      images: imageUrls(color.images),
    })),

    variants,

    matchingProducts: (product.matchingProducts || [])
      .map(matchingProduct => adaptProduct(matchingProduct)),

    // Use derived sizes as fallback if root sizes don't exist
    availableSizes: product.availableSizes?.length ? product.availableSizes : derivedSizes,
    sizes: product.sizes?.length ? product.sizes : derivedSizes,

    features: product.features || [],
    details: product.details || [],

    delivery: product.delivery || {
      heading: '',
      paragraphs: [],
    },
  }
}


export function getAvailableSizes(product, colorName) {
  if (!product || !colorName) return []

  return [
    ...new Set(
      (product.variants || [])
        .filter(variant =>
          variant.color?.toLowerCase() === colorName.toLowerCase() &&
          variant.stock > 0
        )
        .map(variant => variant.size)
    ),
  ]
}

export function getVariantStock(product, colorName, size) {
  const variant = product?.variants?.find(item =>
    item.color?.toLowerCase() === colorName?.toLowerCase() &&
    item.size?.toLowerCase() === size?.toLowerCase()
  )

  return variant?.stock ?? 0
}

export function getVariant(product, colorName, size) {
  return product?.variants?.find(item =>
    item.color?.toLowerCase() === colorName?.toLowerCase() &&
    item.size?.toLowerCase() === size?.toLowerCase()
  ) || null
}


export async function getProducts(options = {}) {
  const params = new URLSearchParams()

  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })

  const query = params.toString()
  const result = await request(`/products${query ? `?${query}` : ''}`)

  return {
    ...result,
    data: result.data.map(adaptProduct),
  }
}

export async function getProductBySlug(slug) {
  const result = await request(
    `/products/${encodeURIComponent(slug)}`
  )

  return {
    ...result,
    data: adaptProduct(result.data),
  }
}

export async function getCategories() {
  const result = await request('/categories')
  return result
}

// Admin API
// Authentication uses the HTTP-only cookie set by the backend.

async function adminRequest(endpoint, options = {}) {
  return request(`/admin${endpoint}`, {
    ...options,
    credentials: 'include',
  })
}

export async function adminLogin(email, password) {
  return adminRequest('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
}

export async function getAdminSession() {
  return adminRequest('/auth/me')
}

export async function adminLogout() {
  return adminRequest('/auth/logout', {
    method: 'POST',
  })
}

export async function getAdminProducts(options = {}) {
  const params = new URLSearchParams()

  Object.entries({
    status: 'all',
    page: 1,
    limit: 20,
    ...options,
  }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })

  return adminRequest(`/products?${params.toString()}`)
}


export async function createAdminProduct(productData) {
  return adminRequest('/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  })
}

export async function getAdminProductById(id) {
  return adminRequest(`/products/${encodeURIComponent(id)}`)
}

export async function updateAdminProduct(id, productData) {
  return adminRequest(`/products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  })
}

export async function publishAdminProduct(id) {
  return adminRequest(`/products/${encodeURIComponent(id)}/publish`, {
    method: 'PATCH',
  })
}

export async function unpublishAdminProduct(id) {
  return adminRequest(`/products/${encodeURIComponent(id)}/unpublish`, {
    method: 'PATCH',
  })
}

export async function archiveAdminProduct(id) {
  return adminRequest(`/products/${encodeURIComponent(id)}/archive`, {
    method: 'PATCH',
  })
}

export async function restoreAdminProduct(id) {
  return adminRequest(`/products/${encodeURIComponent(id)}/restore`, {
    method: 'PATCH',
  })
}



export async function uploadAdminProductImages(
  productId,
  files,
  target = 'gallery',
  colorName = ''
) {
  const formData = new FormData()

  // The backend expects this exact field name.
  Array.from(files).forEach(file => {
    formData.append('images', file)
  })

  formData.append('target', target)

  if (target === 'color') {
    formData.append('colorName', colorName)
  }

  return adminRequest(
    `/products/${encodeURIComponent(productId)}/images`,
    {
      method: 'POST',
      body: formData,
    }
  )
}

export async function deleteAdminProductImages(productId, publicIds) {
  return adminRequest(
    `/products/${encodeURIComponent(productId)}/images`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicIds }),
    }
  )
}


export const updateAdminProductVariants = (id, variants) => {
  return adminRequest(`/inventory/${id}/variants`, {
    method: 'PUT',
    body: JSON.stringify({ variants }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export const getAdminInventory = () => {
  return adminRequest('/inventory', {
    method: 'GET',
  })
}



export const getAdminInventorySettings = () => {
  return adminRequest('/inventory/settings', {
    method: 'GET',
  })
}

export const updateAdminGlobalLowStockThreshold = (lowStockThreshold) => {
  return adminRequest('/inventory/settings/low-stock-threshold', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lowStockThreshold }),
  })
}

export const updateAdminProductLowStockThreshold = (
  productId,
  lowStockThreshold
) => {
  return adminRequest(`/inventory/${productId}/low-stock-threshold`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lowStockThreshold }),
  })
}

export const updateAdminVariantStock = (
  productId,
  variantId,
  stockData
) => {
  return adminRequest(
    `/inventory/${productId}/variants/${variantId}/stock`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stockData),
    }
  )
}

export const updateAdminVariantSku = (
  productId,
  variantId,
  sku
) => {
  return adminRequest(
    `/inventory/${productId}/variants/${variantId}/sku`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sku }),
    }
  )
}


export const bulkUpdateAdminVariantStock = (
  operation,
  updates,
  reason
) => {
  return adminRequest('/inventory/bulk-stock', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operation,
      updates,
      reason,
    }),
  })
}


export const getAdminInventoryHistory = (
  productId,
  {
    variantId,
    page = 1,
    limit = 20,
  } = {}
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (variantId) {
    params.set('variantId', variantId)
  }

  return adminRequest(
    `/inventory/${encodeURIComponent(productId)}/history?${params.toString()}`,
    {
      method: 'GET',
    }
  )
}


// Admin Orders API

export const getAdminOrders = (options = {}) => {
  const params = new URLSearchParams()

  Object.entries({
    page: 1,
    limit: 20,
    sort: 'newest',
    ...options,
  }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })

  return adminRequest(`/orders?${params.toString()}`)
}

export const getAdminOrderById = id => {
  return adminRequest(`/orders/${encodeURIComponent(id)}`)
}

export const updateAdminOrderStatus = (id, orderStatus) => {
  return adminRequest(`/orders/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderStatus }),
  })
}

export const addAdminOrderNote = (id, note) => {
  return adminRequest(`/orders/${encodeURIComponent(id)}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ note }),
  })
}



export const syncGuestCart = (
  guestCartId,
  items,
  { signal } = {}
) => {
  return request(
    `/cart/${encodeURIComponent(guestCartId)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      }),
      signal,
    }
  )
}

export const saveGuestCartContact = (
  guestCartId,
  email,
  abandonedEmailConsent
) => {
  return request(
    `/cart/${encodeURIComponent(guestCartId)}/contact`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        abandonedEmailConsent,
      }),
    }
  )
}



export const subscribeToNewsletter = async ({
  email,
  consent,
  website = '',
}) => {
  const response = await fetch('/.netlify/functions/inner-circle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email.trim(),
      consent,
      website,
    }),
  })

  if (!response.ok) {
    throw new Error('Newsletter signup failed.')
  }

  try {
    return await response.json()
  } catch {
    return { success: true }
  }
}


export const createGuestOrder = (guestCartId, checkoutData) => {
  return request(
    `/orders/guest/${encodeURIComponent(guestCartId)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    }
  )
}

export const simulateGuestPayment = (
  guestCartId,
  orderId,
  outcome
) => {
  return request(
    `/orders/guest/${encodeURIComponent(guestCartId)}/${encodeURIComponent(orderId)}/simulate-payment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ outcome }),
    }
  )
}


export const initializeFlutterwaveCheckout = (
  guestCartId,
  orderId
) => {
  return request(
    `/orders/guest/${guestCartId}/${orderId}/flutterwave/initialize`,
    {
      method: 'POST',
    }
  )
}

export const verifyFlutterwavePayment = (
  guestCartId,
  orderId,
  verificationData
) =>
  request(
    `/orders/guest/${guestCartId}/${orderId}/flutterwave/verify`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verificationData),
    }
  )
