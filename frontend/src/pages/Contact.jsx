
import { Link } from 'react-router-dom'
import { Phone, MessageCircle } from 'lucide-react'
import SEO from '../components/SEO'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2400&q=85'

// Replace these with your actual customer-service number.
const PHONE_NUMBER = '+2348000000000'
const WHATSAPP_NUMBER = '2348000000000'

export default function Contact() {
  return (
    <>
      <SEO
        title="Contact Us"
        description="Discover contemporary wardrobe essentials, considered collections and bespoke tailoring from JOSH AMOR."
      />
    <main className="w-full bg-white text-[#151515]">
      <section
        className="relative flex min-h-[365px] items-center justify-center overflow-hidden bg-cover bg-center md:min-h-[480px]"
        style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
      >
        <div className="absolute inset-0 bg-black/15" />
        <h1 className="relative z-10 font-[var(--font-display)] text-3xl text-white">
          Contact
        </h1>
      </section>

      <section className="mx-auto grid w-[calc(100%-40px)] max-w-5xl grid-cols-1 gap-12 py-16 md:grid-cols-2 md:gap-20 md:py-24">
        <div>
          <h2 className="mb-5 font-[var(--font-display)] text-xl">
            Customer service:
          </h2>

          <p className="mb-5 text-sm leading-7 text-neutral-600">
            Our Customer Service team is available during the following hours:
          </p>

          <p className="text-sm leading-7">
            Monday to Friday: 9AM – 5PM WAT
          </p>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm underline underline-offset-4 transition-opacity hover:opacity-60"
          >
            <MessageCircle size={18} strokeWidth={1.5} />
            Chat with us on WhatsApp
          </a>

          <a
            href={`tel:${PHONE_NUMBER}`}
            className="mt-3 flex w-fit items-center gap-2 text-sm underline underline-offset-4 transition-opacity hover:opacity-60"
          >
            <Phone size={17} strokeWidth={1.5} />
            Call customer service
          </a>

          <p className="mt-6">
            <Link
              to="/enquiry?subject=Customer%20service"
              className="text-sm underline underline-offset-4 transition-opacity hover:opacity-60"
            >
              Contact our customer team here
            </Link>
          </p>
        </div>

        <div>
          <h2 className="mb-5 font-[var(--font-display)] text-xl">
            For press inquiries:
          </h2>

          <a
            href="mailto:info@joshamor.com"
            className="text-sm underline underline-offset-4 transition-opacity hover:opacity-60"
          >
            info@joshamor.com
          </a>
        </div>
      </section>
    </main>
    </>
  )
}
