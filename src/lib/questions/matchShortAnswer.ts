// Shared auto-grading logic for `short_answer` questions. Used by QuizRunner
// (and anywhere else that needs to grade a short-answer response) so the
// normalization rules live in exactly one place.

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/−/g, '-')

/**
 * Splits a numeric answer into its number and whatever unit surrounds it:
 * "$423.50" → { value: 423.5, unit: '$' }, "375 g" → { value: 375, unit: 'g' }.
 * Null for anything that does not start with a number — word answers are
 * compared as text, never by stripping letters off them.
 */
function numeric(s: string): { value: number; unit: string } | null {
  // Digit groups may be separated by a space, the Australian convention the
  // papers use ("12 000"), or by a comma.
  const grouped = normalize(s).replace(/(\d)[ ,](?=\d{3}(?!\d))/g, '$1')
  const m = grouped.match(/^(\$)?\s?(-?\d*\.?\d+)\s*(.*)$/)
  if (!m) return null
  const value = Number(m[2].replace(/,/g, ''))
  if (!Number.isFinite(value)) return null
  return { value, unit: (m[1] ?? '') + m[3].trim() }
}

export function matchShortAnswer(response: string, question: { expected_answer: string; accepted_answers?: string[] }): boolean {
  const accepted = [question.expected_answer, ...(question.accepted_answers ?? [])]
  if (accepted.map(normalize).includes(normalize(response))) return true

  // Papers print the unit on the answer line ("____ g", "$ ____"), so a student
  // writes the number alone. Accept the bare number, or the number with the
  // expected unit, when the expected answer is numeric — "375" and "375 g" both
  // mark correct against "375 g", and "$423.5" against "$423.50".
  const got = numeric(response)
  if (!got) return false
  return accepted.some(a => {
    const want = numeric(a)
    return want !== null && Math.abs(want.value - got.value) < 1e-9 && (got.unit === '' || got.unit === want.unit)
  })
}
