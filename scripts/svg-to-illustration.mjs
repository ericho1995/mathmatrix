#!/usr/bin/env node
// Converts an SVG file into the typed `Illustration` shape used by the exam PDF
// renderer, and prints it ready to paste into src/lib/questions/illustrations.ts.
//
// Why convert instead of storing the SVG markup directly: @react-pdf/renderer
// cannot render an SVG string — it has its own primitive components — and the
// PDF route runs in Node where there is no DOMParser. Converting once, at
// authoring time, keeps the artwork typed, diffable, and identical in the PDF
// and the browser, with no runtime XML parsing.
//
// Only the subset @react-pdf/renderer supports is accepted; anything else is
// reported as an error rather than silently dropped, so artwork that would
// render wrong never reaches the papers.
//
// Usage: node scripts/svg-to-illustration.mjs <file.svg> <illustration-id>

import { readFileSync } from 'fs'

const [, , svgPath, id] = process.argv
if (!svgPath || !id) {
  console.error('Usage: node scripts/svg-to-illustration.mjs <file.svg> <illustration-id>')
  process.exit(1)
}

const src = readFileSync(svgPath, 'utf8')

const SUPPORTED = ['circle', 'ellipse', 'rect', 'line', 'path', 'polygon', 'polyline', 'text']
// Elements that carry no drawing information and are safe to drop.
const IGNORED = ['svg', 'title', 'desc', 'g']

function attrs(tagBody) {
  const out = {}
  // Attribute names may contain digits (x1, y2, …) — a letters-only class here
  // silently drops every line endpoint.
  const re = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*"([^"]*)"/g
  let m
  while ((m = re.exec(tagBody)) !== null) out[m[1]] = m[2]
  return out
}

const num = (v) => (v === undefined ? undefined : Number(v))

function styleProps(a) {
  const out = {}
  if (a.stroke && a.stroke !== 'none') out.stroke = a.stroke
  if (a['stroke-width'] !== undefined) out.strokeWidth = Number(a['stroke-width'])
  if (a.fill !== undefined) out.fill = a.fill
  return out
}

const elements = []
const problems = []

// Strip comments first so they cannot be mistaken for tags.
const clean = src.replace(/<!--[\s\S]*?-->/g, '')

if (/<style[\s>]/i.test(clean)) problems.push('<style> block found — not supported by @react-pdf/renderer')
if (/\sclass\s*=/.test(clean)) problems.push('class attribute found — not supported')
if (/<(use|symbol|defs|filter|mask|clipPath|linearGradient|radialGradient)[\s>]/i.test(clean)) {
  problems.push('unsupported element (use/symbol/defs/filter/mask/clipPath/gradient) found')
}
if (/\stransform\s*=/.test(clean)) problems.push('transform attribute found — compute absolute coordinates instead')

const viewBoxMatch = clean.match(/viewBox\s*=\s*"([^"]+)"/)
const rootMatch = clean.match(/<svg\b([^>]*)>/)
const rootAttrs = rootMatch ? attrs(rootMatch[1]) : {}
let width = num(rootAttrs.width)
let height = num(rootAttrs.height)
if ((!width || !height) && viewBoxMatch) {
  const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number)
  width = width || parts[2]
  height = height || parts[3]
}
if (!width || !height) problems.push('could not determine width/height')

// Walk every tag in document order.
const tagRe = /<([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*?)(\/?)>([\s\S]*?)?(?=<|$)/g
let t
while ((t = tagRe.exec(clean)) !== null) {
  const tag = t[1].toLowerCase()
  const body = t[2]
  const trailingText = (t[4] ?? '').trim()
  if (IGNORED.includes(tag) || tag.startsWith('/')) continue
  if (!SUPPORTED.includes(tag)) {
    problems.push(`unsupported element <${tag}>`)
    continue
  }
  const a = attrs(body)
  const s = styleProps(a)

  switch (tag) {
    case 'circle':
      elements.push({ t: 'circle', cx: num(a.cx), cy: num(a.cy), r: num(a.r), ...s })
      break
    case 'ellipse':
      elements.push({ t: 'ellipse', cx: num(a.cx), cy: num(a.cy), rx: num(a.rx), ry: num(a.ry), ...s })
      break
    case 'rect':
      elements.push({ t: 'rect', x: num(a.x) ?? 0, y: num(a.y) ?? 0, width: num(a.width), height: num(a.height), ...s })
      break
    case 'line':
      elements.push({ t: 'line', x1: num(a.x1), y1: num(a.y1), x2: num(a.x2), y2: num(a.y2), ...s })
      break
    case 'path':
      elements.push({ t: 'path', d: a.d, ...s })
      break
    case 'polygon':
      elements.push({ t: 'polygon', points: a.points, ...s })
      break
    case 'polyline':
      elements.push({ t: 'polyline', points: a.points, ...s })
      break
    case 'text': {
      if (!trailingText) problems.push(`<text> at (${a.x}, ${a.y}) has no content`)
      const el = { t: 'text', x: num(a.x), y: num(a.y), content: trailingText }
      if (a['font-size'] !== undefined) el.fontSize = Number(a['font-size'])
      if (a['text-anchor']) el.textAnchor = a['text-anchor']
      if (a.fill !== undefined) el.fill = a.fill
      elements.push(el)
      break
    }
  }
}

// A missing or unparseable coordinate means the artwork would render wrong, so
// fail rather than emit an element with undefined fields.
for (const el of elements) {
  for (const [k, v] of Object.entries(el)) {
    if (typeof v === 'number' && !Number.isFinite(v)) problems.push(`<${el.t}> has a non-numeric "${k}"`)
    if (v === undefined) problems.push(`<${el.t}> is missing "${k}"`)
  }
  if (el.t === 'path' && !el.d) problems.push('<path> has no "d" attribute')
  if ((el.t === 'polygon' || el.t === 'polyline') && !el.points) problems.push(`<${el.t}> has no "points"`)
}

if (problems.length) {
  console.error('Cannot convert — fix the SVG and re-run:')
  problems.forEach((p) => console.error('  •', p))
  process.exit(1)
}

const fmt = (el) =>
  '    { ' +
  Object.entries(el)
    .map(([k, v]) => `${k}: ${typeof v === 'string' ? `'${v.replace(/'/g, "\\'")}'` : v}`)
    .join(', ') +
  ' },'

console.log(`  '${id}': {`)
console.log(`    width: ${width},`)
console.log(`    height: ${height},`)
console.log('    elements: [')
elements.forEach((el) => console.log('  ' + fmt(el)))
console.log('    ],')
console.log('  },')
console.error(`\n(${elements.length} elements converted)`)
