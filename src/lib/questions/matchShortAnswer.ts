// Shared auto-grading logic for `short_answer` questions. Used by QuizRunner
// (and anywhere else that needs to grade a short-answer response) so the
// normalization rules live in exactly one place.

export function matchShortAnswer(response: string, question: { expected_answer: string; accepted_answers?: string[] }): boolean {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
  const accepted = [question.expected_answer, ...(question.accepted_answers ?? [])].map(normalize)
  return accepted.includes(normalize(response))
}
