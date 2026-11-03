
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import SEO from '../../components/SEO'
import { adminLogin } from '../../services/api'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()

  const { admin, loading, refreshSession } = useAdminAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const redirectTo = location.state?.from || '/admin'

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Loading
        </p>
      </div>
    )
  }

  if (admin) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setIsSubmitting(true)
    setError('')

    try {
      await adminLogin(email.trim(), password)

      const currentAdmin = await refreshSession()

      if (!currentAdmin) {
        throw new Error(
          'Your login was accepted, but we could not verify your admin session. Please try again.'
        )
      }

      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(
        err.message || 'Unable to sign in. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full border-b border-neutral-300 bg-transparent px-0 py-3 text-sm text-[#151515] outline-none transition-colors placeholder:text-neutral-400 focus:border-[#151515]'

  const labelClass =
    'mb-2 block text-[10px] uppercase tracking-[0.16em] text-neutral-600'

  return (
    <>
      <SEO
        title="Admin Sign In"
        description="JOSH AMOR administration."
      />

      <main className="flex min-h-screen flex-col bg-white text-[#151515]">
        <header className="flex h-20 items-center justify-between border-b border-neutral-200 px-6 md:px-12">
          <a
            href="/"
            className="font-[var(--font-display)] text-lg tracking-[0.12em]"
          >
            JOSH AMOR
          </a>

          <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">
            Administration
          </span>
        </header>

        <section className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-[420px]">
            <p className="mb-5 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Private access
            </p>

            <h1 className="font-[var(--font-display)] text-3xl md:text-4xl">
              Welcome back.
            </h1>

            <p className="mt-4 text-sm leading-7 text-neutral-500">
              Sign in to manage the JOSH AMOR store.
            </p>

            <form onSubmit={handleSubmit} className="mt-12 space-y-8">
              <div>
                <label htmlFor="admin-email" className={labelClass}>
                  Email address
                </label>

                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Your admin email"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label htmlFor="admin-password" className={labelClass}>
                  Password
                </label>

                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  className={inputClass}
                  required
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-sm leading-6 text-red-600"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex min-h-14 w-full items-center justify-center bg-[#151515] px-8 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-10 text-center text-[10px] leading-6 text-neutral-400">
              Authorised personnel only.
            </p>
          </div>
        </section>

        <footer className="border-t border-neutral-200 px-6 py-6 text-center text-[9px] uppercase tracking-[0.16em] text-neutral-400">
          JOSH AMOR — TAILORED FOR POWER
        </footer>
      </main>
    </>
  )
}
