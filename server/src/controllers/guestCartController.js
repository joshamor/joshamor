
import mongoose from 'mongoose'
import GuestCart from '../models/GuestCart.js'
import Product from '../models/Product.js'

export const syncGuestCart = async (req, res, next) => {
  try {
    const { guestCartId } = req.params
    const { items } = req.body || {}

    // Validate the anonymous cart identifier.
    if (
      typeof guestCartId !== 'string' ||
      guestCartId.trim().length < 8 ||
      guestCartId.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid guest cart ID.',
      })
    }

    // Validate the cart payload.
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Cart items must be an array.',
      })
    }

    if (items.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'A cart cannot contain more than 100 variants.',
      })
    }

    // Empty carts should not remain eligible for abandoned-cart emails.
    if (items.length === 0) {
      await GuestCart.deleteOne({
        guestCartId: guestCartId.trim(),
        status: { $ne: 'converted' },
      })

      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully.',
        data: {
          guestCartId: guestCartId.trim(),
          items: [],
          subtotal: 0,
          itemCount: 0,
        },
      })
    }

    const requestedItems = []
    const seenVariants = new Set()

    for (const item of items) {
      const { productId, variantId, quantity } = item || {}

      if (
        !mongoose.Types.ObjectId.isValid(productId) ||
        !mongoose.Types.ObjectId.isValid(variantId)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product or variant ID.',
        })
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Cart quantities must be positive whole numbers.',
        })
      }

      const combination = `${productId}:${variantId}`

      if (seenVariants.has(combination)) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate variants are not allowed in the cart.',
        })
      }

      seenVariants.add(combination)

      requestedItems.push({
        productId: String(productId),
        variantId: String(variantId),
        quantity,
      })
    }

    // Retrieve products from MongoDB.
    const productIds = [
      ...new Set(requestedItems.map(item => item.productId)),
    ]

    const products = await Product.find({
      _id: { $in: productIds },
      status: 'published',
    })
      .select('name slug price currency images colors variants status')
      .lean()

    const productMap = new Map(
      products.map(product => [
        product._id.toString(),
        product,
      ])
    )

    const validatedItems = []

    for (const requested of requestedItems) {
      const product = productMap.get(requested.productId)

      if (!product) {
        return res.status(409).json({
          success: false,
          message: 'One or more products are no longer available.',
          details: [{
            productId: requested.productId,
            reason: 'product_unavailable',
          }],
        })
      }

      const variant = product.variants.find(
        item => item._id.toString() === requested.variantId
      )

      if (!variant) {
        return res.status(409).json({
          success: false,
          message: `${product.name} has a variant that is no longer available.`,
          details: [{
            productId: requested.productId,
            variantId: requested.variantId,
            reason: 'variant_unavailable',
          }],
        })
      }

      if (requested.quantity > variant.stock) {
        return res.status(409).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
          details: [{
            productId: requested.productId,
            variantId: requested.variantId,
            sku: variant.sku,
            requested: requested.quantity,
            available: variant.stock,
            reason: 'insufficient_stock',
          }],
        })
      }

      // Find the matching colour image.
      const matchingColor = product.colors.find(
        color =>
          color.name?.toLowerCase() === variant.color?.toLowerCase()
      )

      const imageValue =
        matchingColor?.images?.[0] ||
        product.images?.[0] ||
        null

      const image =
        typeof imageValue === 'string'
          ? imageValue
          : imageValue?.url || ''

      validatedItems.push({
        product: product._id,
        variantId: variant._id,
        quantity: requested.quantity,
        display: {
          productId: product._id,
          variantId: variant._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          currency: product.currency || 'NGN',
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          stock: variant.stock,
          image,
          quantity: requested.quantity,
        },
      })
    }

    // Do not allow an already converted cart to become active again.
    let cart = await GuestCart.findOne({
      guestCartId: guestCartId.trim(),
    })

    if (cart?.status === 'converted') {
      return res.status(409).json({
        success: false,
        message: 'This cart has already been converted into an order.',
      })
    }

    if (!cart) {
      cart = new GuestCart({
        guestCartId: guestCartId.trim(),
      })
    }

    const wasAbandoned = cart.status === 'abandoned'

    cart.items = validatedItems.map(item => ({
      product: item.product,
      variantId: item.variantId,
      quantity: item.quantity,
    }))

    cart.status = 'active'
    cart.lastActivityAt = new Date()
    cart.abandonedAt = null

    // A returning customer starts a new reminder cycle.
    if (wasAbandoned) {
      cart.reminders = {
        oneDaySentAt: null,
        oneWeekSentAt: null,
      }
    }

    await cart.save()

    const responseItems = validatedItems.map(item => item.display)

    const subtotal = responseItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    const itemCount = responseItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    )

    return res.status(200).json({
      success: true,
      message: 'Guest cart synchronized successfully.',
      data: {
        guestCartId: cart.guestCartId,
        items: responseItems,
        subtotal,
        itemCount,
      },
    })
  } catch (error) {
    next(error)
  }
}


export const captureGuestCartContact = async (req, res, next) => {
  try {
    const { guestCartId } = req.params
    const { email, abandonedEmailConsent } = req.body || {}

    if (
      typeof email !== 'string' ||
      email.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      })
    }

    if (typeof abandonedEmailConsent !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Please provide your abandoned-cart email preference.',
      })
    }

    const cart = await GuestCart.findOne({
      guestCartId: guestCartId.trim(),
    })

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Guest cart not found.',
      })
    }

    if (cart.status === 'converted') {
      return res.status(409).json({
        success: false,
        message: 'This cart has already been converted into an order.',
      })
    }

    if (!cart.items.length) {
      return res.status(409).json({
        success: false,
        message: 'Cannot save contact information for an empty cart.',
      })
    }

    const emailChanged =
      cart.email !== email.trim().toLowerCase()

    cart.email = email.trim().toLowerCase()
    cart.emailCapturedAt = new Date()
    cart.abandonedEmailConsent = abandonedEmailConsent
    cart.checkoutStartedAt = cart.checkoutStartedAt || new Date()
    cart.lastActivityAt = new Date()

    // Returning to an abandoned cart starts a fresh reminder cycle.
    if (cart.status === 'abandoned' || emailChanged) {
      cart.status = 'active'
      cart.abandonedAt = null

      cart.reminders = {
        oneDaySentAt: null,
        oneWeekSentAt: null,
      }
    }

    await cart.save()

    return res.status(200).json({
      success: true,
      message: 'Customer contact information saved successfully.',
      data: {
        email: cart.email,
        abandonedEmailConsent: cart.abandonedEmailConsent,
        checkoutStartedAt: cart.checkoutStartedAt,
      },
    })
  } catch (error) {
    next(error)
  }
}
