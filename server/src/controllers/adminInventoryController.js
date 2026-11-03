
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import InventoryLog from '../models/InventoryLog.js'
import Settings from '../models/Settings.js'

const getGlobalSettings = async () => {
  let settings = await Settings.findOne({ key: 'global' })

  if (!settings) {
    settings = await Settings.create({
      key: 'global',
      inventory: {
        lowStockThreshold: 5,
      },
    })
  }

  return settings
}


export async function updateVariantStock(req, res, next) {
  const session = await mongoose.startSession()

  try {
    const { id, variantId } = req.params
    const { operation, quantity, reason } = req.body

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(variantId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product or variant ID.',
      })
    }

    if (!['set', 'adjust'].includes(operation)) {
      return res.status(400).json({
        success: false,
        message: 'Operation must be either set or adjust.',
      })
    }

    if (
      quantity === undefined ||
      quantity === null ||
      quantity === '' ||
      !Number.isInteger(Number(quantity))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a whole number.',
      })
    }

    const numericQuantity = Number(quantity)

    if (operation === 'set' && numericQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative.',
      })
    }

    if (operation === 'adjust' && numericQuantity === 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock adjustment cannot be zero.',
      })
    }

    const trimmedReason = String(reason || '').trim()

    if (!trimmedReason) {
      return res.status(400).json({
        success: false,
        message: 'A reason for the stock change is required.',
      })
    }

    if (trimmedReason.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Reason cannot exceed 200 characters.',
      })
    }

    let responseData

    await session.withTransaction(async () => {
      const product = await Product.findById(id).session(session)

      if (!product) {
        const error = new Error('Product not found.')
        error.status = 404
        throw error
      }

      const variant = product.variants.id(variantId)

      if (!variant) {
        const error = new Error('Product variant not found.')
        error.status = 404
        throw error
      }

      const previousStock = variant.stock

      const newStock =
        operation === 'set'
          ? numericQuantity
          : previousStock + numericQuantity

      if (newStock < 0) {
        const error = new Error(
          `Insufficient stock. Current stock is ${previousStock}.`
        )
        error.status = 400
        throw error
      }

      variant.stock = newStock

      await product.save({ session })

      const change = newStock - previousStock

      await InventoryLog.create(
        [
          {
            product: product._id,
            variantId: variant._id,
            sku: variant.sku,
            color: variant.color,
            size: variant.size,
            operation,
            previousStock,
            change,
            newStock,
            reason: trimmedReason,
            performedBy: req.admin?._id || null,
          },
        ],
        { session }
      )

      responseData = {
        productId: product._id,
        variant: {
          _id: variant._id,
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          previousStock,
          stock: newStock,
          change,
        },
      }
    })

    return res.status(200).json({
      success: true,
      message: 'Stock updated successfully.',
      data: responseData,
    })
  } catch (error) {
    if (
      error.status ||
      error.name === 'ValidationError' ||
      error.name === 'CastError'
    ) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message,
      })
    }

    next(error)
  } finally {
    await session.endSession()
  }
}


export async function getInventoryHistory(req, res, next) {
  try {
    const { id } = req.params
    const { variantId, page = 1, limit = 20 } = req.query

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    if (
      variantId &&
      !mongoose.isValidObjectId(variantId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid variant ID.',
      })
    }

    const parsedPage = Number(page)
    const parsedLimit = Number(limit)

    if (
      !Number.isInteger(parsedPage) ||
      parsedPage < 1 ||
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination values.',
      })
    }

    const productExists = await Product.exists({ _id: id })

    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    const filter = {
      product: id,
    }

    if (variantId) {
      filter.variantId = variantId
    }

    const skip = (parsedPage - 1) * parsedLimit

    const [history, total] = await Promise.all([
      InventoryLog.find(filter)
        .populate('performedBy', 'email')
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),

      InventoryLog.countDocuments(filter),
    ])

    return res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages: Math.ceil(total / parsedLimit),
        },
      },
    })
  } catch (error) {
    next(error)
  }
}


export async function updateProductVariants(req, res, next) {
  try {
    const { id } = req.params
    const { variants } = req.body

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    if (!Array.isArray(variants)) {
      return res.status(400).json({
        success: false,
        message: 'Variants must be provided as an array.',
      })
    }

    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    const seenCombinations = new Set()
    const seenSkus = new Set()

    const normalizedVariants = []

    for (const variant of variants) {
      const sku = String(variant.sku || '').trim().toUpperCase()
      const colorInput = String(variant.color || '').trim()
      const sizeInput = String(variant.size || '').trim()
      const stock = Number(variant.stock)

      if (!sku || !colorInput || !sizeInput) {
        return res.status(400).json({
          success: false,
          message: 'Every variant needs a SKU, colour and size.',
        })
      }

      if (!Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid stock quantity for SKU ${sku}. Stock must be a whole number of zero or more.`,
        })
      }

      const matchingColor = product.colors.find(
        color => color.name.trim().toLowerCase() === colorInput.toLowerCase()
      )

      if (!matchingColor) {
        return res.status(400).json({
          success: false,
          message: `Colour "${colorInput}" is not configured for this product.`,
        })
      }

      const matchingSize = product.sizes.find(
        size => size.trim().toLowerCase() === sizeInput.toLowerCase()
      )

      if (!matchingSize) {
        return res.status(400).json({
          success: false,
          message: `Size "${sizeInput}" is not configured for this product.`,
        })
      }

      const combinationKey = `${matchingColor.name.toLowerCase()}::${matchingSize.toLowerCase()}`

      if (seenCombinations.has(combinationKey)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate colour and size combination: ${matchingColor.name} / ${matchingSize}.`,
        })
      }

      if (seenSkus.has(sku)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate SKU: ${sku}.`,
        })
      }

      seenCombinations.add(combinationKey)
      seenSkus.add(sku)

      normalizedVariants.push({
        sku,
        color: matchingColor.name,
        size: matchingSize,
        stock,
      })
    }

    // SKUs must also be unique across other products.
    const existingSku = await Product.findOne({
      _id: { $ne: product._id },
      'variants.sku': { $in: [...seenSkus] },
    }).select('name variants.sku')

    if (existingSku) {
      const conflictingSku = existingSku.variants.find(
        variant => seenSkus.has(variant.sku)
      )?.sku

      return res.status(409).json({
        success: false,
        message: `SKU ${conflictingSku} is already used by another product.`,
      })
    }

    // Preserve variant IDs for combinations that already exist.
    const existingVariants = new Map(
      product.variants.map(variant => [
        `${variant.color.toLowerCase()}::${variant.size.toLowerCase()}`,
        variant,
      ])
    )

    product.variants = normalizedVariants.map(variant => {
      const key = `${variant.color.toLowerCase()}::${variant.size.toLowerCase()}`
      const existing = existingVariants.get(key)

      return {
        ...variant,
        ...(existing ? { _id: existing._id } : {}),
      }
    })

    await product.save()

    return res.status(200).json({
      success: true,
      message: 'Product inventory updated successfully.',
      data: {
        productId: product._id,
        variants: product.variants,
      },
    })
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    next(error)
  }
}


export async function bulkUpdateVariantStock(req, res, next) {
  const session = await mongoose.startSession()

  try {
    const { operation, updates, reason } = req.body

    if (!['set', 'adjust'].includes(operation)) {
      return res.status(400).json({
        success: false,
        message: 'Operation must be either set or adjust.',
      })
    }

    if (
      !Array.isArray(updates) ||
      updates.length === 0 ||
      updates.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Provide between 1 and 100 stock updates.',
      })
    }

    const trimmedReason = String(reason || '').trim()

    if (!trimmedReason) {
      return res.status(400).json({
        success: false,
        message: 'A reason for the stock change is required.',
      })
    }

    if (trimmedReason.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Reason cannot exceed 200 characters.',
      })
    }

    const seenVariants = new Set()
    const normalizedUpdates = []

    for (const item of updates) {
      const { productId, variantId, quantity } = item || {}

      if (
        !mongoose.isValidObjectId(productId) ||
        !mongoose.isValidObjectId(variantId)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Every update needs a valid product ID and variant ID.',
        })
      }

      if (
        quantity === undefined ||
        quantity === null ||
        quantity === '' ||
        !Number.isInteger(Number(quantity))
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for variant ${variantId}. Quantity must be a whole number.`,
        })
      }

      const numericQuantity = Number(quantity)

      if (operation === 'set' && numericQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock cannot be negative.',
        })
      }

      if (operation === 'adjust' && numericQuantity === 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock adjustments cannot be zero.',
        })
      }

      const key = `${productId}:${variantId}`

      if (seenVariants.has(key)) {
        return res.status(400).json({
          success: false,
          message: `Variant ${variantId} appears more than once.`,
        })
      }

      seenVariants.add(key)

      normalizedUpdates.push({
        productId: String(productId),
        variantId: String(variantId),
        quantity: numericQuantity,
      })
    }

    const productIds = [
      ...new Set(normalizedUpdates.map(item => item.productId)),
    ]

    let responseUpdates = []

    await session.withTransaction(async () => {
      const products = await Product.find({
        _id: { $in: productIds },
      }).session(session)

      const productsById = new Map(
        products.map(product => [product._id.toString(), product])
      )

      const logEntries = []
      const results = []

      for (const item of normalizedUpdates) {
        const product = productsById.get(item.productId)

        if (!product) {
          const error = new Error(
            `Product ${item.productId} was not found.`
          )
          error.status = 404
          throw error
        }

        const variant = product.variants.id(item.variantId)

        if (!variant) {
          const error = new Error(
            `Variant ${item.variantId} was not found in product ${product.name}.`
          )
          error.status = 404
          throw error
        }

        const previousStock = variant.stock

        const newStock =
          operation === 'set'
            ? item.quantity
            : previousStock + item.quantity

        if (newStock < 0) {
          const error = new Error(
            `Insufficient stock for SKU ${variant.sku}. Current stock is ${previousStock}.`
          )
          error.status = 400
          throw error
        }

        variant.stock = newStock

        const change = newStock - previousStock

        logEntries.push({
          product: product._id,
          variantId: variant._id,
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          operation,
          previousStock,
          change,
          newStock,
          reason: trimmedReason,
          performedBy: req.admin?._id || null,
        })

        results.push({
          productId: product._id,
          productName: product.name,
          variantId: variant._id,
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          previousStock,
          stock: newStock,
          change,
        })
      }

      // Save each product once, even if it has multiple selected variants.
      for (const product of products) {
        await product.save({ session })
      }

      // Create one history record for every changed variant.
      await InventoryLog.create(logEntries, {
        session,
        ordered: true,
      })

      responseUpdates = results
    })

    return res.status(200).json({
      success: true,
      message: `${responseUpdates.length} variant(s) updated successfully.`,
      data: {
        updatedCount: responseUpdates.length,
        updates: responseUpdates,
      },
    })
  } catch (error) {
    if (
      error.status ||
      error.name === 'ValidationError' ||
      error.name === 'CastError'
    ) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message,
      })
    }

    next(error)
  } finally {
    await session.endSession()
  }
}


export async function getInventory(req, res, next) {

  const settings = await getGlobalSettings()

  const globalThreshold = settings.inventory.lowStockThreshold

  try {
    const products = await Product.find({
      'variants.0': { $exists: true },
    })
      .select('name slug status images colors variants lowStockThreshold')
      .sort({ updatedAt: -1 })
      .lean()

    const inventory = products.flatMap(product =>
      product.variants.map(variant => {
        const matchingColor = product.colors.find(
          color =>
            color.name.trim().toLowerCase() ===
            variant.color.trim().toLowerCase()
        )

        const image =
          matchingColor?.images?.[0]?.url ||
          product.images?.[0]?.url ||
          null

        const threshold =
          product.lowStockThreshold ?? globalThreshold

        return {
          productId: product._id,
          productName: product.name,
          productSlug: product.slug,
          productStatus: product.status,
          image,
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          stock: variant.stock,
          variantId: variant._id,
          lowStockThreshold: threshold,
          productLowStockThreshold: product.lowStockThreshold ?? null,
          usesGlobalThreshold: product.lowStockThreshold == null,

          stockStatus:
            variant.stock === 0
              ? 'out_of_stock'
              : variant.stock <= threshold
                ? 'low_stock'
                : 'in_stock',
        }
      })
    )

    return res.status(200).json({
      success: true,
      data: {
        inventory,
      },
    })
  } catch (error) {
    next(error)
  }
}



export const getInventorySettings = async (req, res, next) => {
  try {
    const settings = await getGlobalSettings()

    return res.status(200).json({
      success: true,
      data: {
        lowStockThreshold: settings.inventory.lowStockThreshold,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const updateGlobalLowStockThreshold = async (req, res, next) => {
  try {
    const { lowStockThreshold } = req.body

    if (
      !Number.isInteger(lowStockThreshold) ||
      lowStockThreshold < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Low-stock threshold must be a non-negative integer.',
      })
    }

    const settings = await getGlobalSettings()

    settings.inventory.lowStockThreshold = lowStockThreshold

    await settings.save()

    return res.status(200).json({
      success: true,
      message: 'Global low-stock threshold updated successfully.',
      data: {
        lowStockThreshold: settings.inventory.lowStockThreshold,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const updateProductLowStockThreshold = async (req, res, next) => {
  try {
    const { id } = req.params
    const { lowStockThreshold } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    if (
      lowStockThreshold !== null &&
      (
        !Number.isInteger(lowStockThreshold) ||
        lowStockThreshold < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Low-stock threshold must be a non-negative integer or null.',
      })
    }

    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    product.lowStockThreshold = lowStockThreshold

    await product.save()

    return res.status(200).json({
      success: true,
      message: lowStockThreshold === null
        ? 'Product threshold reset to the global default.'
        : 'Product low-stock threshold updated successfully.',
      data: {
        productId: product._id,
        lowStockThreshold: product.lowStockThreshold,
      },
    })
  } catch (error) {
    next(error)
  }
}


export const updateVariantSku = async (req, res, next) => {
  try {
    const { id, variantId } = req.params
    const rawSku = req.body?.sku

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(variantId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product or variant ID.',
      })
    }

    if (typeof rawSku !== 'string' || !rawSku.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid SKU is required.',
      })
    }

    const sku = rawSku.trim().toUpperCase()

    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    const variant = product.variants.id(variantId)

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Product variant not found.',
      })
    }

    // Check for duplicate SKUs among other variants of this product.
    const duplicateInProduct = product.variants.some(item =>
      item._id.toString() !== variantId &&
      item.sku?.toUpperCase() === sku
    )

    if (duplicateInProduct) {
      return res.status(409).json({
        success: false,
        message: 'This SKU is already assigned to another variant of this product.',
      })
    }

    // Check for duplicate SKUs across other products.
    const duplicateInOtherProduct = await Product.findOne({
      _id: { $ne: product._id },
      'variants.sku': sku,
    }).select('name')

    if (duplicateInOtherProduct) {
      return res.status(409).json({
        success: false,
        message: 'This SKU is already assigned to another product.',
      })
    }

    variant.sku = sku

    await product.save()

    return res.status(200).json({
      success: true,
      message: 'Variant SKU updated successfully.',
      data: {
        productId: product._id,
        variantId: variant._id,
        sku: variant.sku,
      },
    })
  } catch (error) {
    next(error)
  }
}
