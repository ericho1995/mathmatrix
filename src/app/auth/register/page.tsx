'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { GraduationCap, Presentation, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { GRADES } from '@/lib/curriculum'
import { friendlyAuthError } from '@/lib/auth/friendlyAuthError'
import { safeNext } from '@/lib/auth/safeNext'
import YearPicker from '@/components/catalogue/YearPicker'
import type { UserRole, YearLevel } from '@/types'
import PasswordInput from '@/components/ui/PasswordInput'

type SignupRole = Exclude<UserRole, 'admin'>

// Who the account is for. Teachers and tutors share the parent dashboard
// (src/lib/auth/roles.ts); the 'teacher' role needs supabase/schema_teacher_role.sql.
const ACCOUNT_TYPES: { role: SignupRole; label: string; sub: string; icon: typeof Users }[] = [
  { role: 'student', label: 'Student', sub: 'I’m studying', icon: GraduationCap },
  { role: 'parent', label: 'Parent', sub: 'For my children', icon: Users },
  { role: 'teacher', label: 'Teacher or tutor', sub: 'For my students', icon: Presentation },
]

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<SignupRole>('student')
  const [fullName, setFullName] = useState('')
  const [yearLevel, setYearLevel] = useState<YearLevel | ''>('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  // Carried through sign-up and the confirmation email, so someone who started
  // from a buy button ends up back at it. Validated by safeNext on the way in
  // here and again in the auth callback.
  const [next, setNext] = useState('/')
  useEffect(() => {
    setNext(safeNext(new URLSearchParams(window.location.search).get('next')))
  }, [])

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
        // PrepNest's confirmation email links straight to /auth/confirm and
        // reads only `next` from this URL, so the return path survives even
        // if Supabase's allow-list does not match it. See completeAuthLink.
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next === '/' ? '/practice' : next)}`,
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

    router.push(next as Parameters<typeof router.push>[0])
    router.refresh()
  }

  return (
    <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-10 sm:py-16 bg-gradient-to-b from-brand-50/70 to-white">
      <div className="w-full max-w-xl rounded-3xl border border-gray-100 bg-white shadow-sm p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-2">PrepNest</p>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Create your free account</h1>
        <p className="text-gray-500 mb-6">Download the free sample papers straight away. No card needed.</p>

        <p id="account-type" className="text-sm font-medium text-gray-900 mb-2">
          Who is this account for?
        </p>
        <div className="grid grid-cols-3 gap-2 mb-6" role="radiogroup" aria-labelledby="account-type">
          {ACCOUNT_TYPES.map(t => {
            const active = role === t.role
            const Icon = t.icon
            return (
              <button
                key={t.role}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setRole(t.role)}
                className={`text-left rounded-xl border px-3 py-3 transition-colors ${
                  active
                    ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                    : 'border-gray-200 hover:border-brand-200 hover:bg-brand-50/40'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1.5 ${active ? 'text-brand-600' : 'text-gray-400'}`} aria-hidden />
                <span className={`block text-sm font-medium leading-tight ${active ? 'text-brand-800' : 'text-gray-900'}`}>
                  {t.label}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">{t.sub}</span>
              </button>
            )
          })}
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {role === 'student' && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Your year level</p>
              {/* Scrolls sideways on a phone rather than stacking three rows. */}
              <div className="-mx-6 px-6 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible pb-1">
                <YearPicker
                  items={GRADES.map(g => ({ yearLevel: g.value }))}
                  selected={yearLevel || null}
                  onSelect={setYearLevel}
                  compact
                />
              </div>
            </div>
          )}
          <input
            className="input"
            type="text"
            placeholder="Full name"
            autoComplete="name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
          <input
            className="input"
            type="email"
            placeholder="Email address"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <PasswordInput
            placeholder="Password (at least 6 characters)"
            autoComplete="new-password"
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
          <Link
            href={(next === '/' ? '/auth/login' : `/auth/login?next=${encodeURIComponent(next)}`) as Route}
            className="text-brand-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
