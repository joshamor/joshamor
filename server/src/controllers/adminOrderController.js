
import mongoose from 'mongoose'
import Order from '../models/Order.js'

const ORDER_STATUSES = [
  'pending_payment',
  'processing',
  'fulfilled',
  'cancelled',
  'abandoned',
  'payment_review',
]

const PAYMENT_STATUSES = [
  'pending',
  'successful',
  'failed',
  'refunded',
]

const SORT_OPTIONS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  highest_total: { totalAmount: -1, _id: -1 },
  lowest_total: { totalAmount: 1, _id: 1 },
}

// Escape user input before using it in a regular expression.
const escapeRegex = value =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export async function getAdminOrders(req, res, next) {
  try {
    const {
      search = '',
      orderStatus,
      paymentStatus,
      startDate,
      endDate,
      sort = 'newest',
      page = '1',
      limit = '20',
    } = req.query

    // Validate pagination.
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

    // Validate order status.
    if (
      orderStatus &&
      !ORDER_STATUSES.includes(orderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status.',
      })
    }

    // Validate payment status.
    if (
      paymentStatus &&
      !PAYMENT_STATUSES.includes(paymentStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status.',
      })
    }

    // Validate sorting.
    if (!Object.hasOwn(SORT_OPTIONS, sort)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sort option.',
      })
    }

    // Validate search input.
    const trimmedSearch = String(search).trim()

    if (trimmedSearch.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Search cannot exceed 100 characters.',
      })
    }

    const filter = {}

    if (orderStatus) {
      filter.orderStatus = orderStatus
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus
    }

    // Search order number and customer details.
    if (trimmedSearch) {
      const searchRegex = new RegExp(
        escapeRegex(trimmedSearch),
        'i'
      )

      filter.$or = [
        { orderNumber: searchRegex },
        { 'customer.firstName': searchRegex },
        { 'customer.lastName': searchRegex },
        { 'customer.email': searchRegex },
        { 'customer.phone': searchRegex },
      ]
    }

    // Date filtering. Dates are interpreted in UTC.
    if (startDate || endDate) {
      filter.createdAt = {}

      if (startDate) {
        const start = new Date(startDate)

        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid start date.',
          })
        }

        filter.createdAt.$gte = start
      }

      if (endDate) {
        const end = new Date(endDate)

        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid end date.',
          })
        }

        // Include the entire selected end date.
        end.setUTCHours(23, 59, 59, 999)

        filter.createdAt.$lte = end
      }

      if (
        filter.createdAt.$gte &&
        filter.createdAt.$lte &&
        filter.createdAt.$gte > filter.createdAt.$lte
      ) {
        return res.status(400).json({
          success: false,
          message: 'Start date cannot be after end date.',
        })
      }
    }

    const skip = (parsedPage - 1) * parsedLimit

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .select(
          [
            'orderNumber',
            'customer',
            'items.productName',
            'items.quantity',
            'subtotal',
            'shippingAmount',
            'discountAmount',
            'taxAmount',
            'totalAmount',
            'currency',
            'orderStatus',
            'paymentStatus',
            'shipping',
            'createdAt',
            'paidAt',
          ].join(' ')
        )
        .sort(SORT_OPTIONS[sort])
        .skip(skip)
        .limit(parsedLimit)
        .lean(),

      Order.countDocuments(filter),
    ])

    return res.status(200).json({
      success: true,
      data: {
        orders: orders.map(order => ({
          ...order,
          itemCount: order.items.reduce(
            (total, item) => total + item.quantity,
            0
          ),
        })),
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



export async function getAdminOrderById(req, res, next) {
  try {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.',
      })
    }

    const order = await Order.findById(id)
      .select([
        'orderNumber',
        'customer',
        'shippingAddress',
        'shipping',
        'items',
        'subtotal',
        'shippingAmount',
        'discountAmount',
        'taxAmount',
        'totalAmount',
        'currency',
        'termsAcceptedAt',
        'orderStatus',
        'paymentStatus',
        'paymentAttempts',
        'paidAt',
        'cancelledAt',
        'abandonedAt',
        'internalNotes',
        'createdAt',
        'updatedAt',
      ].join(' '))
      .lean()

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        order: {
          ...order,
          itemCount: order.items.reduce(
            (total, item) => total + item.quantity,
            0
          ),
        },
      },
    })
  } catch (error) {
    next(error)
  }
}


export async function updateAdminOrderStatus(req, res, next) {
  try {
    const { id } = req.params
    const { orderStatus } = req.body

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.',
      })
    }

    const allowedStatuses = ['fulfilled', 'cancelled']

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Only fulfilled or cancelled status updates are supported.',
      })
    }

    const order = await Order.findById(id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
    }

    // Only processing orders with successful payment can be fulfilled.
    if (orderStatus === 'fulfilled') {
      if (
        order.orderStatus !== 'processing' ||
        order.paymentStatus !== 'successful'
      ) {
        return res.status(400).json({
          success: false,
          message: 'Only successfully paid processing orders can be fulfilled.',
        })
      }
    }

    // Unpaid pending orders can be cancelled.
    // Paid orders can only be cancelled after their payment is refunded.
    if (orderStatus === 'cancelled') {
      const isUnpaidPendingOrder =
        order.orderStatus === 'pending_payment' &&
        ['pending', 'failed'].includes(order.paymentStatus)

      const isRefundedOrder =
        order.orderStatus === 'processing' &&
        order.paymentStatus === 'refunded'

      if (!isUnpaidPendingOrder && !isRefundedOrder) {
        return res.status(400).json({
          success: false,
          message: 'This order cannot be cancelled in its current state. Paid orders must be refunded first.',
        })
      }

      order.cancelledAt = new Date()
    }

    order.orderStatus = orderStatus

    await order.save()

    return res.status(200).json({
      success: true,
      message: `Order ${order.orderNumber} updated successfully.`,
      data: {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          cancelledAt: order.cancelledAt,
          updatedAt: order.updatedAt,
        },
      },
    })
  } catch (error) {
    if (
      error.name === 'ValidationError' ||
      error.name === 'CastError'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    next(error)
  }
}


export async function addAdminOrderNote(req, res, next) {
  try {
    const { id } = req.params
    const { note } = req.body

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.',
      })
    }

    if (typeof note !== 'string' || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid note.',
      })
    }

    const trimmedNote = note.trim()

    if (trimmedNote.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Note cannot exceed 2000 characters.',
      })
    }

    const order = await Order.findById(id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
    }

    const timestamp = new Date().toISOString()
    const adminEmail = req.admin?.email || 'Admin'

    const newNote = `[${timestamp}] ${adminEmail}: ${trimmedNote}`

    order.internalNotes = order.internalNotes
      ? `${order.internalNotes}\n\n${newNote}`
      : newNote

    await order.save()

    return res.status(200).json({
      success: true,
      message: 'Internal note added successfully.',
      data: {
        internalNotes: order.internalNotes,
      },
    })
  } catch (error) {
    next(error)
  }
}
