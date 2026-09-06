'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    // TODO: wire up Supabase auth
    // const supabase = createClient()
    // const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
    // if (error) setError(error.message)
    setLoading(false)
    setError('Supabase auth not yet connected — add your env vars to .env.local.')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-medium tracking-tight mb-1 text-center">
          Math<span className="text-brand-400">Matrix</span>
        </h1>
        <p className="text-gray-500 text-center mb-8">Create your account</p>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            className="input"
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
          <input
            className="input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
