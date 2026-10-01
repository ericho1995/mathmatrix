import cache from '@/lib/pdf/math/cache.json'
import { texToPlain } from '@/lib/text/mathPlain'
import { escapeHtml } from './pdfToHtml'

// ─────────────────────────────────────────────────────────────────────────────
// Typeset maths for the screen, from the glyph cache the PDFs already use.
//
// scripts/gen-math.mjs runs every TeX fragment in the bank through MathJax at
// build time and stores the glyph outlines in cache.json. Here a formula is
// drawn as an inline SVG of those outlines, sized in em so it follows the
// surrounding text, sat on the baseline, and filled with currentColor. No
// maths library goes to the browser.
//
// Server-only: cache.json is large.
// ─────────────────────────────────────────────────────────────────────────────

type Placement = [number, number, number, number, number]
type Formula = { w: number; h: number; d: number; g: Placement[]; r?: [number, number, number, number][] }
const GLYPHS = (cache as unknown as { glyphs: string[] }).glyphs
const FORMULAS = (cache as unknown as { f: Record<string, Formula> }).f

/** TeX glyphs run a little small beside the site font; this keeps them level. */
const SCALE = 1.1

const em = (units: number) => `${+((units / 1000) * SCALE).toFixed(3)}em`

/** One formula as inline SVG markup; plain text if it is not in the cache. */
export function mathSvg(tex: string, display: boolean): string {
  const f = FORMULAS[(display ? 'D:' : 'I:') + tex]
  if (!f) return `<span class="math-fallback">${escapeHtml(texToPlain(tex))}</span>`
  const paths = f.g
    .map(([gi, sx, sy, tx, ty]) => `<path d="${GLYPHS[gi]}" transform="matrix(${sx} 0 0 ${sy} ${tx} ${ty})"/>`)
    .join('')
  const rules = (f.r ?? []).map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('')
  const label = escapeHtml(texToPlain(tex))
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}" viewBox="0 ${-f.h} ${f.w} ${f.h + f.d}" ` +
    `width="${em(f.w)}" height="${em(f.h + f.d)}" fill="currentColor" ` +
    `style="vertical-align:-${em(f.d)};display:inline-block;overflow:visible">${paths}${rules}</svg>`
  )
}

/**
 * Question or option text as HTML: escaped, line breaks kept, and \( … \) and
 * \[ … \] drawn as maths.
 */
export function richHtml(text: string): string {
  let out = ''
  let last = 0
  for (const m of Array.from(text.matchAll(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g))) {
    out += plain(text.slice(last, m.index))
    out +=
      m[1] !== undefined
        ? mathSvg(m[1].trim(), false)
        : `<span style="display:block;text-align:center;margin:0.5em 0">${mathSvg(m[2].trim(), true)}</span>`
    last = m.index! + m[0].length
  }
  return out + plain(text.slice(last))
}

const plain = (s: string) => escapeHtml(s).replace(/\r?\n/g, '<br>')
