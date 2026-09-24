// Typesets TeX with MathJax and flattens the result into data the PDF
// renderer can draw without MathJax: glyph outlines placed by a scale and an
// offset, plus the filled rectangles MathJax uses for fraction bars and root
// overlines. Used by scripts/gen-math.mjs to build src/lib/pdf/math/cache.json.
//
// Coordinates are MathJax font units (1000 per em), y pointing down, with the
// baseline at y = 0: a formula occupies x in [0, w] and y in [-h, d].
import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'

// House notation, matching the VCAA papers: vectors carry a tilde underneath
// (\tv{a}), unit vectors are \ii, \jj, \kk, and cis / Arg are operators.
export const MACROS = {
  // Braced, so a following subscript (\tv{r}_1) attaches to the vector as a
  // whole rather than colliding with the tilde.
  tv: ['{\\underset{\\raise{0.25em}{\\smash{\\sim}}}{#1}}', 1],
  ii: '{\\underset{\\raise{0.25em}{\\smash{\\sim}}}{i}}',
  jj: '{\\underset{\\raise{0.25em}{\\smash{\\sim}}}{j}}',
  kk: '{\\underset{\\raise{0.25em}{\\smash{\\sim}}}{k}}',
  cis: '\\operatorname{cis}',
  Arg: '\\operatorname{Arg}',
  cosec: '\\operatorname{cosec}',
  loge: '\\log_e',
  R: '\\mathbb{R}',
  C: '\\mathbb{C}',
  Z: '\\mathbb{Z}',
  N: '\\mathbb{N}',
  Q: '\\mathbb{Q}',
  E: '\\operatorname{E}',
  Var: '\\operatorname{Var}',
  sd: '\\operatorname{sd}',
  Pr: '\\operatorname{Pr}',
  dd: '\\mathop{}\\!d',
}

const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)
const tex = new TeX({ packages: AllPackages.filter(p => !['bussproofs', 'noundefined'].includes(p)), macros: MACROS, formatError: (_jax, err) => { throw err } })
const svg = new SVG({ fontCache: 'none' })
const doc = mathjax.document('', { InputJax: tex, OutputJax: svg })

const r1 = n => Math.round(n * 10) / 10
const r3 = n => Math.round(n * 1000) / 1000

/** Parses an SVG transform attribute into a matrix [a, b, c, d, e, f]. */
function parseTransform(str) {
  let m = [1, 0, 0, 1, 0, 0]
  if (!str) return m
  for (const [, fn, args] of str.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const v = args.trim().split(/[\s,]+/).map(Number)
    let t
    if (fn === 'translate') t = [1, 0, 0, 1, v[0], v[1] ?? 0]
    else if (fn === 'scale') t = [v[0], 0, 0, v[1] ?? v[0], 0, 0]
    else if (fn === 'matrix') t = v
    else throw new Error(`unsupported transform ${fn}`)
    m = mul(m, t)
  }
  return m
}
function mul([a1, b1, c1, d1, e1, f1], [a2, b2, c2, d2, e2, f2]) {
  return [a1 * a2 + c1 * b2, b1 * a2 + d1 * b2, a1 * c2 + c1 * d2, b1 * c2 + d1 * d2, a1 * e2 + c1 * f2 + e1, b1 * e2 + d1 * f2 + f1]
}
const apply = ([a, b, c, d, e, f], x, y) => [a * x + c * y + e, b * x + d * y + f]

/**
 * Typesets one TeX string. Returns { w, h, d, paths: [[pathData, sx, sy, tx, ty]],
 * rects: [[x, y, w, h]] }. Throws on a TeX error or on any character MathJax
 * could only draw as text (its fonts lack it), so a bad formula fails at build
 * time rather than printing wrongly.
 */
export function typeset(source, display = false) {
  const node = doc.convert(source, { display })
  const root = adaptor.firstChild(node)
  if (adaptor.kind(root) !== 'svg') throw new Error(`no svg for ${source}`)
  const [minX, minY, W, H] = adaptor.getAttribute(root, 'viewBox').split(/\s+/).map(Number)
  const paths = []
  const rects = []
  const walk = (el, m) => {
    const kind = adaptor.kind(el)
    if (kind === '#text' || kind === '#comment') return
    let mm = mul(m, parseTransform(adaptor.getAttribute(el, 'transform')))
    if (kind === 'svg' && el !== root) {
      const x = Number(adaptor.getAttribute(el, 'x') ?? 0), y = Number(adaptor.getAttribute(el, 'y') ?? 0)
      const vb = adaptor.getAttribute(el, 'viewBox')
      mm = mul(mm, [1, 0, 0, 1, x, y])
      if (vb) {
        const [vx, vy, vw, vh] = vb.split(/\s+/).map(Number)
        const w = Number(adaptor.getAttribute(el, 'width')), h = Number(adaptor.getAttribute(el, 'height'))
        mm = mul(mm, [w / vw, 0, 0, h / vh, -vx * (w / vw), -vy * (h / vh)])
      }
    }
    if (kind === 'path') {
      if (Math.abs(mm[1]) > 1e-9 || Math.abs(mm[2]) > 1e-9) throw new Error(`rotated glyph in ${source}`)
      const d = adaptor.getAttribute(el, 'd')
      if (d) paths.push([d, r3(mm[0]), r3(mm[3]), r1(mm[4]), r1(mm[5])])
      return
    }
    if (kind === 'rect') {
      const x = Number(adaptor.getAttribute(el, 'x') ?? 0), y = Number(adaptor.getAttribute(el, 'y') ?? 0)
      const w = Number(adaptor.getAttribute(el, 'width')), h = Number(adaptor.getAttribute(el, 'height'))
      const [x0, y0] = apply(mm, x, y), [x1, y1] = apply(mm, x + w, y + h)
      rects.push([r1(Math.min(x0, x1)), r1(Math.min(y0, y1)), r1(Math.abs(x1 - x0)), r1(Math.abs(y1 - y0))])
      return
    }
    if (kind === 'text') throw new Error(`MathJax has no glyph for "${adaptor.textContent(el)}" in ${source} — use a TeX command instead`)
    if (kind === 'line' || kind === 'polygon' || kind === 'ellipse' || kind === 'use') throw new Error(`unsupported <${kind}> in ${source}`)
    for (const child of adaptor.childNodes(el)) walk(child, mm)
  }
  for (const child of adaptor.childNodes(root)) walk(child, [1, 0, 0, 1, -minX, 0])
  // Error nodes come back as a data-mjx-error attribute rather than a throw.
  const html = adaptor.outerHTML(root)
  if (/data-mjx-error|merror|fill="red"/.test(html)) throw new Error(`TeX error in ${source}`)
  return { w: r1(W), h: r1(-minY), d: r1(H + minY), paths, rects }
}

/** Every inline \( … \) and display \[ … \] fragment in a string. */
export function fragments(text) {
  const out = []
  if (typeof text !== 'string') return out
  for (const m of text.matchAll(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g)) {
    out.push(m[1] !== undefined ? { tex: m[1].trim(), display: false } : { tex: m[2].trim(), display: true })
  }
  return out
}

/** Builds the cache: one shared table of glyph outlines, then each formula as
 * placements into that table. */
export function buildCache(list) {
  const glyphIndex = new Map()
  const glyphs = []
  const formulas = {}
  const errors = []
  for (const { tex: source, display } of list) {
    const key = (display ? 'D:' : 'I:') + source
    if (formulas[key]) continue
    try {
      const t = typeset(source, display)
      const g = t.paths.map(([d, sx, sy, tx, ty]) => {
        if (!glyphIndex.has(d)) { glyphIndex.set(d, glyphs.length); glyphs.push(d) }
        return [glyphIndex.get(d), sx, sy, tx, ty]
      })
      formulas[key] = { w: t.w, h: t.h, d: t.d, g, ...(t.rects.length ? { r: t.rects } : {}) }
    } catch (e) {
      errors.push(`${key}: ${e.message}`)
    }
  }
  const sorted = Object.fromEntries(Object.keys(formulas).sort().map(k => [k, formulas[k]]))
  return { cache: { v: 1, glyphs, f: sorted }, errors }
}
