
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  LoaderCircle,
  Upload,
  EyeOff,
  Archive,
  RotateCcw,
} from 'lucide-react'

import BasicInformationSection from '../components/product-editor/BasicInformationSection'
import PricingCategorySection from '../components/product-editor/PricingCategorySection'
import ProductImagesSection from '../components/product-editor/ProductImagesSection'
import ColoursSizesSection from '../components/product-editor/ColoursSizesSection'
import ProductContentSection from '../components/product-editor/ProductContentSection'
import MatchingProductsSection from '../components/product-editor/MatchingProductsSection'
import SEOSettingsSection from '../components/product-editor/SEOSettingsSection'
import ProductStatusSection from '../components/product-editor/ProductStatusSection'

import {
  createAdminProduct,
  getAdminProductById,
  updateAdminProduct,
  getCategories,
  getAdminProducts,
  publishAdminProduct,
  unpublishAdminProduct,
  updateAdminProductVariants,
  archiveAdminProduct,
  restoreAdminProduct,
} from '../../services/api'



function slugify(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getProductFromResponse(result) {
  return result?.data?.product || result?.data || null
}

function createInitialForm() {
  return {
    name: '',
    slug: '',
    description: '',
    price: '',
    currency: 'NGN',
    category: '',
    featured: false,
    images: [],
    colors: [],
    sizes: [],
    variants: [],
    features: [],
    material: '',
    matchingProducts: [],
    madeIn: '',
    care: '',
    details: [],
    delivery: {
      heading: '',
      paragraphs: [],
    },
    seo: {
      title: '',
      description: '',
    },
  }
}


function createSku(productName, colorName, size) {
  const clean = value =>
    String(value || '')
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  const productPart = clean(productName).slice(0, 12)
  const colorPart = clean(colorName)
  const sizePart = clean(size)

  return [productPart, colorPart, sizePart]
    .filter(Boolean)
    .join('-')
}

function generateVariants(productName, colors, sizes, existingVariants = []) {
  const existingMap = new Map(
    existingVariants.map(variant => [
      `${variant.color.toLowerCase()}::${variant.size.toLowerCase()}`,
      variant,
    ])
  )

  return colors.flatMap(color =>
    sizes.map(size => {
      const key = `${color.name.toLowerCase()}::${size.toLowerCase()}`
      const existing = existingMap.get(key)

      return {
        sku: existing?.sku || createSku(productName, color.name, size),
        color: color.name,
        size,
        stock: Number(existing?.stock) || 0,
      }
    })
  )
}



export default function AdminProductEditor() {
  const { id } = useParams()
  const navigate = useNavigate()

  const isEditing = Boolean(id)

  const [form, setForm] = useState(createInitialForm)
  const [categories, setCategories] = useState([])
  const [productId, setProductId] = useState(id || null)
  const [productStatus, setProductStatus] = useState('draft')

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [lifecycleLoading, setLifecycleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const [matchingSearch, setMatchingSearch] = useState('')
  const [matchingResults, setMatchingResults] = useState([])
  const [selectedMatchingProducts, setSelectedMatchingProducts] = useState([])
  const [matchingLoading, setMatchingLoading] = useState(false)
  const [matchingError, setMatchingError] = useState('')
  const [publishErrors, setPublishErrors] = useState([])

  function markAsChanged() {
    setHasChanges(true)
    setSuccess('')
    setError('')
    setPublishErrors([])
  }


  useEffect(() => {
    let active = true

    async function loadEditor() {
      try {
        setLoading(true)
        setError('')

        const categoryResult = await getCategories()

        if (active) {
          setCategories(categoryResult?.data || [])
        }

        if (!id) return

        const result = await getAdminProductById(id)
        const product = getProductFromResponse(result)

        if (!product) {
          throw new Error('Unable to load this product.')
        }

        if (!active) return

        setProductId(product._id)
        setProductStatus(product?.status || 'draft')


        setForm({
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || '',
          price: product.price ?? '',
          currency: product.currency || 'NGN',
          category:
            typeof product.category === 'object'
              ? product.category?._id || ''
              : product.category || '',
          featured: Boolean(product.featured),
          images: product.images || [],
          colors: product.colors || [],
          sizes: product.sizes || [],
          variants: product.variants || [],
          features: product.features || [],
          material: product.material || '',
          madeIn: product.madeIn || '',
          care: product.care || '',

          details: product.details || [],

          delivery: {
            heading: product.delivery?.heading || '',
            paragraphs: product.delivery?.paragraphs || [],
          },

          seo: {
            title: product.seo?.title || '',
            description: product.seo?.description || '',
          },
          matchingProducts: (product.matchingProducts || []).map(item =>
            typeof item === 'object' ? item._id : item
          ),
        })

        setSelectedMatchingProducts(
          (product.matchingProducts || []).filter(
            item => typeof item === 'object' && item._id
          )
        )

        setSlugManuallyEdited(true)
        setHasChanges(false)
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load the product editor.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadEditor()

    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    let active = true

    const timeout = setTimeout(async () => {
      try {
        setMatchingLoading(true)
        setMatchingError('')

        const result = await getAdminProducts({
          search: matchingSearch.trim(),
          status: 'published',
          page: 1,
          limit: 50,
        })

        if (!active) return

        const products = result?.data?.products || []

        setMatchingResults(
          products.filter(product => product._id !== productId)
        )
      } catch (err) {
        if (active) {
          setMatchingError(
            err.message || 'Unable to load matching products.'
          )
        }
      } finally {
        if (active) setMatchingLoading(false)
      }
    }, 300)

    return () => {
      active = false
      clearTimeout(timeout)
    }
  }, [matchingSearch, productId])

  function addMatchingProduct(product) {
    if (!product?._id || String(product._id) === String(productId)) {
      return
    }

    setForm(current => {
      const currentIds = Array.isArray(current.matchingProducts)
        ? current.matchingProducts
        : []

      const alreadyAdded = currentIds.some(
        id => String(id) === String(product._id)
      )

      if (alreadyAdded) return current

      return {
        ...current,
        matchingProducts: [...currentIds, product._id],
      }
    })

    setSelectedMatchingProducts(current => {
      const alreadyAdded = current.some(
        item => String(item._id) === String(product._id)
      )

      if (alreadyAdded) return current

      return [...current, product]
    })

    setHasChanges(true)
    setError('')
    setSuccess('')
    setPublishErrors([])
  }


  function removeMatchingProduct(productIdToRemove) {
    setForm(current => ({
      ...current,
      matchingProducts: current.matchingProducts.filter(
        id => id !== productIdToRemove
      ),
    }))

    setSelectedMatchingProducts(current =>
      current.filter(product => product._id !== productIdToRemove)
    )

    setHasChanges(true)
    setError('')
    setSuccess('')
    setPublishErrors([])
  }

  const updateField = useCallback((field, value) => {
    setForm(current => {
      const next = {
        ...current,
        [field]: value,
      }

      if (field === 'name' && !slugManuallyEdited) {
        next.slug = slugify(value)
      }

      return next
    })

    setHasChanges(true)
    setSuccess('')
    setError('')
    setPublishErrors([])
  }, [slugManuallyEdited])

  function handleSlugChange(value) {
    setSlugManuallyEdited(true)
    updateField('slug', slugify(value))
  }

  const addFeature = () => {
    setForm(prev => ({
      ...prev,
      features: [...prev.features, ''],
    }))
    markAsChanged()
  }

  const updateFeature = (index, value) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? value : feature
      ),
    }))
    markAsChanged()
  }

  const removeFeature = index => {
    setForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
    markAsChanged()
  }

  const addDetail = () => {
    setForm(prev => ({
      ...prev,
      details: [...prev.details, { label: '', value: '' }],
    }))
    markAsChanged()
  }

  const updateDetail = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      details: prev.details.map((detail, i) =>
        i === index ? { ...detail, [field]: value } : detail
      ),
    }))
    markAsChanged()
  }

  const removeDetail = index => {
    setForm(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }))
    markAsChanged()
  }

  const updateDelivery = (field, value) => {
    setForm(prev => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        [field]: value,
      },
    }))
    markAsChanged()
  }

  const addDeliveryParagraph = () => {
    setForm(prev => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        paragraphs: [...prev.delivery.paragraphs, ''],
      },
    }))
    markAsChanged()
  }

  const updateDeliveryParagraph = (index, value) => {
    setForm(prev => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        paragraphs: prev.delivery.paragraphs.map((paragraph, i) =>
          i === index ? value : paragraph
        ),
      },
    }))
    markAsChanged()
  }

  const removeDeliveryParagraph = index => {
    setForm(prev => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        paragraphs: prev.delivery.paragraphs.filter((_, i) => i !== index),
      },
    }))
    markAsChanged()
  }

  const updateSeo = (field, value) => {
    setForm(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value,
      },
    }))
    markAsChanged()
  }


  function addColor() {
    setForm(current => ({
      ...current,
      colors: [
        ...current.colors,
        {
          name: '',
          hex: '#000000',
          images: [],
        },
      ],
    }))
    setHasChanges(true)
  }

  function updateColor(index, field, value) {
    setForm(current => ({
      ...current,
      colors: current.colors.map((color, colorIndex) =>
        colorIndex === index
          ? { ...color, [field]: value }
          : color
      ),
    }))
    setHasChanges(true)
  }

  function removeColor(index) {
    setForm(current => {
      const removedColor = current.colors[index]

      return {
        ...current,
        colors: current.colors.filter(
          (_, colorIndex) => colorIndex !== index
        ),
        variants: current.variants.filter(
          variant =>
            variant.color.toLowerCase() !== removedColor.name.toLowerCase()
        ),
      }
    })
    setHasChanges(true)
  }

  function addSize(value) {
    const size = value.trim().toUpperCase()

    if (!size) return

    if (form.sizes.some(item => item.toLowerCase() === size.toLowerCase())) {
      return
    }

    setForm(current => ({
      ...current,
      sizes: [...current.sizes, size],
    }))
    setHasChanges(true)
  }

  function removeSize(size) {
    setForm(current => ({
      ...current,
      sizes: current.sizes.filter(
        item => item.toLowerCase() !== size.toLowerCase()
      ),
      variants: current.variants.filter(
        variant => variant.size.toLowerCase() !== size.toLowerCase()
      ),
    }))
    setHasChanges(true)
  }

  function updateVariant(index, field, value) {
    setForm(current => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index
          ? { ...variant, [field]: value }
          : variant
      ),
    }))

    setHasChanges(true)
  }

  function generateProductVariants() {
    if (!form.colors.length || !form.sizes.length) {
      setError('Add at least one colour and one size first.')
      return
    }

    if (form.colors.some(color => !color.name.trim())) {
      setError('Please give every colour a name before generating variants.')
      return
    }

    const names = form.colors.map(color => color.name.trim().toLowerCase())

    if (new Set(names).size !== names.length) {
      setError('Each colour must have a unique name.')
      return
    }

    setForm(current => ({
      ...current,
      variants: generateVariants(
        current.name,
        current.colors,
        current.sizes,
        current.variants
      ),
    }))

    setHasChanges(true)
    setError('')
    setSuccess('')
  }


  async function handleSave() {
    if (saving) return

    if (!form.name.trim()) {
      setError('Please enter a product name before saving.')
      return
    }

    if (form.colors.some(color => !color.name.trim())) {
      setError('Please enter a name for every colour.')
      return
    }

    if (
      form.variants.some(variant =>
        !variant.sku.trim() ||
        !variant.color.trim() ||
        !variant.size.trim() ||
        !Number.isInteger(Number(variant.stock)) ||
        Number(variant.stock) < 0
      )
    ) {
      setError('Please check every variant SKU and stock quantity.')
      return
    }

    const skuValues = form.variants.map(
      variant => variant.sku.trim().toUpperCase()
    )

    if (new Set(skuValues).size !== skuValues.length) {
      setError('Every variant must have a unique SKU.')
      return
    }


    const productData = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      description: form.description.trim(),
      currency: form.currency,
      featured: form.featured,

      images: form.images,
      colors: form.colors,
      sizes: form.sizes,
      features: form.features
        .map(feature => feature.trim())
        .filter(Boolean),

      material: form.material.trim(),
      madeIn: form.madeIn.trim(),
      care: form.care.trim(),

      details: form.details
        .map(detail => ({
          label: detail.label.trim(),
          value: detail.value.trim(),
        }))
        .filter(detail => detail.label && detail.value),

      delivery: {
        heading: form.delivery.heading.trim(),
        paragraphs: form.delivery.paragraphs
          .map(paragraph => paragraph.trim())
          .filter(Boolean),
      },

      seo: {
        title: form.seo.title.trim(),
        description: form.seo.description.trim(),
      },
      matchingProducts: form.matchingProducts,


    }


    // Don't send blank optional fields.
    if (form.price !== '' && form.price !== null) {
      productData.price = Number(form.price)
    }

    if (form.category) {
      productData.category = form.category
    }
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      setPublishErrors([])

      let result

      if (productId) {
        result = await updateAdminProduct(productId, productData)
      } else {
        result = await createAdminProduct(productData)
      }

      const product = getProductFromResponse(result)
      const savedId = product?._id || productId

      if (!savedId) {
        throw new Error('The product was saved, but no product ID was returned.')
      }

      // Keep the product ID even if the inventory request fails.
      setProductId(savedId)
      setProductStatus(product?.status || productStatus)

      // Ensure new drafts can be reopened if a later request fails.
      if (!id) {
        navigate(`/admin/products/${savedId}`, { replace: true })
      }

      // Save variants through the dedicated inventory endpoint.
      await updateAdminProductVariants(
        savedId,
        form.variants.map(variant => ({
          sku: variant.sku.trim().toUpperCase(),
          color: variant.color.trim(),
          size: variant.size.trim(),
          stock: Number(variant.stock),
        }))
      )

      setHasChanges(false)
      setSuccess('Product and inventory saved successfully.')
    } catch (err) {
      setError(
        err.message ||
        'The product could not be saved completely. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handlePublishAction() {
    if (!productId || saving || lifecycleLoading) return

    if (hasChanges) {
      setError('Please save your changes before changing the product status.')
      setSuccess('')
      return
    }

    const isPublished = productStatus === 'published'

    const confirmed = window.confirm(
      isPublished
        ? 'Are you sure you want to unpublish this product? It will no longer be visible in the shop.'
        : 'Are you sure you want to publish this product?'
    )

    if (!confirmed) return

    try {
      setLifecycleLoading(true)
      setError('')
      setSuccess('')
      setPublishErrors([])

      if (isPublished) {
        await unpublishAdminProduct(productId)
        setProductStatus('draft')
        setSuccess('Product unpublished successfully.')
      } else {
        await publishAdminProduct(productId)
        setProductStatus('published')
        setSuccess('Product published successfully.')
      }
    } catch (err) {
      setError(err.message || 'Unable to update the product status.')

      if (!isPublished) {
        setPublishErrors(
          Array.isArray(err.details) ? err.details : []
        )
      }
    } finally {
      setLifecycleLoading(false)
    }
  }

  async function handleArchiveAction() {
    if (!productId || saving || lifecycleLoading) return

    if (hasChanges) {
      setError('Please save your changes before changing the product status.')
      setSuccess('')
      return
    }

    const isArchived = productStatus === 'archived'

    const confirmed = window.confirm(
      isArchived
        ? 'Are you sure you want to restore this product? It will return to Draft and will not be published.'
        : 'Are you sure you want to archive this product?'
    )

    if (!confirmed) return

    try {
      setLifecycleLoading(true)
      setError('')
      setSuccess('')

      if (isArchived) {
        await restoreAdminProduct(productId)
        setProductStatus('draft')
        setSuccess('Product restored successfully. It is now a draft.')
      } else {
        await archiveAdminProduct(productId)
        setProductStatus('archived')
        setSuccess('Product archived successfully.')
      }
    } catch (err) {
      setError(err.message || 'Unable to update the product status.')
    } finally {
      setLifecycleLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoaderCircle className="h-5 w-5 animate-spin text-neutral-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8">
      <button
        type="button"
        onClick={() => navigate('/admin/products')}
        className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-neutral-500 transition hover:text-black"
      >
        <ArrowLeft size={15} />
        Back to products
      </button>

      <div className="mb-8 flex flex-col justify-between gap-5 border-b border-neutral-200 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            Product management
          </p>

          <h1 className="font-display text-3xl text-neutral-950">
            {isEditing ? 'Edit product' : 'New product'}
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Add the essential information for this product.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`border px-3 py-2 text-[10px] uppercase tracking-[0.12em] ${
              productStatus === 'published'
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : productStatus === 'archived'
                  ? 'border-neutral-300 bg-neutral-100 text-neutral-500'
                  : 'border-neutral-200 text-neutral-600'
            }`}
          >
            {productStatus}
          </span>

          {productStatus !== 'archived' && productId && (
            <button
              type="button"
              onClick={handlePublishAction}
              disabled={
                saving ||
                lifecycleLoading ||
                hasChanges
              }
              className={`inline-flex items-center justify-center gap-2 border px-4 py-3 text-[10px] font-medium uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-40 ${
                productStatus === 'published'
                  ? 'border-neutral-300 text-neutral-700 hover:border-neutral-950 hover:text-neutral-950'
                  : 'border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-700'
              }`}
            >
              {lifecycleLoading ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : productStatus === 'published' ? (
                <EyeOff size={14} />
              ) : (
                <Upload size={14} />
              )}

              {lifecycleLoading
                ? 'Updating...'
                : productStatus === 'published'
                  ? 'Unpublish'
                  : 'Publish'}
            </button>
          )}

          {productId && (
            <button
              type="button"
              onClick={handleArchiveAction}
              disabled={
                saving ||
                lifecycleLoading ||
                hasChanges
              }
              className={`inline-flex items-center justify-center gap-2 border px-4 py-3 text-[10px] font-medium uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-40 ${
                productStatus === 'archived'
                  ? 'border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-white'
                  : 'border-neutral-300 text-neutral-600 hover:border-red-700 hover:text-red-700'
              }`}
            >
              {lifecycleLoading ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : productStatus === 'archived' ? (
                <RotateCcw size={14} />
              ) : (
                <Archive size={14} />
              )}

              {lifecycleLoading
                ? 'Updating...'
                : productStatus === 'archived'
                  ? 'Restore'
                  : 'Archive'}
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges && Boolean(productId)}
            className="inline-flex items-center justify-center gap-2 bg-neutral-950 px-5 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saving ? 'Saving...' : 'Save as draft'}
          </button>
          {hasChanges && productId && (
            <p className="mb-6 text-xs text-amber-700">
              You have unsaved changes. Save the product before publishing or unpublishing it.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {publishErrors.length > 0 && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
          <p className="mb-2 font-medium">
            This product needs a few changes before it can be published:
          </p>

          <ul className="list-disc space-y-1 pl-5">
            {publishErrors.map((message, index) => (
              <li key={`${index}-${message}`}>
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}
      {success && (
        <div className="mb-6 border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {success}
        </div>
      )}

      <div className="space-y-10">
      <BasicInformationSection
        form={form}
        updateField={updateField}
        handleSlugChange={handleSlugChange}
      />
      <PricingCategorySection
        form={form}
        categories={categories}
        updateField={updateField}
      />

      <ProductImagesSection
        productId={productId}
        images={form.images}
        colors={form.colors}
        onChange={({ images, colors }) => {
          setForm(current => ({
            ...current,
            images,
            colors,
          }))

          markAsChanged()
        }}
        />



        <ColoursSizesSection
          form={form}
          addColor={addColor}
          updateColor={updateColor}
          removeColor={removeColor}
          addSize={addSize}
          removeSize={removeSize}
          generateProductVariants={generateProductVariants}
          updateVariant={updateVariant}
        />


        <ProductContentSection
          form={form}
          updateField={updateField}
          addFeature={addFeature}
          updateFeature={updateFeature}
          removeFeature={removeFeature}
          addDetail={addDetail}
          updateDetail={updateDetail}
          removeDetail={removeDetail}
          updateDelivery={updateDelivery}
          addDeliveryParagraph={addDeliveryParagraph}
          updateDeliveryParagraph={updateDeliveryParagraph}
          removeDeliveryParagraph={removeDeliveryParagraph}
        />


        {/* MATCHING PRODUCTS */}
        <MatchingProductsSection
          form={form}
          matchingSearch={matchingSearch}
          setMatchingSearch={setMatchingSearch}
          matchingResults={matchingResults}
          selectedMatchingProducts={selectedMatchingProducts}
          matchingLoading={matchingLoading}
          matchingError={matchingError}
          addMatchingProduct={addMatchingProduct}
          removeMatchingProduct={removeMatchingProduct}
        />

        {/* SEO */}
        <SEOSettingsSection
          form={form}
          updateSeo={updateSeo}
        />

        <ProductStatusSection
          productId={productId}
          saving={saving}
          hasChanges={hasChanges}
          handleSave={handleSave}
        />

      </div>
    </div>
  )
}
