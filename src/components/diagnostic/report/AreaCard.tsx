import Link from 'next/link'
import type { Route } from 'next'
import { ArrowRight, Check, Minus, X } from 'lucide-react'
import type { AreaResult, SkillState } from '@/lib/diagnostic/types'
import type { SubjectSlug, YearLevel } from '@/types'
import { guidanceFor } from '@/lib/diagnostic/guidance'
import { SKILL_STATE_LABEL } from '@/lib/diagnostic/score'
import { TOPICS } from '@/lib/curriculum'
import LevelChip from '../LevelChip'
import AreaBar from '../AreaBar'

const TOPIC_SUBJECT = new Map(TOPICS.map(t => [t.slug as string, t.subject]))

/** The free-practice topic an area maps to, or null when the builder has none. */
function practiceTopic(subject: SubjectSlug, area: string): string | null {
  if (TOPIC_SUBJECT.get(area) === subject) return area
  if (subject === 'english') return area === 'vocabulary' ? 'vocabulary' : 'grammar_punctuation'
  return null
}

const STATE_STYLE: Record<SkillState, { icon: typeof Check; cls: string }> = {
  secure: { icon: Check, cls: 'text-teal-600' },
  one_right: { icon: Check, cls: 'text-teal-600/70' },
  mixed: { icon: Minus, cls: 'text-brand-600' },
  one_miss: { icon: Minus, cls: 'text-amber-600' },
  gap: { icon: X, cls: 'text-amber-600' },
}

const CONFIDENCE_NOTE = {
  clear: 'Enough questions pointed the same way for this to be a clear result.',
  likely: 'This is probably right; the next test will settle it.',
  early: 'Too few questions, or too close to a boundary, to rely on yet. Treat it as something to watch, not a finding.',
} as const

/**
 * One area of the report: how it went, how firm that is, the skills inside it,
 * what it covers, and three things to do at home.
 */
export default function AreaCard({ area, subject, year, name }: { area: AreaResult; subject: SubjectSlug; year: YearLevel; name: string | null }) {
  const guide = guidanceFor(subject, year, area.id)
  const topic = practiceTopic(subject, area.id)
  // Skills that went wrong first, so the list reads as "what to work on".
  const order: Record<SkillState, number> = { gap: 0, mixed: 1, one_miss: 2, one_right: 3, secure: 4 }
  const skills = [...area.skills].sort((a, b) => order[a.state] - order[b.state])
  const showSkills = !(skills.length === 1 && skills[0].label === area.label)

  return (
    <article className="card p-6 break-inside-avoid">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold tracking-tight">{area.label}</h3>
        <LevelChip level={area.level} confidence={area.confidence} />
      </div>
      <AreaBar pct={area.pct} level={area.level} label={area.label} />
      <p className="text-sm text-gray-500 mt-2">
        {area.correct} of {area.total} correct
        {area.evidence < area.total ? ` (${area.secure} of the ${area.evidence} that count)` : ''}
        {area.skipped ? ` · ${area.skipped} not sure` : ''}
        {area.seconds !== null ? ` · about ${area.seconds} s a question` : ''}
      </p>
      <p className="text-xs text-gray-400 mt-1">{CONFIDENCE_NOTE[area.confidence]}</p>

      {showSkills && (
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">Skills</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {skills.map(s => {
              const { icon: Icon, cls } = STATE_STYLE[s.state]
              return (
                <li key={s.label} className="flex items-center gap-2 text-sm">
                  <Icon className={`w-4 h-4 shrink-0 ${cls}`} aria-hidden />
                  <span className="text-gray-800">{s.label}</span>
                  <span className="text-gray-400 text-xs ml-auto whitespace-nowrap">
                    {s.correct}/{s.total} · {SKILL_STATE_LABEL[s.state]}
                  </span>
                </li>
              )
            })}
          </ul>
          {skills.some(s => s.state === 'one_miss') && (
            <p className="text-xs text-gray-400 mt-2">“One miss” means a skill was asked once and missed — it may have been a slip.</p>
          )}
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1.5">What it covers</p>
          <p className="text-sm text-gray-600 leading-relaxed">{guide.covers}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1.5">Help {name ?? 'them'} at home</p>
          <ol className="text-sm text-gray-700 space-y-1.5 list-decimal pl-4">
            {guide.tips.map(t => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </div>
      </div>

      {topic && area.level !== 'strength' && (
        <Link
          href={`/practice?subject=${subject}&grade=${year}&topics=${topic}&from=paper` as Route}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-800 mt-5 print:hidden"
        >
          Free practice questions on {area.label}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      )}
    </article>
  )
}
