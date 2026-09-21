import React from 'react'
import { Line, Rect, Circle, Polygon, Polyline } from '@react-pdf/renderer'
import type { MeasureDiagram, ClockDiagram, BalanceDiagram, CalendarDiagram } from '@/types'
import { Canvas, Frame, T, INK, MUTED, SHADES, pts, arcPoints, range, minus, clean } from './shared'

type Fit = { fit?: number; bare?: boolean }
type XY = [number, number]

export function Measure({ diagram: d, fit, bare }: { diagram: MeasureDiagram } & Fit) {
  switch (d.instrument) {
    case 'ruler':
      return <Ruler d={d} fit={fit} bare={bare} />
    case 'jug':
      return <Jug d={d} fit={fit} bare={bare} />
    case 'thermometer':
      return <Thermometer d={d} fit={fit} bare={bare} />
    case 'dial':
      return <Dial d={d} fit={fit} bare={bare} />
    case 'protractor':
      return <Protractor d={d} fit={fit} bare={bare} />
  }
}

function Ruler({ d, fit, bare }: { d: Extract<MeasureDiagram, { instrument: 'ruler' }> } & Fit) {
  const span = d.to - d.from
  const perUnit = Math.min(36, 360 / span)
  const pad = 14
  const W = span * perUnit + pad * 2
  const top = d.object ? 26 : 8
  const bodyH = 34
  const H = top + bodyH + 6
  const sx = (v: number) => pad + (v - d.from) * perUnit
  const minor = d.unit === 'cm' ? 0.1 : 1
  const ticks: React.ReactNode[] = []
  for (let v = d.from; v <= d.to + 1e-9; v = clean(v + minor)) {
    const whole = Math.abs(v - Math.round(v)) < 1e-6
    const half = d.unit === 'cm' && Math.abs(v * 2 - Math.round(v * 2)) < 1e-6
    const len = d.unit === 'cm' ? (whole ? 13 : half ? 9 : 5) : Math.round(v) % 10 === 0 ? 13 : Math.round(v) % 5 === 0 ? 9 : 5
    ticks.push(<Line key={`t${v}`} x1={sx(v)} y1={top} x2={sx(v)} y2={top + len} stroke={INK} strokeWidth={whole ? 0.8 : 0.45} />)
    const labelled = d.unit === 'cm' ? whole : Math.round(v) % 10 === 0
    if (labelled) ticks.push(<T key={`l${v}`} x={sx(v)} y={top + 23} size={7.5}>{String(d.unit === 'mm' ? Math.round(v) : Math.round(v))}</T>)
  }
  const leftEdge: XY[] = d.broken
    ? [[pad - 4, top], [pad - 9, top + 8], [pad - 2, top + 15], [pad - 10, top + 24], [pad - 4, top + bodyH]]
    : [[pad - 6, top], [pad - 6, top + bodyH]]
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>
        <Polygon points={pts([...leftEdge, [W - pad + 6, top + bodyH], [W - pad + 6, top]])} fill="#fbf7e8" stroke={INK} strokeWidth={0.9} />
        {ticks}
        <T x={W - pad - 2} y={top + bodyH - 4} size={7} anchor="end" fill={MUTED}>{d.unit}</T>
        {d.object ? (
          <>
            <Rect x={sx(d.object.start)} y={top - 16} width={sx(d.object.end) - sx(d.object.start)} height={12} fill={SHADES[2]} stroke={INK} strokeWidth={0.9} />
            <Line x1={sx(d.object.start)} y1={top - 4} x2={sx(d.object.start)} y2={top} stroke={INK} strokeWidth={0.5} strokeDasharray="1.5 1.5" />
            <Line x1={sx(d.object.end)} y1={top - 4} x2={sx(d.object.end)} y2={top} stroke={INK} strokeWidth={0.5} strokeDasharray="1.5 1.5" />
            {d.object.label ? <T x={(sx(d.object.start) + sx(d.object.end)) / 2} y={top - 7} size={7.5}>{d.object.label}</T> : null}
          </>
        ) : null}
      </Canvas>
    </Frame>
  )
}

function Jug({ d, fit, bare }: { d: Extract<MeasureDiagram, { instrument: 'jug' }> } & Fit) {
  const W = 150, H = 190
  const x0 = 34, x1 = 116, yTop = 22, yBot = 176
  const scaleTop = 36
  const sy = (v: number) => yBot - (v / d.max) * (yBot - scaleTop)
  const every = d.labelEvery ?? d.step * 2
  const level = sy(d.level)
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>
        {/* Liquid, then the jug outline over it. */}
        <Rect x={x0} y={level} width={x1 - x0} height={yBot - level} fill={SHADES[1]} />
        <Line x1={x0} y1={level} x2={x1} y2={level} stroke={MUTED} strokeWidth={0.8} />
        <Polyline points={pts([[x0 - 8, yTop - 6], [x0, yTop], [x0, yBot], [x1, yBot], [x1, yTop]])} fill="none" stroke={INK} strokeWidth={1.4} />
        {/* Handle */}
        <Polyline points={pts([[x1, yTop + 20], [x1 + 22, yTop + 28], [x1 + 22, yTop + 88], [x1, yTop + 98]])} fill="none" stroke={INK} strokeWidth={1.4} />
        {range(0, d.max, d.step).map(v => {
          const labelled = Math.abs(v / every - Math.round(v / every)) < 1e-6
          return (
            <React.Fragment key={v}>
              <Line x1={x0} y1={sy(v)} x2={x0 + (labelled ? 14 : 8)} y2={sy(v)} stroke={INK} strokeWidth={0.7} />
              {labelled && v > 0 ? <T x={x0 + 17} y={sy(v) + 2.5} size={7} anchor="start">{String(v)}</T> : null}
            </React.Fragment>
          )
        })}
        <T x={(x0 + x1) / 2 + 12} y={yBot - 6} size={7.5} fill={MUTED}>{d.unit}</T>
      </Canvas>
    </Frame>
  )
}

function Thermometer({ d, fit, bare }: { d: Extract<MeasureDiagram, { instrument: 'thermometer' }> } & Fit) {
  const W = 110, H = 220
  const cx = 42, top = 14, bottom = 184, tubeW = 10
  const sy = (v: number) => bottom - ((v - d.min) / (d.max - d.min)) * (bottom - top - 6)
  const every = d.labelEvery ?? d.step * 2
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>
        <Rect x={cx - tubeW / 2} y={top - 4} width={tubeW} height={bottom - top + 8} fill="#fff" stroke={INK} strokeWidth={1.1} />
        <Rect x={cx - 2.4} y={sy(d.value)} width={4.8} height={bottom + 6 - sy(d.value)} fill={SHADES[4]} />
        <Circle cx={cx} cy={bottom + 14} r={11} fill={SHADES[4]} stroke={INK} strokeWidth={1.1} />
        {range(d.min, d.max, d.step).map(v => {
          const labelled = Math.abs((v - d.min) / every - Math.round((v - d.min) / every)) < 1e-6
          return (
            <React.Fragment key={v}>
              <Line x1={cx + tubeW / 2} y1={sy(v)} x2={cx + tubeW / 2 + (labelled ? 9 : 5)} y2={sy(v)} stroke={INK} strokeWidth={0.7} />
              {labelled ? <T x={cx + tubeW / 2 + 12} y={sy(v) + 2.5} size={7.5} anchor="start">{minus(v)}</T> : null}
            </React.Fragment>
          )
        })}
        <T x={cx + tubeW / 2 + 12} y={top - 6} size={7.5} anchor="start" fill={MUTED}>°C</T>
      </Canvas>
    </Frame>
  )
}

function Dial({ d, fit, bare }: { d: Extract<MeasureDiagram, { instrument: 'dial' }> } & Fit) {
  const r = 66
  const cx = r + 12, cy = r + 12
  const W = cx * 2, H = cy * 2 + 6
  // Scale runs clockwise from 225° (bottom-left) to -45° (bottom-right).
  const angleOf = (v: number) => 225 - (v / d.max) * 270
  const every = d.labelEvery ?? d.step * 5
  const needle = (angleOf(d.value) * Math.PI) / 180
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>
        <Circle cx={cx} cy={cy} r={r + 8} fill={SHADES[1]} stroke={INK} strokeWidth={1.2} />
        <Circle cx={cx} cy={cy} r={r} fill="#fff" stroke={INK} strokeWidth={0.8} />
        {range(0, d.max, d.step).map(v => {
          const a = (angleOf(v) * Math.PI) / 180
          const labelled = Math.abs(v / every - Math.round(v / every)) < 1e-6
          const inner = r - (labelled ? 10 : 5)
          return (
            <React.Fragment key={v}>
              <Line x1={cx + Math.cos(a) * inner} y1={cy - Math.sin(a) * inner} x2={cx + Math.cos(a) * r} y2={cy - Math.sin(a) * r} stroke={INK} strokeWidth={labelled ? 0.9 : 0.5} />
              {labelled ? <T x={cx + Math.cos(a) * (r - 19)} y={cy - Math.sin(a) * (r - 19) + 2.5} size={7}>{String(v)}</T> : null}
            </React.Fragment>
          )
        })}
        <Line x1={cx} y1={cy} x2={cx + Math.cos(needle) * (r - 6)} y2={cy - Math.sin(needle) * (r - 6)} stroke={INK} strokeWidth={1.8} />
        <Circle cx={cx} cy={cy} r={3.5} fill={INK} />
        <T x={cx} y={cy + 28} size={8} fill={MUTED}>{d.unit}</T>
      </Canvas>
    </Frame>
  )
}

function Protractor({ d, fit, bare }: { d: Extract<MeasureDiagram, { instrument: 'protractor' }> } & Fit) {
  const r = 150
  const cx = r + 16, cy = r + 16
  const W = cx * 2, H = cy + 22
  const a = (d.angle * Math.PI) / 180
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>
        <Polygon points={pts([[cx - r, cy], ...arcPoints(cx, cy, r, 180, 0, 60).map(p => p), [cx + r, cy]])} fill="#f4f7fb" stroke={INK} strokeWidth={1} />
        {range(0, 180, 1).map(deg => {
          const t = (deg * Math.PI) / 180
          const len = deg % 10 === 0 ? 12 : deg % 5 === 0 ? 8 : 4
          return <Line key={deg} x1={cx + Math.cos(t) * r} y1={cy - Math.sin(t) * r} x2={cx + Math.cos(t) * (r - len)} y2={cy - Math.sin(t) * (r - len)} stroke={INK} strokeWidth={deg % 10 === 0 ? 0.7 : 0.35} />
        })}
        {range(0, 180, 10).map(deg => {
          const t = (deg * Math.PI) / 180
          return (
            <React.Fragment key={`l${deg}`}>
              <T x={cx + Math.cos(t) * (r - 21)} y={cy - Math.sin(t) * (r - 21) + 2.5} size={7}>{String(deg)}</T>
              <T x={cx + Math.cos(t) * (r - 35)} y={cy - Math.sin(t) * (r - 35) + 2.5} size={6} fill={MUTED}>{String(180 - deg)}</T>
            </React.Fragment>
          )
        })}
        <Line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={INK} strokeWidth={0.8} />
        {/* The angle being measured: one arm on the baseline, one at the angle. */}
        <Line x1={cx} y1={cy} x2={cx + r + 12} y2={cy} stroke={INK} strokeWidth={1.8} />
        <Line x1={cx} y1={cy} x2={cx + Math.cos(a) * (r + 12)} y2={cy - Math.sin(a) * (r + 12)} stroke={INK} strokeWidth={1.8} />
        <Circle cx={cx} cy={cy} r={2.2} fill={INK} />
      </Canvas>
    </Frame>
  )
}

// ── Clock ────────────────────────────────────────────────────────────────────

export function Clock({ diagram: d, fit, bare }: { diagram: ClockDiagram } & Fit) {
  if (d.style === 'digital') {
    const W = 150, H = d.label ? 70 : 56
    const hh = String(d.hour)
    const mm = String(d.minute).padStart(2, '0')
    return (
      <Frame bare={bare}>
        <Canvas w={W} h={H} fit={fit}>
          <Rect x={6} y={6} width={W - 12} height={44} rx={6} ry={6} fill={SHADES[4]} stroke={INK} strokeWidth={1} />
          <Rect x={14} y={12} width={W - 28} height={32} rx={3} ry={3} fill="#f2f2f2" />
          <T x={W / 2 - (d.meridiem ? 8 : 0)} y={36} size={20} bold>{`${hh}:${mm}`}</T>
          {d.meridiem ? <T x={W - 22} y={36} size={8} bold>{d.meridiem}</T> : null}
          {d.label ? <T x={W / 2} y={H - 4} size={8}>{d.label}</T> : null}
        </Canvas>
      </Frame>
    )
  }
  const r = 56
  const cx = r + 8, cy = r + 8
  const H = cy * 2 + (d.label ? 12 : 0)
  const numerals = d.numerals ?? 'all'
  const minuteA = (90 - d.minute * 6) * (Math.PI / 180)
  const hourA = (90 - ((d.hour % 12) + d.minute / 60) * 30) * (Math.PI / 180)
  return (
    <Frame bare={bare}>
      <Canvas w={cx * 2} h={H} fit={fit}>
        <Circle cx={cx} cy={cy} r={r} fill="#fff" stroke={INK} strokeWidth={2} />
        {range(0, 59, 1).map(m => {
          const t = ((90 - m * 6) * Math.PI) / 180
          const len = m % 5 === 0 ? 7 : 3
          return <Line key={m} x1={cx + Math.cos(t) * (r - 3)} y1={cy - Math.sin(t) * (r - 3)} x2={cx + Math.cos(t) * (r - 3 - len)} y2={cy - Math.sin(t) * (r - 3 - len)} stroke={INK} strokeWidth={m % 5 === 0 ? 1.1 : 0.5} />
        })}
        {numerals !== 'none'
          ? range(1, 12, 1)
              .filter(h => numerals === 'all' || h % 3 === 0)
              .map(h => {
                const t = ((90 - h * 30) * Math.PI) / 180
                return <T key={`n${h}`} x={cx + Math.cos(t) * (r - 17)} y={cy - Math.sin(t) * (r - 17) + 3.5} size={10}>{String(h)}</T>
              })
          : null}
        <Line x1={cx} y1={cy} x2={cx + Math.cos(hourA) * r * 0.5} y2={cy - Math.sin(hourA) * r * 0.5} stroke={INK} strokeWidth={3} />
        <Line x1={cx} y1={cy} x2={cx + Math.cos(minuteA) * r * 0.78} y2={cy - Math.sin(minuteA) * r * 0.78} stroke={INK} strokeWidth={1.8} />
        <Circle cx={cx} cy={cy} r={2.8} fill={INK} />
        {d.label ? <T x={cx} y={H - 2} size={8}>{d.label}</T> : null}
      </Canvas>
    </Frame>
  )
}

// ── Balance ──────────────────────────────────────────────────────────────────

export function Balance({ diagram: d, fit, bare }: { diagram: BalanceDiagram } & Fit) {
  const W = 300, H = 160
  const cx = W / 2, pivotY = 62
  const tilt = d.tilt === 'left' ? 9 : d.tilt === 'right' ? -9 : 0
  const armL = 110
  const t = (tilt * Math.PI) / 180
  const lx = cx - Math.cos(t) * armL, ly = pivotY + Math.sin(t) * armL
  const rx = cx + Math.cos(t) * armL, ry = pivotY - Math.sin(t) * armL
  const pan = (px: number, py: number, items: string[], key: string) => {
    const panY = py + 26
    const blockW = Math.max(26, ...items.map(s => s.length * 5.2 + 10))
    return (
      <React.Fragment key={key}>
        <Line x1={px} y1={py} x2={px - 34} y2={panY} stroke={INK} strokeWidth={0.7} />
        <Line x1={px} y1={py} x2={px + 34} y2={panY} stroke={INK} strokeWidth={0.7} />
        <Polygon points={pts([[px - 44, panY], [px + 44, panY], [px + 36, panY + 7], [px - 36, panY + 7]])} fill={SHADES[2]} stroke={INK} strokeWidth={0.9} />
        {items.map((it, i) => {
          const perRow = Math.max(1, Math.floor(84 / (blockW + 3)))
          const row = Math.floor(i / perRow), col = i % perRow
          const inRow = Math.min(perRow, items.length - row * perRow)
          const bx = px - (inRow * (blockW + 3)) / 2 + col * (blockW + 3)
          const by = panY - 16 - row * 17
          return (
            <React.Fragment key={i}>
              <Rect x={bx} y={by} width={blockW} height={16} fill="#fff" stroke={INK} strokeWidth={0.9} />
              <T x={bx + blockW / 2} y={by + 11} size={7.5}>{it}</T>
            </React.Fragment>
          )
        })}
      </React.Fragment>
    )
  }
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>
        <Polygon points={pts([[cx, pivotY], [cx - 22, H - 12], [cx + 22, H - 12]])} fill={SHADES[3]} stroke={INK} strokeWidth={1} />
        <Rect x={cx - 42} y={H - 12} width={84} height={6} fill={SHADES[3]} stroke={INK} strokeWidth={1} />
        <Line x1={lx} y1={ly} x2={rx} y2={ry} stroke={INK} strokeWidth={3} />
        <Circle cx={cx} cy={pivotY} r={3.5} fill={INK} />
        {pan(lx, ly, d.left, 'L')}
        {pan(rx, ry, d.right, 'R')}
      </Canvas>
    </Frame>
  )
}

// ── Calendar ─────────────────────────────────────────────────────────────────

export function Calendar({ diagram: d, fit, bare }: { diagram: CalendarDiagram } & Fit) {
  const cell = 26
  const weeks = Math.ceil((d.startDay + d.days) / 7)
  const W = cell * 7 + 4
  const H = 22 + 14 + weeks * cell + 4
  const circled = new Set(d.circled ?? [])
  const shaded = new Set(d.shaded ?? [])
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>
        <Rect x={2} y={2} width={W - 4} height={20} fill={SHADES[4]} />
        <T x={W / 2} y={15} size={9} bold fill="#fff">{d.title}</T>
        {days.map((dy, i) => (
          <T key={dy} x={2 + i * cell + cell / 2} y={32} size={7} bold>{dy}</T>
        ))}
        {Array.from({ length: d.days }, (_, i) => {
          const n = i + 1
          const pos = d.startDay + i
          const x = 2 + (pos % 7) * cell, y = 36 + Math.floor(pos / 7) * cell
          return (
            <React.Fragment key={n}>
              <Rect x={x} y={y} width={cell} height={cell} fill={shaded.has(n) ? SHADES[2] : '#fff'} stroke={INK} strokeWidth={0.5} />
              <T x={x + cell / 2} y={y + cell / 2 + 3} size={8.5}>{String(n)}</T>
              {circled.has(n) ? <Circle cx={x + cell / 2} cy={y + cell / 2} r={9.5} fill="none" stroke={INK} strokeWidth={1.2} /> : null}
            </React.Fragment>
          )
        })}
      </Canvas>
    </Frame>
  )
}
