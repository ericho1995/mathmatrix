import { Users } from 'lucide-react'
import { bandOf, bands, percentBelow, type Cohort } from '@/lib/diagnostic/cohort'
import { SELECTIVE_SUBJECTS, SUBJECTS } from '@/lib/curriculum'
import { yearLabel } from '@/lib/yearLevels'
import type { SubjectSlug, YearLevel } from '@/types'

const SUBJECT = new Map([...SUBJECTS, ...SELECTIVE_SUBJECTS].map(s => [s.slug, s.label]))

/**
 * How this result sits among other children who sat the same test: where the
 * score falls, and the spread of scores as ten bands with this child's band
 * marked. Shown only once enough children have sat it (lib/diagnostic/cohort.ts);
 * before that, a line saying the comparison opens later, with no count.
 */
export default function CohortCard({
  cohort,
  pct,
  name,
  year,
  subject,
}: {
  cohort: Cohort
  pct: number
  name: string | null
  year: YearLevel
  subject: SubjectSlug
}) {
  const who = name ?? 'Your child'
  const test = `${yearLabel(year)} ${SUBJECT.get(subject) ?? subject}`

  if (!cohort.open) {
    return (
      <section className="card p-5 flex gap-3 items-start">
        <Users className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" aria-hidden />
        <p className="text-sm text-gray-600">
          <strong className="text-gray-900">Compared with other students:</strong> this opens once enough students have sat the {test} test, so that
          the comparison means something. Until then the report is about {name ?? 'your child'} alone.
        </p>
      </section>
    )
  }

  const below = percentBelow(pct, cohort.pcts)
  const spread = bands(cohort.pcts)
  const mine = bandOf(pct)
  const tallest = Math.max(...spread, 1)
  return (
    <section className="card p-6 sm:p-8">
      <div className="flex items-start gap-3 mb-5">
        <Users className="w-6 h-6 text-brand-600 shrink-0 mt-0.5" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Compared with other students</h2>
          <p className="text-gray-700 mt-1">
            {who} scored higher than <strong>{below}%</strong> of {yearLabel(year)} students who have sat this {SUBJECT.get(subject) ?? subject} test.
          </p>
        </div>
      </div>
      <figure>
        <div className="flex items-end gap-1.5 h-28" role="img" aria-label={`Scores of students who sat the ${test} test, in ten bands; ${who}'s score is in the ${mine * 10} to ${mine * 10 + 9} percent band.`}>
          {spread.map((share, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end h-full">
              <div
                className={`rounded-t-md ${i === mine ? 'bg-brand-500' : 'bg-gray-200'}`}
                style={{ height: `${Math.max(4, (share / tallest) * 100)}%` }}
                title={`${i * 10}–${i === 9 ? 100 : i * 10 + 9}%: ${share}% of students`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2 tabular-nums">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        <figcaption className="text-xs text-gray-500 mt-3">
          Each bar is a band of scores; the blue one is {name ? `${name}’s` : 'your child’s'}. From each student’s latest sitting of this test. A
          comparison is a guide, not a ranking: the areas below say more about what to do next.
        </figcaption>
      </figure>
    </section>
  )
}
