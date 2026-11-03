
import GuestCart from '../models/GuestCart.js'
import Product from '../models/Product.js'
import EmailLog from '../models/EmailLog.js'
import { sendEmail } from './emailService.js'

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, character => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }

    return entities[character]
  })
}

function formatMoney(amount, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getIdempotencyKey(cart, type) {
  const activityTime = new Date(cart.lastActivityAt).getTime()

  return `abandoned-${type}-${cart._id}-${activityTime}`
}

async function buildReminderEmail(cart, type) {
  const productIds = [
    ...new Set(
      cart.items.map(item => item.product.toString())
    ),
  ]

  const products = await Product.find({
    _id: { $in: productIds },
    status: 'published',
  })
    .select('name slug price currency variants')
    .lean()

  const productMap = new Map(
    products.map(product => [
      product._id.toString(),
      product,
    ])
  )

  const items = []

  for (const cartItem of cart.items) {
    const product = productMap.get(
      cartItem.product.toString()
    )

    const variant = product?.variants.find(
      item => item._id.toString() === cartItem.variantId.toString()
    )

    if (!product || !variant) continue

    items.push({
      name: product.name,
      slug: product.slug,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      price: product.price,
      quantity: cartItem.quantity,
      currency: product.currency || 'NGN',
    })
  }

  if (!items.length) {
    return null
  }

  const firstName = escapeHtml(
    cart.email.split('@')[0]
  )

  const isFirstReminder = type === 'abandoned_cart_one_day'

  const heading = isFirstReminder
    ? 'Something caught your eye?'
    : 'Your favourites are still waiting.'

  const introduction = isFirstReminder
    ? 'You recently added a few pieces to your bag. We thought you might like a reminder.'
    : 'Your selected pieces are still on your mind, perhaps? Revisit your selection before it is too late.'

  const storefrontUrl = (
    process.env.STOREFRONT_URL || ''
  ).replace(/\/+$/, '')

  const itemRows = items.map(item => {
    const productUrl = storefrontUrl
      ? `${storefrontUrl}/products/${encodeURIComponent(item.slug)}`
      : ''

    return `
      <tr>
        <td style="padding:16px 8px;border-bottom:1px solid #eeeeee;">
          ${
            productUrl
              ? `<a href="${escapeHtml(productUrl)}" style="color:#171717;text-decoration:none;"><strong>${escapeHtml(item.name)}</strong></a>`
              : `<strong>${escapeHtml(item.name)}</strong>`
          }

          <br>
          <span style="font-size:12px;color:#777;">
            ${escapeHtml(item.color)} / ${escapeHtml(item.size)}
          </span>
          <br>
          <span style="font-size:12px;color:#777;">
            Quantity: ${item.quantity}
          </span>
        </td>

        <td style="padding:16px 8px;text-align:right;border-bottom:1px solid #eeeeee;">
          ${formatMoney(item.price * item.quantity, item.currency)}
        </td>
      </tr>
    `
  }).join('')

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const currency = items[0].currency

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${heading}</title>
      </head>

      <body style="margin:0;padding:0;background:#f5f4f1;font-family:Arial,sans-serif;color:#171717;">

        <div style="max-width:640px;margin:30px auto;padding:40px 24px;background:#ffffff;">

          <div style="text-align:center;padding-bottom:28px;border-bottom:1px solid #eeeeee;">
          <img src="https://res.cloudinary.com/eynk4fvb/image/upload/v1793633517/logo.png" />

          </div>

          <div style="padding:38px 0 28px;">

            <p style="font-size:10px;letter-spacing:2px;color:#888;">
              THE JOSH AMOR EXPERIENCE
            </p>

            <h1 style="font-size:28px;font-weight:normal;line-height:1.3;">
              ${escapeHtml(heading)}
            </h1>

            <p style="font-size:14px;color:#666;line-height:1.8;">
              Hello ${firstName},
              <br><br>
              ${escapeHtml(introduction)}
            </p>

          </div>

          <div style="border-top:1px solid #eeeeee;padding-top:20px;">

            <h2 style="font-size:13px;letter-spacing:1px;font-weight:normal;">
              YOUR SELECTION
            </h2>

            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <tbody>
                ${itemRows}
              </tbody>
            </table>

            <div style="display:flex;justify-content:space-between;padding-top:20px;font-size:14px;">
              <strong>Current subtotal</strong>
              <strong>${formatMoney(subtotal, currency)}</strong>
            </div>

            <p style="margin-top:12px;font-size:11px;line-height:1.7;color:#888;">
              Prices and product availability may change. Your items are not reserved until an order is successfully paid for.
            </p>

          </div>

          ${
            storefrontUrl
              ? `
                <div style="margin-top:35px;text-align:center;">
                  <a
                    href="${escapeHtml(storefrontUrl)}"
                    style="display:inline-block;padding:16px 30px;background:#171717;color:#ffffff;text-decoration:none;font-size:11px;letter-spacing:1px;text-transform:uppercase;"
                  >
                    Continue shopping
                  </a>
                </div>
              `
              : ''
          }

          <div style="margin-top:40px;padding-top:24px;border-top:1px solid #eeeeee;text-align:center;">

            <p style="font-size:12px;line-height:1.8;color:#777;">
              Thank you for considering JOSH AMOR.
            </p>

            <p style="font-size:10px;letter-spacing:2px;color:#999;margin-top:25px;">
              JOSH AMOR · TAILORED FOR POWER
            </p>

          </div>

        </div>
      </body>
    </html>
  `

  const text = `
JOSH AMOR

${heading}

Hello ${cart.email},

${introduction}

YOUR SELECTION

${items.map(item =>
  `${item.name}\n${item.color} / ${item.size}\nQuantity: ${item.quantity}\n${formatMoney(item.price * item.quantity, item.currency)}`
).join('\n\n')}

Current subtotal: ${formatMoney(subtotal, currency)}

Prices and availability may change. Items are not reserved until an order is successfully paid for.

Thank you for considering JOSH AMOR.
TAILORED FOR POWER.
  `.trim()

  return {
    subject: isFirstReminder
      ? 'A little reminder from JOSH AMOR'
      : 'Your JOSH AMOR selection is still waiting',
    html,
    text,
  }
}

export async function sendAbandonedCartReminder(cartId, type) {
  const allowedTypes = [
    'abandoned_cart_one_day',
    'abandoned_cart_one_week',
  ]

  if (!allowedTypes.includes(type)) {
    throw new Error('Invalid abandoned-cart email type.')
  }

  const cart = await GuestCart.findById(cartId).lean()

  if (!cart) {
    return { sent: false, skipped: true }
  }

  // Confirm the cart is still eligible immediately before sending.
  if (
    cart.status !== 'abandoned' ||
    !cart.email ||
    !cart.abandonedEmailConsent ||
    !cart.items.length
  ) {
    return { sent: false, skipped: true }
  }

  const reminderField = type === 'abandoned_cart_one_day'
    ? 'oneDaySentAt'
    : 'oneWeekSentAt'

  if (cart.reminders?.[reminderField]) {
    return { sent: false, alreadySent: true }
  }

  const email = await buildReminderEmail(cart, type)

  if (!email) {
    return { sent: false, skipped: true }
  }

  const idempotencyKey = getIdempotencyKey(cart, type)

  // Create or retrieve the logical email record.
  let log

  try {
    log = await EmailLog.findOneAndUpdate(
      { idempotencyKey },
      {
        $setOnInsert: {
          recipient: cart.email,
          type,
          subject: email.subject,
          provider: 'resend',
          status: 'queued',
          guestCart: cart._id,
          idempotencyKey,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    )
  } catch (error) {
    if (error.code !== 11000) throw error

    log = await EmailLog.findOne({ idempotencyKey })
  }

  if (!log) {
    throw new Error('Unable to create abandoned-cart email log.')
  }

  if (log.status === 'sent') {
    await GuestCart.findOneAndUpdate(
      {
        _id: cart._id,
        status: 'abandoned',
        lastActivityAt: cart.lastActivityAt,
      },
      {
        $set: {
          [`reminders.${reminderField}`]: log.sentAt || new Date(),
        },
      }
    )

    return {
      sent: true,
      alreadySent: true,
    }
  }

  const staleSendingBefore = new Date(
    Date.now() - 10 * 60 * 1000
  )

  // Atomically claim the email so concurrent worker processes
  // cannot send the same reminder simultaneously.
  const claimedLog = await EmailLog.findOneAndUpdate(
    {
      _id: log._id,
      $or: [
        { status: { $in: ['queued', 'failed'] } },
        {
          status: 'sending',
          updatedAt: { $lt: staleSendingBefore },
        },
      ],
    },
    {
      $set: {
        status: 'sending',
        lastError: null,
      },
      $inc: {
        attemptCount: 1,
      },
    },
    { new: true }
  )

  if (!claimedLog) {
    return {
      sent: false,
      inProgress: true,
    }
  }

  try {
    // Check again so a returning customer does not receive
    // a reminder after their cart has been reactivated.
    const stillEligible = await GuestCart.findOne({
      _id: cart._id,
      status: 'abandoned',
      email: cart.email,
      abandonedEmailConsent: true,
      lastActivityAt: cart.lastActivityAt,
    }).select('_id')

    if (!stillEligible) {
      await EmailLog.findByIdAndUpdate(claimedLog._id, {
        $set: {
          status: 'failed',
          lastError: 'Cart is no longer eligible for this reminder.',
        },
      })

      return { sent: false, skipped: true }
    }

    const result = await sendEmail({
      to: cart.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      idempotencyKey,
    })

    const sentAt = new Date()

    await EmailLog.findByIdAndUpdate(claimedLog._id, {
      $set: {
        status: 'sent',
        providerEmailId: result.emailId,
        sentAt,
        lastError: null,
      },
    })

    // Update reminder timestamp only for this same cart cycle.
    await GuestCart.findOneAndUpdate(
      {
        _id: cart._id,
        status: 'abandoned',
        lastActivityAt: cart.lastActivityAt,
        abandonedEmailConsent: true,
      },
      {
        $set: {
          [`reminders.${reminderField}`]: sentAt,
        },
      }
    )

    return {
      sent: true,
      emailId: result.emailId,
    }
  } catch (error) {
    await EmailLog.findByIdAndUpdate(claimedLog._id, {
      $set: {
        status: 'failed',
        lastError: error.message || 'Reminder email failed.',
      },
    }).catch(logError => {
      console.error('Unable to update abandoned-cart email log:', logError)
    })

    throw error
  }
}
