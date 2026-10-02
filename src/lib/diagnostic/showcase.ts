import type { PaperSummary } from '@/components/papers/WeakPapersCard'
import { QUESTION_BANK } from '@/lib/questions/bank'
import type { DiagnosticReport } from './types'
import { sampleResult } from './sample'
import { headlineOf, type Headline } from './score'
import { buildProfile, type Profile } from './profile'
import { composeTailoredExam, weakAreas } from './tailor'
import { CATALOGUE_IDS } from './server'

// ─────────────────────────────────────────────────────────────────────────────
// One made-up child, Mia in Grade 5 Maths, for every page that shows the
// product with sample data: the homepage story and the parents' guide. Drawn
// with the real scoring and paper-building code, so a sample is exactly what a
// parent would see — only the child is invented. Server-only.
// ─────────────────────────────────────────────────────────────────────────────

const NAME = 'Mia'
const YEAR = 'grade_5'
const SUBJECT = 'math'

/** The first seed that gives a firm area to work on beside a strength — the shape of result the report exists to explain. */
function pickReport(): DiagnosticReport | null {
  for (let seed = 1; seed <= 40; seed++) {
    const s = sampleResult(QUESTION_BANK, YEAR, SUBJECT, seed)
    if (!s) continue
    const firmFocus = s.report.areas.some(a => a.level === 'focus' && a.confidence !== 'early')
    const strength = s.report.areas.some(a => a.level === 'strength')
    if (firmFocus && strength && !s.report.quality.flags.length) return s.report
  }
  return null
}

/** Two sittings six weeks apart, for the "over time" view. */
function pickProgress(): Profile | null {
  const before = sampleResult(QUESTION_BANK, YEAR, SUBJECT, 9)
  const after = sampleResult(QUESTION_BANK, YEAR, SUBJECT, 3)
  if (!before || !after) return null
  const sitting = (id: string, at: string, r: DiagnosticReport) => ({
    id,
    at,
    areas: r.areas.map(a => ({ id: a.id, label: a.label, secure: a.secure, evidence: a.evidence })),
  })
  return buildProfile([sitting('a', '2026-08-20', before.report), sitting('b', '2026-10-01', after.report)])
}

/** Two weak-areas papers from the sample result, the first sat and marked. */
function pickPapers(report: DiagnosticReport): PaperSummary[] {
  const used = new Set<string>()
  const out: PaperSummary[] = []
  for (let seq = 1; seq <= 2; seq++) {
    const exam = composeTailoredExam(QUESTION_BANK, { resultId: 'showcase', report, childName: NAME }, { weakOnly: true, seq, used, allowed: CATALOGUE_IDS, id: `showcase-${seq}` })
    for (const s of exam.sections) for (const id of s.question_ids) used.add(id)
    const questions = exam.sections.reduce((n, s) => n + s.question_ids.length, 0)
    out.push({
      id: `showcase-${seq}`,
      seq,
      createdAt: seq === 1 ? '2026-10-02T09:30:00+10:00' : '2026-10-09T09:30:00+10:00',
      questions,
      focus: exam.focus,
      open: true,
      marked: seq === 1 ? { got: Math.round(questions * 0.7), of: questions, at: '2026-10-03T16:00:00+10:00' } : null,
    })
  }
  return out
}

export interface Showcase {
  name: string
  report: DiagnosticReport
  headline: Headline
  progress: Profile | null
  papers: PaperSummary[]
  weak: { label: string; level: DiagnosticReport['areas'][number]['level'] }[]
}

function build(): Showcase | null {
  const report = pickReport()
  if (!report) return null
  return {
    name: NAME,
    report,
    headline: headlineOf(report, NAME),
    progress: pickProgress(),
    papers: pickPapers(report),
    weak: weakAreas(report).areas.map(a => ({ label: a.label, level: a.level })),
  }
}

export const SHOWCASE = build()
