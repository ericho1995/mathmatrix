import type { ResolvedExam, ResolvedQuestion } from './resolveExam'
import { PREVIEW_SHARE } from './previewPolicy'

/** What a preview left out, for the page that closes it. */
export interface PreviewInfo {
  examId: string
  /** Questions in the preview. */
  shown: number
  /** Questions in the full paper. */
  total: number
  totalMarks: number
  /** Per section, what is still to come. Sections the preview finished are omitted. */
  rest: { title: string; questions: number; marks: number }[]
}

export function questionMarks(q: ResolvedQuestion): number {
  if (q.format === 'extended_response') return q.parts.reduce((sum, p) => sum + p.marks, 0)
  return 'marks' in q && typeof q.marks === 'number' ? q.marks : 1
}

/**
 * How many questions, from the start of the paper, a preview shows: as close
 * to PREVIEW_SHARE of them as possible, never all of them, and never splitting
 * a group of questions that share a text or data set — a Reading preview ends
 * at the end of a text, not halfway through its questions. The cut goes at the
 * group boundary nearest the target, so six-question texts cannot push a
 * "third" up to a half.
 */
export function previewCount(questions: ResolvedQuestion[], share = PREVIEW_SHARE): number {
  const total = questions.length
  if (total < 2) return 0
  const target = Math.max(1, Math.round(total * share))
  const continuesGroup = (k: number) =>
    Boolean(questions[k].stimulus_id) && questions[k].stimulus_id === questions[k - 1].stimulus_id
  const cuts: number[] = []
  for (let k = 1; k < total; k++) if (!continuesGroup(k)) cuts.push(k)
  // One group running through the whole paper has no clean place to stop.
  if (!cuts.length) return Math.min(target, total - 1)
  return cuts.reduce((best, k) => (Math.abs(k - target) < Math.abs(best - target) ? k : best))
}

/**
 * The preview of a paper: the same sections, cut to the first questions. Every
 * section is kept, even one left empty, so the cover still describes the whole
 * paper and its timing; the documents skip empty sections when laying out
 * questions.
 */
export function previewOf(resolved: ResolvedExam): { resolved: ResolvedExam; info: PreviewInfo } {
  const all = resolved.sections.flatMap(s => s.questions)
  const shown = previewCount(all)

  let left = shown
  const sections = resolved.sections.map(s => {
    const take = Math.min(left, s.questions.length)
    left -= take
    return { ...s, questions: s.questions.slice(0, take) }
  })

  const rest = resolved.sections
    .map((s, i) => {
      const hidden = s.questions.slice(sections[i].questions.length)
      return { title: s.section.title, questions: hidden.length, marks: hidden.reduce((sum, q) => sum + questionMarks(q), 0) }
    })
    .filter(r => r.questions > 0)

  return {
    resolved: { exam: resolved.exam, sections },
    info: {
      examId: resolved.exam.id,
      shown,
      total: all.length,
      totalMarks: all.reduce((sum, q) => sum + questionMarks(q), 0),
      rest,
    },
  }
}
