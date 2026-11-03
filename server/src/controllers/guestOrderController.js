
import mongoose from 'mongoose'
import { randomBytes } from 'node:crypto'

import GuestCart from '../models/GuestCart.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'

// Server-side shipping prices.
// These mirror the options currently displayed in CartDrawer.jsx.
const SHIPPING_OPTIONS = {
  Nigeria: {
    standard: {
      name: 'Standard delivery',
      amount: 0,
    },
    express: {
      name: 'Express delivery',
      amount: 5000,
    },
    priority: {
      name: 'Priority delivery',
      amount: 9000,
    },
  },

  International: {
    standard: {
      name: 'International standard',
      amount: 25000,
    },
    express: {
      name: 'International express',
      amount: 45000,
    },
  },
}

function httpError(status, message, details = []) {
  const error = new Error(message)
  error.status = status
  error.details = details
  return error
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function createOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')

  return `JA-${date}-${randomBytes(4).toString('hex').toUpperCase()}`
}

function getImage(product, colorName) {
  const matchingColor = product.colors?.find(
    color =>
      color.name?.toLowerCase() === colorName?.toLowerCase()
  )

  const imageValue =
    matchingColor?.images?.[0] ||
    product.images?.[0] ||
    null

  return typeof imageValue === 'string'
    ? imageValue
    : imageValue?.url || ''
}

function checkoutMatches(order, checkout) {
  if (!order || order.orderStatus !== 'pending_payment') {
    return false
  }

  const sameCustomer =
    order.customer.email === checkout.customer.email &&
    order.customer.firstName === checkout.customer.firstName &&
    order.customer.lastName === checkout.customer.lastName &&
    order.customer.phone === checkout.customer.phone

  const sameAddress =
    order.shippingAddress.country === checkout.shippingAddress.country &&
    order.shippingAddress.state === checkout.shippingAddress.state &&
    order.shippingAddress.city === checkout.shippingAddress.city &&
    order.shippingAddress.address === checkout.shippingAddress.address &&
    order.shippingAddress.apartment === checkout.shippingAddress.apartment &&
    order.shippingAddress.postalCode === checkout.shippingAddress.postalCode

  const sameShipping =
    order.shipping.method === checkout.shipping.method

  const sameItems =
    order.items.length === checkout.items.length &&
    order.items.every((existing, index) => {
      const current = checkout.items[index]

      return (
        existing.product.toString() === current.product.toString() &&
        existing.variantId.toString() === current.variantId.toString() &&
        existing.quantity === current.quantity &&
        existing.unitPrice === current.unitPrice
      )
    })

  return (
    sameCustomer &&
    sameAddress &&
    sameShipping &&
    sameItems &&
    order.totalAmount === checkout.totalAmount
  )
}

export const createGuestOrder = async (req, res, next) => {
  const { guestCartId } = req.params

  const session = await mongoose.startSession()

  let outcome = null

  try {
    const cartId = cleanString(guestCartId)

    if (cartId.length < 8 || cartId.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Invalid guest cart ID.',
      })
    }

    const {
      customer: customerInput,
      shippingAddress: addressInput,
      shippingMethod,
      termsAccepted,
    } = req.body || {}

    if (termsAccepted !== true) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the terms and conditions.',
      })
    }

    // Validate customer information.
    const email = cleanString(customerInput?.email).toLowerCase()
    const firstName = cleanString(customerInput?.firstName)
    const lastName = cleanString(customerInput?.lastName)
    const phone = cleanString(customerInput?.phone)

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      })
    }

    if (
      !firstName ||
      firstName.length > 100 ||
      !lastName ||
      lastName.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid first and last name.',
      })
    }

    if (
      !phone ||
      !/^[0-9+() .-]{7,20}$/.test(phone)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number.',
      })
    }

    // Validate delivery address.
    const country = cleanString(addressInput?.country)
    const state = cleanString(addressInput?.state)
    const city = cleanString(addressInput?.city)
    const address = cleanString(addressInput?.address)
    const apartment = cleanString(addressInput?.apartment)
    const postalCode = cleanString(addressInput?.postalCode)

    if (
      !country ||
      !state ||
      !city ||
      !address ||
      country.length > 100 ||
      state.length > 100 ||
      city.length > 100 ||
      address.length > 300 ||
      apartment.length > 150 ||
      postalCode.length > 30
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid delivery address.',
      })
    }

    const shippingGroup =
      country.toLowerCase() === 'nigeria'
        ? 'Nigeria'
        : 'International'

    const shippingOption =
      SHIPPING_OPTIONS[shippingGroup]?.[shippingMethod]

    if (!shippingOption) {
      return res.status(400).json({
        success: false,
        message: 'The selected shipping method is unavailable for this destination.',
      })
    }

    const customer = {
      email,
      firstName,
      lastName,
      phone,
    }

    const shippingAddress = {
      country,
      state,
      city,
      address,
      apartment,
      postalCode,
    }

    const now = new Date()

    await session.withTransaction(async () => {
      // Retrieve the latest cart.
      const cart = await GuestCart.findOne({
        guestCartId: cartId,
      }).session(session)

      if (!cart) {
        throw httpError(404, 'Guest cart not found.')
      }

      if (cart.status === 'converted') {
        throw httpError(
          409,
          'This cart has already been converted into an order.'
        )
      }

      if (!cart.items.length) {
        throw httpError(409, 'Your cart is empty.')
      }

      // Retrieve current published products.
      const productIds = [
        ...new Set(
          cart.items.map(item => item.product.toString())
        ),
      ]

      const products = await Product.find({
        _id: { $in: productIds },
        status: 'published',
      })
        .session(session)
        .select('name slug price currency images colors variants')

      const productMap = new Map(
        products.map(product => [
          product._id.toString(),
          product,
        ])
      )

      // Revalidate every item and create price snapshots.
      const orderItems = []
      let subtotal = 0

      for (const cartItem of cart.items) {
        const product = productMap.get(
          cartItem.product.toString()
        )

        if (!product) {
          throw httpError(
            409,
            'A product in your cart is no longer available.'
          )
        }

        const variant = product.variants.id(
          cartItem.variantId
        )

        if (!variant) {
          throw httpError(
            409,
            `${product.name} has a variant that is no longer available.`
          )
        }

        if (
          cartItem.quantity > variant.stock ||
          variant.stock === 0
        ) {
          throw httpError(
            409,
            `Insufficient stock for ${product.name}.`,
            [{
              productId: product._id,
              variantId: variant._id,
              sku: variant.sku,
              requested: cartItem.quantity,
              available: variant.stock,
              reason: 'insufficient_stock',
            }]
          )
        }

        const unitPrice = Number(product.price)

        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
          throw httpError(
            409,
            `Invalid price for ${product.name}.`
          )
        }

        if (
          product.currency &&
          product.currency.toUpperCase() !== 'NGN'
        ) {
          throw httpError(
            409,
            'This checkout currently supports NGN products only.'
          )
        }

        const lineTotal = unitPrice * cartItem.quantity

        subtotal += lineTotal

        orderItems.push({
          product: product._id,
          variantId: variant._id,
          sku: variant.sku,
          productName: product.name,
          slug: product.slug,
          color: variant.color,
          size: variant.size,
          image: getImage(product, variant.color),
          unitPrice,
          quantity: cartItem.quantity,
          lineTotal,
        })
      }

      // Server-side totals.
      const shippingAmount = shippingOption.amount
      const discountAmount = 0
      const taxAmount = 0

      // VAT is not currently configured in the storefront.
      const totalAmount =
        subtotal +
        shippingAmount -
        discountAmount +
        taxAmount

      const checkoutSnapshot = {
        customer,
        shippingAddress,
        shipping: {
          method: shippingMethod,
        },
        items: orderItems,
        totalAmount,
      }

      // Check whether this cart already has a pending order.
      let existingOrder = cart.pendingOrder
        ? await Order.findById(cart.pendingOrder).session(session)
        : null

      if (
        existingOrder?.paymentStatus === 'successful' ||
        existingOrder?.orderStatus === 'processing' ||
        existingOrder?.orderStatus === 'fulfilled'
      ) {
        throw httpError(
          409,
          'An order has already been successfully paid for.'
        )
      }

      // Reuse the pending order if checkout details are unchanged.
      if (checkoutMatches(existingOrder, checkoutSnapshot)) {
        outcome = {
          order: existingOrder,
          reused: true,
        }

        return
      }

      // If checkout details changed, mark the old pending
      // order abandoned before creating a replacement.
      if (
        existingOrder &&
        existingOrder.orderStatus === 'pending_payment'
      ) {
        existingOrder.orderStatus = 'abandoned'
        existingOrder.abandonedAt = now

        await existingOrder.save({ session })
      }

      const orderNumber = createOrderNumber()

      const [order] = await Order.create(
        [{
          orderNumber,
          guestCartId: cartId,

          customer,
          shippingAddress,

          shipping: {
            method: shippingMethod,
            name: shippingOption.name,
            amount: shippingAmount,
          },

          items: orderItems,

          subtotal,
          shippingAmount,
          discountAmount,
          taxAmount,
          totalAmount,
          currency: 'NGN',

          termsAcceptedAt: now,

          orderStatus: 'pending_payment',
          paymentStatus: 'pending',
        }],
        { session }
      )

      // Save the new email without transferring previous
      // abandoned-cart consent to a different email address.
      const emailChanged =
        cart.email &&
        cart.email.toLowerCase() !== email

      if (emailChanged) {
        cart.abandonedEmailConsent = false

        cart.reminders = {
          oneDaySentAt: null,
          oneWeekSentAt: null,
        }
      }

      cart.email = email
      cart.emailCapturedAt = cart.emailCapturedAt || now

      cart.status = 'active'
      cart.lastActivityAt = now
      cart.checkoutStartedAt = cart.checkoutStartedAt || now
      cart.abandonedAt = null
      cart.pendingOrder = order._id

      await cart.save({ session })

      outcome = {
        order,
        reused: false,
      }
    })

    if (!outcome) {
      throw httpError(
        500,
        'Unable to create your order.'
      )
    }

    const order = outcome.order

    return res.status(outcome.reused ? 200 : 201).json({
      success: true,
      message: outcome.reused
        ? 'Your existing pending order has been retrieved.'
        : 'Your order has been created successfully.',

      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        shippingAmount: order.shippingAmount,
        totalAmount: order.totalAmount,
        currency: order.currency,
        itemCount: order.items.length,
        reused: outcome.reused,
      },
    })
  } catch (error) {
    next(error)
  } finally {
    await session.endSession()
  }
}
