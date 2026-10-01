// ─────────────────────────────────────────────────────────────────────────────
// The paper's diagrams, drawn for the screen.
//
// Every diagram on a PDF paper is a react-pdf component tree whose leaves are
// plain element types — 'SVG', 'LINE', 'VIEW', 'TEXT'… — that map one for one
// onto SVG and HTML. This walks that tree on the server, calling each
// component with its props (the diagram renderers are pure functions of their
// props and use no hooks), and writes the equivalent markup. So the on-screen
// test shows exactly the diagram the paper prints, from the same code, and no
// diagram code — nor anything else about the question — goes to the browser.
//
// Lengths stay in points, the paper's unit, so a diagram is the size on
// screen that it is in print (a point is 1⅓ CSS pixels); SVGs still shrink to
// fit a narrow screen.
//
// Server-only. The output is a string for dangerouslySetInnerHTML; every text
// node and attribute value is escaped here.
// ─────────────────────────────────────────────────────────────────────────────

type Props = Record<string, unknown> & { children?: unknown }
interface Element {
  $$typeof: symbol
  type: unknown
  props: Props
}

const REACT_ELEMENT = Symbol.for('react.element')
const REACT_TRANSITIONAL_ELEMENT = Symbol.for('react.transitional.element')
const FRAGMENT = Symbol.for('react.fragment')
const MEMO = Symbol.for('react.memo')
const FORWARD_REF = Symbol.for('react.forward_ref')

/** The page font is DejaVu Sans on paper; on screen, the site's own. */
const FONT_STACK = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'
const MONO_STACK = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

const SVG_TAGS: Record<string, string> = {
  SVG: 'svg',
  G: 'g',
  LINE: 'line',
  RECT: 'rect',
  CIRCLE: 'circle',
  ELLIPSE: 'ellipse',
  POLYGON: 'polygon',
  POLYLINE: 'polyline',
  PATH: 'path',
  DEFS: 'defs',
  STOP: 'stop',
  CLIP_PATH: 'clipPath',
  LINEAR_GRADIENT: 'linearGradient',
  RADIAL_GRADIENT: 'radialGradient',
  TSPAN: 'tspan',
}

/** SVG attributes that really are camelCase; everything else is kebab-cased. */
const CAMEL_ATTRS = new Set([
  'viewBox',
  'preserveAspectRatio',
  'gradientUnits',
  'gradientTransform',
  'patternUnits',
  'patternContentUnits',
  'patternTransform',
  'clipPathUnits',
  'markerWidth',
  'markerHeight',
  'markerUnits',
  'refX',
  'refY',
  'textLength',
  'lengthAdjust',
  'spreadMethod',
  'startOffset',
  'pathLength',
])

/** react-pdf layout props with no meaning on screen. */
const DROP_PROPS = new Set(['children', 'key', 'ref', 'wrap', 'fixed', 'debug', 'break', 'minPresenceAhead', 'orphans', 'widows', 'render', 'hyphenationCallback', 'id'])

/** Style keys whose numbers carry no unit. */
const UNITLESS = new Set(['fontWeight', 'lineHeight', 'flex', 'flexGrow', 'flexShrink', 'opacity', 'zIndex', 'fillOpacity', 'strokeOpacity', 'order'])

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const kebab = (k: string) => k.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)

function isElement(node: unknown): node is Element {
  if (!node || typeof node !== 'object') return false
  const t = (node as { $$typeof?: unknown }).$$typeof
  return t === REACT_ELEMENT || t === REACT_TRANSITIONAL_ELEMENT
}

function fontFamily(v: string): string {
  if (/mono/i.test(v)) return MONO_STACK
  return FONT_STACK
}

/** react-pdf's shorthand keys, expanded to CSS. */
function expand(key: string, value: unknown): [string, unknown][] {
  switch (key) {
    case 'marginHorizontal':
      return [['marginLeft', value], ['marginRight', value]]
    case 'marginVertical':
      return [['marginTop', value], ['marginBottom', value]]
    case 'paddingHorizontal':
      return [['paddingLeft', value], ['paddingRight', value]]
    case 'paddingVertical':
      return [['paddingTop', value], ['paddingBottom', value]]
    default:
      return [[key, value]]
  }
}

/** A react-pdf style (object or array of objects) as a CSS declaration list. */
export function styleToCss(style: unknown, base: Record<string, string> = {}): string {
  const flat: Record<string, unknown> = {}
  const add = (s: unknown) => {
    if (Array.isArray(s)) s.forEach(add)
    else if (s && typeof s === 'object') Object.assign(flat, s)
  }
  add(style)
  const out: Record<string, string> = { ...base }
  for (const [rawKey, rawValue] of Object.entries(flat)) {
    for (const [key, value] of expand(rawKey, rawValue)) {
      if (value === undefined || value === null || value === '') continue
      let css: string
      if (key === 'fontFamily') css = fontFamily(String(value))
      else if (typeof value === 'number') css = UNITLESS.has(key) ? String(value) : `${+value.toFixed(3)}pt`
      else css = String(value)
      out[kebab(key)] = css
    }
  }
  return Object.entries(out)
    .map(([k, v]) => `${k}:${v}`)
    .join(';')
}

function attrs(props: Props, svg: boolean, extra: Record<string, string> = {}, cssBase: Record<string, string> = {}, svgRoot = false): string {
  const out: string[] = []
  for (const [key, value] of Object.entries(props)) {
    if (DROP_PROPS.has(key) || value === undefined || value === null || value === false) continue
    if (key === 'style') {
      const css = styleToCss(value, cssBase)
      if (css) out.push(`style="${escapeHtml(css)}"`)
      cssBase = {}
      continue
    }
    if (typeof value === 'function' || typeof value === 'object') continue
    const name = svg && !CAMEL_ATTRS.has(key) ? kebab(key) : key
    const v = svgRoot && (key === 'width' || key === 'height') && typeof value === 'number' ? `${+value.toFixed(3)}pt` : String(value)
    out.push(`${name}="${escapeHtml(v)}"`)
  }
  if (Object.keys(cssBase).length) out.push(`style="${escapeHtml(styleToCss({}, cssBase))}"`)
  for (const [k, v] of Object.entries(extra)) out.push(`${k}="${escapeHtml(v)}"`)
  return out.length ? ` ${out.join(' ')}` : ''
}

type Context = 'html' | 'svg' | 'text'

function walk(node: unknown, ctx: Context, depth: number): string {
  if (depth > 200) throw new Error('pdfToHtml: tree too deep')
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return escapeHtml(String(node))
  if (Array.isArray(node)) return node.map(n => walk(n, ctx, depth + 1)).join('')
  if (!isElement(node)) return ''

  const { type, props } = node
  const children = props.children

  if (type === FRAGMENT) return walk(children, ctx, depth + 1)
  if (typeof type === 'function') {
    // Diagram components are plain functions of their props.
    return walk((type as (p: Props) => unknown)(props), ctx, depth + 1)
  }
  if (type && typeof type === 'object') {
    const t = type as { $$typeof?: symbol; type?: unknown; render?: (p: Props, r: null) => unknown }
    if (t.$$typeof === MEMO) return walk({ ...node, type: t.type }, ctx, depth + 1)
    if (t.$$typeof === FORWARD_REF && t.render) return walk(t.render(props, null), ctx, depth + 1)
    return ''
  }
  if (typeof type !== 'string') return ''

  if (type === 'SVG') {
    const inner = walk(children, 'svg', depth + 1)
    return `<svg xmlns="http://www.w3.org/2000/svg"${attrs(props, true, {}, { 'max-width': '100%', height: 'auto' }, true)}>${inner}</svg>`
  }
  const svgTag = SVG_TAGS[type]
  if (svgTag) return `<${svgTag}${attrs(props, true)}>${walk(children, ctx === 'html' ? 'svg' : ctx, depth + 1)}</${svgTag}>`

  if (type === 'TEXT') {
    if (ctx === 'svg') {
      // react-pdf puts font settings in style; SVG text reads them as CSS too.
      return `<text${attrs(props, true)}>${walk(children, 'svg', depth + 1)}</text>`
    }
    const tag = ctx === 'text' ? 'span' : 'div'
    return `<${tag}${attrs(props, false)}>${walk(children, 'text', depth + 1)}</${tag}>`
  }
  if (type === 'VIEW') {
    return `<div${attrs(props, false, {}, { display: 'flex', 'flex-direction': 'column' })}>${walk(children, 'html', depth + 1)}</div>`
  }
  if (type === 'TEXT_INSTANCE') return walk(children, ctx, depth + 1)
  // Anything else (IMAGE, LINK, PAGE…) has no place in a diagram.
  return ''
}

/** A react-pdf element tree (a diagram, usually) as HTML/SVG markup. */
export function pdfToHtml(node: unknown): string {
  return walk(node, 'html', 0)
}
