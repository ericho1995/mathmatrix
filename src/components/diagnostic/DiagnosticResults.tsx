'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { clearResult, loadResult, saveResultLocal, type StoredResult } from '@/lib/diagnostic/storage'
import HeadlineResults from './HeadlineResults'
import Bird from '@/components/brand/Bird'
import { Sparkle, Star } from '@/components/brand/Decor'

type State = 'loading' | 'none' | 'signed-out' | 'saving' | 'error'

const HERE = '/diagnostic/results'

/**
 * Straight after the test. Anyone sees the headline; a free account adds the
 * full report and the practice exam. Signed in, the result is saved to the
 * account and the report opens — the server marks it again from the answers
 * in the receipt, never trusting a score sent from here.
 */
export default function DiagnosticResults() {
  const router = useRouter()
  const [result, setResult] = useState<StoredResult | null>(null)
  const [state, setState] = useState<State>('loading')
  const [error, setError] = useState<string | null>(null)

  const claim = useCallback(
    async (r: StoredResult) => {
      setState('saving')
      setError(null)
      try {
        const res = await fetch('/api/diagnostic/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receipt: r.receipt }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.status === 401) return setState('signed-out')
        if (!res.ok) throw new Error(data.error ?? `The result could not be saved (${res.status}).`)
        clearResult()
        router.replace(`/diagnostic/report/${data.id}` as Route)
      } catch (e) {
        const message = e instanceof Error ? e.message : 'The result could not be saved.'
        setError(message)
        saveResultLocal({ ...r, saveError: message })
        setState('error')
      }
    },
    [router]
  )

  useEffect(() => {
    const r = loadResult()
    setResult(r)
    if (!r) return setState('none')
    createClient()
      .auth.getUser()
      .then(({ data }) => (data.user ? claim(r) : setState('signed-out')))
      .catch(() => setState('signed-out'))
  }, [claim])

  if (state === 'loading') return <Shell><p className="text-gray-500">Loading the results…</p></Shell>

  if (state === 'none' || !result) {
    return (
      <Shell>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">No results on this device</h1>
        <p className="text-gray-500 mb-6">
          Results are kept in the browser the test was sat in until they are saved to an account. If you signed up on another
          device, open this page in the browser the test was sat in.
        </p>
        <Link href="/diagnostic" className="btn-primary">
          Start a diagnostic test
        </Link>
      </Shell>
    )
  }

  const who = result.headline.name ?? 'your child'
  return (
    <main className="flex-1 w-full">
      <section className="relative overflow-hidden bg-teal-400">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Star className="absolute top-6 left-[10%] w-10 h-10 animate-float motion-reduce:animate-none" />
          <Sparkle className="absolute top-16 right-[18%] w-8 h-8" fill="#FFFFFF" />
          <Star className="absolute bottom-10 right-[8%] w-8 h-8" />
          <Sparkle className="absolute bottom-8 left-[30%] w-6 h-6" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
          <span className="inline-flex w-32 h-32 rounded-full bg-white items-center justify-center shrink-0">
            <Bird pose="cheer" className="w-28 h-28 animate-float motion-reduce:animate-none" />
          </span>
          <div>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">{result.headline.name ? `Well done, ${result.headline.name}!` : 'Test complete!'}</p>
            <p className="text-lg font-semibold text-ink">Here&apos;s what the test found.</p>
          </div>
        </div>
      </section>
      <div className="max-w-3xl mx-auto px-4 py-10">
      <HeadlineResults headline={result.headline} />

      {state === 'saving' && (
        <p className="text-gray-600 mt-6" role="status">
          Saving to your account…
        </p>
      )}

      {state === 'error' && (
        <div className="card mt-6 border-red-100">
          <p className="text-red-700 font-medium mb-1">The result could not be saved yet</p>
          <p className="text-sm text-gray-600 mb-4">{error} Nothing is lost: the answers are kept on this device.</p>
          <button type="button" className="btn-primary" onClick={() => claim(result)}>
            Try again
          </button>
        </div>
      )}

      {state === 'signed-out' && (
        <div className="card mt-6 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-brand-600" aria-hidden />
            <h2 className="text-lg font-semibold tracking-tight">See the full report — free</h2>
          </div>
          <p className="text-gray-600 mb-4">Create a free parent account to keep this result and see:</p>
          <ul className="space-y-2 text-gray-700 mb-6">
            {[
              'The specific skills to work on in each area, and which are already secure',
              `Three practical ways to help ${who} at home, area by area`,
              'Every question with the answer given, the right answer and an explanation',
              `A practice exam built around ${result.headline.name ? `${result.headline.name}’s` : 'the'} result, with an answer key`,
              'Progress over time when they sit it again',
            ].map(t => (
              <li key={t} className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link href={`/auth/register?role=parent&next=${encodeURIComponent(HERE)}` as Route} className="btn-primary">
              Create a free parent account
            </Link>
            <Link href={`/auth/login?next=${encodeURIComponent(HERE)}` as Route} className="btn-secondary">
              Sign in
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            No card needed. The result stays in this browser until it is saved.
          </p>
        </div>
      )}
      </div>
    </main>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="max-w-2xl mx-auto px-4 py-16 flex-1 w-full">{children}</main>
}
