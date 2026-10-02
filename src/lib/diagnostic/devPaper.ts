import type { SubjectSlug, YearLevel } from '@/types'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { sampleResult } from './sample'
import { composeTailoredExam, type TailoredExam } from './tailor'
import { CATALOGUE_IDS } from './server'

/**
 * Development only: weak-areas paper `seq` for a sample result, composed the
 * way the server composes a real one (papers 1..seq-1 used first).
 */
export function devPaper(params: Record<string, string | undefined>): TailoredExam | null {
  const year = (params.year ?? 'grade_5') as YearLevel
  const subject = (params.subject ?? 'math') as SubjectSlug
  const seed = Number(params.seed ?? 2) || 2
  const seq = Math.max(1, Number(params.seq ?? 1) || 1)
  const sample = sampleResult(QUESTION_BANK, year, subject, seed)
  if (!sample) return null
  const resultId = '00000000-0000-4000-8000-000000000000'
  const used = new Set<string>()
  let exam: TailoredExam | null = null
  for (let n = 1; n <= seq; n++) {
    exam = composeTailoredExam(QUESTION_BANK, { resultId, report: sample.report, childName: 'Mia' }, { weakOnly: true, seq: n, used, allowed: CATALOGUE_IDS, id: `dev-paper-${n}` })
    for (const s of exam.sections) for (const id of s.question_ids) used.add(id)
  }
  return exam
}
