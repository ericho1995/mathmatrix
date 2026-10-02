import type { Headline } from '@/lib/diagnostic/score'
import { SELECTIVE_SUBJECTS, SUBJECTS } from '@/lib/curriculum'
import { yearLabel } from '@/lib/yearLevels'
import LevelChip from './LevelChip'
import AreaBar from './AreaBar'
import { AlertTriangle } from 'lucide-react'

const SUBJECT = new Map([...SUBJECTS, ...SELECTIVE_SUBJECTS].map(s => [s.slug, s.label]))

/**
 * The result in brief: the score, the plain-English summary, and every area
 * with its level, how firm it is, and a bar. Shown to anyone straight after
 * the test, and at the top of the full report.
 */
export default function HeadlineResults({ headline, sample = false }: { headline: Headline; sample?: boolean }) {
  const h = headline
  return (
    <div className="card p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 mb-6">
        <ScoreRing correct={h.correct} total={h.total} />
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-1">
            {sample ? 'Sample · ' : ''}
            {yearLabel(h.year)} {SUBJECT.get(h.subject) ?? h.subject}
          </p>
          <h2 className="text-xl font-semibold tracking-tight mb-2">{h.name ? `${h.name}’s results` : 'Results'}</h2>
          <p className="text-gray-600 leading-relaxed">{h.summary}</p>
        </div>
      </div>
      {h.notes?.length ? (
        <div className="rounded-xl bg-amber-50 border border-amber-400/30 p-4 mb-6 space-y-2">
          {h.notes.map(n => (
            <p key={n} className="flex gap-2 text-sm text-gray-700">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden />
              {n}
            </p>
          ))}
        </div>
      ) : null}
      <ul className="divide-y divide-gray-100">
        {h.areas.map(a => (
          <li key={a.id} className="py-3">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mb-2">
              <span className="font-medium text-gray-900">{a.label}</span>
              <LevelChip level={a.level} confidence={a.confidence} />
            </div>
            <AreaBar pct={a.pct} level={a.level} label={a.label} />
            <p className="text-xs text-gray-500 mt-1.5">
              {a.correct} of {a.total} correct
              {a.evidence < a.total ? ` · ${a.total - a.evidence} not counted (guesses or too quick)` : ''}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ScoreRing({ correct, total }: { correct: number; total: number }) {
  const r = 30
  const c = 2 * Math.PI * r
  const share = total ? correct / total : 0
  return (
    <div className="relative w-20 h-20 shrink-0" role="img" aria-label={`${correct} of ${total} correct`}>
      <svg viewBox="0 0 72 72" className="w-20 h-20 -rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#E6F1FB" strokeWidth="8" />
        <circle cx="36" cy="36" r={r} fill="none" stroke="#185FA5" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${c * share} ${c}`} />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold leading-none">{correct}</span>
        <span className="text-[11px] text-gray-500">of {total}</span>
      </span>
    </div>
  )
}
