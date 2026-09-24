import React from 'react'
import { View, Text, Svg, Path, Rect } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import cache from './cache.json'
import { hasMath, texToPlain } from '@/lib/text/mathPlain'

/**
 * Typeset maths for the PDFs.
 *
 * Question text marks maths as TeX: \( … \) inline, \[ … \] on its own line.
 * scripts/gen-math.mjs has already run every fragment through MathJax and
 * stored the glyph outlines in cache.json, so here each formula is only drawn:
 * an Svg of glyph paths, sized from the font size and sat on the text baseline.
 *
 * Text with no maths renders as the same single <Text> it always did, so
 * nothing outside the maths subjects changes.
 */

type Placement = [number, number, number, number, number]
type Formula = { w: number; h: number; d: number; g: Placement[]; r?: [number, number, number, number][] }
const GLYPHS = (cache as unknown as { glyphs: string[] }).glyphs
const FORMULAS = (cache as unknown as { f: Record<string, Formula> }).f

/** TeX glyphs are smaller than DejaVu Sans at the same point size (x-height
 * 0.43em against 0.55em); scaling the maths up keeps it level with the words. */
export const MATH_SCALE = 1.14
const INK = '#1a1a1a'

// DejaVu Sans vertical metrics, as fractions of the font size.
const ASCENT = 0.928
const DESCENT = 0.236
const SPACE = 0.318

export function lookupFormula(tex: string, display: boolean): Formula | undefined {
  return FORMULAS[(display ? 'D:' : 'I:') + tex]
}

/** One formula as vector glyphs. `depth` (below the baseline) is returned via
 * the caller's own lookup so paragraphs can align baselines. */
export function MathSvg({ tex, display = false, fontSize, color = INK }: { tex: string; display?: boolean; fontSize: number; color?: string }) {
  const f = lookupFormula(tex, display)
  if (!f) {
    // gen-math.mjs and verify-bank make this unreachable in a built bank; if a
    // formula is ever missing, print it readably rather than failing the paper.
    return <Text style={{ fontSize, color }}>{texToPlain(tex)}</Text>
  }
  const k = (fontSize * MATH_SCALE) / 1000
  return (
    <Svg width={f.w * k} height={(f.h + f.d) * k} viewBox={`0 ${-f.h} ${f.w} ${f.h + f.d}`}>
      {f.g.map(([gi, sx, sy, tx, ty], i) => (
        <Path key={i} d={GLYPHS[gi]} fill={color} transform={`matrix(${sx}, 0, 0, ${sy}, ${tx}, ${ty})`} />
      ))}
      {(f.r ?? []).map(([x, y, w, h], i) => (
        <Rect key={`r${i}`} x={x} y={y} width={w} height={h} fill={color} />
      ))}
    </Svg>
  )
}

type Segment = { kind: 'text'; text: string } | { kind: 'math'; tex: string } | { kind: 'display'; tex: string }

export function parseRich(text: string): Segment[] {
  const out: Segment[] = []
  let last = 0
  for (const m of Array.from(text.matchAll(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g))) {
    if (m.index! > last) out.push({ kind: 'text', text: text.slice(last, m.index) })
    out.push(m[1] !== undefined ? { kind: 'math', tex: m[1].trim() } : { kind: 'display', tex: m[2].trim() })
    last = m.index! + m[0].length
  }
  if (last < text.length) out.push({ kind: 'text', text: text.slice(last) })
  return out
}

const TEXT_KEYS = new Set(['fontSize', 'fontFamily', 'fontWeight', 'fontStyle', 'color', 'lineHeight', 'letterSpacing', 'textTransform', 'textDecoration', 'textAlign'])

function splitStyle(style: Style | Style[] | undefined): { text: Style; box: Style } {
  const flat: Style = Object.assign({}, ...(Array.isArray(style) ? style : [style ?? {}]))
  const text: Style = {}
  const box: Style = {}
  for (const [k, v] of Object.entries(flat)) (TEXT_KEYS.has(k) ? (text as Record<string, unknown>) : (box as Record<string, unknown>))[k] = v
  return { text, box }
}

type Atom = { kind: 'text'; text: string } | { kind: 'math'; tex: string }

/**
 * Text that may contain maths. Words and formulas flow together and wrap like
 * a paragraph; every item is bottom-aligned with padding chosen so that all the
 * baselines on a line coincide, whatever the formula's depth.
 */
export function RichText({ text, style, fontSize: fontSizeProp }: { text: string; style?: Style | Style[]; fontSize?: number }) {
  if (!hasMath(text)) return <Text style={style}>{text}</Text>
  const { text: textStyle, box: boxStyle } = splitStyle(style)
  const fontSize = (textStyle.fontSize as number | undefined) ?? fontSizeProp ?? 11
  const color = (textStyle.color as string | undefined) ?? INK
  const lineHeight = (textStyle.lineHeight as number | undefined) ?? ASCENT + DESCENT
  // Distance from the bottom of a word's box to its baseline.
  const wordBase = fontSize * (DESCENT + (lineHeight - (ASCENT + DESCENT)) / 2)
  const k = (fontSize * MATH_SCALE) / 1000
  const wordStyle: Style = { ...textStyle, textAlign: undefined }

  // Paragraphs split on newlines; display maths is a block of its own.
  const blocks: ({ kind: 'inline'; atoms: Atom[][] } | { kind: 'display'; tex: string })[] = []
  for (const para of text.split('\n')) {
    let groups: Atom[][] = []
    let current: Atom[] = []
    const flush = () => { if (current.length) groups.push(current); current = [] }
    const endInline = () => { flush(); if (groups.length) blocks.push({ kind: 'inline', atoms: groups }); groups = [] }
    for (const seg of parseRich(para)) {
      if (seg.kind === 'display') { endInline(); blocks.push({ kind: 'display', tex: seg.tex }); continue }
      if (seg.kind === 'math') { current.push({ kind: 'math', tex: seg.tex }); continue }
      for (const piece of seg.text.split(/(\s+)/)) {
        if (!piece) continue
        if (/^\s+$/.test(piece)) flush()
        else current.push({ kind: 'text', text: piece })
      }
    }
    endInline()
  }

  const depthOf = (a: Atom) => (a.kind === 'math' ? (lookupFormula(a.tex, false)?.d ?? 0) * k : wordBase)

  return (
    <View style={boxStyle}>
      {blocks.map((block, bi) => {
        // Every block is kept whole (wrap={false}): react-pdf mislays an Svg
        // when a wrapping row is split across a page break, printing the
        // formula at the foot of one page and its words on the next.
        if (block.kind === 'display') {
          return (
            <View key={bi} wrap={false} style={{ alignItems: 'center', marginVertical: fontSize * 0.35 }}>
              <MathSvg tex={block.tex} display fontSize={fontSize} color={color} />
            </View>
          )
        }
        // One common baseline-to-bottom distance for the paragraph, so items
        // on different lines need no knowledge of where the lines break.
        const base = Math.max(wordBase, ...block.atoms.flat().map(depthOf))
        return (
          <View key={bi} wrap={false} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: textStyle.textAlign === 'center' ? 'center' : 'flex-start' }}>
            {block.atoms.map((group, gi) => (
              <View key={gi} style={{ flexDirection: 'row', alignItems: 'flex-end', marginRight: gi === block.atoms.length - 1 ? 0 : fontSize * SPACE }}>
                {group.map((atom, ai) =>
                  atom.kind === 'text' ? (
                    <Text key={ai} style={[wordStyle, { paddingBottom: base - wordBase }]}>{atom.text}</Text>
                  ) : (
                    <View key={ai} style={{ paddingBottom: base - depthOf(atom), marginHorizontal: fontSize * 0.04 }}>
                      <MathSvg tex={atom.tex} fontSize={fontSize} color={color} />
                    </View>
                  ),
                )}
              </View>
            ))}
          </View>
        )
      })}
    </View>
  )
}
