'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { friendlyAuthError } from '@/lib/auth/friendlyAuthError'
import { safeNext } from '@/lib/auth/safeNext'
import PasswordInput from '@/components/ui/PasswordInput'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Where to go after signing in. A visitor sent here by a buy button must land
  // back on the purchase they were making, not on the homepage — this was
  // ignored before, so every signed-out checkout lost its place. Read from the
  // URL after mount rather than with useSearchParams, which would force a
  // Suspense boundary around the whole form.
  const [next, setNext] = useState('/')
  // Set when an emailed link could not be used and /auth/confirm sent the
  // visitor here. The usual cause is clicking a confirmation link twice, so
  // the message leads with "you may already be confirmed".
  const [linkExpired, setLinkExpired] = useState(false)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setNext(safeNext(params.get('next')))
    setLinkExpired(params.get('link') === 'expired')
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setError('Supabase is not configured yet. Add your project URL and anon key to .env.local.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(friendlyAuthError(signInError.message))
      setLoading(false)
      return
    }

    router.push(next as Parameters<typeof router.push>[0])
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-medium tracking-tight mb-1 text-center">
          Prep<span className="text-brand-400">Nest</span>
        </h1>
        <p className="text-gray-500 text-center mb-8">Sign in to your account</p>

        {linkExpired && (
          <p className="text-sm text-gray-600 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-4">
            That link has expired or has already been used. If you&apos;ve already confirmed your email, sign in
            below.
          </p>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            className="input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <PasswordInput
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Link href="/auth/forgot-password" className="text-sm text-brand-600 hover:underline -mt-2 self-start">
            Forgot password?
          </Link>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          No account?{' '}
          <Link
            href={(next === '/' ? '/auth/register' : `/auth/register?next=${encodeURIComponent(next)}`) as Route}
            className="text-brand-600 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  )
}
