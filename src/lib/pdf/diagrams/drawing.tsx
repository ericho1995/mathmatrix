import React from 'react'
import { Text, Line, Rect, Circle, Polyline, Polygon, Text as SvgText } from '@react-pdf/renderer'
import { pdfStyles } from '../theme'
import type { DrawingDiagram, DrawElement, DrawFill } from '@/types'
import { Canvas, Frame, INK, SVG_FONT } from './shared'

type Fit = { fit?: number; bare?: boolean }

const FILL: Record<DrawFill, string> = {
  none: 'none',
  white: '#ffffff',
  black: INK,
  light: '#e6e6e6',
  mid: '#bdbdbd',
  dark: '#7e7e7e',
}

/** A filled arrowhead at (x, y) pointing along (dx, dy). */
function head(x: number, y: number, dx: number, dy: number, size = 6) {
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len, uy = dy / len
  const bx = x - ux * size, by = y - uy * size
  const px = -uy * size * 0.42, py = ux * size * 0.42
  return `${x},${y} ${bx + px},${by + py} ${bx - px},${by - py}`
}

const pts = (p: [number, number][]) => p.map(([x, y]) => `${x},${y}`).join(' ')

function renderElement(el: DrawElement, i: number) {
  switch (el.t) {
    case 'line': {
      const stroke = el.grey ? '#8a8a8a' : INK
      const w = el.w ?? 1
      const dx = el.x2 - el.x1, dy = el.y2 - el.y1
      return (
        <React.Fragment key={i}>
          <Line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={stroke} strokeWidth={w} strokeDasharray={el.dash ? '4 3' : undefined} />
          {el.arrow === 'end' || el.arrow === 'both' ? <Polygon points={head(el.x2, el.y2, dx, dy, 5 + w * 1.5)} fill={stroke} /> : null}
          {el.arrow === 'start' || el.arrow === 'both' ? <Polygon points={head(el.x1, el.y1, -dx, -dy, 5 + w * 1.5)} fill={stroke} /> : null}
        </React.Fragment>
      )
    }
    case 'poly': {
      const fill = FILL[el.fill ?? 'none']
      const w = el.w ?? 1
      const n = el.points.length
      const tail = n > 1 && el.arrow === 'end' ? <Polygon points={head(el.points[n - 1][0], el.points[n - 1][1], el.points[n - 1][0] - el.points[n - 2][0], el.points[n - 1][1] - el.points[n - 2][1], 5 + w * 1.5)} fill={INK} /> : null
      return (
        <React.Fragment key={i}>
          {el.closed ? (
            <Polygon points={pts(el.points)} fill={fill} stroke={INK} strokeWidth={w} strokeDasharray={el.dash ? '4 3' : undefined} />
          ) : (
            <Polyline points={pts(el.points)} fill="none" stroke={INK} strokeWidth={w} strokeDasharray={el.dash ? '4 3' : undefined} />
          )}
          {tail}
        </React.Fragment>
      )
    }
    case 'rect':
      return (
        <Rect key={i} x={el.x} y={el.y} width={el.w} height={el.h} rx={el.rx} ry={el.rx} fill={FILL[el.fill ?? 'none']}
          stroke={el.noStroke ? 'none' : INK} strokeWidth={1} strokeDasharray={el.dash ? '4 3' : undefined} />
      )
    case 'circle':
      return (
        <Circle key={i} cx={el.cx} cy={el.cy} r={el.r} fill={FILL[el.fill ?? 'none']}
          stroke={el.noStroke ? 'none' : INK} strokeWidth={el.w ?? 1} strokeDasharray={el.dash ? '4 3' : undefined} />
      )
    case 'arc': {
      const steps = Math.max(8, Math.ceil(Math.abs(el.a1 - el.a0) / 6))
      const p: [number, number][] = []
      for (let s = 0; s <= steps; s++) {
        const a = ((el.a0 + ((el.a1 - el.a0) * s) / steps) * Math.PI) / 180
        p.push([el.cx + el.r * Math.cos(a), el.cy - el.r * Math.sin(a)])
      }
      const [x1, y1] = p[p.length - 1], [x0, y0] = p[p.length - 2]
      const [s1x, s1y] = p[0], [s0x, s0y] = p[1]
      return (
        <React.Fragment key={i}>
          <Polyline points={pts(p)} fill="none" stroke={INK} strokeWidth={1} strokeDasharray={el.dash ? '3 2.5' : undefined} />
          {el.arrow === 'end' ? <Polygon points={head(x1, y1, x1 - x0, y1 - y0, 6)} fill={INK} /> : null}
          {el.arrow === 'start' ? <Polygon points={head(s1x, s1y, s1x - s0x, s1y - s0y, 6)} fill={INK} /> : null}
        </React.Fragment>
      )
    }
    case 'text':
      return (
        <SvgText key={i} x={el.x} y={el.y} fill={INK} textAnchor={el.anchor ?? 'middle'}
          style={{ fontSize: el.size ?? 9, fontFamily: SVG_FONT, fontWeight: el.bold ? 700 : 400, fontStyle: el.italic ? 'italic' : 'normal' }}>
          {el.text}
        </SvgText>
      )
  }
}

/** A physics drawing: apparatus, circuits, fields and free-body sketches. */
export function DrawingView({ diagram, fit, bare }: { diagram: DrawingDiagram } & Fit) {
  return (
    <Frame title={diagram.title} bare={bare}>
      <Canvas w={diagram.width} h={diagram.height} fit={fit}>
        {diagram.elements.map(renderElement)}
      </Canvas>
      {diagram.caption ? <Text style={[pdfStyles.diagramCaption, { textAlign: 'center' }]}>{diagram.caption}</Text> : null}
    </Frame>
  )
}
