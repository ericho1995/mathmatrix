'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { GraduationCap, Presentation, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { friendlyAuthError } from '@/lib/auth/friendlyAuthError'
import { safeNext } from '@/lib/auth/safeNext'
import { YEAR_STAGES, yearLabel } from '@/lib/yearLevels'
import type { UserRole, YearLevel } from '@/types'
import PasswordInput from '@/components/ui/PasswordInput'
import { track } from '@/lib/analytics/track'

type SignupRole = Exclude<UserRole, 'admin'>

// Who the account is for. Teachers and tutors share the parent dashboard
// (src/lib/auth/roles.ts); the 'teacher' role needs supabase/schema_teacher_role.sql.
const ACCOUNT_TYPES: { role: SignupRole; label: string; sub: string; icon: typeof Users }[] = [
  { role: 'student', label: 'Student', sub: 'I’m studying', icon: GraduationCap },
  { role: 'parent', label: 'Parent', sub: 'For my children', icon: Users },
  { role: 'teacher', label: 'Teacher or tutor', sub: 'For my students', icon: Presentation },
]

// Any age can sign up: a younger child, an adult learner or anyone not at
// school picks this, and the account is made without a year level
// (supabase/schema_student_any_year.sql). Every year's papers stay open to them.
const OTHER_YEAR = 'other'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<SignupRole>('student')
  const [fullName, setFullName] = useState('')
  const [yearLevel, setYearLevel] = useState<YearLevel | typeof OTHER_YEAR | ''>('')
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
    const params = new URLSearchParams(window.location.search)
    setNext(safeNext(params.get('next')))
    // ?role=parent preselects the account type, e.g. from a diagnostic result.
    const preset = ACCOUNT_TYPES.find(t => t.role === params.get('role'))
    if (preset) setRole(preset.role)
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
          ...(role === 'student' && yearLevel !== OTHER_YEAR ? { year_level: yearLevel } : {}),
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
    // Parents and teachers only: a student's sign-up is never reported to an ad platform.
    if (role !== 'student') track('CompleteRegistration')

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
        <p className="text-gray-500 mb-6">Flip through the first half of any paper straight away. No card needed.</p>

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
            <label className="block">
              <span className="block text-sm font-medium text-gray-900 mb-2">Your year level</span>
              <select
                className={`input ${yearLevel ? 'text-gray-900' : 'text-gray-400'}`}
                value={yearLevel}
                onChange={e => setYearLevel(e.target.value as YearLevel | typeof OTHER_YEAR)}
                required
              >
                <option value="" disabled>
                  Choose your year level
                </option>
                {YEAR_STAGES.map(stage => (
                  <optgroup key={stage.id} label={stage.label}>
                    {stage.years.map(y => (
                      <option key={y} value={y} className="text-gray-900">
                        {yearLabel(y)}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value={OTHER_YEAR} className="text-gray-900">
                  Another year, or not at school
                </option>
              </select>
            </label>
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
