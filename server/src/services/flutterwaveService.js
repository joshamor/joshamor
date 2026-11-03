
const FLUTTERWAVE_BASE_URL =
  process.env.FLW_API_BASE_URL || 'https://api.flutterwave.com/v3'

function getFlutterwaveConfig() {
  const secretKey = process.env.FLW_SECRET_KEY

  if (!secretKey) {
    throw new Error('Flutterwave secret key is not configured.')
  }

  return { secretKey }
}

async function flutterwaveRequest(endpoint, options = {}) {
  const { secretKey } = getFlutterwaveConfig()

  const response = await fetch(
    `${FLUTTERWAVE_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secretKey}`,
        ...options.headers,
      },
    }
  )

  let result

  try {
    result = await response.json()
  } catch {
    throw new Error('Flutterwave returned an invalid response.')
  }

  if (!response.ok || result.status !== 'success') {
    throw new Error(
      result.message || 'Flutterwave request failed.'
    )
  }

  return result.data
}

export async function initializeFlutterwavePayment({
  amount,
  currency = 'NGN',
  reference,
  customer,
  orderNumber,
  orderId,
  guestCartId,
}) {
  const baseRedirectUrl = process.env.FLW_REDIRECT_URL

  if (!baseRedirectUrl) {
    throw new Error('Flutterwave redirect URL is not configured.')
  }

  const redirectUrl = new URL(baseRedirectUrl)

  redirectUrl.searchParams.set('orderId', String(orderId))
  redirectUrl.searchParams.set('guestCartId', guestCartId)

  if (!redirectUrl) {
    throw new Error('Flutterwave redirect URL is not configured.')
  }

  const data = await flutterwaveRequest('/payments', {
    method: 'POST',

    body: JSON.stringify({
      tx_ref: reference,
      amount: String(amount),
      currency,

      redirect_url: redirectUrl.toString(),

      customer: {
        email: customer.email,
        name: `${customer.firstName} ${customer.lastName}`,
        phone_number: customer.phone,
      },

      customizations: {
        title: 'JOSH AMOR',
        description: `Payment for order ${orderNumber}`,
      },

      configuration: {
        session_duration: 30,
        max_retry_attempt: 3,
      },

      payment_options: 'card,banktransfer,ussd',

      meta: {
        orderId: String(orderId),
        orderNumber,
      },
    }),
  })

  if (!data?.link) {
    throw new Error(
      'Flutterwave did not return a checkout URL.'
    )
  }

  return {
    checkoutUrl: data.link,
  }
}

export async function verifyFlutterwaveTransaction(transactionId) {
  if (
    !transactionId ||
    !/^\d+$/.test(String(transactionId))
  ) {
    throw new Error('Invalid Flutterwave transaction ID.')
  }

  return flutterwaveRequest(
    `/transactions/${encodeURIComponent(transactionId)}/verify`,
    {
      method: 'GET',
    }
  )
}


export async function verifyFlutterwaveTransactionByReference(txRef) {
  if (typeof txRef !== 'string' || !txRef.trim()) {
    throw new Error('Invalid Flutterwave transaction reference.')
  }

  const params = new URLSearchParams({
    tx_ref: txRef.trim(),
  })

  return flutterwaveRequest(
    `/transactions/verify_by_reference?${params.toString()}`,
    {
      method: 'GET',
    }
  )
}
