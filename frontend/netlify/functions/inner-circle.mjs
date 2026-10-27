
export default async function handler(request) {
  if (request.method !== 'POST') {
    return Response.json(
      { message: 'Method not allowed' },
      { status: 405, headers: { Allow: 'POST' } }
    )
  }

  const apiKey = process.env.KIT_API_KEY
  const formId = process.env.KIT_FORM_ID

  if (!apiKey || !formId) {
    return Response.json(
      { message: 'Newsletter signup is not configured.' },
      { status: 500 }
    )
  }

  let body

  try {
    body = await request.json()
  } catch {
    return Response.json(
      { message: 'Invalid request.' },
      { status: 400 }
    )
  }

  // Honeypot: silently ignore automated spam submissions.
  if (body.website) {
    return Response.json({ success: true })
  }

  const email =
    typeof body.email === 'string' ? body.email.trim() : ''

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    body.consent !== true
  ) {
    return Response.json(
      { message: 'Enter a valid email and provide consent.' },
      { status: 400 }
    )
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Kit-Api-Key': apiKey,
  }

  try {
    // Create or update the subscriber in Kit.
    const subscriberResponse = await fetch(
      'https://api.kit.com/v4/subscribers',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email_address: email,
          fields: {
            signup_source: body.source || 'updates_page',
          },
        }),
      }
    )

    if (!subscriberResponse.ok) {
      throw new Error('Kit subscriber request failed')
    }

    // Add the subscriber to the Inner Circle form.
    const formResponse = await fetch(
      `https://api.kit.com/v4/forms/${encodeURIComponent(formId)}/subscribers`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ email_address: email }),
      }
    )

    if (!formResponse.ok) {
      throw new Error('Kit form subscription failed')
    }

    return Response.json({ success: true })
  } catch {
    // Do not expose API credentials or provider error details.
    return Response.json(
      { message: 'Signup failed. Please try again.' },
      { status: 502 }
    )
  }
}
