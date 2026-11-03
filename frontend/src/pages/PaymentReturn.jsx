
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { verifyFlutterwavePayment } from '../services/api'
import { useCart } from '../context/CartContext'

export default function PaymentReturn() {
  const [searchParams] = useSearchParams()
  const { clearCart, startNewGuestCart } = useCart()

  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState(
    'Please wait while we confirm your payment.'
  )
  const [orderNumber, setOrderNumber] = useState('')

  const verificationStarted = useRef(false)

  useEffect(() => {
    if (verificationStarted.current) return

    verificationStarted.current = true

    async function verifyPayment() {
      const orderId = searchParams.get('orderId')
      const guestCartId = searchParams.get('guestCartId')
      const txRef = searchParams.get('tx_ref')
      const transactionId = searchParams.get('transaction_id')

      if (!orderId || !guestCartId || !txRef) {
        setStatus('error')
        setMessage(
          'We could not retrieve your payment details. Please contact our support team.'
        )
        return
      }

      try {
        const response = await verifyFlutterwavePayment(
          guestCartId,
          orderId,
          {
            txRef,
            transactionId: transactionId || undefined,
          }
        )

        const data = response?.data

        setOrderNumber(data?.orderNumber || '')

        if (data?.paymentStatus === 'successful') {
          clearCart()
          startNewGuestCart()

          setStatus(
            data?.requiresManualReview ? 'review' : 'success'
          )

          setMessage(
            data?.requiresManualReview
              ? 'Your payment was received, but your order requires additional review. Our team will follow up.'
              : 'Your payment has been confirmed. Thank you for shopping with JOSH AMOR.'
          )

          return
        }

        if (data?.paymentStatus === 'pending') {
          setStatus('pending')
          setMessage(
            'Your payment is still being processed. Please allow some time for confirmation.'
          )
          return
        }

        setStatus('failed')
        setMessage(
          response?.message || 'Your payment could not be completed.'
        )
      } catch (error) {
        console.error('Payment verification failed:', error)

        setStatus('error')
        setMessage(
          error.message ||
            'We could not verify your payment. Please contact our support team before attempting payment again.'
        )
      }
    }

    verifyPayment()
  }, [searchParams, clearCart, startNewGuestCart])

  const states = {
    verifying: {
      eyebrow: 'PAYMENT VERIFICATION',
      heading: 'Verifying payment',
      icon: 'loading',
      label: 'PLEASE WAIT',
    },
    success: {
      eyebrow: 'ORDER CONFIRMED',
      heading: 'Thank you for your order.',
      icon: 'success',
      label: 'PAYMENT SUCCESSFUL',
    },
    review: {
      eyebrow: 'PAYMENT RECEIVED',
      heading: 'Your order is being reviewed.',
      icon: 'review',
      label: 'ADDITIONAL REVIEW REQUIRED',
    },
    pending: {
      eyebrow: 'PAYMENT PROCESSING',
      heading: 'Your payment is being processed.',
      icon: 'pending',
      label: 'AWAITING CONFIRMATION',
    },
    failed: {
      eyebrow: 'PAYMENT UNSUCCESSFUL',
      heading: 'We couldn’t complete your payment.',
      icon: 'failed',
      label: 'PAYMENT NOT COMPLETED',
    },
    error: {
      eyebrow: 'VERIFICATION ISSUE',
      heading: 'We couldn’t verify your payment.',
      icon: 'failed',
      label: 'VERIFICATION REQUIRED',
    },
  }

  const current = states[status]

  return (
    <main className="min-h-[75vh] bg-white px-5 py-20 sm:px-8 sm:py-28">
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">


        {/* Status icon */}
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-neutral-200">
          {status === 'verifying' && (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-black" />
          )}

          {status === 'success' && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7 text-black"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M5 12.5L10 17L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {status === 'review' && (
            <span className="text-2xl text-black">!</span>
          )}

          {status === 'pending' && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7 text-black"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                d="M12 7V12L15 14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {(status === 'failed' || status === 'error') && (
            <span className="text-2xl text-black">×</span>
          )}
        </div>

        {/* Status */}
        <p className="mb-5 text-[10px] font-medium tracking-[0.25em] text-neutral-500">
          {current.eyebrow}
        </p>

        <h1 className="max-w-xl text-3xl font-medium leading-tight tracking-[-0.04em] text-black sm:text-5xl">
          {current.heading}
        </h1>

        <p className="mt-6 max-w-md text-sm leading-7 text-neutral-500 sm:text-base">
          {message}
        </p>

        {/* Order information */}
        {orderNumber && (
          <div className="mt-10 w-full max-w-md border-y border-neutral-200 py-6">
            <p className="text-[10px] font-medium tracking-[0.2em] text-neutral-400">
              ORDER REFERENCE
            </p>

            <p className="mt-3 text-sm font-medium tracking-wider text-black">
              {orderNumber}
            </p>
          </div>
        )}

        {/* Verification notice */}
        {status === 'verifying' && (
          <p className="mt-10 text-[10px] tracking-[0.12em] text-neutral-400">
            PLEASE DO NOT CLOSE THIS PAGE
          </p>
        )}

        {/* Actions */}
        <div className="mt-12 flex w-full max-w-md flex-col gap-3 sm:flex-row">

          <Link
            to="/shop"
            className="flex min-h-14 flex-1 items-center justify-center bg-black px-6 text-[10px] font-semibold tracking-[0.18em] text-white transition-colors duration-300 hover:bg-neutral-800"
          >
            CONTINUE SHOPPING
            <span className="ml-3 text-base">↗</span>
          </Link>

          {(status === 'failed' || status === 'error' || status === 'pending' || status === 'review') && (
            <Link
              to="/enquiry"
              className="flex min-h-14 flex-1 items-center justify-center border border-neutral-300 px-6 text-[10px] font-semibold tracking-[0.18em] text-black transition-colors duration-300 hover:border-black"
            >
              CONTACT SUPPORT
              <span className="ml-3 text-base">↗</span>
            </Link>
          )}
        </div>

        {/* Footer note */}
        <p className="mt-16 text-[10px] tracking-[0.12em] text-neutral-400">
          TAILORED FOR POWER.
        </p>

      </section>
    </main>
  )
}
