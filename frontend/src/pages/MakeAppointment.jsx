
import { useState } from 'react'
import SEO from '../components/SEO'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2400&q=85'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mbggopzr'

export default function MakeAppointment() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState({
    type: '',
    message: '',
  })

  const getToday = () => {
    const today = new Date()
    const offset = today.getTimezoneOffset()
    return new Date(today.getTime() - offset * 60000)
      .toISOString()
      .split('T')[0]
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      })

      if (response.ok) {
        setStatus({
          type: 'success',
          message:
            'Thank you for your appointment request. A member of our team will be in touch shortly.',
        })

        form.reset()
      } else {
        setStatus({
          type: 'error',
          message:
            'Something went wrong while submitting your request. Please try again.',
        })
      }
    } catch {
      setStatus({
        type: 'error',
        message:
          'We could not submit your request. Please check your connection and try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full border-b border-neutral-300 bg-transparent px-0 py-3 text-sm text-[#151515] outline-none transition-colors placeholder:text-neutral-400 focus:border-[#151515]'

  const labelClass =
    'mb-2 block text-xs uppercase tracking-[0.12em] text-neutral-600'

  return (
    <>
      <SEO
        title="Make an Appointment"
        description="Book an appointment with JOSH AMOR for a bespoke tailoring or Groomswear experience."
      />

      <main className="w-full bg-white text-[#151515]">
        {/* Hero */}
        <section
          className="relative flex min-h-[365px] items-center justify-center overflow-hidden bg-cover bg-center md:min-h-[480px]"
          style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
        >
          <div className="absolute inset-0 bg-black/25" />

          <h1 className="relative z-10 px-5 text-center font-[var(--font-display)] text-3xl text-white md:text-4xl">
            Make an Appointment
          </h1>
        </section>

        {/* Introduction */}
        <section className="mx-auto w-[calc(100%-40px)] max-w-5xl py-16 md:py-24">
          <div className="max-w-2xl">

            <h2 className="mb-6 font-[var(--font-display)] text-2xl md:text-3xl">
              BESPOKE CONSULTATION
            </h2>

            <p className="text-sm leading-7 text-neutral-600 md:text-base">
              If you would like to book an appointment with Josh Amor for a
              bespoke tailoring or Groomswear experience, please complete the
              form below.
            </p>

            <p className="mt-3 text-sm leading-7 text-neutral-600 md:text-base">
              A member of our team will be in touch to discuss your requirements
              and confirm your appointment.
            </p>
          </div>
        </section>

        {/* Appointment Form */}
        <section className="mx-auto w-[calc(100%-40px)] max-w-5xl pb-20 md:pb-28">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
            <div>
              <h3 className="font-[var(--font-display)] text-xl">
                Request an appointment
              </h3>

              <p className="mt-4 text-sm leading-7 text-neutral-500">
                Share a few details about your appointment and the experience
                you are looking for. Our team will contact you to discuss the
                next steps.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full">
              {/* Formspree honeypot */}
              <input
                type="text"
                name="_gotcha"
                tabIndex="-1"
                autoComplete="off"
                className="hidden"
              />

              <input
                type="hidden"
                name="_subject"
                value="New JOSH AMOR Appointment Request"
              />

              <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className={labelClass}>
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="First name"
                    autoComplete="given-name"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className={labelClass}>
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Last name"
                    autoComplete="family-name"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Your email address"
                    autoComplete="email"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Your phone number"
                    autoComplete="tel"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Service */}
                <div className="sm:col-span-2">
                  <label htmlFor="service" className={labelClass}>
                    Service Required *
                  </label>

                  <select
                    id="service"
                    name="service"
                    defaultValue=""
                    className={`${inputClass} cursor-pointer`}
                    required
                  >
                    <option value="" disabled>
                      Select a service
                    </option>
                    <option value="Bespoke Tailoring">
                      Bespoke Tailoring
                    </option>
                    <option value="Groomswear">
                      Groomswear
                    </option>
                  </select>
                </div>

                {/* Appointment Date */}
                <div className="sm:col-span-2">
                  <label htmlFor="appointmentDate" className={labelClass}>
                    Preferred Appointment Date *
                  </label>

                  <input
                    id="appointmentDate"
                    name="preferredAppointmentDate"
                    type="date"
                    min={getToday()}
                    className={inputClass}
                    required
                  />

                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    This is your preferred date. Our team will contact you to
                    confirm availability.
                  </p>
                </div>

                {/* Additional Information */}
                <div className="sm:col-span-2">
                  <label htmlFor="message" className={labelClass}>
                   Message
                  </label>

                  <textarea
                    id="message"
                    name="additionalInformation"
                    rows={5}
                    placeholder="Tell us more about your requirements..."
                    className="w-full resize-y border-b border-neutral-300 bg-transparent px-0 py-3 text-sm leading-7 text-[#151515] outline-none transition-colors placeholder:text-neutral-400 focus:border-[#151515]"
                  />
                </div>

                <span className=" flex mt-2 text-center text-sm leading-5 text-neutral-500"> We respect your privacy and the information you provide, will only be used to contact you to confirm your Bespoke appointment</span>
              </div>

              {/* Submission Status */}
              {status.message && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`mt-8 text-sm leading-6 ${
                    status.type === 'success'
                      ? 'text-green-700'
                      : 'text-red-600'
                  }`}
                >
                  {status.message}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-10 inline-flex min-h-14 w-full items-center justify-center bg-[#151515] px-8 text-xs font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isSubmitting
                  ? 'Submitting...'
                  : 'Request an Appointment'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  )
}
