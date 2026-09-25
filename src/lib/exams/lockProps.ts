import type { Route } from 'next'
import { PRACTICE_EXAMS, type PracticeExam } from '@/lib/questions/exams'
import { PLAN_TOTALS, shortTitle, subjectLabel, summarisePaper, yearLabel } from '@/lib/catalogue'
import { isVceYear, PLANS } from '@/lib/pricing'
import { isPlanSellable, isVcePaperSellable } from '@/lib/stripe'
import { vcePartnerId } from '@/lib/auth/vceSets'

/**
 * Everything the lock screen needs for one paper. Server-only.
 *
 * The exam page and the mark page both gate on the same purchase, so both
 * render the same lock — built here once so they cannot describe the offer
 * differently.
 */
export function lockPropsFor(exam: PracticeExam) {
  const freeSample = PRACTICE_EXAMS.find(
    e => e.subject === exam.subject && e.yearLevel === exam.yearLevel && !e.premium
  )
  const vce = isVceYear(exam.yearLevel)
  // A two-paper VCE set is one purchase: the lock names the other exam too.
  const partner = PRACTICE_EXAMS.find(e => e.id === vcePartnerId(exam.id))
  return {
    examId: exam.id,
    title: exam.title,
    pairedWith: partner ? shortTitle(partner) : undefined,
    yearLabel: yearLabel(exam.yearLevel),
    summary: summarisePaper(exam),
    vce,
    sellable: vce ? isVcePaperSellable() : PLANS.some(p => isPlanSellable(p.id)),
    plan: { range: PLAN_TOTALS.range, papers: PLAN_TOTALS.papers },
    freeSample: freeSample
      ? { id: freeSample.id, title: freeSample.title, subjectLabel: subjectLabel(freeSample.subject) }
      : undefined,
    backHref: `/practice/exams?year=${exam.yearLevel}` as Route,
  }
}
