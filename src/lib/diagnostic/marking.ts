import { firstQuestionNumbers, hydrateExam } from '@/lib/pdf/resolveExam'
import type { PaperSection } from '@/lib/exams/paperQuestions'
import type { TopicSlug } from '@/types'
import type { BankQuestion } from './types'
import type { Mark } from './save'
import { classify } from './areas'
import { tailoredAsPractice } from './paper'
import type { TailoredExam } from './tailor'
import { BY_ID } from './server'

// ─────────────────────────────────────────────────────────────────────────────
// Marking the tailored exam on screen.
//
// The marking grid numbers questions exactly as the printed paper does and
// groups them by the report's areas, so "Spelling" on the report is "Spelling"
// here. Like the catalogue's marking screen, the browser sends only which
// positions were wrong; the server maps them back to questions. Server-only.
// ─────────────────────────────────────────────────────────────────────────────

interface Numbered {
  title: string
  questions: { id: string; n: number; area: string; label: string }[]
}

function numbered(exam: TailoredExam): Numbered[] {
  const resolved = hydrateExam(tailoredAsPractice(exam))
  const starts = firstQuestionNumbers(resolved.sections)
  return resolved.sections.map((s, i) => ({
    title: s.section.title,
    questions: s.questions.map((q, qi) => {
      const { area } = classify(q as unknown as BankQuestion)
      return { id: q.id, n: starts[i] + qi + 1, area: area.id, label: area.label }
    }),
  }))
}

/** The grid for the marking screen: numbers and area labels, no ids. */
export function markingSections(exam: TailoredExam): PaperSection[] {
  return numbered(exam).map(s => ({
    title: s.title,
    // PaperMarking groups by `topic`; for a diagnostic the group is the report area.
    questions: s.questions.map(q => ({ n: q.n, topic: q.area as TopicSlug, label: q.label })),
  }))
}

/** Wrong positions ({ s: section index, n: printed number }) as marks on every question. */
export function marksFromWrong(exam: TailoredExam, wrong: readonly { s: number; n: number }[]): Mark[] | null {
  const sections = numbered(exam)
  const wrongKeys = new Set(wrong.map(w => `${w.s}:${w.n}`))
  for (const w of wrong) {
    if (!sections[w.s]?.questions.some(q => q.n === w.n)) return null
  }
  return sections.flatMap((s, si) => s.questions.map(q => ({ id: q.id, ok: !wrongKeys.has(`${si}:${q.n}`) })))
}

export interface MarkedArea {
  id: string
  label: string
  correct: number
  total: number
}

/** How the marked exam went, area by area, weakest first. */
export function markedAreas(marks: readonly Mark[]): MarkedArea[] {
  const out = new Map<string, MarkedArea>()
  for (const m of marks) {
    const q = BY_ID.get(m.id)
    if (!q) continue
    const { area } = classify(q)
    const a = out.get(area.id) ?? { id: area.id, label: area.label, correct: 0, total: 0 }
    a.total++
    if ('ok' in m ? m.ok : m.m >= m.of) a.correct++
    out.set(area.id, a)
  }
  return Array.from(out.values()).sort((x, y) => x.correct / x.total - y.correct / y.total)
}
