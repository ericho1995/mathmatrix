import Link from 'next/link'
import type { Route } from 'next'
import type { PracticeExam } from '@/lib/questions/exams'
import SubjectIcon from '@/components/ui/SubjectIcon'
import { FROM_PER_MONTH, VCE_PAPER_PRICE, isVceYear } from '@/lib/pricing'
import { subjectLabel, type YearLevelStats } from '@/lib/catalogue'
import { stageTag } from '@/lib/yearLevels'
import { groupIntoSets, isSetGroup } from '@/lib/auth/vceSets'
import { PaperTile, SetTile, type TileState } from './PaperTile'

/**
 * One year level in the catalogue: what it is (NAPLAN year, VCE units), how
 * much is in it, and every paper as a page tile, grouped by subject. A VCE
 * two-exam set shows as one joined tile, because it is one purchase.
 */
export default function YearSection({
  stats,
  owned,
  plansOpen,
  unlocked,
  focused,
}: {
  stats: YearLevelStats
  owned: boolean
  plansOpen: boolean
  unlocked: (exam: PracticeExam) => boolean
  /** The page shows only this year (?year=…), so its title is not a link. */
  focused: boolean
}) {
  const vce = isVceYear(stats.yearLevel)
  const locked = stats.exams.filter(e => !unlocked(e)).length
  const bySubject = stats.subjects.map(subject => ({
    subject,
    exams: stats.exams.filter(e => e.subject === subject),
  }))
  // VCE is sold by purchase: a two-exam set is one purchase, a single paper another.
  const groups = bySubject.flatMap(s => groupIntoSets(s.exams))
  const purchasable = groups.filter(g => (isSetGroup(g) ? g.exams.some(e => e.premium) : g.premium)).length
  const hasSets = groups.some(isSetGroup)
  const tag = stageTag(stats.yearLevel)

  // One purchase opens both exams of a set; when one is the free sample, the
  // price buys the other.
  const setPrice = (lockedInSet: number) =>
    lockedInSet === 2 ? `${VCE_PAPER_PRICE} both` : lockedInSet === 1 ? VCE_PAPER_PRICE : undefined

  const stateOf = (exam: PracticeExam): TileState =>
    !exam.premium ? 'free' : unlocked(exam) ? 'unlocked' : vce ? { price: VCE_PAPER_PRICE } : 'locked'

  return (
    <section aria-labelledby={`year-${stats.yearLevel}`} className="rounded-3xl border border-gray-100 bg-gray-50/60 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
        <div>
          {tag && <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-1">{tag}</p>}
          <h2 id={`year-${stats.yearLevel}`} className="text-xl font-semibold tracking-tight text-gray-900">
            {focused ? (
              stats.label
            ) : (
              <Link href={`/practice/exams?year=${stats.yearLevel}` as Route} className="hover:text-brand-600">
                {stats.label}
              </Link>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {stats.papers} printable {stats.papers === 1 ? 'paper' : 'papers'} across {stats.subjects.length}{' '}
            {stats.subjects.length === 1 ? 'subject' : 'subjects'}
          </p>
          <div className="flex flex-wrap gap-2 mt-2.5">
            {stats.free > 0 && (
              <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-600">{stats.free} free</span>
            )}
            {vce ? (
              purchasable > 0 && (
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800">
                  {purchasable} to purchase · {VCE_PAPER_PRICE} each
                </span>
              )
            ) : (
              stats.paid > 0 && (
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800">
                  {stats.paid} with a plan
                </span>
              )
            )}
          </div>
        </div>
        <div className="sm:w-64">
          {owned ? (
            <p className="text-sm text-teal-600 sm:text-right">✓ Every {stats.label} paper is unlocked</p>
          ) : locked === 0 ? null : vce ? (
            <p className="text-sm text-gray-500 sm:text-right">
              {hasSets
                ? `${VCE_PAPER_PRICE} per paper, or per two-exam set — open one to purchase it`
                : `${VCE_PAPER_PRICE} per paper — open a paper to purchase it`}
            </p>
          ) : plansOpen ? (
            <Link
              href={'/pricing' as Route}
              className={`${focused ? 'btn-primary' : 'btn-secondary bg-white'} w-full block text-center text-sm`}
            >
              Unlock with a plan — from {FROM_PER_MONTH}/mo
            </Link>
          ) : (
            <p className="text-xs text-gray-400 sm:text-right">Plans open soon.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {bySubject.map(({ subject, exams }) => {
          const items = groupIntoSets(exams)
          const magazine = exams.some(e => e.magazine_id)
          return (
            <div key={subject} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="font-medium text-sm flex items-center gap-2.5">
                  <SubjectIcon subject={subject} size="sm" /> {subjectLabel(subject)}
                </p>
                <span className="text-xs text-gray-400">
                  {exams.length} {exams.length === 1 ? 'paper' : 'papers'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {items.map((item, i) =>
                  isSetGroup(item) ? (
                    <SetTile
                      key={`set-${item.set}`}
                      set={item.set}
                      price={setPrice(item.exams.filter(e => !unlocked(e)).length)}
                      papers={item.exams.map((e, k) => ({
                        href: `/practice/exams/${e.id}`,
                        label: `Ex ${k + 1}`,
                        state: stateOf(e),
                        ariaTitle: `${subjectLabel(subject)} practice set ${item.set}, exam ${k + 1}`,
                      }))}
                    />
                  ) : (
                    <PaperTile
                      key={item.id}
                      href={`/practice/exams/${item.id}`}
                      number={i + 1}
                      state={stateOf(item)}
                      ariaTitle={`${subjectLabel(subject)} practice paper ${i + 1}`}
                    />
                  ),
                )}
              </div>
              {magazine && <p className="text-xs text-gray-500 mt-3">Each comes with a colour Reading Magazine</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
