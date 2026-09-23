import React from 'react'
import { Document, Page, View, Text, Svg, Path } from '@react-pdf/renderer'
import { Watermark } from './Brand'
import { BRAND_BLUE_DARK } from './theme'
import { DiagramView } from './diagrams'
import { IllustrationView } from './diagrams/illustration'
import { ILLUSTRATIONS } from '@/lib/questions/illustrations'
import { yearLabel } from '@/lib/catalogue'
import type { FlowFigure, ReadingBlock, ReadingMagazine, ReadingText, ReadingTextType } from '@/types/reading'
import type { DataTableDiagram } from '@/types'
import type { YearLevel } from '@/types'

/**
 * The Reading Magazine: the colour booklet a student reads before answering
 * the Reading paper.
 *
 * Page numbers are the contract with the question paper, which says "Read
 * Wombats on page 3 of the magazine". The cover is page 1 and each text opens
 * on its own page, so a text's `page` holds as long as the texts before it fit
 * the pages they claim. The footer prints the real rendered page number, not
 * the claimed one, so a text that overflows shows up as a mismatch when the
 * magazine is checked rather than as a silently wrong reference.
 *
 * Text types are never printed. "What type of text is this?" is a question
 * the paper asks, and a label on the page would answer it.
 */

// Each text type gets its own accent, so pages feel distinct the way a real
// magazine's do, without a label saying what the type is.
const ACCENT: Record<ReadingTextType, string> = {
  story: '#C2410C',
  report: '#0F6E56',
  explanation: '#185FA5',
  persuasive: '#9D174D',
  letter: '#6D28D9',
  poem: '#B45309',
  review: '#0E7490',
  news: '#1D4ED8',
  procedure: '#15803D',
  web: '#475569',
}

/** Body sizes by year level: large and open for Year 3, denser by Year 9. */
function typeScale(yearLevel: YearLevel) {
  if (yearLevel === 'grade_3' || yearLevel === 'grade_4') return { body: 14, title: 26, lead: 1.55 }
  if (yearLevel === 'grade_5' || yearLevel === 'grade_6') return { body: 12.5, title: 24, lead: 1.5 }
  if (yearLevel === 'year_7' || yearLevel === 'year_8') return { body: 11, title: 22, lead: 1.5 }
  return { body: 10.5, title: 21, lead: 1.5 }
}

/** Mixes a hex colour toward white; 0.9 is a pale tint for a panel background. */
function tint(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  const mix = (c: number) => Math.round(c + (255 - c) * amount)
  const r = mix((n >> 16) & 255), g = mix((n >> 8) & 255), b = mix(n & 255)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

type Scale = ReturnType<typeof typeScale>

function Block({ block, scale, accent }: { block: ReadingBlock; scale: Scale; accent: string }) {
  const body = { fontSize: scale.body, lineHeight: scale.lead, color: '#1f1f1f' }
  const gap = scale.body * 0.75
  switch (block.kind) {
    case 'para':
      return <Text style={{ ...body, marginBottom: gap }}>{block.text}</Text>
    case 'heading':
      return <Text style={{ fontSize: scale.body * 1.12, fontWeight: 700, color: accent, marginTop: gap * 0.4, marginBottom: gap * 0.5 }}>{block.text}</Text>
    case 'note':
      return <Text style={{ ...body, fontStyle: 'italic', marginBottom: gap }}>{block.text}</Text>
    case 'caption':
      return <Text style={{ fontSize: scale.body * 0.8, fontStyle: 'italic', color: '#555', marginBottom: gap }}>{block.text}</Text>
    case 'quote':
      return (
        <View style={{ borderTop: `1.5pt solid ${accent}`, borderBottom: `1.5pt solid ${accent}`, paddingVertical: gap * 0.7, marginBottom: gap * 1.2, marginTop: gap * 0.2 }} wrap={false}>
          <Text style={{ fontSize: scale.body * 1.3, fontWeight: 700, fontStyle: 'italic', color: accent, textAlign: 'center', lineHeight: 1.35 }}>{block.text}</Text>
        </View>
      )
    case 'bullets':
      return (
        <View style={{ marginBottom: gap }}>
          {block.items.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: gap * 0.35 }} wrap={false}>
              <Text style={{ ...body, width: scale.body * 1.1, color: accent, fontWeight: 700 }}>•</Text>
              <Text style={{ ...body, flex: 1 }}>{item}</Text>
            </View>
          ))}
        </View>
      )
    case 'steps':
      return (
        <View style={{ marginBottom: gap }}>
          {block.items.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: gap * 0.55 }} wrap={false}>
              <View style={{ width: scale.body * 1.6, height: scale.body * 1.6, borderRadius: scale.body * 0.8, backgroundColor: accent, marginRight: scale.body * 0.6, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: scale.body * 0.85, fontWeight: 700, color: '#ffffff' }}>{i + 1}</Text>
              </View>
              <Text style={{ ...body, flex: 1, paddingTop: scale.body * 0.08 }}>{item}</Text>
            </View>
          ))}
        </View>
      )
    case 'factbox':
      return (
        <View style={{ backgroundColor: tint(accent, 0.9), borderLeft: `3pt solid ${accent}`, borderRadius: 3, padding: gap, marginBottom: gap, marginTop: gap * 0.3 }} wrap={false}>
          <Text style={{ fontSize: scale.body, fontWeight: 700, color: accent, marginBottom: gap * 0.5 }}>{block.title}</Text>
          {block.items.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: gap * 0.3 }}>
              <Text style={{ ...body, fontSize: scale.body * 0.92, width: scale.body, color: accent }}>•</Text>
              <Text style={{ ...body, fontSize: scale.body * 0.92, flex: 1 }}>{item}</Text>
            </View>
          ))}
        </View>
      )
    case 'verse': {
      // An empty line is a stanza break.
      const stanzas: string[][] = [[]]
      for (const line of block.lines) {
        if (line === '') stanzas.push([])
        else stanzas[stanzas.length - 1].push(line)
      }
      return (
        <View style={{ marginBottom: gap, paddingLeft: scale.body * 2 }}>
          {stanzas.filter(s => s.length).map((stanza, i) => (
            <View key={i} style={{ marginBottom: gap * 1.1 }} wrap={false}>
              {stanza.map((line, j) => (
                <Text key={j} style={{ ...body, lineHeight: scale.lead + 0.1 }}>{line}</Text>
              ))}
            </View>
          ))}
        </View>
      )
    }
  }
}

/** Rough reading weight of a block, for balancing two columns. */
function weight(block: ReadingBlock): number {
  switch (block.kind) {
    case 'bullets':
    case 'steps':
      return block.items.join(' ').length + block.items.length * 30
    case 'factbox':
      return block.items.join(' ').length + block.items.length * 30 + 60
    case 'verse':
      return block.lines.length * 45
    default:
      return block.text.length + 30
  }
}

/** Splits blocks into two columns of about equal length, never splitting a block. */
function splitColumns(blocks: ReadingBlock[]): [ReadingBlock[], ReadingBlock[]] {
  const total = blocks.reduce((n, b) => n + weight(b), 0)
  let running = 0
  let cut = blocks.length
  for (let i = 0; i < blocks.length; i++) {
    running += weight(blocks[i])
    if (running >= total / 2) {
      // Put the block that crosses the middle on whichever side leaves the
      // columns closer in length.
      cut = running - total / 2 < weight(blocks[i]) / 2 ? i + 1 : i
      break
    }
  }
  cut = Math.min(Math.max(cut, 1), blocks.length - 1)
  return [blocks.slice(0, cut), blocks.slice(cut)]
}

/** Tables sized for the page they sit on — the paper's 8-point table is too small for Year 3. */
function MagazineTable({ table, scale, accent }: { table: DataTableDiagram; scale: Scale; accent: string }) {
  const size = Math.max(9, scale.body * 0.85)
  // Column widths from the longest entry in each column, so a cell never wraps
  // word by word, scaled down together if the table would be too wide.
  const cols = table.columns.map((c, i) => Math.max(c.length, ...table.rows.map(r => String(r[i] ?? '').length)))
  const natural = cols.map(n => n * size * 0.62 + 20)
  const shrink = Math.min(1, 470 / natural.reduce((a, b) => a + b, 0))
  const widths = natural.map(w => w * shrink)
  const cell = (i: number) => ({ width: widths[i], fontSize: size, paddingVertical: 5, paddingHorizontal: 8, borderRight: `1pt solid ${accent}`, borderBottom: `1pt solid ${accent}` })
  return (
    <View style={{ marginTop: 6, marginBottom: 10, alignItems: 'center' }} wrap={false}>
      {table.title ? <Text style={{ fontSize: size, fontWeight: 700, color: accent, marginBottom: 5 }}>{table.title}</Text> : null}
      <View style={{ borderTop: `1pt solid ${accent}`, borderLeft: `1pt solid ${accent}` }}>
        <View style={{ flexDirection: 'row', backgroundColor: tint(accent, 0.85) }}>
          {table.columns.map((c, i) => (
            <Text key={i} style={{ ...cell(i), fontWeight: 700 }}>{c}</Text>
          ))}
        </View>
        {table.rows.map((row, r) => (
          <View key={r} style={{ flexDirection: 'row' }}>
            {row.map((value, i) => (
              <Text key={i} style={cell(i)}>{String(value)}</Text>
            ))}
          </View>
        ))}
      </View>
    </View>
  )
}

/** A process as boxes and labelled arrows; a cycle gets an arrow back to the start. */
function Flow({ flow, scale, accent }: { flow: FlowFigure; scale: Scale; accent: string }) {
  const W = 460
  const n = flow.steps.length
  const labelled = flow.steps.some(s => s.then)
  const gap = labelled ? 78 : 30
  const box = (W - gap * (n - 1)) / n
  const size = Math.max(9, scale.body * 0.85)
  const small = Math.max(8, scale.body * 0.68)
  const back = flow.cycle ? flow.steps[n - 1].then : undefined
  return (
    <View style={{ marginTop: 10, marginBottom: 6, width: W, alignSelf: 'center' }} wrap={false}>
      {flow.title ? <Text style={{ fontSize: size, fontWeight: 700, color: accent, marginBottom: 8, textAlign: 'center' }}>{flow.title}</Text> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {flow.steps.map((step, i) => (
          <React.Fragment key={i}>
            <View style={{ width: box, minHeight: size * 3.4, backgroundColor: tint(accent, 0.88), border: `1.5pt solid ${accent}`, borderRadius: 8, padding: 7, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: size, fontWeight: 700, textAlign: 'center', color: '#1f1f1f', lineHeight: 1.3 }}>{step.text}</Text>
            </View>
            {i < n - 1 ? (
              <View style={{ width: gap, alignItems: 'center' }}>
                {step.then ? <Text style={{ fontSize: small, color: accent, textAlign: 'center', marginBottom: 1 }}>{step.then}</Text> : null}
                <Text style={{ fontSize: size * 1.6, color: accent, lineHeight: 1 }}>→</Text>
              </View>
            ) : null}
          </React.Fragment>
        ))}
      </View>
      {flow.cycle ? (
        <View style={{ alignItems: 'center' }}>
          <Svg width={W} height={26} viewBox={`0 0 ${W} 26`}>
            <Path d={`M ${W - box / 2} 0 V 16 H ${box / 2} V 6`} stroke={accent} strokeWidth={1.8} fill="none" />
            <Path d={`M ${box / 2 - 5} 9 L ${box / 2} 1 L ${box / 2 + 5} 9 Z`} fill={accent} />
          </Svg>
          {back ? <Text style={{ fontSize: small, color: accent, marginTop: 1 }}>{back}</Text> : null}
        </View>
      ) : null}
    </View>
  )
}

function Figure({ text, scale, accent }: { text: ReadingText; scale: Scale; accent: string }) {
  if (!text.figure) return null
  return (
    <View style={{ marginTop: 4, marginBottom: 8, alignItems: 'center' }} wrap={false}>
      {text.figure.kind === 'data_table'
        ? <MagazineTable table={text.figure} scale={scale} accent={accent} />
        : text.figure.kind === 'flow'
          ? <Flow flow={text.figure} scale={scale} accent={accent} />
          : <DiagramView diagram={text.figure} fit={380} bare />}
      {text.figureCaption ? (
        <Text style={{ fontSize: scale.body * 0.8, fontStyle: 'italic', color: '#555', marginTop: 4, textAlign: 'center' }}>{text.figureCaption}</Text>
      ) : null}
    </View>
  )
}

/** A text's spot illustration, fitted inside a box so it never crowds the page. */
function Art({ id }: { id: string }) {
  const art = ILLUSTRATIONS[id]
  if (!art) return null
  const maxW = 300
  const maxH = 200
  const fit = Math.min(maxW, (maxH * art.width) / art.height)
  return (
    <View style={{ alignItems: 'center', marginTop: 10 }} wrap={false}>
      <IllustrationView diagram={{ kind: 'illustration', id }} fit={fit} bare />
    </View>
  )
}

function Footer({ label, accent }: { label: string; accent: string }) {
  return (
    <View style={{ position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} fixed>
      <Text style={{ fontSize: 8, color: '#9a9a9a' }}>{label}</Text>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: accent, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 10, fontWeight: 700, color: '#ffffff' }} render={({ pageNumber }) => String(pageNumber)} />
      </View>
    </View>
  )
}

/** Called with every page a text lands on, so a check can compare it with `page`. */
export type OnPlaced = (textId: string, pageNumber: number) => void

function TextPage({ text, magazine, label, onPlaced }: { text: ReadingText; magazine: ReadingMagazine; label: string; onPlaced?: OnPlaced }) {
  const accent = ACCENT[text.type]
  const scale = typeScale(magazine.yearLevel)
  const columns = text.columns === 2 && text.blocks.length > 1 ? splitColumns(text.blocks) : null

  const body = columns ? (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ flex: 1, paddingRight: 11 }}>
        {columns[0].map((b, i) => <Block key={i} block={b} scale={scale} accent={accent} />)}
      </View>
      <View style={{ flex: 1, paddingLeft: 11 }}>
        {columns[1].map((b, i) => <Block key={i} block={b} scale={scale} accent={accent} />)}
      </View>
    </View>
  ) : (
    <View>{text.blocks.map((b, i) => <Block key={i} block={b} scale={scale} accent={accent} />)}</View>
  )

  return (
    <Page size="A4" style={{ paddingTop: 0, paddingBottom: 56, paddingHorizontal: 0, fontFamily: 'DejaVuSans' }}>
      <View style={{ height: 10, backgroundColor: accent }} fixed />
      <Watermark />
      <View style={{ paddingHorizontal: 44, paddingTop: 30 }}>
        {text.type === 'web' ? (
          // A web page reads as a web page: a browser bar above the title.
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef1f5', borderRadius: 4, paddingVertical: 5, paddingHorizontal: 8, marginBottom: 14 }}>
            {['#e5534b', '#e0a53a', '#4caf50'].map(c => (
              <View key={c} style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: c, marginRight: 4 }} />
            ))}
            <View style={{ flex: 1, marginLeft: 8, backgroundColor: '#ffffff', borderRadius: 3, paddingVertical: 2, paddingHorizontal: 6 }}>
              <Text style={{ fontSize: 8, color: '#777' }}>{`www.${text.title.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com.au`}</Text>
            </View>
          </View>
        ) : null}
        <Text style={{ fontSize: scale.title, fontWeight: 700, color: accent, lineHeight: 1.2 }}>{text.title}</Text>
        <View style={{ width: 60, height: 3, backgroundColor: accent, marginTop: 8, marginBottom: 16 }} />
        {body}
        <Figure text={text} scale={scale} accent={accent} />
        {text.art ? <Art id={text.art} /> : null}
      </View>
      <Footer label={label} accent={accent} />
      {onPlaced ? (
        <Text fixed style={{ position: 'absolute', fontSize: 1, color: '#ffffff' }} render={({ pageNumber }) => { onPlaced(text.id, pageNumber); return ' ' }} />
      ) : null}
    </Page>
  )
}

export function ReadingMagazineDocument({ magazine, title, onPlaced }: { magazine: ReadingMagazine; title: string; onPlaced?: OnPlaced }) {
  const year = yearLabel(magazine.yearLevel)
  const label = `PrepNest Reading Magazine · ${year} · Paper ${magazine.set}`
  const coverAccent = '#0F6E56'
  const texts = [...magazine.texts].sort((a, b) => a.page - b.page)

  return (
    <Document title={`${title} — Reading Magazine`} author="PrepNest">
      <Page size="A4" style={{ padding: 0, fontFamily: 'DejaVuSans' }}>
        <View style={{ backgroundColor: coverAccent, paddingTop: 56, paddingBottom: 44, paddingHorizontal: 44 }}>
          <Text style={{ fontSize: 13, color: '#bfe6da', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>{year} · Practice Paper {magazine.set}</Text>
          <Text style={{ fontSize: 44, fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>Reading</Text>
          <Text style={{ fontSize: 44, fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>Magazine</Text>
          <View style={{ flexDirection: 'row', marginTop: 22 }}>
            {texts.slice(0, 8).map(t => (
              <View key={t.id} style={{ width: 26, height: 6, borderRadius: 3, backgroundColor: ACCENT[t.type], marginRight: 6, border: '1pt solid #ffffff' }} />
            ))}
          </View>
        </View>
        <Watermark />
        <View style={{ paddingHorizontal: 44, paddingTop: 34 }}>
          <Text style={{ fontSize: 10, fontWeight: 700, color: '#888', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>In this magazine</Text>
          {texts.map(t => (
            <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', borderBottom: '0.75pt solid #e6e6e6', paddingVertical: 9 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT[t.type], marginRight: 12 }} />
              <Text style={{ flex: 1, fontSize: 14, color: '#1f1f1f' }}>{t.title}</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>page {t.page}</Text>
            </View>
          ))}
          <View style={{ backgroundColor: '#f2f8f6', borderRadius: 4, padding: 16, marginTop: 28 }}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: coverAccent, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>How to use this magazine</Text>
            <Text style={{ fontSize: 11, color: '#333', lineHeight: 1.55 }}>
              Use this magazine with the question paper “{title}”. Each part of the question paper tells you which text to read and the page it is on. Read the text first, then answer its questions. You may look back at the magazine as often as you like.
            </Text>
          </View>
        </View>
        <View style={{ position: 'absolute', bottom: 24, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 16, fontWeight: 700, color: BRAND_BLUE_DARK }}>Prep<Text style={{ color: '#3B8FD9' }}>Nest</Text></Text>
          <Text style={{ fontSize: 8, color: '#9a9a9a', marginTop: 6 }}>Original texts written for PrepNest practice</Text>
        </View>
      </Page>
      {texts.map(t => (
        <TextPage key={t.id} text={t} magazine={magazine} label={label} onPlaced={onPlaced} />
      ))}
    </Document>
  )
}
