
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
  text,
  idempotencyKey,
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured.')
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error('RESEND_FROM_EMAIL is not configured.')
  }

  if (!to || !subject || (!html && !text)) {
    throw new Error('Missing required email information.')
  }

  const options = {
    from: process.env.RESEND_FROM_EMAIL,
    to: Array.isArray(to) ? to : [to],
    replyTo: process.env.RESEND_REPLY_TO || undefined,
    subject,
    html,
    text,
  }

  const sendOptions = idempotencyKey
    ? { idempotencyKey }
    : undefined

  const { data, error } = await resend.emails.send(
    options,
    sendOptions
  )

  if (error) {
    console.error('Resend email error:', error)

    throw new Error(
      error.message || 'Unable to send email.'
    )
  }

  return {
    emailId: data.id,
  }
}
