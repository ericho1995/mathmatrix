/**
 * Best-effort extraction of a unit or currency symbol to print alongside a
 * short-answer blank (`$______`, `______ m`), matching real NAPLAN's
 * unit-aware blanks. Never invents a unit that isn't present in
 * `expectedAnswer` — an unrecognised shape gives a plain blank. Display only:
 * `expected_answer` and grading (`matchShortAnswer`) are untouched.
 *
 * Shared by the PDF paper and the on-screen test, so both print the same line.
 */
export function answerUnit(expectedAnswer: string): { prefix?: string; suffix?: string } {
  const trimmed = expectedAnswer.trim()
  const currencyMatch = trimmed.match(/^([$€£])\s?[\d,.]/)
  if (currencyMatch) return { prefix: currencyMatch[1] }
  // A number followed by a unit: words ("beads", "degrees"), metric units with
  // powers ("cm²", "m³"), compound units ("km/h", "L/100 km"), or a bare symbol
  // ("°", "%"). Real papers print these on the answer line.
  const unitMatch = trimmed.match(/^[−-]?[\d,.]+\s*((?:[a-zA-Z]{1,15}(?:[²³]|\/[a-zA-Z0-9 ]{1,8})?)|°C?|%)$/)
  if (unitMatch) return { suffix: unitMatch[1] }
  return {}
}
