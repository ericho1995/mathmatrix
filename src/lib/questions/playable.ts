import type { Question } from '@/types'

/**
 * Whether the free on-screen quiz can actually show this question.
 *
 * The quiz renders question text, options and a typed answer — nothing else.
 * It has no diagram renderer, no reading passage and no multi-part layout, so a
 * question that depends on any of those is unanswerable there: "The graph shows
 * the number of books…" with no graph, or four questions about a passage the
 * student never sees. Those stay on the printable papers, where they render.
 *
 * scripts/gen-coverage.mjs applies the same rule so the practice builder's pool
 * sizes match what the quiz will serve. Change both together.
 */
export function isQuizPlayable(q: Question | Omit<Question, 'created_at'>): boolean {
  if (q.diagram) return false
  if ('option_diagrams' in q && q.option_diagrams?.length) return false
  if (q.stimulus_id) return false
  if (q.format === 'extended_response') return false
  return true
}
