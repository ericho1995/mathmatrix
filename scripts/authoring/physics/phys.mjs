// Authoring helpers for VCE Physics Unit 3 & 4 practice exams (2024–2027
// study design). A set file (set-1.mjs …) builds one complete examination:
// Section A (20 multiple choice) then Section B (short answer, 100 marks).
// build.mjs writes every set into bank.ts. See
// .claude/skills/vce-physics-papers/SKILL.md for the workflow.
//
// Text uses the `t` tag (String.raw): \( … \) is typeset maths. Units go in
// plain text with superscripts: m s⁻¹, N kg⁻¹, m s⁻².

export { t } from '../specialist/sm.mjs'
export { curve, param, axes, piTicks } from '../specialist/sm.mjs'

export const AOS = {
  MO: 'phys_motion', // Unit 3 AOS1: motion in two dimensions (Newton, projectiles, circular, momentum, energy, springs)
  FI: 'phys_fields', // Unit 3 AOS2: gravitational, electric and magnetic fields
  EL: 'phys_electrical_power', // Unit 3 AOS3: generating and transmitting electricity
  LM: 'phys_light_matter', // Unit 4 AOS1: light and matter, special relativity
  IN: 'phys_investigation', // Unit 4 AOS2: scientific investigation
}
const CODE = {
  phys_motion: 'VCE-PHY-U3-AOS1',
  phys_fields: 'VCE-PHY-U3-AOS2',
  phys_electrical_power: 'VCE-PHY-U3-AOS3',
  phys_light_matter: 'VCE-PHY-U4-AOS1',
  phys_investigation: 'VCE-PHY-U4-AOS2',
}
const LETTERS = ['A', 'B', 'C', 'D']

/** One lettered part. opts: { unit: 'N' } prints a final-answer box with the
 *  unit; { lines: n } overrides the working space; { diagram } adds a figure
 *  under the prompt (e.g. axes to plot on). */
export const part = (label, prompt, marks, answer, solution, opts = {}) => ({ label, prompt, marks, expected_answer: answer, explanation: solution, ...opts })

// Working space: VCAA gives calculations about a line and a half per mark on
// top of the answer box, and explanations a little more.
const LINES = { 1: 3, 2: 5, 3: 7, 4: 9, 5: 10, 6: 11 }
const withLines = parts => parts.map(p => ({ ...p, lines: p.lines ?? (p.diagram ? 2 : Math.max(2, (LINES[p.marks] ?? 11) - (p.unit !== undefined ? 1 : 0))) }))

export function makeSet(set) {
  const items = []
  const counters = { a: 0, b: 0 }
  return {
    items,
    /** Section A multiple choice: options in printed order, answer letter.
     *  extra.headers makes a table (each option "cell | cell"). */
    mc(topic, difficulty, stem, options, answer, explanation, extra = {}) {
      const index = LETTERS.indexOf(answer)
      if (index < 0) throw new Error(`answer must be A–D: ${stem.slice(0, 50)}`)
      const { headers, ...rest } = extra
      items.push({ key: `aq${++counters.a}`, topic, set, difficulty, calc: true, stem, options, index, explanation, code: CODE[topic], ...(headers ? { option_headers: headers } : {}), ...rest })
    },
    /** Section B question. */
    q(topic, difficulty, stem, parts, extra = {}) {
      items.push({ key: `bq${++counters.b}`, topic, set, difficulty, calc: true, stem, parts: withLines(parts), code: CODE[topic], ...extra })
    },
  }
}
