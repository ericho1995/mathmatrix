'use client'

import { useState } from 'react'
import { MailPlus, Send } from 'lucide-react'
import { GRADES, SELECTIVE_SUBJECTS, SUBJECTS } from '@/lib/curriculum'
import { yearLabel } from '@/lib/yearLevels'
import { SUPPORT_EMAIL } from '@/lib/site'
import type { SubjectSlug, YearLevel } from '@/types'

const VCE = new Set<YearLevel>(['year_11', 'year_12'])
const subjectsFor = (year: YearLevel) => (VCE.has(year) ? SELECTIVE_SUBJECTS : SUBJECTS)

/**
 * "Need more practice papers?" A family that has worked through the papers
 * for their year and subject can ask the team for more. `compact` is a single
 * line that opens the same form (under the weak-areas papers); otherwise a
 * card. Signed-in families are answered at their account email.
 */
export default function RequestMorePapers({
  year: initialYear,
  subject: initialSubject,
  source,
  signedIn,
  compact = false,
}: {
  year?: YearLevel
  subject?: SubjectSlug
  source: 'catalogue' | 'paper' | 'weak_papers'
  signedIn: boolean
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState<YearLevel>(initialYear ?? 'grade_5')
  const options = subjectsFor(year)
  const [subject, setSubject] = useState<SubjectSlug>(initialSubject && options.some(s => s.slug === initialSubject) ? initialSubject : options[0].slug)
  const [note, setNote] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [sentTo, setSentTo] = useState('')
  const [error, setError] = useState<string | null>(null)

  const pickYear = (y: YearLevel) => {
    setYear(y)
    const opts = subjectsFor(y)
    if (!opts.some(s => s.slug === subject)) setSubject(opts[0].slug)
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    setError(null)
    try {
      const res = await fetch('/api/paper-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, subject, note, email: signedIn ? undefined : email, source, website }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Your request could not be sent. Please try again.')
      setSentTo(data.email ?? email)
      setState('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Your request could not be sent. Please try again.')
      setState('idle')
    }
  }

  if (state === 'sent') {
    return (
      <div className={`rounded-2xl border-2 border-teal-200 bg-teal-50 p-4 text-sm ${compact ? 'mt-3' : ''}`} role="status">
        <p className="font-bold text-teal-600">Thanks, your request is with our team.</p>
        <p className="mt-1 text-gray-700">
          We&apos;ll be in touch{sentTo ? ` at ${sentTo}` : ''} about more {yearLabel(year)} {options.find(s => s.slug === subject)?.label} papers for your child.
        </p>
      </div>
    )
  }

  const form = (
    <form onSubmit={send} className="mt-3 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-bold text-gray-700">Year level</span>
          <select className="mt-1 w-full rounded-xl border-2 border-line px-3 py-2" value={year} onChange={e => pickYear(e.target.value as YearLevel)}>
            {GRADES.map(g => (
              <option key={g.value} value={g.value}>
                {yearLabel(g.value)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-bold text-gray-700">Subject</span>
          <select className="mt-1 w-full rounded-xl border-2 border-line px-3 py-2" value={subject} onChange={e => setSubject(e.target.value as SubjectSlug)}>
            {options.map(s => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-bold text-gray-700">What would help your child?</span> <span className="text-gray-500">(optional)</span>
        <textarea
          className="mt-1 w-full rounded-xl border-2 border-line px-3 py-2"
          rows={3}
          maxLength={1000}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={VCE.has(year) ? 'For example: more Examination 2 practice, or more calculus before the exams in November' : 'For example: more fractions questions, or another full paper before NAPLAN'}
        />
      </label>
      {!signedIn && (
        <label className="block text-sm">
          <span className="font-bold text-gray-700">Your email</span>
          <input type="email" required className="mt-1 w-full rounded-xl border-2 border-line px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
        </label>
      )}
      {/* People never see this; bots fill it in. */}
      <input type="text" name="website" value={website} onChange={e => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
          {SUPPORT_EMAIL && (
            <>
              {' '}
              <a className="underline font-bold" href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`More ${yearLabel(year)} papers`)}`}>
                {SUPPORT_EMAIL}
              </a>
            </>
          )}
        </p>
      )}
      <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={state === 'sending'}>
        <Send className="w-4 h-4" aria-hidden />
        {state === 'sending' ? 'Sending…' : 'Send request'}
      </button>
    </form>
  )

  if (compact) {
    return (
      <div className="mt-3 text-sm">
        {!open ? (
          <button type="button" className="font-bold text-brand-600 underline underline-offset-2" onClick={() => setOpen(true)}>
            Run out of papers? Ask us for more.
          </button>
        ) : (
          <div className="rounded-2xl border-2 border-line bg-white p-4">
            <p className="font-bold text-ink">Ask us for more papers</p>
            <p className="mt-1 text-gray-600">Our team is busy, but we&apos;ll make it work for your child and arrange more.</p>
            {form}
          </div>
        )}
      </div>
    )
  }

  return (
    <section className="rounded-2xl border-2 border-line border-b-4 bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <MailPlus className="w-5 h-5" aria-hidden />
        </span>
        <div className="flex-1">
          <h2 className="font-extrabold text-ink">Need more practice papers?</h2>
          <p className="mt-1 text-sm text-gray-600">
            If your child has worked through these, tell us what they need. Our team is busy, but we&apos;ll make it work for your child and arrange
            more papers.
          </p>
          {!open ? (
            <button type="button" className="btn-secondary mt-3 inline-flex items-center gap-2" onClick={() => setOpen(true)}>
              <MailPlus className="w-4 h-4" aria-hidden />
              Request more papers
            </button>
          ) : (
            form
          )}
        </div>
      </div>
    </section>
  )
}
