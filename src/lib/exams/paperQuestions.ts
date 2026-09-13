import { resolveExam, isSplitEligible, firstQuestionNumbers, type ResolvedSection } from '@/lib/pdf/resolveExam'
import { TOPICS } from '@/lib/curriculum'
import type { TopicSlug } from '@/types'

/**
 * The question numbers and topics of a paper — and nothing else.
 *
 * This is what the marking screen needs: to score a sat paper we only need to
 * know which numbered question belongs to which topic. The options, the correct
 * index and the explanations stay on the server. The person marking already has
 * the answer key PDF in front of them; the site never needs to know what the
 * right answer was, only which questions were wrong.
 *
 * That is deliberate. `/practice` was rebuilt to stop shipping the question bank
 * to the browser, and this must not quietly undo it.
 */
export interface PaperQuestion {
  /** The number as printed on the paper. */
  n: number
  topic: TopicSlug
  /** Topic label, resolved here so the marking screen needs no lookup table. */
  label: string
}

export interface PaperSection {
  title: string
  questions: PaperQuestion[]
}

const LABELS = new Map(TOPICS.map(t => [t.slug, t.label]))

function numberSections(sections: ResolvedSection[]): IdentifiedPaperSection[] {
  // Same helper the PDF uses, so the numbers on screen match the numbers on the
  // page the student actually wrote on. A mismatch here would silently score the
  // wrong topics.
  const starts = firstQuestionNumbers(sections)
  return sections.map((section, i) => ({
    title: section.section.title,
    questions: section.questions.map((q, qi) => ({
      id: q.id,
      n: starts[i] + qi + 1,
      topic: q.topic,
      label: LABELS.get(q.topic) ?? q.topic,
    })),
  }))
}

/**
 * Returns the paper's sections with each question numbered exactly as the
 * downloaded PDF numbers it, or null when the exam id is unknown.
 */
export function paperQuestionMap(examId: string): PaperSection[] | null {
  const withIds = paperQuestionMapWithIds(examId)
  if (!withIds) return null
  // Strip the ids on the way to the client. They give nothing away, but the
  // marking screen has no use for them and the smallest payload that does the
  // job is the one least likely to grow into a leak later.
  return withIds.map(section => ({
    title: section.title,
    questions: section.questions.map(({ n, topic, label }) => ({ n, topic, label })),
  }))
}

/**
 * The same map with question ids attached — server-only, for recording a result
 * against `question_attempts`. Never pass this to a client component.
 */
export interface IdentifiedPaperSection {
  title: string
  questions: (PaperQuestion & { id: string })[]
}

export function paperQuestionMapWithIds(examId: string): IdentifiedPaperSection[] | null {
  const resolved = resolveExam(examId)
  if (!resolved) return null

  // A split paper is downloaded as two separate booklets, and each booklet
  // numbers its questions from 1 — so the marking grid has to as well, or every
  // number in the second booklet would be wrong.
  if (isSplitEligible(resolved)) {
    const nonCalculator = resolved.sections.filter(s => s.section.calculator_allowed === false)
    const calculator = resolved.sections.filter(s => s.section.calculator_allowed === true)
    return [...numberSections(nonCalculator), ...numberSections(calculator)]
  }

  return numberSections(resolved.sections)
}
