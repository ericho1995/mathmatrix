// Authoring helpers for VCE Specialist Mathematics Unit 3 & 4 practice sets.
// A set file (set-1.mjs …) builds one Examination 1 and one Examination 2 with
// these, and build.mjs writes every set into bank.ts. See
// .claude/skills/specialist-exam-papers/SKILL.md for the whole workflow.
//
// Text is written with the `t` tag (String.raw), so TeX needs single
// backslashes: t`Let \(f(x) = \dfrac{x^2 + 1}{x - 1}\).` — \( … \) is inline
// maths, \[ … \] is a displayed line.

export const t = String.raw

export const AOS = {
  PF: 'sm_proof', // Discrete mathematics: logic and proof
  FG: 'sm_functions', // Functions, relations and graphs
  CX: 'sm_complex_numbers', // Algebra, number and structure: complex numbers
  CA: 'sm_calculus', // Calculus: differential and integral calculus, DEs, kinematics
  VE: 'sm_vectors', // Space and measurement: vectors, lines and planes, vector calculus
  ST: 'sm_statistics', // Data analysis, probability and statistics
}
const CODE = {
  sm_proof: 'VCE-SM-U34-AOS1',
  sm_functions: 'VCE-SM-U34-AOS2',
  sm_complex_numbers: 'VCE-SM-U34-AOS3',
  sm_calculus: 'VCE-SM-U34-AOS4',
  sm_vectors: 'VCE-SM-U34-AOS5',
  sm_statistics: 'VCE-SM-U34-AOS6',
}
const LETTERS = ['A', 'B', 'C', 'D']

/** One lettered part of an extended question.
 *  opts.lines — ruled working lines (default from marks); opts.diagram — a
 *  graphic printed under the prompt (blank axes for a sketch). */
export const part = (label, prompt, marks, answer, solution, opts = {}) => ({ label, prompt, marks, expected_answer: answer, explanation: solution, ...opts })

// Working space, as the VCAA booklets size it: Examination 1 is worked by
// hand, so it gets more room per mark than a CAS-supported Section B part.
const EXAM1_LINES = { 1: 4, 2: 7, 3: 10, 4: 12, 5: 14 }
const SECTION_B_LINES = { 1: 3, 2: 6, 3: 8, 4: 10, 5: 12 }
const withLines = (parts, table) => parts.map(p => ({ ...p, lines: p.lines ?? (p.diagram ? 2 : table[p.marks] ?? 12) }))

/** Collects one practice set's items in paper order. */
export function makeSet(set) {
  const items = []
  const counters = { exam1: 0, a: 0, b: 0 }
  return {
    items,
    /** Examination 1 (technology-free) question. */
    ex1(topic, difficulty, stem, parts, extra = {}) {
      items.push({ key: `e1q${++counters.exam1}`, topic, set, difficulty, calc: false, stem, parts: withLines(parts, EXAM1_LINES), code: CODE[topic], ...extra })
    },
    /** Examination 2 Section A multiple choice: options in printed order, the
     *  answer as a letter. */
    mc(topic, difficulty, stem, options, answer, explanation, extra = {}) {
      const index = LETTERS.indexOf(answer)
      if (index < 0) throw new Error(`answer must be A–D: ${stem.slice(0, 50)}`)
      items.push({ key: `aq${++counters.a}`, topic, set, difficulty, calc: true, stem, options, index, explanation, code: CODE[topic], ...extra })
    },
    /** Examination 2 Section B extended question. */
    ex2(topic, difficulty, stem, parts, extra = {}) {
      items.push({ key: `bq${++counters.b}`, topic, set, difficulty, calc: true, stem, parts: withLines(parts, SECTION_B_LINES), code: CODE[topic], ...extra })
    },
  }
}

// ── Diagram helpers ──

const r3 = v => Math.round(v * 1000) / 1000

/** Samples y = f(x) on [a, b]. Non-finite values are dropped, so a curve can
 *  be sampled straight across an asymptote and the renderer clips the rest. */
export function curve(f, a, b, n = 120) {
  const out = []
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n
    const y = f(x)
    if (Number.isFinite(y)) out.push([r3(x), r3(y)])
  }
  return out
}

/** Samples a parametric curve (x(t), y(t)) for t in [a, b]. */
export function param(fx, fy, a, b, n = 160) {
  const out = []
  for (let i = 0; i <= n; i++) {
    const s = a + ((b - a) * i) / n
    out.push([r3(fx(s)), r3(fy(s))])
  }
  return out
}

/** Short strokes of gradient f(x, y) centred on a lattice: a slope field. */
export function slopeField(f, xs, ys, len = 0.3) {
  const segs = []
  for (const x of xs) {
    for (const y of ys) {
      const m = f(x, y)
      if (!Number.isFinite(m)) continue
      const dx = len / 2 / Math.sqrt(1 + m * m)
      segs.push({ from: [r3(x - dx), r3(y - m * dx)], to: [r3(x + dx), r3(y + m * dx)], thin: true })
    }
  }
  return segs
}

export const steps = (a, b, h) => {
  const out = []
  for (let v = a; v <= b + 1e-9; v += h) out.push(r3(v))
  return out
}

/** Points of a circle (centre (cx, cy), radius r) from angle a0 to a1. */
export function arc(cx, cy, r, a0 = 0, a1 = 2 * Math.PI, n = 72) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n
    return [r3(cx + r * Math.cos(a)), r3(cy + r * Math.sin(a))]
  })
}

/** The closed outline of {r1 ≤ |z − c| ≤ r2, a0 ≤ arg ≤ a1}: use it both as a
 *  shaded region and as a solid boundary curve. */
export function sectorOutline(r1, r2, a0, a1, cx = 0, cy = 0) {
  const outer = arc(cx, cy, r2, a0, a1, 40)
  const inner = r1 > 0 ? arc(cx, cy, r1, a1, a0, 40) : [[cx, cy]]
  return [...outer, ...inner, outer[0]]
}

/** x-axis ticks at multiples of π/denom, labelled π/4, π/2, 3π/4 … */
export function piTicks(kFrom, kTo, denom) {
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a))
  const out = []
  for (let k = kFrom; k <= kTo; k++) {
    if (k === 0) continue
    const g = gcd(k, denom), num = k / g, den = denom / g
    const sign = num < 0 ? '−' : ''
    const n = Math.abs(num)
    out.push({ x: r3((k * Math.PI) / denom), text: `${sign}${n === 1 ? '' : n}π${den === 1 ? '' : '/' + den}` })
  }
  return out
}

/** Blank axes for "sketch … on the axes below". */
export function axes({ xMin, xMax, yMin, yMax, xStep = 1, yStep = 1, xLabel = 'x', yLabel = 'y', equalAspect = false, width = 360 }) {
  return { kind: 'function_graph', xMin, xMax, yMin, yMax, xStep, yStep, xLabel, yLabel, curves: [], grid: true, equalAspect, width }
}

/** Blank Argand diagram (Re(z) across, Im(z) up), one unit per step. */
export function argand(r = 3, extra = {}) {
  return { kind: 'function_graph', xMin: -r, xMax: r, yMin: -r, yMax: r, xStep: 1, yStep: 1, xLabel: 'Re(z)', yLabel: 'Im(z)', curves: [], grid: true, equalAspect: true, width: 250, ...extra }
}
