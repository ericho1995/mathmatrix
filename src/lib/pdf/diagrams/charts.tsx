import React from 'react'
import { View, Text, Line, Rect, Circle, Polyline, Polygon, Ellipse } from '@react-pdf/renderer'
import { pdfStyles } from '../theme'
import type {
  BarChartDiagram,
  LineGraphDiagram,
  PieChartDiagram,
  PictographDiagram,
  PictoIcon,
  DotPlotDiagram,
  StemLeafDiagram,
  BoxPlotDiagram,
  DataTableDiagram,
} from '@/types'
import { Canvas, Frame, T, INK, MUTED, GRID, ACCENT, SHADES, range, minus, pts, Sector, arcPoints, wrapLabel, Key, keyWidth, FULL_WIDTH } from './shared'

type Fit = { fit?: number; bare?: boolean }

// ── Bar chart ────────────────────────────────────────────────────────────────

/** Series fills: one series is mid grey; several step through the greys so the
 * key can tell them apart in print. */
const seriesFill = (i: number, n: number, style: BarChartDiagram['style']) => {
  if (style === 'outline') return '#ffffff'
  if (n === 1) return style === 'shaded' ? SHADES[3] : SHADES[2]
  const ramp = [SHADES[4], SHADES[2], SHADES[0], SHADES[3], SHADES[1]]
  return ramp[i % ramp.length]
}

export function BarChart({ diagram: d, fit, bare }: { diagram: BarChartDiagram } & Fit) {
  // Legacy items carry no axis and print the value under each bar. They stay
  // renderable, but everything new sets yStep.
  if (!d.yStep) return <LegacyBarChart diagram={d} fit={fit} bare={bare} />

  const categories = d.categories ?? (d.bars ?? []).map(b => b.label)
  const series = d.series ?? [{ label: '', values: (d.bars ?? []).map(b => b.value) }]
  const maxVal = d.yMax ?? Math.ceil(Math.max(...series.flatMap(s => s.values), 1) / d.yStep) * d.yStep
  const ticks = range(0, maxVal, d.yStep)
  const hasKey = series.length > 1
  const kw = hasKey ? keyWidth(series.map(s => s.label)) + 14 : 0

  if (d.horizontal) {
    const labelW = Math.max(...categories.map(c => c.length)) * 4.8 + 12
    const rowH = series.length > 1 ? 10 * series.length + 10 : 22
    const plotW = 300
    const padT = d.yLabel ? 8 : 6
    const w = labelW + plotW + 20 + kw
    const plotH = categories.length * rowH
    const h = padT + plotH + 34
    const sx = (v: number) => labelW + (v / maxVal) * plotW
    return (
      <Frame title={d.title} bare={bare}>
        <Canvas w={w} h={h} fit={fit}>
          {ticks.map((t, i) => (
            <React.Fragment key={i}>
              <Line x1={sx(t)} y1={padT} x2={sx(t)} y2={padT + plotH} stroke={GRID} strokeWidth={0.5} />
              <T x={sx(t)} y={padT + plotH + 10} size={7}>{t}</T>
            </React.Fragment>
          ))}
          <Line x1={labelW} y1={padT} x2={labelW} y2={padT + plotH} stroke={INK} strokeWidth={1} />
          <Line x1={labelW} y1={padT + plotH} x2={labelW + plotW} y2={padT + plotH} stroke={INK} strokeWidth={1} />
          {categories.map((c, ci) => {
            const y0 = padT + ci * rowH + 5
            const barH = (rowH - 10) / series.length
            return (
              <React.Fragment key={ci}>
                <T x={labelW - 5} y={padT + ci * rowH + rowH / 2 + 3} size={8} anchor="end">{c}</T>
                {series.map((s, si) => (
                  <Rect key={si} x={labelW} y={y0 + si * barH} width={Math.max(0, sx(s.values[ci] ?? 0) - labelW)} height={barH} fill={seriesFill(si, series.length, d.style)} stroke={INK} strokeWidth={0.6} />
                ))}
              </React.Fragment>
            )
          })}
          {d.yLabel ? <T x={labelW + plotW / 2} y={padT + plotH + 24} size={8} bold>{d.yLabel}</T> : null}
          {hasKey ? <Key x={labelW + plotW + 14} y={padT} items={series.map((s, i) => ({ fill: seriesFill(i, series.length, d.style), label: s.label }))} /> : null}
        </Canvas>
      </Frame>
    )
  }

  const titleW = d.yLabel ? axisTitleWidth(d.yLabel) : 0
  const padL = 28 + titleW
  const plotW = Math.min(330, Math.max(170, categories.length * (series.length * 18 + 22)))
  const plotH = 140
  const catLines = categories.map(c => wrapLabel(c, 13))
  const labelRows = Math.max(...catLines.map(l => l.length))
  const padT = 8
  const w = padL + plotW + 10 + kw
  const h = padT + plotH + 12 + labelRows * 9 + (d.xLabel ? 14 : 2)
  const sy = (v: number) => padT + plotH - (v / maxVal) * plotH
  const slot = plotW / categories.length
  const groupW = slot * 0.64
  const barW = groupW / series.length

  return (
    <Frame title={d.title} bare={bare}>
      <Canvas w={w} h={h} fit={fit}>
        {ticks.map((t, i) => (
          <React.Fragment key={i}>
            <Line x1={padL} y1={sy(t)} x2={padL + plotW} y2={sy(t)} stroke={GRID} strokeWidth={0.5} />
            <Line x1={padL - 3} y1={sy(t)} x2={padL} y2={sy(t)} stroke={INK} strokeWidth={0.8} />
            <T x={padL - 5} y={sy(t) + 2.5} size={7} anchor="end">{t}</T>
          </React.Fragment>
        ))}
        {categories.map((c, ci) => {
          const gx = padL + ci * slot + (slot - groupW) / 2
          return (
            <React.Fragment key={ci}>
              {series.map((s, si) => {
                const v = s.values[ci] ?? 0
                return (
                  <React.Fragment key={si}>
                    <Rect x={gx + si * barW} y={sy(v)} width={barW} height={padT + plotH - sy(v)} fill={seriesFill(si, series.length, d.style)} stroke={INK} strokeWidth={0.6} />
                    {d.showValues ? <T x={gx + si * barW + barW / 2} y={sy(v) - 3} size={7}>{v}</T> : null}
                  </React.Fragment>
                )
              })}
              {catLines[ci].map((line, li) => (
                <T key={li} x={padL + ci * slot + slot / 2} y={padT + plotH + 10 + li * 9} size={7.5}>{line}</T>
              ))}
            </React.Fragment>
          )
        })}
        <Line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={INK} strokeWidth={1} />
        <Line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke={INK} strokeWidth={1} />
        {d.xLabel ? <T x={padL + plotW / 2} y={h - 3} size={8} bold>{d.xLabel}</T> : null}
        {d.yLabel ? <YAxisTitle x={titleW / 2 + 1} y={padT + plotH / 2} text={d.yLabel} /> : null}
        {hasKey ? <Key x={padL + plotW + 12} y={padT + 10} items={series.map((s, i) => ({ fill: seriesFill(i, series.length, d.style), label: s.label }))} /> : null}
      </Canvas>
    </Frame>
  )
}

/**
 * A y-axis title. react-pdf cannot rotate SVG text reliably, so the title is
 * stacked one word per line beside the axis — which is also how several real
 * papers set a short axis title.
 */
/** Width a stacked axis title needs: its longest word at 7pt bold, plus air. */
const axisTitleWidth = (text: string) => Math.max(...text.split(' ').map(w => w.length)) * 4.6 + 8

function YAxisTitle({ x, y, text }: { x: number; y: number; text: string }) {
  const words = text.split(' ')
  const top = y - ((words.length - 1) * 9) / 2
  return (
    <>
      {words.map((wd, i) => (
        <T key={i} x={x} y={top + i * 9} size={7} bold>{wd}</T>
      ))}
    </>
  )
}

function LegacyBarChart({ diagram, bare }: { diagram: BarChartDiagram } & Fit) {
  const bars = diagram.bars ?? []
  const chartWidth = 420
  const chartHeight = 130
  const barGap = 16
  const barWidth = (chartWidth - barGap * (bars.length + 1)) / Math.max(bars.length, 1)
  const maxValue = Math.max(...bars.map(b => b.value), 1)
  return (
    <View style={bare ? { alignItems: 'center' } : pdfStyles.diagramBox} wrap={false}>
      {diagram.title ? <Text style={pdfStyles.diagramTitle}>{diagram.title}</Text> : null}
      <Canvas w={chartWidth} h={chartHeight + 20}>
        <Line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#333" strokeWidth={1} />
        {bars.map((bar, i) => {
          const barHeight = (bar.value / maxValue) * (chartHeight - 20)
          return <Rect key={i} x={barGap + i * (barWidth + barGap)} y={chartHeight - barHeight} width={barWidth} height={barHeight} fill={ACCENT} />
        })}
      </Canvas>
      <View style={pdfStyles.diagramLabelsRow}>
        {bars.map((bar, i) => {
          const isCurrency = diagram.unit && /^[$€£]$/.test(diagram.unit)
          const valueLabel = isCurrency ? `${diagram.unit}${bar.value.toFixed(2)}` : `${bar.value}${diagram.unit ? ` ${diagram.unit}` : ''}`
          return (
            <Text key={i} style={[pdfStyles.diagramLabel, { width: `${100 / bars.length}%` }]}>
              {bar.label}{'\n'}({valueLabel})
            </Text>
          )
        })}
      </View>
    </View>
  )
}

// ── Line graph ───────────────────────────────────────────────────────────────

export function LineGraph({ diagram: d, fit, bare }: { diagram: LineGraphDiagram } & Fit) {
  const titleW = d.yLabel ? axisTitleWidth(d.yLabel) : 0
  const padL = 30 + titleW
  const plotW = Math.min(340, Math.max(200, d.xLabels.length * 34))
  const plotH = 140
  const padT = 8
  const hasKey = d.series.some(s => s.label)
  const kw = hasKey ? keyWidth(d.series.map(s => s.label ?? '')) + 30 : 0
  const w = padL + plotW + 14 + kw
  const h = padT + plotH + 16 + (d.xLabel ? 14 : 2)
  const sx = (i: number) => padL + (d.xLabels.length === 1 ? plotW / 2 : (i / (d.xLabels.length - 1)) * plotW)
  const sy = (v: number) => padT + plotH - ((v - d.yMin) / (d.yMax - d.yMin)) * plotH
  const ticks = range(d.yMin, d.yMax, d.yStep)
  const markers = d.markers !== false

  return (
    <Frame title={d.title} bare={bare}>
      <Canvas w={w} h={h} fit={fit}>
        {ticks.map((t, i) => (
          <React.Fragment key={i}>
            <Line x1={padL} y1={sy(t)} x2={padL + plotW} y2={sy(t)} stroke={GRID} strokeWidth={0.5} />
            <T x={padL - 5} y={sy(t) + 2.5} size={7} anchor="end">{minus(t)}</T>
          </React.Fragment>
        ))}
        {d.xLabels.map((l, i) => (
          <React.Fragment key={i}>
            <Line x1={sx(i)} y1={padT} x2={sx(i)} y2={padT + plotH} stroke={GRID} strokeWidth={0.4} />
            <T x={sx(i)} y={padT + plotH + 11} size={7}>{l}</T>
          </React.Fragment>
        ))}
        <Line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={INK} strokeWidth={1} />
        <Line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke={INK} strokeWidth={1} />
        {d.series.map((s, si) => {
          // Split at nulls so a missing reading leaves a visible gap.
          const runs: [number, number][][] = [[]]
          s.values.forEach((v, i) => {
            if (v === null) runs.push([])
            else runs[runs.length - 1].push([sx(i), sy(v)])
          })
          return (
            <React.Fragment key={si}>
              {runs.filter(r => r.length > 1).map((r, ri) => (
                <Polyline key={ri} points={pts(r)} fill="none" stroke={si === 0 ? INK : MUTED} strokeWidth={1.3} strokeDasharray={s.dashed ? '4 3' : undefined} />
              ))}
              {markers
                ? s.values.map((v, i) =>
                    v === null ? null : si === 0 ? (
                      <Circle key={i} cx={sx(i)} cy={sy(v)} r={2.3} fill={INK} />
                    ) : (
                      <Rect key={i} x={sx(i) - 2.2} y={sy(v) - 2.2} width={4.4} height={4.4} fill="#fff" stroke={MUTED} strokeWidth={1} />
                    )
                  )
                : null}
            </React.Fragment>
          )
        })}
        {d.xLabel ? <T x={padL + plotW / 2} y={h - 3} size={8} bold>{d.xLabel}</T> : null}
        {d.yLabel ? <YAxisTitle x={titleW / 2 + 1} y={padT + plotH / 2} text={d.yLabel} /> : null}
        {hasKey
          ? d.series.map((s, si) => (
              <React.Fragment key={si}>
                <Line x1={padL + plotW + 16} y1={padT + 14 + si * 13} x2={padL + plotW + 34} y2={padT + 14 + si * 13} stroke={si === 0 ? INK : MUTED} strokeWidth={1.3} strokeDasharray={s.dashed ? '4 3' : undefined} />
                <T x={padL + plotW + 38} y={padT + 16.5 + si * 13} size={7} anchor="start">{s.label ?? ''}</T>
              </React.Fragment>
            ))
          : null}
      </Canvas>
    </Frame>
  )
}

// ── Pie chart ────────────────────────────────────────────────────────────────

export function PieChart({ diagram: d, fit, bare }: { diagram: PieChartDiagram } & Fit) {
  const r = 62
  const cx = r + 6, cy = r + 6
  const total = d.sectors.reduce((s, x) => s + x.value, 0) || 1
  const defaults = [SHADES[1], SHADES[3], SHADES[0], SHADES[2], SHADES[4]]
  const fills = d.sectors.map((s, i) => (s.shade !== undefined ? SHADES[s.shade] : defaults[i % defaults.length]))
  const kw = keyWidth(d.sectors.map(s => s.label)) + 16
  let angle = 90
  return (
    <Frame title={d.title} bare={bare}>
      <Canvas w={cx * 2 + kw} h={cy * 2} fit={fit}>
        {d.sectors.map((s, i) => {
          const sweep = (s.value / total) * 360
          const from = angle - sweep
          const to = angle
          angle = from
          const mid = ((from + to) / 2) * (Math.PI / 180)
          const pct = Math.round((s.value / total) * 100)
          // Dark sectors take white text.
          const textFill = fills[i] === SHADES[4] || fills[i] === SHADES[3] ? '#fff' : INK
          return (
            <React.Fragment key={i}>
              <Sector cx={cx} cy={cy} r={r} fromDeg={from} toDeg={to} fill={fills[i]} />
              {d.showPercent && sweep > 18 ? (
                <T x={cx + r * 0.62 * Math.cos(mid)} y={cy - r * 0.62 * Math.sin(mid) + 3} size={7.5} fill={textFill}>
                  {`${pct}%`}
                </T>
              ) : null}
            </React.Fragment>
          )
        })}
        <Key x={cx * 2 + 10} y={cy - (d.sectors.length * 12 + 16) / 2} items={d.sectors.map((s, i) => ({ fill: fills[i], label: s.label }))} />
      </Canvas>
    </Frame>
  )
}

// ── Pictograph ───────────────────────────────────────────────────────────────

/** Icon artwork, drawn in a 14 × 14 box whose top-left is (x, y). */
export function Icon({ icon, x, y, s = 14 }: { icon: PictoIcon; x: number; y: number; s?: number }) {
  const k = s / 14
  const P = (px: number, py: number): [number, number] => [x + px * k, y + py * k]
  const sw = 0.8
  switch (icon) {
    case 'star': {
      const outer = 6.8, inner = 2.8
      const star: [number, number][] = []
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI / 5) * i - Math.PI / 2
        const r = i % 2 === 0 ? outer : inner
        star.push(P(7 + r * Math.cos(a), 7.4 + r * Math.sin(a)))
      }
      return <Polygon points={pts(star)} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
    }
    case 'circle':
      return <Circle cx={x + 7 * k} cy={y + 7 * k} r={6 * k} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
    case 'square':
      return <Rect x={x + 1.5 * k} y={y + 1.5 * k} width={11 * k} height={11 * k} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
    case 'smiley':
      return (
        <>
          <Circle cx={x + 7 * k} cy={y + 7 * k} r={6.2 * k} fill={SHADES[1]} stroke={INK} strokeWidth={sw} />
          <Circle cx={x + 4.8 * k} cy={y + 5.6 * k} r={0.9 * k} fill={INK} />
          <Circle cx={x + 9.2 * k} cy={y + 5.6 * k} r={0.9 * k} fill={INK} />
          <Polyline points={pts(arcPoints(x + 7 * k, y + 7 * k, 3.6 * k, 200, 340, 10))} fill="none" stroke={INK} strokeWidth={sw} />
        </>
      )
    case 'book':
      return (
        <>
          <Rect x={x + 2 * k} y={y + 1.5 * k} width={10 * k} height={11 * k} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
          <Line x1={x + 4 * k} y1={y + 1.5 * k} x2={x + 4 * k} y2={y + 12.5 * k} stroke={INK} strokeWidth={sw} />
          <Line x1={x + 6 * k} y1={y + 5 * k} x2={x + 10.5 * k} y2={y + 5 * k} stroke={INK} strokeWidth={0.5} />
        </>
      )
    case 'tree':
      return (
        <>
          <Rect x={x + 6 * k} y={y + 9.5 * k} width={2 * k} height={3.5 * k} fill={SHADES[3]} stroke={INK} strokeWidth={0.5} />
          <Polygon points={pts([P(7, 0.8), P(12.5, 10), P(1.5, 10)])} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
        </>
      )
    case 'fish':
      return (
        <>
          <Ellipse cx={x + 6 * k} cy={y + 7 * k} rx={4.8 * k} ry={3.4 * k} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
          <Polygon points={pts([P(10.4, 7), P(13.5, 3.8), P(13.5, 10.2)])} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
          <Circle cx={x + 3.4 * k} cy={y + 6.2 * k} r={0.7 * k} fill={INK} />
        </>
      )
    case 'car':
      return (
        <>
          <Polygon points={pts([P(1, 9.5), P(1, 6.5), P(3.5, 6.5), P(5, 3.5), P(9.5, 3.5), P(11, 6.5), P(13, 6.5), P(13, 9.5)])} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
          <Circle cx={x + 4 * k} cy={y + 10 * k} r={1.8 * k} fill={SHADES[4]} />
          <Circle cx={x + 10 * k} cy={y + 10 * k} r={1.8 * k} fill={SHADES[4]} />
        </>
      )
    case 'apple':
      return (
        <>
          <Circle cx={x + 7 * k} cy={y + 8 * k} r={5.2 * k} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
          <Line x1={x + 7 * k} y1={y + 3 * k} x2={x + 7.8 * k} y2={y + 0.8 * k} stroke={INK} strokeWidth={1} />
          <Ellipse cx={x + 9.6 * k} cy={y + 2.2 * k} rx={1.8 * k} ry={0.9 * k} fill={SHADES[3]} />
        </>
      )
    case 'ball':
      return (
        <>
          <Circle cx={x + 7 * k} cy={y + 7 * k} r={6 * k} fill={SHADES[1]} stroke={INK} strokeWidth={sw} />
          <Polyline points={pts(arcPoints(x + 1 * k, y + 7 * k, 5 * k, -60, 60, 10))} fill="none" stroke={INK} strokeWidth={0.6} />
          <Polyline points={pts(arcPoints(x + 13 * k, y + 7 * k, 5 * k, 120, 240, 10))} fill="none" stroke={INK} strokeWidth={0.6} />
        </>
      )
    case 'cup':
      return (
        <>
          <Polygon points={pts([P(2, 3), P(10.5, 3), P(9.5, 12.5), P(3, 12.5)])} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
          <Polyline points={pts(arcPoints(x + 10.2 * k, y + 7 * k, 2.2 * k, -80, 80, 8))} fill="none" stroke={INK} strokeWidth={sw} />
        </>
      )
    case 'person':
      return (
        <>
          <Circle cx={x + 7 * k} cy={y + 3 * k} r={2.3 * k} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
          <Polygon points={pts([P(4, 13.5), P(4.8, 6), P(9.2, 6), P(10, 13.5)])} fill={SHADES[2]} stroke={INK} strokeWidth={sw} />
        </>
      )
  }
}

export function Pictograph({ diagram: d, fit, bare }: { diagram: PictographDiagram } & Fit) {
  const labelW = Math.max(...d.rows.map(r => r.label.length)) * 4.9 + 14
  const icon = 15
  const maxIcons = Math.max(...d.rows.map(r => Math.ceil(r.count)), 1)
  const rowH = 20
  const w = labelW + maxIcons * (icon + 2) + 12
  const tableH = d.rows.length * rowH
  const h = tableH + 30
  return (
    <Frame title={d.title} bare={bare}>
      <Canvas w={Math.max(w, 190)} h={h} fit={fit}>
        <Rect x={0.5} y={0.5} width={Math.max(w, 190) - 1} height={tableH} fill="none" stroke={INK} strokeWidth={0.8} />
        <Line x1={labelW} y1={0.5} x2={labelW} y2={tableH + 0.5} stroke={INK} strokeWidth={0.8} />
        {d.rows.map((r, ri) => {
          const y = ri * rowH
          const whole = Math.floor(r.count)
          const half = r.count - whole >= 0.5
          return (
            <React.Fragment key={ri}>
              {ri > 0 ? <Line x1={0.5} y1={y + 0.5} x2={Math.max(w, 190) - 0.5} y2={y + 0.5} stroke={INK} strokeWidth={0.5} /> : null}
              <T x={6} y={y + rowH / 2 + 3} size={8} anchor="start">{r.label}</T>
              {Array.from({ length: whole }, (_, i) => (
                <Icon key={i} icon={d.icon} x={labelW + 6 + i * (icon + 2)} y={y + 2.5} s={icon} />
              ))}
              {half ? (
                <>
                  <Icon icon={d.icon} x={labelW + 6 + whole * (icon + 2)} y={y + 2.5} s={icon} />
                  {/* Cover the right half: a half icon means half the key value. */}
                  <Rect x={labelW + 6 + whole * (icon + 2) + icon / 2} y={y + 1.5} width={icon / 2 + 1.5} height={rowH - 3} fill="#fff" />
                </>
              ) : null}
            </React.Fragment>
          )
        })}
        <Icon icon={d.icon} x={labelW + 6} y={tableH + 9} s={icon} />
        <T x={labelW + 6 + icon + 6} y={tableH + 20} size={8} anchor="start">{`= ${d.keyValue} ${d.keyNoun}`}</T>
        <T x={6} y={tableH + 20} size={7} anchor="start" bold>KEY</T>
      </Canvas>
    </Frame>
  )
}

// ── Dot plot ─────────────────────────────────────────────────────────────────

/** Dot plot on a full integer axis — every value in range gets a tick, so an
 * empty column reads as zero rather than disappearing. */
export function DotPlot({ diagram: d, fit, bare }: { diagram: DotPlotDiagram } & Fit) {
  const min = Math.min(...d.values), max = Math.max(...d.values)
  const span = Math.max(max - min, 1)
  const step = span > 20 ? 5 : span > 12 ? 2 : 1
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step
  const counts = new Map<number, number>()
  for (const v of d.values) counts.set(v, (counts.get(v) ?? 0) + 1)
  const maxStack = Math.max(...Array.from(counts.values()), 1)
  const w = 360, padX = 18, dotR = 3.6, gap = 8.2
  const plotH = maxStack * gap + 8
  const h = plotH + (d.axisLabel ? 30 : 18)
  const sx = (v: number) => padX + ((v - lo) / Math.max(hi - lo, 1)) * (w - 2 * padX)
  return (
    <Frame bare={bare}>
      <Canvas w={w} h={h} fit={fit}>
        {Array.from(counts.entries()).flatMap(([v, c]) =>
          Array.from({ length: c }, (_, i) => <Circle key={`${v}-${i}`} cx={sx(v)} cy={plotH - 2 - i * gap} r={dotR} fill={INK} />)
        )}
        <Line x1={padX - 8} y1={plotH + 3} x2={w - padX + 8} y2={plotH + 3} stroke={INK} strokeWidth={1} />
        {range(lo, hi, 1).map((t, i) => (
          <React.Fragment key={i}>
            <Line x1={sx(t)} y1={plotH + 3} x2={sx(t)} y2={plotH + (t % step === 0 ? 7 : 5)} stroke={INK} strokeWidth={0.7} />
            {t % step === 0 ? <T x={sx(t)} y={plotH + 15} size={7}>{minus(t)}</T> : null}
          </React.Fragment>
        ))}
        {d.axisLabel ? <T x={w / 2} y={h - 3} size={8} bold>{d.axisLabel}</T> : null}
      </Canvas>
    </Frame>
  )
}

// ── Stem-and-leaf ────────────────────────────────────────────────────────────

export function StemLeaf({ diagram: d, fit, bare }: { diagram: StemLeafDiagram } & Fit) {
  const rowH = 14
  const leafChars = Math.max(...d.rows.map(r => r.leaves.replace(/\s/g, '').length), 1)
  const w = Math.max(170, 60 + leafChars * 11)
  const h = 18 + d.rows.length * rowH + 22
  return (
    <Frame title={d.title} bare={bare}>
      <Canvas w={w} h={h} fit={fit}>
        <T x={22} y={11} size={7.5} bold>Stem</T>
        <T x={44} y={11} size={7.5} bold anchor="start">Leaf</T>
        <Line x1={34} y1={2} x2={34} y2={16 + d.rows.length * rowH} stroke={INK} strokeWidth={1} />
        <Line x1={4} y1={15} x2={w - 4} y2={15} stroke={INK} strokeWidth={0.6} />
        {d.rows.map((r, i) => (
          <React.Fragment key={i}>
            <T x={24} y={27 + i * rowH} size={9} anchor="end">{r.stem}</T>
            {r.leaves.replace(/\s/g, '').split('').map((leaf, li) => (
              <T key={li} x={46 + li * 11} y={27 + i * rowH} size={9}>{leaf}</T>
            ))}
          </React.Fragment>
        ))}
        <T x={4} y={h - 5} size={7.5} anchor="start" fill={MUTED}>{`Key: ${d.keyText}`}</T>
      </Canvas>
    </Frame>
  )
}

// ── Box plot (moved unchanged from ExamPaperDocument) ────────────────────────

export function BoxPlot({ diagram, fit, bare }: { diagram: BoxPlotDiagram } & Fit) {
  const width = 360
  const padLeft = diagram.boxes.some(b => b.label) ? 56 : 16
  const padRight = 16
  const plotW = width - padLeft - padRight
  const rowH = 34
  const boxH = 16
  const axisY = diagram.boxes.length * rowH + 10
  const height = axisY + 26
  const { min, max } = diagram
  const sx = (v: number) => padLeft + ((v - min) / (max - min)) * plotW
  const ticks = range(min, max, diagram.step)
  return (
    <Frame title={diagram.title} bare={bare}>
      <Canvas w={width} h={height} fit={fit}>
        {diagram.boxes.map((b, bi) => {
          const cy = bi * rowH + rowH / 2
          const top = cy - boxH / 2
          return (
            <React.Fragment key={`b${bi}`}>
              <Line x1={sx(b.min)} y1={cy} x2={sx(b.q1)} y2={cy} stroke="#333" strokeWidth={0.8} />
              <Line x1={sx(b.q3)} y1={cy} x2={sx(b.max)} y2={cy} stroke="#333" strokeWidth={0.8} />
              <Line x1={sx(b.min)} y1={top} x2={sx(b.min)} y2={top + boxH} stroke="#333" strokeWidth={0.8} />
              <Line x1={sx(b.max)} y1={top} x2={sx(b.max)} y2={top + boxH} stroke="#333" strokeWidth={0.8} />
              <Rect x={sx(b.q1)} y={top} width={Math.max(sx(b.q3) - sx(b.q1), 0.5)} height={boxH} fill="#fff" stroke="#333" strokeWidth={0.8} />
              <Line x1={sx(b.median)} y1={top} x2={sx(b.median)} y2={top + boxH} stroke={ACCENT} strokeWidth={1.6} />
              {(b.outliers ?? []).map((o, oi) => (
                <Circle key={`o${oi}`} cx={sx(o)} cy={cy} r={2.2} fill="none" stroke="#333" strokeWidth={0.8} />
              ))}
              {b.label ? <T x={padLeft - 6} y={cy + 3} anchor="end" fill="#333">{b.label}</T> : null}
            </React.Fragment>
          )
        })}
        <Line x1={padLeft} y1={axisY} x2={padLeft + plotW} y2={axisY} stroke="#333" strokeWidth={1} />
        {ticks.map((t, i) => (
          <React.Fragment key={`t${i}`}>
            <Line x1={sx(t)} y1={axisY} x2={sx(t)} y2={axisY + 4} stroke="#333" strokeWidth={0.8} />
            <T x={sx(t)} y={axisY + 13} size={7} fill="#444">{minus(t)}</T>
          </React.Fragment>
        ))}
        {diagram.axisLabel ? <T x={padLeft + plotW / 2} y={axisY + 24} fill="#444">{diagram.axisLabel}</T> : null}
      </Canvas>
    </Frame>
  )
}

// ── Tables ───────────────────────────────────────────────────────────────────

/** Five-bar tally groups for a count. */
function Tally({ x, y, n }: { x: number; y: number; n: number }) {
  const out: React.ReactNode[] = []
  let cx = x
  for (let g = 0; g < Math.floor(n / 5); g++) {
    for (let i = 0; i < 4; i++) out.push(<Line key={`g${g}-${i}`} x1={cx + i * 3.2} y1={y - 8} x2={cx + i * 3.2} y2={y + 1} stroke={INK} strokeWidth={0.9} />)
    out.push(<Line key={`g${g}-x`} x1={cx - 1.5} y1={y - 1} x2={cx + 11} y2={y - 7} stroke={INK} strokeWidth={0.9} />)
    cx += 17
  }
  for (let i = 0; i < n % 5; i++) out.push(<Line key={`r${i}`} x1={cx + i * 3.2} y1={y - 8} x2={cx + i * 3.2} y2={y + 1} stroke={INK} strokeWidth={0.9} />)
  return <>{out}</>
}

const textW = (s: string | number, size = 8) => String(s).length * size * 0.56

/**
 * Styled tables are drawn as SVG so they scale — as picture answer options too
 * ("Which table correctly shows…?"). The plain grid keeps the View-based layout
 * because older General Mathematics tables rely on its text wrapping.
 */
export function DataTable({ diagram: d, fit, bare }: { diagram: DataTableDiagram } & Fit) {
  const style = d.style ?? 'grid'
  if (style === 'grid' && !fit) return <GridTable diagram={d} bare={bare} />

  const pad = 7
  const rowH = style === 'timetable' ? 15 : 16
  const colW = d.columns.map((c, ci) => {
    const cells = [c, ...d.rows.map(r => r[ci]), ...(d.footer ? [d.footer[ci]] : [])]
    if (style === 'tally' && ci === d.tallyColumn) {
      const maxN = Math.max(...d.rows.map(r => Number(r[ci]) || 0))
      return Math.max(textW(c, 8) + 2 * pad, Math.floor(maxN / 5) * 17 + (maxN % 5) * 3.2 + 2 * pad + 4)
    }
    return Math.max(...cells.map(v => textW(v ?? '', 8))) + 2 * pad
  })
  const tableW = colW.reduce((a, b) => a + b, 0)
  const rows = d.rows.length + (d.footer ? 1 : 0)
  const headerH = 18
  const receipt = style === 'receipt'
  const topPad = receipt ? 18 : 0
  const bodyH = headerH + rows * rowH
  const tearH = d.torn ? 10 : 0
  const w = tableW + 2
  const h = topPad + bodyH + tearH + (receipt ? 6 : 2)
  const colX = colW.map((_, i) => 1 + colW.slice(0, i).reduce((a, b) => a + b, 0))
  const alignRight = (v: string | number) => typeof v === 'number' || /^[$\d.,−-]+$/.test(String(v))
  const cellX = (ci: number, v: string | number) => (alignRight(v) && ci > 0 ? colX[ci] + colW[ci] - pad : colX[ci] + pad)

  // Receipts are a single outlined docket with dotted separators; the others are ruled grids.
  const ruled = !receipt && style !== 'price_list'
  const tornEdge: [number, number][] = []
  if (d.torn) {
    const yBase = topPad + bodyH
    for (let x = 1, i = 0; x <= w - 1; x += 7, i++) tornEdge.push([x, yBase + (i % 2 === 0 ? 3 : tearH)])
    tornEdge.push([w - 1, yBase + 5])
  }

  return (
    <Frame title={d.title} bare={bare}>
      <Canvas w={w} h={h} fit={fit ?? FULL_WIDTH}>
        {receipt || style === 'price_list' ? (
          d.torn ? (
            // Down the right side, back along the ragged tear, up the left.
            <Polygon points={pts([[1, 1], [w - 1, 1], ...tornEdge.slice().reverse(), [1, topPad + bodyH + 3]])} fill="#fcfcfc" stroke={INK} strokeWidth={0.8} />
          ) : (
            <Rect x={1} y={1} width={w - 2} height={topPad + bodyH + 4} fill="#fcfcfc" stroke={INK} strokeWidth={0.8} />
          )
        ) : null}
        {receipt ? <T x={w / 2} y={12} size={7.5} bold>{d.title ? '' : 'RECEIPT'}</T> : null}
        {/* Header */}
        {style === 'timetable' ? <Rect x={1} y={topPad} width={tableW} height={headerH} fill={SHADES[4]} /> : null}
        {ruled && style !== 'timetable' ? <Rect x={1} y={topPad} width={tableW} height={headerH} fill={SHADES[1]} /> : null}
        {d.columns.map((c, ci) => (
          <T key={ci} x={colX[ci] + pad} y={topPad + 12} size={8} anchor="start" bold fill={style === 'timetable' ? '#fff' : INK}>{c}</T>
        ))}
        {receipt || style === 'price_list' ? <Line x1={4} y1={topPad + headerH - 1} x2={w - 4} y2={topPad + headerH - 1} stroke={INK} strokeWidth={0.6} strokeDasharray="2 2" /> : null}
        {d.rows.map((r, ri) => {
          const y = topPad + headerH + ri * rowH
          return (
            <React.Fragment key={ri}>
              {style === 'timetable' && ri % 2 === 1 ? <Rect x={1} y={y} width={tableW} height={rowH} fill={SHADES[1]} /> : null}
              {r.map((v, ci) =>
                style === 'tally' && ci === d.tallyColumn ? (
                  <Tally key={ci} x={colX[ci] + pad + 2} y={y + rowH - 4} n={Number(v) || 0} />
                ) : (
                  <T key={ci} x={cellX(ci, v)} y={y + rowH - 4.5} size={8} anchor={alignRight(v) && ci > 0 ? 'end' : 'start'} bold={ci === 0 && d.rowHeader}>
                    {typeof v === 'number' ? minus(v) : v}
                  </T>
                )
              )}
            </React.Fragment>
          )
        })}
        {d.footer ? (
          <>
            <Line x1={receipt ? 4 : 1} y1={topPad + headerH + d.rows.length * rowH} x2={receipt ? w - 4 : tableW + 1} y2={topPad + headerH + d.rows.length * rowH} stroke={INK} strokeWidth={0.9} />
            {d.footer.map((v, ci) => (
              <T key={ci} x={cellX(ci, v)} y={topPad + headerH + d.rows.length * rowH + rowH - 4.5} size={8} anchor={alignRight(v) && ci > 0 ? 'end' : 'start'} bold>
                {v}
              </T>
            ))}
          </>
        ) : null}
        {/* Grid lines for ruled styles */}
        {ruled ? (
          <>
            <Rect x={1} y={topPad} width={tableW} height={bodyH} fill="none" stroke={INK} strokeWidth={0.8} />
            {Array.from({ length: rows }, (_, i) => (
              <Line key={`h${i}`} x1={1} y1={topPad + headerH + i * rowH} x2={tableW + 1} y2={topPad + headerH + i * rowH} stroke={INK} strokeWidth={i === 0 ? 0.8 : 0.4} />
            ))}
            {colX.slice(1).map((x, i) => (
              <Line key={`v${i}`} x1={x} y1={topPad} x2={x} y2={topPad + bodyH} stroke={INK} strokeWidth={0.4} />
            ))}
          </>
        ) : null}
      </Canvas>
    </Frame>
  )
}

function GridTable({ diagram, bare }: { diagram: DataTableDiagram; bare?: boolean }) {
  return (
    <View style={bare ? {} : pdfStyles.tableBox} wrap={false}>
      {diagram.title ? <Text style={pdfStyles.graphTitle}>{diagram.title}</Text> : null}
      <View style={pdfStyles.tableGrid}>
        <View style={pdfStyles.tableHeaderRow}>
          {diagram.columns.map((c, i) => (
            <Text key={i} style={[pdfStyles.tableCell, pdfStyles.tableHeaderCell, { width: `${100 / diagram.columns.length}%` }]}>{c}</Text>
          ))}
        </View>
        {diagram.rows.map((row, ri) => (
          <View key={ri} style={pdfStyles.tableRow}>
            {row.map((cell, ci) => (
              <Text key={ci} style={[pdfStyles.tableCell, ci === 0 && diagram.rowHeader ? pdfStyles.tableHeaderCell : {}, { width: `${100 / diagram.columns.length}%` }]}>
                {typeof cell === 'number' ? minus(cell) : String(cell)}
              </Text>
            ))}
          </View>
        ))}
        {diagram.footer ? (
          <View style={pdfStyles.tableRow}>
            {diagram.footer.map((cell, ci) => (
              <Text key={ci} style={[pdfStyles.tableCell, pdfStyles.tableHeaderCell, { width: `${100 / diagram.columns.length}%` }]}>{String(cell)}</Text>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  )
}
