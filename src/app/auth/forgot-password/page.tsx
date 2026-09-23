'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { friendlyAuthError } from '@/lib/auth/friendlyAuthError'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  // Set when a reset link could not be used (expired, already used, or opened
  // twice) and /auth/confirm sent the visitor back here to ask for another.
  const [linkExpired, setLinkExpired] = useState(false)
  useEffect(() => {
    setLinkExpired(new URLSearchParams(window.location.search).get('link') === 'expired')
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/auth/reset-password`,
    })

    setLoading(false)

    if (resetError) {
      setError(friendlyAuthError(resetError.message))
      return
    }

    setSent(true)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-medium tracking-tight mb-1 text-center">
          Prep<span className="text-brand-400">Nest</span>
        </h1>
        <p className="text-gray-500 text-center mb-8">Reset your password</p>

        {linkExpired && !sent && (
          <p className="text-sm text-gray-600 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-4">
            That reset link has expired or has already been used. Enter your email and we&apos;ll send a new one.
          </p>
        )}

        {sent ? (
          <p className="text-teal-600 text-sm text-center">
            If an account exists for {email}, we&apos;ve sent a link to reset your password.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              className="input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/auth/login" className="text-brand-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
