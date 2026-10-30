
const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '')

async function request(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Accept: 'application/json',
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
    throw error
  }

  return result
}

// Keep the existing storefront's product shape working
// while MongoDB becomes the source of product data.

function imageUrls(images = []) {
  return images
    .map((image) => (
      typeof image === 'string' ? image : image?.url
    ))
    .filter(Boolean)
}

export function adaptProduct(product) {
  if (!product) return null

  return {
    ...product,

    id: product.legacyId || product._id,

    category:
      typeof product.category === 'object'
        ? product.category?.name || ''
        : product.category,

    images: imageUrls(product.images),

    colors: (product.colors || []).map((color) => ({
      ...color,
      images: imageUrls(color.images),
    })),

    matchingProducts: (product.matchingProducts || []).map(
      (matchingProduct) => adaptProduct(matchingProduct)
    ),

    availableSizes: product.availableSizes || [],
    sizes: product.sizes || [],
    features: product.features || [],
    details: product.details || [],
    delivery: product.delivery || {
      heading: '',
      paragraphs: [],
    },

    _id: product._id,
  }
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
