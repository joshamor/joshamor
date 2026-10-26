
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './enquiry.css'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'


const enquiryOptions = [
  'General enquiry',
  'Customer service',
  'Order enquiry',
  'Cancel an order',
  'Missing order',
  'Damaged item',
  'Returns and exchanges',
  'Shipping and returns',
  'Product enquiry',
  'Careers',
  'Sustainability',
  'Press and collaborations',
]


export default function Enquiry() {
  const [searchParams] = useSearchParams()


  const requestedSubject = searchParams.get('subject') || ''

  const initialSubject =
    enquiryOptions.find(
      (option) => option.toLowerCase() === requestedSubject.toLowerCase()
    ) ||
    (requestedSubject.toLowerCase().includes('cancel')
      ? 'Cancel an order'
      : requestedSubject.toLowerCase().includes('missing')
        ? 'Missing order'
        : requestedSubject.toLowerCase().includes('damage')
          ? 'Damaged item'
          : requestedSubject.toLowerCase().includes('return')
            ? 'Returns and exchanges'
            : requestedSubject.toLowerCase().includes('shipping')
              ? 'Shipping and returns'
              : requestedSubject.toLowerCase().includes('career')
                ? 'Careers'
                : requestedSubject.toLowerCase().includes('sustain')
                  ? 'Sustainability'
                  : requestedSubject.toLowerCase().includes('customer')
                    ? 'Customer service'
                    : requestedSubject.toLowerCase().includes('product')
                      ? 'Product enquiry'
                      : requestedSubject.toLowerCase().includes('press')
                        ? 'Press and collaborations'
                        : requestedSubject.toLowerCase().includes('order')
                          ? 'Order enquiry'
                          : 'General enquiry')

  const [status, setStatus] = useState('idle')

  async function handleSubmit(event) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    // Basic honeypot spam check.
    if (formData.get('website')) return

    setStatus('sending')

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) throw new Error('Submission failed')

      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="enquiry-page">
      <section className="enquiry-heading">
        <p className="page-eyebrow">Customer care</p>
        <h1>How can we help?</h1>
        <p>
          For questions about an order, a product, or the brand, send us a
          message using the form below.
        </p>
      </section>

      <section className="enquiry-form-section">
        {status === 'success' ? (
          <div className="enquiry-success" role="status">
            <h2>Thank you for getting in touch.</h2>
            <p>Your enquiry has been submitted successfully.</p>
            <Link to="/">Return to home</Link>
          </div>
        ) : (
          <form className="enquiry-form" onSubmit={handleSubmit}>
            <label>
              Full name
              <input
                name="name"
                type="text"
                autoComplete="name"
                required
              />
            </label>

            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Order number <span>(if applicable)</span>
              <input name="order_number" type="text" />
            </label>

            <label>
              Enquiry type
              <select
                name="enquiry_type"
                defaultValue={initialSubject}
                required
              >
                {enquiryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Message
              <textarea name="message" rows={6} required />
            </label>

            <div className="enquiry-honeypot" aria-hidden="true">
              <label>
                Leave this field empty
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Submit enquiry'}
              <span aria-hidden="true">↗</span>
            </button>

            {status === 'error' && (
              <p className="enquiry-error" role="alert">
                We couldn't submit your message. Please try again.
              </p>
            )}

            <p className="enquiry-privacy">
              By submitting this form, you acknowledge our{' '}
              <Link to="/privacy-policy">Privacy Policy</Link>.
            </p>
          </form>
        )}
      </section>
    </main>
  )
}
