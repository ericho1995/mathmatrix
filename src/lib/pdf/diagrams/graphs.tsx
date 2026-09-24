import React from 'react'
import { View, Text, Line, Rect, Circle, Polyline, Polygon } from '@react-pdf/renderer'
import { pdfStyles } from '../theme'
import type { FunctionGraphDiagram, NetworkGraphDiagram, MatrixDiagram, PseudocodeDiagram } from '@/types'
import { Canvas, Frame, T, ACCENT, range, minus, arrowHeadWings } from './shared'

type Fit = { fit?: number; bare?: boolean }

/** Curves on Cartesian axes, the graphic VCE Methods papers are built from.
 * Points arrive already sampled, so this only maps data coordinates to the
 * drawing area — no expression is evaluated at render time. */
export function FunctionGraph({ diagram, fit, bare }: { diagram: FunctionGraphDiagram } & Fit) {
  const { xMin, xMax, yMin, yMax } = diagram
  const grid = diagram.grid !== false
  const width = diagram.width ?? 300
  // top leaves room for the y-axis label to sit above the highest tick label.
  const pad = grid ? { left: 30, right: 14, top: 18, bottom: 26 } : { left: 26, right: 26, top: 16, bottom: 20 }
  const plotW = width - pad.left - pad.right
  // Equal aspect: one unit is the same length on both axes, so a circle on an
  // Argand diagram prints as a circle.
  const plotH = diagram.equalAspect ? Math.min(460, (plotW * (yMax - yMin)) / (xMax - xMin)) : 220 - pad.top - pad.bottom
  const height = plotH + pad.top + pad.bottom
  const sx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW
  const sy = (y: number) => pad.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH
  const xTicks = diagram.xTickLabels ? diagram.xTickLabels.map(t => t.x) : diagram.xStep ? range(xMin, xMax, diagram.xStep) : []
  const xText = (t: number) => diagram.xTickLabels?.find(l => l.x === t)?.text ?? minus(t)
  const yTicks = diagram.yStep ? range(yMin, yMax, diagram.yStep) : []
  // Axes sit on zero when it is in range, otherwise on the edge of the plot.
  const axisY = yMin <= 0 && yMax >= 0 ? sy(0) : sy(yMin)
  const axisX = xMin <= 0 && xMax >= 0 ? sx(0) : sx(xMin)

  // Curves are cut where they leave the plotting window (a branch running up
  // an asymptote), so nothing is drawn over the axes' labels.
  const inside = ([, y]: [number, number]) => y >= yMin && y <= yMax
  const clip = (points: [number, number][]) => {
    const runs: [number, number][][] = []
    let run: [number, number][] = []
    const edge = (a: [number, number], b: [number, number]): [number, number] => {
      const yb = b[1] > yMax ? yMax : yMin
      const t = (yb - a[1]) / (b[1] - a[1])
      return [a[0] + t * (b[0] - a[0]), yb]
    }
    points.forEach((p, i) => {
      const prev = points[i - 1]
      if (inside(p)) {
        if (prev && !inside(prev) && Number.isFinite(prev[1])) run.push(edge(p, prev))
        run.push(p)
      } else if (run.length) {
        if (Number.isFinite(p[1])) run.push(edge(prev, p))
        runs.push(run)
        run = []
      }
    })
    if (run.length) runs.push(run)
    return runs.filter(r => r.length > 1)
  }
  const offset = { n: [0, -5], s: [0, 11], e: [5, 3], w: [-5, 3], ne: [4, -4], nw: [-4, -4], se: [4, 10], sw: [-4, 10], c: [0, 3] } as const
  const anchorOf = (at: keyof typeof offset) => (at.endsWith('e') ? 'start' : at.endsWith('w') ? 'end' : 'middle')

  return (
    <Frame title={diagram.title} bare={bare}>
      <Canvas w={width} h={height} fit={fit}>
        {grid ? xTicks.map((t, i) => <Line key={`gx${i}`} x1={sx(t)} y1={pad.top} x2={sx(t)} y2={pad.top + plotH} stroke="#d8d8d8" strokeWidth={0.5} />) : null}
        {grid ? yTicks.map((t, i) => <Line key={`gy${i}`} x1={pad.left} y1={sy(t)} x2={pad.left + plotW} y2={sy(t)} stroke="#d8d8d8" strokeWidth={0.5} />) : null}
        {(diagram.regions ?? []).map((r, ri) => (
          <Polygon key={`rg${ri}`} points={r.points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')} fill="#cfcfcf" fillOpacity={0.7} stroke="none" />
        ))}
        <Line x1={pad.left} y1={axisY} x2={pad.left + plotW} y2={axisY} stroke="#333" strokeWidth={1} />
        <Line x1={axisX} y1={pad.top} x2={axisX} y2={pad.top + plotH} stroke="#333" strokeWidth={1} />
        {!grid ? xTicks.filter(t => t !== 0).map((t, i) => <Line key={`tx${i}`} x1={sx(t)} y1={axisY - 2} x2={sx(t)} y2={axisY + 2} stroke="#333" strokeWidth={0.8} />) : null}
        {!grid ? yTicks.filter(t => t !== 0).map((t, i) => <Line key={`ty${i}`} x1={axisX - 2} y1={sy(t)} x2={axisX + 2} y2={sy(t)} stroke="#333" strokeWidth={0.8} />) : null}
        {xTicks.filter(t => t !== 0).map((t, i) => <T key={`xt${i}`} x={sx(t)} y={axisY + 11} size={7} fill="#444">{xText(t)}</T>)}
        {yTicks.filter(t => t !== 0).map((t, i) => <T key={`yt${i}`} x={axisX - 4} y={sy(t) + 2.5} size={7} anchor="end" fill="#444">{minus(t)}</T>)}
        {(diagram.segments ?? []).map((s, si) => {
          const x1 = sx(s.from[0]), y1 = sy(s.from[1]), x2 = sx(s.to[0]), y2 = sy(s.to[1])
          const len = Math.hypot(x2 - x1, y2 - y1) || 1
          const stroke = s.thin ? '#444' : '#1a1a1a'
          return (
            <React.Fragment key={`sg${si}`}>
              <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={s.thin ? 0.6 : 1} strokeDasharray={s.dashed ? '3 2.5' : undefined} />
              {s.arrow ? arrowHeadWings(x2, y2, (x2 - x1) / len, (y2 - y1) / len, 5).map((w, wi) => <Line key={`sa${wi}`} {...w} stroke={stroke} strokeWidth={1} />) : null}
            </React.Fragment>
          )
        })}
        {diagram.curves.flatMap((curve, ci) =>
          clip(curve.points).map((run, ri) => (
            <Polyline key={`c${ci}-${ri}`} points={run.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')} stroke={ACCENT} strokeWidth={1.4} strokeDasharray={curve.dashed ? '4 3' : curve.dotted ? '1.2 2.2' : undefined} fill="none" />
          )),
        )}
        {(diagram.points ?? []).map((p, pi) => <Circle key={`p${pi}`} cx={sx(p.x)} cy={sy(p.y)} r={2.6} fill="#0F766E" />)}
        {(diagram.openPoints ?? []).map((p, pi) => <Circle key={`o${pi}`} cx={sx(p.x)} cy={sy(p.y)} r={2.6} fill="#ffffff" stroke="#0F766E" strokeWidth={1} />)}
        {(diagram.labels ?? []).map((l, li) => {
          const at = l.at ?? 'ne'
          return <T key={`l${li}`} x={sx(l.x) + offset[at][0]} y={sy(l.y) + offset[at][1]} size={8} anchor={anchorOf(at)}>{l.text}</T>
        })}
        {grid ? (
          <>
            {diagram.xLabel ? <T x={pad.left + plotW} y={axisY + 20} anchor="end" fill="#444">{diagram.xLabel}</T> : null}
            {diagram.yLabel ? <T x={2} y={8} anchor="start" fill="#444">{diagram.yLabel}</T> : null}
          </>
        ) : (
          <>
            {diagram.xLabel ? <T x={pad.left + plotW + 3} y={axisY + 3} anchor="start" fill="#333">{diagram.xLabel}</T> : null}
            {diagram.yLabel ? <T x={axisX} y={pad.top - 5} fill="#333">{diagram.yLabel}</T> : null}
          </>
        )}
      </Canvas>
      {diagram.points?.some(p => p.label) || diagram.curves.some(c => c.label) ? (
        <Text style={pdfStyles.diagramCaption}>
          {[
            ...diagram.curves.filter(c => c.label).map(c => `${c.dashed ? '– – ' : c.dotted ? '· · · ' : '—— '}${c.label}`),
            // A label that is already a coordinate, often an exact one such as
            // (1, e⁻¹), is printed as written rather than followed by decimals.
            ...(diagram.points ?? []).filter(p => p.label).map(p => (p.label!.startsWith('(') ? p.label! : `${p.label} (${p.x}, ${p.y})`)),
          ].join('    ')}
        </Text>
      ) : null}
    </Frame>
  )
}

/** Pseudocode as VCAA prints it: a monospaced listing, keywords in bold,
 * indentation preserved. */
const PSEUDO_KEYWORDS = /\b(define|end define|if|then|else if|else|end if|for|from|to|step|end for|while|do|end while|repeat|until|end repeat|return|print|and|or|not|input|output)\b/g
export function PseudocodeView({ diagram }: { diagram: PseudocodeDiagram }) {
  return (
    <View style={{ marginLeft: 12, marginBottom: 8, marginTop: 2 }} wrap={false}>
      {diagram.title ? <Text style={pdfStyles.graphTitle}>{diagram.title}</Text> : null}
      <View style={{ borderLeft: '2pt solid #bbb', paddingLeft: 10, paddingVertical: 4, backgroundColor: '#fafafa' }}>
        {diagram.lines.map((line, i) => {
          const indent = line.match(/^ */)![0].length
          const body = line.slice(indent)
          const parts: { text: string; bold: boolean }[] = []
          let last = 0
          for (const m of Array.from(body.matchAll(PSEUDO_KEYWORDS))) {
            if (m.index! > last) parts.push({ text: body.slice(last, m.index), bold: false })
            parts.push({ text: m[0], bold: true })
            last = m.index! + m[0].length
          }
          if (last < body.length) parts.push({ text: body.slice(last), bold: false })
          return (
            <Text key={i} style={{ fontFamily: 'DejaVuSansMono', fontSize: 9.5, lineHeight: 1.45, marginLeft: indent * 5.7 }}>
              {parts.length ? parts.map((p, pi) => <Text key={pi} style={p.bold ? { fontWeight: 700 } : {}}>{p.text}</Text>) : ' '}
            </Text>
          )
        })}
      </View>
    </View>
  )
}

/** Vertices and edges for the networks and decision mathematics questions.
 * Vertex positions come from the question (0-100 in each direction) — nothing
 * is laid out at render time, so the same source always draws the same graph. */
export function NetworkGraph({ diagram, fit, bare }: { diagram: NetworkGraphDiagram } & Fit) {
  const width = 300
  const height = 200
  const pad = 22
  const R = 9
  const sx = (x: number) => pad + (x / 100) * (width - 2 * pad)
  const sy = (y: number) => height - pad - (y / 100) * (height - 2 * pad)
  const at = new Map(diagram.vertices.map(v => [v.id, v]))
  return (
    <Frame title={diagram.title} bare={bare}>
      <Canvas w={width} h={height} fit={fit}>
        {diagram.edges.map((e, ei) => {
          const a = at.get(e.from), b = at.get(e.to)
          if (!a || !b) return null
          const ax = sx(a.x), ay = sy(a.y), bx = sx(b.x), by = sy(b.y)
          const dx = bx - ax, dy = by - ay
          const len = Math.hypot(dx, dy) || 1
          const ux = dx / len, uy = dy / len
          // Stop the line at the circle's edge so it never runs under a label.
          const x1 = ax + ux * R, y1 = ay + uy * R
          const x2 = bx - ux * R, y2 = by - uy * R
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
          const ox = -uy * 7, oy = ux * 7
          return (
            <React.Fragment key={`e${ei}`}>
              <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#333" strokeWidth={0.9} />
              {diagram.directed ? arrowHeadWings(x2, y2, ux, uy, 6).map((w, wi) => <Line key={`a${wi}`} {...w} stroke="#333" strokeWidth={0.9} />) : null}
              {e.weight !== undefined ? <T x={mx + ox} y={my + oy + 2.5} fill={ACCENT}>{String(e.weight)}</T> : null}
            </React.Fragment>
          )
        })}
        {diagram.vertices.map(v => (
          <React.Fragment key={v.id}>
            <Circle cx={sx(v.x)} cy={sy(v.y)} r={R} fill="#fff" stroke="#333" strokeWidth={1} />
            <T x={sx(v.x)} y={sy(v.y) + 3}>{v.id}</T>
          </React.Fragment>
        ))}
      </Canvas>
    </Frame>
  )
}

/** A matrix, drawn with the square brackets real papers use. */
export function MatrixView({ diagram, fit, bare }: { diagram: MatrixDiagram } & Fit) {
  const cellW = 30
  const cellH = 15
  const cols = Math.max(...diagram.rows.map(r => r.length), 1)
  const bracketPad = 5
  const gridW = cols * cellW
  const gridH = diagram.rows.length * cellH
  const labelLeft = diagram.rowLabels?.length ? 22 : 0
  const labelTop = diagram.colLabels?.length ? 12 : 0
  const nameW = diagram.name ? 26 : 0
  const width = nameW + labelLeft + bracketPad * 2 + gridW + 12
  const height = labelTop + gridH + 10
  const gridX = nameW + labelLeft + bracketPad
  const tipIn = 4
  return (
    <Frame bare={bare}>
      <Canvas w={width} h={height} fit={fit}>
        {diagram.name ? <T x={0} y={labelTop + gridH / 2 + 3} size={10} anchor="start">{diagram.name}</T> : null}
        {(diagram.colLabels ?? []).map((c, ci) => <T key={`c${ci}`} x={gridX + ci * cellW + cellW / 2} y={labelTop - 2} size={7} fill="#666">{c}</T>)}
        {(diagram.rowLabels ?? []).map((r, ri) => <T key={`r${ri}`} x={nameW + labelLeft - 6} y={labelTop + ri * cellH + cellH / 2 + 3} size={7} anchor="end" fill="#666">{r}</T>)}
        {[gridX - bracketPad, gridX + gridW + bracketPad].map((bx, bi) => {
          const inward = bi === 0 ? tipIn : -tipIn
          const top = labelTop - 2, bottom = labelTop + gridH + 2
          return (
            <React.Fragment key={`br${bi}`}>
              <Line x1={bx} y1={top} x2={bx} y2={bottom} stroke="#1a1a1a" strokeWidth={1} />
              <Line x1={bx} y1={top} x2={bx + inward} y2={top} stroke="#1a1a1a" strokeWidth={1} />
              <Line x1={bx} y1={bottom} x2={bx + inward} y2={bottom} stroke="#1a1a1a" strokeWidth={1} />
            </React.Fragment>
          )
        })}
        {diagram.rows.map((row, ri) =>
          row.map((cell, ci) => (
            <T key={`${ri}-${ci}`} x={gridX + ci * cellW + cellW / 2} y={labelTop + ri * cellH + cellH / 2 + 3} size={9}>
              {minus(cell)}
            </T>
          ))
        )}
        <Rect x={0} y={0} width={0} height={0} fill="none" />
      </Canvas>
    </Frame>
  )
}
