import React from 'react'
import { View, Text, Svg, Rect, Line } from '@react-pdf/renderer'
import { pdfStyles } from '../theme'
import type { SimpleShapeDiagram } from '@/types'
import { arrowHeadWings } from './shared'

// Kept for existing items only. New geometry uses `figure`, which can draw
// any polygon, angle or composite shape — this can draw two.

function DoubleArrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len, uy = dy / len
  const size = 5
  const segments = [
    { x1, y1, x2, y2 },
    ...arrowHeadWings(x1, y1, -ux, -uy, size),
    ...arrowHeadWings(x2, y2, ux, uy, size),
  ]
  return <>{segments.map((s, i) => <Line key={i} {...s} stroke="#333" strokeWidth={1} />)}</>
}

/** Rectangle or right-triangle with labelled sides — for perimeter/area/geometry
 * questions where the figure carries information the text alone doesn't.
 * Each label sits directly against the edge it measures (height labels beside
 * the vertical side, base/width labels under the horizontal side — never
 * grouped in an unrelated list below the shape), with a double-headed arrow
 * spanning that edge so the student can see exactly what's being measured. */
export function SimpleShape({ diagram }: { diagram: SimpleShapeDiagram }) {
  const label = (side: string) => diagram.labels.find(l => l.side === side)?.text
  const GAP = 12 // shape edge → arrow line
  const EDGE_RESERVE = 26 // arrow + label space on a side that has a label
  const MARGIN = 8 // side that has no label

  if (diagram.shape === 'rectangle') {
    const w = 160, h = 90
    const top = label('top'), left = label('left'), bottom = label('bottom'), right = label('right')
    const padTop = top ? EDGE_RESERVE : MARGIN
    const padLeft = left ? EDGE_RESERVE + 30 : MARGIN
    const padBottom = bottom ? EDGE_RESERVE : MARGIN
    const padRight = right ? EDGE_RESERVE + 30 : MARGIN
    const totalW = padLeft + w + padRight
    const totalH = padTop + h + padBottom
    const rx = padLeft, ry = padTop

    return (
      <View style={[pdfStyles.diagramBox, { width: totalW, height: totalH, position: 'relative', alignItems: 'flex-start' }]} wrap={false}>
        <Svg width={totalW} height={totalH}>
          <Rect x={rx} y={ry} width={w} height={h} fill="none" stroke="#333" strokeWidth={1.5} />
          {top ? <DoubleArrow x1={rx} y1={ry - GAP} x2={rx + w} y2={ry - GAP} /> : null}
          {left ? <DoubleArrow x1={rx - GAP} y1={ry} x2={rx - GAP} y2={ry + h} /> : null}
          {bottom ? <DoubleArrow x1={rx} y1={ry + h + GAP} x2={rx + w} y2={ry + h + GAP} /> : null}
          {right ? <DoubleArrow x1={rx + w + GAP} y1={ry} x2={rx + w + GAP} y2={ry + h} /> : null}
        </Svg>
        {top ? <Text style={[pdfStyles.diagramLabel, { position: 'absolute', left: rx, width: w, top: ry - GAP - 11 }]}>{top}</Text> : null}
        {bottom ? <Text style={[pdfStyles.diagramLabel, { position: 'absolute', left: rx, width: w, top: ry + h + GAP + 2 }]}>{bottom}</Text> : null}
        {left ? <Text style={[pdfStyles.diagramLabel, { position: 'absolute', left: 0, width: padLeft - GAP - 4, top: ry + h / 2 - 4, textAlign: 'right' }]}>{left}</Text> : null}
        {right ? <Text style={[pdfStyles.diagramLabel, { position: 'absolute', left: rx + w + GAP + 4, width: padRight - GAP - 4, top: ry + h / 2 - 4, textAlign: 'left' }]}>{right}</Text> : null}
      </View>
    )
  }

  // right_triangle: horizontal base along the bottom, vertical height on the
  // left, right angle at the bottom-left corner, hypotenuse top-left to bottom-right.
  const base = 160, height = 90
  const baseLabel = label('bottom'), heightLabel = label('left'), hypLabel = label('hypotenuse')
  const padTop = hypLabel ? EDGE_RESERVE : MARGIN
  const padLeft = heightLabel ? EDGE_RESERVE + 30 : MARGIN
  const padBottom = baseLabel ? EDGE_RESERVE : MARGIN
  const padRight = hypLabel ? EDGE_RESERVE + 10 : MARGIN
  const totalW = padLeft + base + padRight
  const totalH = padTop + height + padBottom
  const ox = padLeft, oy = padTop

  // Hypotenuse dimension line, offset perpendicular and outward (away from
  // the right-angle corner at bottom-left) from the actual hypotenuse.
  const hypLen = Math.hypot(base, height) || 1
  // 22, not 14: the label is a horizontal text box sitting over a diagonal
  // line, so its two ends reach back towards the line even when its centre
  // clears it. At 14 the text crossed the dimension arrow.
  const offset = 22
  const px = (height / hypLen) * offset, py = -(base / hypLen) * offset
  const hx1 = ox + px, hy1 = oy + py
  const hx2 = ox + base + px, hy2 = oy + height + py
  const hMidX = (hx1 + hx2) / 2, hMidY = (hy1 + hy2) / 2

  return (
    <View style={[pdfStyles.diagramBox, { width: totalW, height: totalH, position: 'relative', alignItems: 'flex-start' }]} wrap={false}>
      <Svg width={totalW} height={totalH}>
        <Line x1={ox} y1={oy + height} x2={ox + base} y2={oy + height} stroke="#333" strokeWidth={1.5} />
        <Line x1={ox} y1={oy} x2={ox} y2={oy + height} stroke="#333" strokeWidth={1.5} />
        <Line x1={ox} y1={oy} x2={ox + base} y2={oy + height} stroke="#333" strokeWidth={1.5} />
        <Rect x={ox} y={oy + height - 10} width={10} height={10} fill="none" stroke="#333" strokeWidth={1} />
        {baseLabel ? <DoubleArrow x1={ox} y1={oy + height + GAP} x2={ox + base} y2={oy + height + GAP} /> : null}
        {heightLabel ? <DoubleArrow x1={ox - GAP} y1={oy} x2={ox - GAP} y2={oy + height} /> : null}
        {hypLabel ? <DoubleArrow x1={hx1} y1={hy1} x2={hx2} y2={hy2} /> : null}
      </Svg>
      {baseLabel ? <Text style={[pdfStyles.diagramLabel, { position: 'absolute', left: ox, width: base, top: oy + height + GAP + 2 }]}>{baseLabel}</Text> : null}
      {heightLabel ? <Text style={[pdfStyles.diagramLabel, { position: 'absolute', left: 0, width: padLeft - GAP - 4, top: oy + height / 2 - 4, textAlign: 'right' }]}>{heightLabel}</Text> : null}
      {hypLabel ? <Text style={[pdfStyles.diagramLabel, { position: 'absolute', left: hMidX - 25, width: 50, top: hMidY - 14, textAlign: 'center' }]}>{hypLabel}</Text> : null}
    </View>
  )
}
