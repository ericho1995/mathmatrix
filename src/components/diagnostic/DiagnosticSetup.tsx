'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Clock, RotateCcw } from 'lucide-react'
import YearPicker from '@/components/catalogue/YearPicker'
import SubjectIcon from '@/components/ui/SubjectIcon'
import { SELECTIVE_SUBJECTS, SUBJECTS } from '@/lib/curriculum'
import { yearLabel } from '@/lib/yearLevels'
import { clearTest, emptyAnswer, loadTest, saveTest, type StoredTest } from '@/lib/diagnostic/storage'
import type { SubjectSlug, YearLevel } from '@/types'
import { track } from '@/lib/analytics/track'

export interface SetupTest {
  year: YearLevel
  subject: SubjectSlug
  questions: number
  /** Lowest and highest likely minutes, follow-ups included. */
  minutes: [number, number]
  followUps: number
}

const SUBJECT = new Map([...SUBJECTS, ...SELECTIVE_SUBJECTS].map(s => [s.slug, s]))

/**
 * Choosing the test: year level, subject, and optionally the child's first
 * name. The parent does this; the next screen is the child's.
 */
export default function DiagnosticSetup({ tests, initialYear }: { tests: SetupTest[]; initialYear?: YearLevel }) {
  const router = useRouter()
  const years = useMemo(() => Array.from(new Set(tests.map(t => t.year))), [tests])
  const [year, setYear] = useState<YearLevel | null>(initialYear && years.includes(initialYear) ? initialYear : null)
  const [subject, setSubject] = useState<SubjectSlug | null>(null)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resume, setResume] = useState<StoredTest | null>(null)

  useEffect(() => setResume(loadTest()), [])

  const forYear = tests.filter(t => t.year === year)
  const chosen = forYear.find(t => t.subject === subject) ?? null

  function pickYear(y: YearLevel) {
    setYear(y)
    const options = tests.filter(t => t.year === y)
    setSubject(options.length === 1 ? options[0].subject : null)
  }

  async function start() {
    if (!chosen) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/diagnostic/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: chosen.year, subject: chosen.subject, name: name.trim() || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? `The test could not start (${res.status}).`)
      track('StartFreeTest')
      const test: StoredTest = {
        token: data.token,
        year: chosen.year,
        subject: chosen.subject,
        name: name.trim() || null,
        part: 1,
        partOne: data.questions.length,
        minutes: data.minutes,
        followUps: data.followUps,
        questions: data.questions,
        texts: data.texts,
        answers: data.questions.map(emptyAnswer),
        index: -1,
        startedAt: Date.now(),
      }
      // A test that will not fit in storage still runs; it just will not survive a refresh.
      clearTest()
      saveTest(test)
      sessionStorage.setItem('prepnest.diagnostic.fresh', '1')
      router.push('/diagnostic/test')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The test could not start.')
      setBusy(false)
    }
  }

  return (
    <div className="card p-6 sm:p-8 rounded-3xl border-brand-200">
      {resume && (
        <div className="mb-8 rounded-2xl border-2 border-brand-200 bg-brand-50 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <RotateCcw className="w-5 h-5 text-brand-600 shrink-0" aria-hidden />
          <p className="text-sm text-brand-900 flex-1">
            {resume.name ? `${resume.name}’s` : 'A'} {yearLabel(resume.year)} {SUBJECT.get(resume.subject)?.label} test is
            in progress on this device: {resume.answers.filter(a => a.done).length} of {resume.questions.length} questions answered.
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn-primary text-sm py-2" onClick={() => router.push('/diagnostic/test')}>
              Carry on
            </button>
            <button
              type="button"
              className="btn-secondary text-sm py-2"
              onClick={() => {
                clearTest()
                setResume(null)
              }}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <Step n={1} title="Your child’s year level">
        <div className="overflow-x-auto -mx-1 px-1 pb-1">
          <YearPicker items={years.map(y => ({ yearLevel: y }))} selected={year} onSelect={pickYear} compact />
        </div>
      </Step>

      {year && (
        <Step n={2} title={year === 'year_11' || year === 'year_12' ? 'The VCE subject' : 'The subject'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {forYear.map(t => {
              const s = SUBJECT.get(t.subject)
              const active = subject === t.subject
              return (
                <button
                  key={t.subject}
                  type="button"
                  onClick={() => setSubject(t.subject)}
                  aria-pressed={active}
                  className={`flex items-start gap-3 text-left rounded-2xl border-2 border-b-4 px-4 py-3 transition-colors ${
                    active ? 'border-brand-500 bg-brand-50' : 'border-line bg-white hover:border-brand-200 hover:bg-brand-50/50'
                  }`}
                >
                  <SubjectIcon subject={t.subject} />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">{s?.label ?? t.subject}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">{s?.tagline}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500 mt-1.5">
                      <Clock className="w-3.5 h-3.5" aria-hidden />
                      {t.minutes[0]}–{t.minutes[1]} minutes
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </Step>
      )}

      {chosen && (
        <Step n={3} title="Their first name (optional)">
          <input
            className="input max-w-xs"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={40}
            placeholder="e.g. Mia"
            autoComplete="off"
            aria-label="Child’s first name"
          />
          <p className="text-xs text-gray-500 mt-2">Used on the report and on the practice exam’s cover.</p>
        </Step>
      )}

      {chosen && (
        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="text-sm font-medium text-gray-900 mb-2">Before they start</p>
          <ul className="text-sm text-gray-600 space-y-1.5 mb-6 list-disc pl-5">
            <li>Let them work on their own. Help on a question hides exactly what the test is looking for.</li>
            <li>Paper and a pencil for working out are fine{chosen.subject === 'math' && (chosen.year === 'year_7' || chosen.year === 'year_8' || chosen.year === 'year_9' || chosen.year === 'year_10') ? '; a calculator only on questions marked “calculator allowed”' : ''}.</li>
            <li>
              Tell them <strong>I’m not sure</strong> is a good answer. A guess hides what they know; an honest skip shows it.
            </li>
            <li>
              There are {chosen.questions} questions, then up to {chosen.followUps} more chosen from their answers. Progress is
              saved as they go.
            </li>
          </ul>
          <button type="button" className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-10 py-3.5 w-full sm:w-auto" onClick={start} disabled={busy}>
            {busy ? 'Starting…' : 'Start the test'}
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
          {error && (
            <p role="alert" className="text-sm text-red-600 mt-3">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7 last:mb-0">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink mb-3">
        <span className="inline-flex w-7 h-7 rounded-lg bg-brand-500 text-white text-sm font-bold items-center justify-center">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}
