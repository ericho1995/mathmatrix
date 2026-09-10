'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GRADES } from '@/lib/curriculum'
import { friendlyAuthError } from '@/lib/auth/friendlyAuthError'
import type { UserRole, YearLevel } from '@/types'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<Exclude<UserRole, 'admin'>>('student')
  const [fullName, setFullName] = useState('')
  const [yearLevel, setYearLevel] = useState<YearLevel | ''>('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setError('Supabase is not configured yet. Add your project URL and anon key to .env.local.')
      setLoading(false)
      return
    }

    if (role === 'student' && !yearLevel) {
      setError('Choose your year level.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          ...(role === 'student' ? { year_level: yearLevel } : {}),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(friendlyAuthError(signUpError.message))
      return
    }

    if (data.user && !data.session) {
      setMessage('Check your email to confirm your account before signing in.')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-medium tracking-tight mb-1 text-center">
          Prep<span className="text-brand-400">Nest</span>
        </h1>
        <p className="text-gray-500 text-center mb-8">Create your account</p>

        <div className="inline-flex rounded-xl border border-gray-100 p-1 mb-6 w-full">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${role === 'student' ? 'bg-brand-600 text-white' : 'text-gray-500'}`}
          >
            I&apos;m a student
          </button>
          <button
            type="button"
            onClick={() => setRole('parent')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${role === 'parent' ? 'bg-brand-600 text-white' : 'text-gray-500'}`}
          >
            I&apos;m a parent
          </button>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            className="input"
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
          {role === 'student' && (
            <select
              className="input"
              value={yearLevel}
              onChange={e => setYearLevel(e.target.value as YearLevel)}
              required
            >
              <option value="" disabled>Year level</option>
              {GRADES.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          )}
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
            minLength={6}
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-teal-600 text-sm">{message}</p>}
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
