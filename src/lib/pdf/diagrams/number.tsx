import React from 'react'
import { View, Text, Line, Rect, Circle, Polygon, Polyline, Ellipse } from '@react-pdf/renderer'
import { pdfStyles } from '../theme'
import type {
  NumberLineDiagram,
  FractionModelDiagram,
  BarModelDiagram,
  PlaceValueDiagram,
  ArrayDiagram,
  MoneyDiagram,
  MoneyItem,
  TilePatternDiagram,
  PriceTagsDiagram,
  ItemIcon,
} from '@/types'
import { Canvas, Frame, T, INK, MUTED, SHADES, pts, arcPoints, range, minus, Sector, Arrow } from './shared'

type Fit = { fit?: number; bare?: boolean }
type XY = [number, number]

// ── Number line ──────────────────────────────────────────────────────────────

export function NumberLine({ diagram: d, fit, bare }: { diagram: NumberLineDiagram } & Fit) {
  const W = 400
  const left = 20, right = W - 20
  const lineY = (d.jumps?.length ? 42 : 0) + (d.points?.some(p => p.label) || d.arrowAt !== undefined ? 26 : 12)
  const H = lineY + 22
  const sx = (v: number) => left + ((v - d.min) / (d.max - d.min)) * (right - left)
  const ticks = range(d.min, d.max, d.step)
  const every = d.labelEvery ?? 1
  const labelFor = (v: number) => d.tickLabels?.[String(v)] ?? minus(v)
  const showLabel = (v: number, i: number) => {
    if (d.hideLabels) return v === d.min || v === d.max || d.tickLabels?.[String(v)] !== undefined
    return i % every === 0 || d.tickLabels?.[String(v)] !== undefined
  }
  const legacyMarks = d.marks ?? []
  return (
    <View style={bare ? { alignItems: 'center' } : pdfStyles.diagramBox} wrap={false}>
      {d.title ? <Text style={pdfStyles.graphTitle}>{d.title}</Text> : null}
      <Canvas w={W} h={H} fit={fit}>
        {d.ray ? (
          <>
            <Line x1={sx(d.ray.from)} y1={lineY} x2={d.ray.direction === 'right' ? right + 8 : left - 8} y2={lineY} stroke={INK} strokeWidth={3.2} />
            <Circle cx={sx(d.ray.from)} cy={lineY} r={4} fill={d.ray.open ? '#fff' : INK} stroke={INK} strokeWidth={1.4} />
          </>
        ) : null}
        <Line x1={left - 10} y1={lineY} x2={right + 10} y2={lineY} stroke={INK} strokeWidth={1} />
        <Arrow x1={right} y1={lineY} x2={right + 12} y2={lineY} size={4} />
        <Arrow x1={left} y1={lineY} x2={left - 12} y2={lineY} size={4} />
        {ticks.map((t, i) => (
          <React.Fragment key={t}>
            <Line x1={sx(t)} y1={lineY - 5} x2={sx(t)} y2={lineY + 5} stroke={INK} strokeWidth={0.9} />
            {showLabel(t, i) ? <T x={sx(t)} y={lineY + 16} size={8}>{labelFor(t)}</T> : null}
          </React.Fragment>
        ))}
        {(d.jumps ?? []).map((j, i) => {
          const x1 = sx(j.from), x2 = sx(j.to)
          const cx = (x1 + x2) / 2, rx = Math.abs(x2 - x1) / 2
          const ry = Math.min(30, 10 + rx * 0.4)
          const arc: XY[] = []
          for (let k = 0; k <= 20; k++) {
            const a = Math.PI * (k / 20)
            arc.push([cx - Math.cos(a) * rx * Math.sign(x2 - x1 || 1), lineY - 3 - Math.sin(a) * ry])
          }
          const end = arc[arc.length - 1], prev = arc[arc.length - 3]
          return (
            <React.Fragment key={`j${i}`}>
              <Polyline points={pts(arc)} fill="none" stroke={INK} strokeWidth={1} />
              <Arrow x1={prev[0]} y1={prev[1]} x2={end[0]} y2={end[1]} size={4.5} />
              {j.label ? <T x={cx} y={lineY - ry - 7} size={8}>{j.label}</T> : null}
            </React.Fragment>
          )
        })}
        {(d.points ?? []).map((p, i) => (
          <React.Fragment key={`p${i}`}>
            <Circle cx={sx(p.value)} cy={lineY} r={3.8} fill={p.open ? '#fff' : INK} stroke={INK} strokeWidth={1.3} />
            {p.label ? <T x={sx(p.value)} y={lineY - 10} size={8.5} bold>{p.label}</T> : null}
          </React.Fragment>
        ))}
        {d.arrowAt !== undefined ? <Arrow x1={sx(d.arrowAt)} y1={lineY - 24} x2={sx(d.arrowAt)} y2={lineY - 7} size={5} width={1.4} /> : null}
        {legacyMarks.map((m, i) => (
          <Circle key={`m${i}`} cx={sx(m.value)} cy={lineY} r={4} fill="#185FA5" />
        ))}
      </Canvas>
      {legacyMarks.length ? <Text style={pdfStyles.diagramCaption}>{legacyMarks.map(m => m.label).join('  •  ')}</Text> : null}
    </View>
  )
}

// ── Fraction models ──────────────────────────────────────────────────────────

export function FractionModel({ diagram: d, fit, bare }: { diagram: FractionModelDiagram } & Fit) {
  const wholes = d.wholes ?? 1
  const out: React.ReactNode[] = []
  let W = 0, H = 0
  if (d.model === 'circle') {
    const r = 38, gap = 16
    W = wholes * (2 * r + gap) + 4
    H = 2 * r + 6
    for (let w = 0; w < wholes; w++) {
      const cx = 2 + r + w * (2 * r + gap), cy = r + 3
      for (let p = 0; p < d.parts; p++) {
        const idx = w * d.parts + p
        const from = 90 - ((p + 1) * 360) / d.parts, to = 90 - (p * 360) / d.parts
        out.push(<Sector key={`${w}-${p}`} cx={cx} cy={cy} r={r} fromDeg={from} toDeg={to} fill={idx < d.shaded ? SHADES[2] : '#fff'} />)
      }
    }
  } else if (d.model === 'grid') {
    const rows = d.rows ?? 1, cols = d.cols ?? d.parts
    const cell = Math.min(20, 150 / cols, 120 / rows)
    const gap = 16
    W = wholes * (cols * cell + gap) + 4
    H = rows * cell + 4
    for (let w = 0; w < wholes; w++) {
      const x0 = 2 + w * (cols * cell + gap)
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const idx = w * rows * cols + r * cols + c
          out.push(<Rect key={`${w}-${r}-${c}`} x={x0 + c * cell} y={2 + r * cell} width={cell} height={cell} fill={idx < d.shaded ? SHADES[2] : '#fff'} stroke={INK} strokeWidth={0.8} />)
        }
    }
  } else {
    const barW = Math.min(300, 360 / wholes), barH = 28, gap = 14
    W = wholes * (barW + gap) + 4
    H = barH + 4
    for (let w = 0; w < wholes; w++) {
      const x0 = 2 + w * (barW + gap)
      for (let p = 0; p < d.parts; p++) {
        const idx = w * d.parts + p
        out.push(<Rect key={`${w}-${p}`} x={x0 + (p * barW) / d.parts} y={2} width={barW / d.parts} height={barH} fill={idx < d.shaded ? SHADES[2] : '#fff'} stroke={INK} strokeWidth={0.9} />)
      }
    }
  }
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>{out}</Canvas>
    </Frame>
  )
}

/** Tape diagram. Widths are relative units, shared across bars so comparisons line up. */
export function BarModel({ diagram: d, fit, bare }: { diagram: BarModelDiagram } & Fit) {
  const labelW = Math.max(0, ...d.bars.map(b => (b.label ?? '').length * 5 + 10))
  const units = Math.max(...d.bars.map(b => b.segments.reduce((a, s) => a + s.width, 0)), 1)
  const unitW = Math.min(48, 300 / units)
  const barH = 24, gap = 10
  const top = d.total ? 26 : 4
  const W = labelW + units * unitW + 8
  const H = top + d.bars.length * (barH + gap)
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>
        {d.total ? (
          <>
            <Polyline
              points={pts([[labelW, top - 4], [labelW, top - 10], [labelW + (d.bars[0].segments.reduce((a, s) => a + s.width, 0) * unitW) / 2 - 4, top - 10], [labelW + (d.bars[0].segments.reduce((a, s) => a + s.width, 0) * unitW) / 2, top - 15], [labelW + (d.bars[0].segments.reduce((a, s) => a + s.width, 0) * unitW) / 2 + 4, top - 10], [labelW + d.bars[0].segments.reduce((a, s) => a + s.width, 0) * unitW, top - 10], [labelW + d.bars[0].segments.reduce((a, s) => a + s.width, 0) * unitW, top - 4]])}
              fill="none"
              stroke={INK}
              strokeWidth={0.9}
            />
            <T x={labelW + (d.bars[0].segments.reduce((a, s) => a + s.width, 0) * unitW) / 2} y={top - 18} size={8.5}>{d.total}</T>
          </>
        ) : null}
        {d.bars.map((b, bi) => {
          const y = top + bi * (barH + gap)
          let x = labelW
          return (
            <React.Fragment key={bi}>
              {b.label ? <T x={labelW - 6} y={y + barH / 2 + 3} size={8} anchor="end">{b.label}</T> : null}
              {b.segments.map((s, si) => {
                const sx = x
                x += s.width * unitW
                return (
                  <React.Fragment key={si}>
                    <Rect x={sx} y={y} width={s.width * unitW} height={barH} fill={SHADES[s.shade ?? 0]} stroke={INK} strokeWidth={1} />
                    {s.text ? <T x={sx + (s.width * unitW) / 2} y={y + barH / 2 + 3} size={8.5} fill={(s.shade ?? 0) >= 3 ? '#fff' : INK}>{s.text}</T> : null}
                  </React.Fragment>
                )
              })}
            </React.Fragment>
          )
        })}
      </Canvas>
    </Frame>
  )
}

// ── Place value (MAB) ────────────────────────────────────────────────────────

export function PlaceValue({ diagram: d, fit, bare }: { diagram: PlaceValueDiagram } & Fit) {
  const u = 5.5 // one unit cube's face
  const items: React.ReactNode[] = []
  let x = 4
  const baseY = 4 + 10 * u + 4
  const depth = 0.5
  // Thousands: a big cube.
  for (let i = 0; i < (d.thousands ?? 0); i++) {
    const s = 10 * u, dd = s * depth
    const fl: XY = [x, baseY], fr: XY = [x + s, baseY], ftr: XY = [x + s, baseY - s], ftl: XY = [x, baseY - s]
    const btl: XY = [x + dd, baseY - s - dd * 0.8], btr: XY = [x + s + dd, baseY - s - dd * 0.8], bbr: XY = [x + s + dd, baseY - dd * 0.8]
    items.push(
      <React.Fragment key={`k${i}`}>
        <Polygon points={pts([ftl, ftr, btr, btl])} fill={SHADES[1]} stroke={INK} strokeWidth={0.8} />
        <Polygon points={pts([fr, bbr, btr, ftr])} fill={SHADES[2]} stroke={INK} strokeWidth={0.8} />
        <Rect x={x} y={baseY - s} width={s} height={s} fill="#fff" stroke={INK} strokeWidth={0.8} />
        {range(1, 9, 1).map(k => (
          <React.Fragment key={k}>
            <Line x1={x + k * u} y1={baseY - s} x2={x + k * u} y2={baseY} stroke={SHADES[2]} strokeWidth={0.4} />
            <Line x1={x} y1={baseY - k * u} x2={x + s} y2={baseY - k * u} stroke={SHADES[2]} strokeWidth={0.4} />
          </React.Fragment>
        ))}
      </React.Fragment>
    )
    x += s + dd + 10
  }
  // Hundreds: flats (10 × 10 grids).
  for (let i = 0; i < d.hundreds; i++) {
    const s = 10 * u
    items.push(
      <React.Fragment key={`h${i}`}>
        <Rect x={x} y={baseY - s} width={s} height={s} fill={SHADES[1]} stroke={INK} strokeWidth={0.9} />
        {range(1, 9, 1).map(k => (
          <React.Fragment key={k}>
            <Line x1={x + k * u} y1={baseY - s} x2={x + k * u} y2={baseY} stroke={INK} strokeWidth={0.3} />
            <Line x1={x} y1={baseY - k * u} x2={x + s} y2={baseY - k * u} stroke={INK} strokeWidth={0.3} />
          </React.Fragment>
        ))}
      </React.Fragment>
    )
    x += s + 8
  }
  // Tens: rods.
  for (let i = 0; i < d.tens; i++) {
    items.push(
      <React.Fragment key={`t${i}`}>
        <Rect x={x} y={baseY - 10 * u} width={u} height={10 * u} fill={SHADES[1]} stroke={INK} strokeWidth={0.9} />
        {range(1, 9, 1).map(k => <Line key={k} x1={x} y1={baseY - k * u} x2={x + u} y2={baseY - k * u} stroke={INK} strokeWidth={0.3} />)}
      </React.Fragment>
    )
    x += u + 4
  }
  if (d.tens) x += 6
  // Ones: small cubes, in columns of five.
  for (let i = 0; i < d.ones; i++) {
    const col = Math.floor(i / 5), row = i % 5
    items.push(<Rect key={`o${i}`} x={x + col * (u + 3)} y={baseY - (row + 1) * (u + 3)} width={u} height={u} fill={SHADES[1]} stroke={INK} strokeWidth={0.9} />)
  }
  x += Math.ceil(d.ones / 5) * (u + 3)
  return (
    <Frame bare={bare}>
      <Canvas w={Math.max(x + 4, 80)} h={baseY + 4} fit={fit}>{items}</Canvas>
    </Frame>
  )
}

// ── Arrays ───────────────────────────────────────────────────────────────────

export function ArrayDots({ diagram: d, fit, bare }: { diagram: ArrayDiagram } & Fit) {
  const s = Math.min(18, 300 / d.cols, 200 / d.rows)
  const W = d.cols * s + 8, H = d.rows * s + 8
  const sym = d.symbol ?? 'dot'
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>
        {range(0, d.rows - 1, 1).flatMap(r =>
          range(0, d.cols - 1, 1).map(c => {
            const cx = 4 + c * s + s / 2, cy = 4 + r * s + s / 2
            if (sym === 'square') return <Rect key={`${r}-${c}`} x={cx - s * 0.32} y={cy - s * 0.32} width={s * 0.64} height={s * 0.64} fill={SHADES[2]} stroke={INK} strokeWidth={0.7} />
            if (sym === 'star') {
              const star: XY[] = []
              for (let i = 0; i < 10; i++) {
                const a = (Math.PI / 5) * i - Math.PI / 2
                const rr = i % 2 === 0 ? s * 0.4 : s * 0.17
                star.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)])
              }
              return <Polygon key={`${r}-${c}`} points={pts(star)} fill={SHADES[2]} stroke={INK} strokeWidth={0.6} />
            }
            return <Circle key={`${r}-${c}`} cx={cx} cy={cy} r={s * 0.28} fill={INK} />
          })
        )}
      </Canvas>
    </Frame>
  )
}

// ── Money ────────────────────────────────────────────────────────────────────

/** Relative diameters follow the real coins: the 50c is the biggest and the
 * $2 among the smallest, which is itself a thing young students must learn. */
const COINS: Partial<Record<MoneyItem, { d: number; fill: string; label: string; sides?: number }>> = {
  '5c': { d: 19.4, fill: SHADES[1], label: '5c' },
  '10c': { d: 23.6, fill: SHADES[1], label: '10c' },
  '20c': { d: 28.5, fill: SHADES[1], label: '20c' },
  '50c': { d: 31.5, fill: SHADES[1], label: '50c', sides: 12 },
  '$1': { d: 25, fill: SHADES[2], label: '$1' },
  '$2': { d: 20.5, fill: SHADES[2], label: '$2' },
}
const NOTES: Partial<Record<MoneyItem, { w: number; fill: string }>> = {
  '$5': { w: 130, fill: '#f1e6ee' },
  '$10': { w: 137, fill: '#e3ecf5' },
  '$20': { w: 144, fill: '#f3e3dd' },
  '$50': { w: 151, fill: '#f5efd8' },
  '$100': { w: 158, fill: '#e1efe6' },
}

export function Money({ diagram: d, fit, bare }: { diagram: MoneyDiagram } & Fit) {
  const k = 1.5 // points per mm
  const notes = d.items.filter(i => NOTES[i])
  const coins = d.items.filter(i => COINS[i])
  const noteH = 65 * 0.62
  const out: React.ReactNode[] = []
  let x = 4, y = 4
  let rowH = 0
  // Size the canvas to what is drawn, so a few coins are not shrunk into the
  // corner of a fixed-width box when they appear as picture answer options.
  let maxX = 0
  notes.forEach((n, i) => {
    const spec = NOTES[n]!
    const w = spec.w * 0.62
    if (x + w > 400) { x = 4; y += rowH + 8; rowH = 0 }
    out.push(
      <React.Fragment key={`n${i}`}>
        <Rect x={x} y={y} width={w} height={noteH} rx={3} ry={3} fill={spec.fill} stroke={INK} strokeWidth={0.9} />
        <Rect x={x + 4} y={y + 4} width={w - 8} height={noteH - 8} rx={2} ry={2} fill="none" stroke={MUTED} strokeWidth={0.4} />
        <T x={x + 12} y={y + 14} size={9} bold anchor="start">{n}</T>
        <T x={x + w - 12} y={y + noteH - 7} size={9} bold anchor="end">{n}</T>
        <Ellipse cx={x + w / 2} cy={y + noteH / 2} rx={11} ry={13} fill="none" stroke={MUTED} strokeWidth={0.5} />
      </React.Fragment>
    )
    maxX = Math.max(maxX, x + w)
    x += w + 8
    rowH = Math.max(rowH, noteH)
  })
  if (notes.length && coins.length) { x = 4; y += rowH + 10; rowH = 0 }
  coins.forEach((c, i) => {
    const spec = COINS[c]!
    const r = (spec.d * k) / 2
    if (x + 2 * r > 400) { x = 4; y += rowH + 6; rowH = 0 }
    const cx = x + r, cy = y + r
    if (spec.sides) {
      const poly: XY[] = []
      for (let s = 0; s < spec.sides; s++) {
        const a = (2 * Math.PI * s) / spec.sides + Math.PI / spec.sides
        poly.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
      }
      out.push(<Polygon key={`c${i}`} points={pts(poly)} fill={spec.fill} stroke={INK} strokeWidth={0.9} />)
    } else {
      out.push(<Circle key={`c${i}`} cx={cx} cy={cy} r={r} fill={spec.fill} stroke={INK} strokeWidth={0.9} />)
    }
    out.push(<Circle key={`ci${i}`} cx={cx} cy={cy} r={r - 2.5} fill="none" stroke={MUTED} strokeWidth={0.4} />)
    out.push(<T key={`cl${i}`} x={cx} y={cy + 3.5} size={Math.max(7.5, r * 0.45)} bold>{spec.label}</T>)
    maxX = Math.max(maxX, x + 2 * r)
    x += 2 * r + 7
    rowH = Math.max(rowH, 2 * r)
  })
  const W = maxX + 4
  const H = y + rowH + 4
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>{out}</Canvas>
    </Frame>
  )
}

// ── Tile patterns ────────────────────────────────────────────────────────────

export function TilePattern({ diagram: d, fit, bare }: { diagram: TilePatternDiagram } & Fit) {
  const maxCols = Math.max(...d.designs.flatMap(g => g.rows.map(r => r.length)), 1)
  // A single pattern ("Rosa's pattern") has room for bigger tiles than a
  // growing pattern's stack of designs. Labels get the width their text needs.
  const cell = Math.min(d.designs.length === 1 ? 16 : 11, 300 / maxCols)
  const labelW = Math.max(50, ...d.designs.map(g => g.label.length * 8 * 0.68 + 10))
  const gap = 10
  const heights = d.designs.map(g => g.rows.length * cell)
  const W = labelW + maxCols * cell + 6
  const H = heights.reduce((a, h) => a + h + gap, 0) + 4
  const out: React.ReactNode[] = []
  let y = 4
  d.designs.forEach((g, gi) => {
    out.push(<T key={`l${gi}`} x={2} y={y + Math.min(heights[gi], cell * 1.5) / 2 + 4} size={8} anchor="start" bold>{g.label}</T>)
    g.rows.forEach((row, ri) =>
      row.split('').forEach((ch, ci) => {
        if (ch === ' ') return
        const fill = ch === '#' ? SHADES[4] : ch === 'o' ? SHADES[2] : '#fff'
        const x = labelW + ci * cell, yy = y + ri * cell
        out.push(
          d.round ? (
            <Circle key={`${gi}-${ri}-${ci}`} cx={x + cell / 2} cy={yy + cell / 2} r={cell / 2 - 0.6} fill={fill} stroke={INK} strokeWidth={0.6} />
          ) : (
            <Rect key={`${gi}-${ri}-${ci}`} x={x} y={yy} width={cell} height={cell} fill={fill} stroke={INK} strokeWidth={0.6} />
          )
        )
      })
    )
    y += heights[gi] + gap
  })
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>{out}</Canvas>
    </Frame>
  )
}

// ── Shop items with price tags ───────────────────────────────────────────────

/** Item artwork in a 40 × 40 box whose top-left is (x, y). */
function Item({ icon, x, y }: { icon: ItemIcon; x: number; y: number }) {
  const P = (px: number, py: number): XY => [x + px, y + py]
  const sw = 1
  switch (icon) {
    case 'ball':
      return (
        <>
          <Circle cx={x + 20} cy={y + 21} r={16} fill={SHADES[1]} stroke={INK} strokeWidth={sw} />
          <Polygon points={pts([P(20, 13), P(27, 18), P(24, 26), P(16, 26), P(13, 18)])} fill={SHADES[4]} />
          <Line x1={x + 20} y1={y + 13} x2={x + 20} y2={y + 5} stroke={INK} strokeWidth={0.7} />
          <Line x1={x + 27} y1={y + 18} x2={x + 35} y2={y + 15} stroke={INK} strokeWidth={0.7} />
          <Line x1={x + 13} y1={y + 18} x2={x + 5} y2={y + 15} stroke={INK} strokeWidth={0.7} />
          <Line x1={x + 24} y1={y + 26} x2={x + 29} y2={y + 34} stroke={INK} strokeWidth={0.7} />
          <Line x1={x + 16} y1={y + 26} x2={x + 11} y2={y + 34} stroke={INK} strokeWidth={0.7} />
        </>
      )
    case 'book':
      return (
        <>
          <Rect x={x + 8} y={y + 4} width={25} height={32} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
          <Rect x={x + 8} y={y + 4} width={5} height={32} fill={SHADES[3]} stroke={INK} strokeWidth={sw} />
          <Rect x={x + 16} y={y + 11} width={13} height={7} fill="#fff" stroke={INK} strokeWidth={0.6} />
        </>
      )
    case 'cap':
      return (
        <>
          <Polygon points={pts(arcPoints(x + 20, y + 26, 15, 0, 180, 20))} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
          <Polygon points={pts([P(20, 26), P(39, 26), P(37, 31), P(20, 30)])} fill={SHADES[3]} stroke={INK} strokeWidth={sw} />
          <Circle cx={x + 20} cy={y + 11} r={1.6} fill={INK} />
        </>
      )
    case 'drink':
      return (
        <>
          <Rect x={x + 13} y={y + 7} width={15} height={29} rx={2} ry={2} fill={SHADES[1]} stroke={INK} strokeWidth={sw} />
          <Rect x={x + 13} y={y + 15} width={15} height={11} fill={SHADES[3]} />
          <Line x1={x + 23} y1={y + 7} x2={x + 26} y2={y + 1} stroke={INK} strokeWidth={1.4} />
        </>
      )
    case 'apple':
      return (
        <>
          <Circle cx={x + 20} cy={y + 23} r={13} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
          <Line x1={x + 20} y1={y + 10} x2={x + 22} y2={y + 4} stroke={INK} strokeWidth={1.5} />
          <Ellipse cx={x + 27} cy={y + 7} rx={4.5} ry={2.2} fill={SHADES[3]} />
        </>
      )
    case 'pencil':
      return (
        <>
          <Polygon points={pts([P(4, 30), P(30, 4), P(36, 10), P(10, 36)])} fill={SHADES[1]} stroke={INK} strokeWidth={sw} />
          <Polygon points={pts([P(4, 30), P(10, 36), P(2, 38)])} fill={SHADES[3]} stroke={INK} strokeWidth={sw} />
          <Polygon points={pts([P(30, 4), P(36, 10), P(38, 8), P(32, 2)])} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
        </>
      )
    case 'bag':
      return (
        <>
          <Rect x={x + 8} y={y + 12} width={24} height={25} rx={4} ry={4} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
          <Polyline points={pts(arcPoints(x + 20, y + 13, 7, 0, 180, 12))} fill="none" stroke={INK} strokeWidth={1.4} />
          <Rect x={x + 12} y={y + 22} width={16} height={9} fill={SHADES[3]} stroke={INK} strokeWidth={0.6} />
        </>
      )
    case 'shirt':
      return <Polygon points={pts([P(13, 5), P(20, 9), P(27, 5), P(37, 12), P(32, 19), P(29, 16), P(29, 36), P(11, 36), P(11, 16), P(8, 19), P(3, 12)])} fill={SHADES[1]} stroke={INK} strokeWidth={sw} />
    case 'shoe':
      return (
        <>
          <Polygon points={pts([P(4, 30), P(4, 14), P(14, 14), P(18, 20), P(34, 24), P(37, 30)])} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
          <Rect x={x + 3} y={y + 30} width={35} height={4} fill={SHADES[4]} />
        </>
      )
    case 'sandwich':
      return (
        <>
          <Polygon points={pts([P(4, 32), P(20, 8), P(36, 32)])} fill={SHADES[1]} stroke={INK} strokeWidth={sw} />
          <Polyline points={pts([P(9, 26), P(14, 28), P(20, 25), P(26, 28), P(31, 26)])} fill="none" stroke={INK} strokeWidth={1.2} />
        </>
      )
    case 'toy':
      return (
        <>
          <Circle cx={x + 11} cy={y + 9} r={4.5} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
          <Circle cx={x + 29} cy={y + 9} r={4.5} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
          <Circle cx={x + 20} cy={y + 15} r={9} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
          <Ellipse cx={x + 20} cy={y + 30} rx={11} ry={8} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
          <Circle cx={x + 17} cy={y + 13} r={1.1} fill={INK} />
          <Circle cx={x + 23} cy={y + 13} r={1.1} fill={INK} />
        </>
      )
    case 'plant':
      return (
        <>
          <Polygon points={pts([P(10, 24), P(30, 24), P(27, 38), P(13, 38)])} fill={SHADES[3]} stroke={INK} strokeWidth={sw} />
          <Ellipse cx={x + 14} cy={y + 15} rx={6} ry={9} fill={SHADES[2]} stroke={INK} strokeWidth={0.8} />
          <Ellipse cx={x + 26} cy={y + 15} rx={6} ry={9} fill={SHADES[2]} stroke={INK} strokeWidth={0.8} />
          <Line x1={x + 20} y1={y + 24} x2={x + 20} y2={y + 8} stroke={INK} strokeWidth={1} />
        </>
      )
  }
}

export function PriceTags({ diagram: d, fit, bare }: { diagram: PriceTagsDiagram } & Fit) {
  const cardW = 100, cardH = 92, gap = 10
  const W = d.items.length * (cardW + gap) + 4
  const H = cardH + 6
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>
        {d.items.map((it, i) => {
          const x = 2 + i * (cardW + gap)
          return (
            <React.Fragment key={i}>
              <Rect x={x} y={2} width={cardW} height={cardH} rx={5} ry={5} fill="#fff" stroke={SHADES[2]} strokeWidth={0.8} />
              <Item icon={it.icon} x={x + 8} y={10} />
              {/* The tag: a small card on a string, tied to the item. */}
              <Line x1={x + 46} y1={30} x2={x + 55} y2={24} stroke={INK} strokeWidth={0.6} />
              <Polygon points={pts([[x + 57, 14], [x + 96, 14], [x + 96, 34], [x + 57, 34], [x + 51, 24]])} fill={SHADES[1]} stroke={INK} strokeWidth={0.8} />
              <Circle cx={x + 57} cy={24} r={1.4} fill="#fff" stroke={INK} strokeWidth={0.5} />
              <T x={x + 77} y={27.5} size={8.5} bold>{it.price}</T>
              <T x={x + cardW / 2} y={cardH - 12} size={8}>{it.name}</T>
            </React.Fragment>
          )
        })}
      </Canvas>
    </Frame>
  )
}

