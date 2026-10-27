
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './enquiry.css'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mzeerkja'

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
    <main className="min-h-screen bg-white px-5 py-16 text-[#151515] md:px-10 md:py-24">
      <section className="mx-auto max-w-2xl text-center">
        <p className="mb-4 text-[10px] uppercase tracking-[0.2em]">
          Customer care
        </p>

        <h1 className="font-[var(--font-display)] text-3xl leading-tight md:text-5xl">
          How can we help?
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-neutral-600">
          For questions about an order, a product, or the brand, send us a
          message using the form below.
        </p>
      </section>

      <section className="mx-auto mt-12 max-w-xl md:mt-16">
        {status === 'success' ? (
          <div className="py-12 text-center" role="status">
            <h2 className="font-[var(--font-display)] text-2xl">
              Thank you for getting in touch.
            </h2>

            <p className="mt-4 text-sm leading-7 text-neutral-600">
              Your enquiry has been submitted successfully.
            </p>

            <Link
              to="/"
              className="mt-6 inline-block border-b border-black pb-1 text-xs uppercase tracking-wider"
            >
              Return to home
            </Link>
          </div>
        ) : (
          <form
            className="space-y-7"
            onSubmit={handleSubmit}
          >
            <label className="block text-xs">
              <span className="mb-2 block">Full name</span>
              <input
                name="name"
                type="text"
                autoComplete="name"
                required
                className="w-full border-b border-neutral-400 bg-transparent py-3 text-sm outline-none transition-colors focus:border-black"
              />
            </label>

            <label className="block text-xs">
              <span className="mb-2 block">Email address</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full border-b border-neutral-400 bg-transparent py-3 text-sm outline-none transition-colors focus:border-black"
              />
            </label>

            <label className="block text-xs">
              <span className="mb-2 block">
                Order number <span className="text-neutral-500">(if applicable)</span>
              </span>
              <input
                name="order_number"
                type="text"
                className="w-full border-b border-neutral-400 bg-transparent py-3 text-sm outline-none transition-colors focus:border-black"
              />
            </label>

            <label className="block text-xs">
              <span className="mb-2 block">Enquiry type</span>
              <select
                name="enquiry_type"
                defaultValue={initialSubject}
                required
                className="w-full rounded-none border-b border-neutral-400 bg-white py-3 text-sm outline-none focus:border-black"
              >
                {enquiryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs">
              <span className="mb-2 block">Message</span>
              <textarea
                name="message"
                rows={6}
                required
                className="w-full resize-y border-b border-neutral-400 bg-transparent py-3 text-sm leading-6 outline-none transition-colors focus:border-black"
              />
            </label>

            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
              <label>
                Leave this field empty
                <input
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="flex w-full items-center justify-between bg-[#171717] px-5 py-4 text-xs uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending…' : 'Submit enquiry'}

            </button>

            {status === 'error' && (
              <p className="text-sm text-red-700" role="alert">
                We couldn't submit your message. Please try again.
              </p>
            )}

            <p className="text-xs leading-6 text-neutral-500">
              By submitting this form, you acknowledge our{' '}
              <Link
                to="/privacy-policy"
                className="text-black underline underline-offset-2"
              >
                Privacy Policy
              </Link>.
            </p>
          </form>
        )}
      </section>
    </main>
  )

}
