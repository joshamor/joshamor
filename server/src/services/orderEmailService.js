
import Order from '../models/Order.js'
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

function buildOrderConfirmation(order) {
  const firstName = escapeHtml(order.customer.firstName)
  const orderNumber = escapeHtml(order.orderNumber)
  const currency = order.currency || 'NGN'

  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding:16px 8px;border-bottom:1px solid #eeeeee;">
        <strong>${escapeHtml(item.productName)}</strong>
        <br>
        <span style="font-size:12px;color:#777;">
          ${escapeHtml(item.color)} / ${escapeHtml(item.size)}
        </span>
        <br>
        <span style="font-size:12px;color:#777;">
          SKU: ${escapeHtml(item.sku)}
        </span>
      </td>
      <td style="padding:16px 8px;border-bottom:1px solid #eeeeee;text-align:center;">
        ${item.quantity}
      </td>
      <td style="padding:16px 8px;border-bottom:1px solid #eeeeee;text-align:right;">
        ${formatMoney(item.lineTotal, currency)}
      </td>
    </tr>
  `).join('')

  const total = formatMoney(order.totalAmount, currency)
  const subtotal = formatMoney(order.subtotal, currency)
  const shipping = formatMoney(order.shippingAmount, currency)

  const address = [
    order.shippingAddress.address,
    order.shippingAddress.apartment,
    order.shippingAddress.city,
    order.shippingAddress.state,
    order.shippingAddress.country,
    order.shippingAddress.postalCode,
  ].filter(Boolean).map(escapeHtml).join(', ')

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>

      <body style="margin:0;padding:0;background:#f5f4f1;font-family:Arial,sans-serif;color:#171717;">
        <div style="max-width:640px;margin:30px auto;padding:40px 24px;background:#ffffff;">

          <div style="text-align:center;padding-bottom:28px;border-bottom:1px solid #eeeeee;">
          <img src="https://res.cloudinary.com/eynk4fvb/image/upload/v1793633517/logo.png" />

          </div>

          <div style="padding:36px 0 28px;">
            <p style="font-size:10px;letter-spacing:2px;color:#888;">
              ORDER CONFIRMATION
            </p>

            <h1 style="font-size:28px;font-weight:normal;line-height:1.3;">
              Thank you, ${firstName}.
            </h1>

            <p style="font-size:14px;line-height:1.8;color:#666;">
              Your payment has been confirmed and your order is now being processed.
              We appreciate your choosing JOSH AMOR.
            </p>

            <p style="font-size:12px;color:#777;">
              Order number:
              <strong style="color:#171717;">${orderNumber}</strong>
            </p>
          </div>

          <div style="border-top:1px solid #eeeeee;padding-top:20px;">
            <h2 style="font-size:13px;letter-spacing:1px;font-weight:normal;">
              ORDER SUMMARY
            </h2>

            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <thead>
                <tr style="color:#888;text-align:left;">
                  <th style="padding:12px 8px;">Product</th>
                  <th style="padding:12px 8px;text-align:center;">Qty</th>
                  <th style="padding:12px 8px;text-align:right;">Total</th>
                </tr>
              </thead>

              <tbody>
                ${itemRows}
              </tbody>
            </table>

            <div style="padding-top:20px;font-size:13px;">
              <p style="display:flex;justify-content:space-between;">
                <span>Subtotal</span>
                <strong>${subtotal}</strong>
              </p>

              <p style="display:flex;justify-content:space-between;">
                <span>Shipping</span>
                <strong>${shipping}</strong>
              </p>

              <div style="margin-top:18px;padding-top:16px;border-top:1px solid #eeeeee;">
                <p style="display:flex;justify-content:space-between;font-size:16px;">
                  <strong>Total paid</strong>
                  <strong>${total}</strong>
                </p>
              </div>
            </div>
          </div>

          <div style="margin-top:35px;padding-top:24px;border-top:1px solid #eeeeee;">
            <h2 style="font-size:13px;font-weight:normal;letter-spacing:1px;">
              DELIVERY INFORMATION
            </h2>

            <p style="font-size:13px;line-height:1.8;color:#666;">
              ${escapeHtml(order.customer.firstName)} ${escapeHtml(order.customer.lastName)}
              <br>
              ${address}
              <br>
              ${escapeHtml(order.customer.phone)}
            </p>

            <p style="font-size:13px;color:#666;">
              Delivery method: ${escapeHtml(order.shipping.name)}
            </p>
          </div>

          <div style="margin-top:35px;padding-top:24px;border-top:1px solid #eeeeee;text-align:center;">
            <p style="font-size:13px;color:#666;line-height:1.8;">
              Thank you for being part of the JOSH AMOR experience.
            </p>

            <p style="font-size:10px;color:#999;letter-spacing:1px;margin-top:25px;">
              JOSH AMOR · TAILORED FOR POWER
            </p>
          </div>

        </div>
      </body>
    </html>
  `

  const text = `
JOSH AMOR — ORDER CONFIRMATION

Thank you, ${order.customer.firstName}.

Your payment has been confirmed and your order is being processed.

Order number: ${order.orderNumber}

ORDER SUMMARY

${order.items.map(item =>
  `${item.productName} - ${item.color} / ${item.size}\nSKU: ${item.sku}\nQuantity: ${item.quantity}\nTotal: ${formatMoney(item.lineTotal, currency)}`
).join('\n\n')}

Subtotal: ${subtotal}
Shipping: ${shipping}
Total paid: ${total}

DELIVERY ADDRESS

${address}

Delivery method: ${order.shipping.name}
`.trim()

  return {
    subject: `Your JOSH AMOR order ${order.orderNumber} is confirmed`,
    html,
    text,
  }
}

export async function sendOrderConfirmation(orderId) {
  const order = await Order.findById(orderId).lean()

  if (!order) {
    throw new Error('Order not found.')
  }

  if (order.paymentStatus !== 'successful') {
    throw new Error('Cannot send confirmation for an unpaid order.')
  }

  const idempotencyKey = `order-confirmation-${order._id}`

  const email = buildOrderConfirmation(order)

  let log = await EmailLog.findOne({ idempotencyKey })

  if (log?.status === 'sent') {
    return {
      sent: true,
      alreadySent: true,
      emailId: log.providerEmailId,
    }
  }

  // Create the log if this is the first send attempt.
  if (!log) {
    try {
      log = await EmailLog.create({
        recipient: order.customer.email,
        type: 'order_confirmation',
        subject: email.subject,
        order: order._id,
        status: 'queued',
        idempotencyKey,
      })
    } catch (error) {
      // Another request may have created the same log concurrently.
      if (error.code !== 11000) throw error

      log = await EmailLog.findOne({ idempotencyKey })
    }
  }

  if (!log) {
    throw new Error('Unable to create email log.')
  }

  // Claim the email for sending. This also permits retries
  // of previously failed or stale sending attempts.
  const staleSendingBefore = new Date(Date.now() - 10 * 60 * 1000)

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
        subject: email.subject,
      },
      $inc: {
        attemptCount: 1,
      },
    },
    { new: true }
  )

  if (!claimedLog) {
    const currentLog = await EmailLog.findById(log._id)

    return {
      sent: currentLog?.status === 'sent',
      alreadySent: currentLog?.status === 'sent',
      inProgress: currentLog?.status === 'sending',
      emailId: currentLog?.providerEmailId || null,
    }
  }

  try {
    const result = await sendEmail({
      to: order.customer.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      idempotencyKey,
    })

    await EmailLog.findByIdAndUpdate(claimedLog._id, {
      $set: {
        status: 'sent',
        providerEmailId: result.emailId,
        sentAt: new Date(),
        lastError: null,
      },
    })

    return {
      sent: true,
      alreadySent: false,
      emailId: result.emailId,
    }
  } catch (error) {
    await EmailLog.findByIdAndUpdate(claimedLog._id, {
      $set: {
        status: 'failed',
        lastError: error.message || 'Email delivery failed.',
      },
    }).catch(logError => {
      console.error('Unable to update email log:', logError)
    })

    throw error
  }
}
