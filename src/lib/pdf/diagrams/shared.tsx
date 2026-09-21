import React from 'react'
import { View, Text, Svg, Line, Polyline, Polygon, Text as SvgText } from '@react-pdf/renderer'
import { pdfStyles } from '../theme'
import type { Shade } from '@/types'

/**
 * Drawing primitives shared by every diagram renderer.
 *
 * Every renderer draws into a fixed-size coordinate space and hands it to
 * <Canvas>, which scales it to the room available. That one rule is what lets a
 * diagram appear full width above a question *and* at half size as a picture
 * answer option without a second implementation — the whole drawing, text
 * included, scales through the SVG viewBox.
 */

// Text inside <Svg> does not inherit the page font. It falls back to Helvetica,
// whose WinAnsi encoding silently drops U+2212 and friends, so "−3" prints as
// "3" with no error anywhere. Every SvgText here names the embedded font.
export const SVG_FONT = 'DejaVuSans'

export const INK = '#1a1a1a'
export const MUTED = '#555555'
export const GRID = '#cfcfcf'
export const ACCENT = '#185FA5'

/** Greyscale fills for Shade 0-4. Real papers are printed in greyscale. */
export const SHADES = ['#ffffff', '#e4e4e4', '#b9b9b9', '#7e7e7e', '#3b3b3b'] as const
export const shadeFill = (s: Shade | undefined, fallback: Shade = 0) => SHADES[s ?? fallback]

/** Full column width available to a diagram, in points. */
export const FULL_WIDTH = 440

/** Real papers set negatives with a minus sign, not a hyphen. */
export const minus = (v: number | string) => String(v).replace(/^-/, '−')

/** Rounds away floating-point noise so tick labels read 0.3, not 0.30000000000000004. */
export const clean = (v: number) => Number(v.toFixed(6))

export function range(min: number, max: number, step: number): number[] {
  if (!(step > 0)) return []
  const out: number[] = []
  for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + 1e-9; v += step) out.push(clean(v))
  return out
}

/** The frame every diagram sits in: optional title, centred drawing. */
export function Frame({ title, children, bare }: { title?: string; children: React.ReactNode; bare?: boolean }) {
  return (
    <View style={bare ? { alignItems: 'center' } : pdfStyles.diagramBox} wrap={false}>
      {title ? <Text style={pdfStyles.graphTitle}>{title}</Text> : null}
      {children}
    </View>
  )
}

/** An SVG drawing of natural size w × h, scaled down to fit `fit` points. */
export function Canvas({ w, h, fit = FULL_WIDTH, children }: { w: number; h: number; fit?: number; children: React.ReactNode }) {
  const s = Math.min(1, fit / w)
  return (
    <Svg width={w * s} height={h * s} viewBox={`0 0 ${w} ${h}`}>
      {children}
    </Svg>
  )
}

export function T({
  x,
  y,
  children,
  size = 8,
  anchor = 'middle',
  fill = INK,
  bold = false,
}: {
  x: number
  y: number
  children: React.ReactNode
  size?: number
  anchor?: 'start' | 'middle' | 'end'
  fill?: string
  bold?: boolean
}) {
  return (
    <SvgText x={x} y={y} fill={fill} textAnchor={anchor} style={{ fontSize: size, fontFamily: SVG_FONT, fontWeight: bold ? 700 : 400 }}>
      {children}
    </SvgText>
  )
}

/** Points on a circular arc, angles in degrees, 0° = east, counter-clockwise, y down on the page. */
export function arcPoints(cx: number, cy: number, r: number, fromDeg: number, toDeg: number, steps = 24): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const a = ((fromDeg + ((toDeg - fromDeg) * i) / steps) * Math.PI) / 180
    out.push([cx + r * Math.cos(a), cy - r * Math.sin(a)])
  }
  return out
}

export const pts = (ps: [number, number][]) => ps.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')

/**
 * A filled circular sector, as a polygon.
 *
 * Arcs are sampled into polygons rather than drawn with SVG arc commands: the
 * result is identical in print and there is no dependence on how the PDF
 * backend interprets arc flags.
 */
export function Sector({
  cx,
  cy,
  r,
  fromDeg,
  toDeg,
  fill,
  stroke = INK,
}: {
  cx: number
  cy: number
  r: number
  fromDeg: number
  toDeg: number
  fill: string
  stroke?: string
}) {
  const steps = Math.max(6, Math.ceil(Math.abs(toDeg - fromDeg) / 6))
  return <Polygon points={pts([[cx, cy], ...arcPoints(cx, cy, r, fromDeg, toDeg, steps)])} fill={fill} stroke={stroke} strokeWidth={0.8} />
}

export function Arc({ cx, cy, r, fromDeg, toDeg, stroke = INK, width = 0.8 }: { cx: number; cy: number; r: number; fromDeg: number; toDeg: number; stroke?: string; width?: number }) {
  return <Polyline points={pts(arcPoints(cx, cy, r, fromDeg, toDeg))} fill="none" stroke={stroke} strokeWidth={width} />
}

// ── Arrows ───────────────────────────────────────────────────────────────────

export function arrowHeadWings(tipX: number, tipY: number, dirX: number, dirY: number, size: number) {
  const wingAngle = 0.45 // ~26 degrees
  const cos = Math.cos(wingAngle), sin = Math.sin(wingAngle)
  const rx = -dirX, ry = -dirY // back along the shaft, from the tip
  const w1x = rx * cos - ry * sin, w1y = rx * sin + ry * cos
  const w2x = rx * cos + ry * sin, w2y = -rx * sin + ry * cos
  return [
    { x1: tipX, y1: tipY, x2: tipX + w1x * size, y2: tipY + w1y * size },
    { x1: tipX, y1: tipY, x2: tipX + w2x * size, y2: tipY + w2y * size },
  ]
}

export function Arrow({ x1, y1, x2, y2, size = 5, stroke = INK, width = 1, both = false }: { x1: number; y1: number; x2: number; y2: number; size?: number; stroke?: string; width?: number; both?: boolean }) {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len, uy = dy / len
  const segs = [{ x1, y1, x2, y2 }, ...arrowHeadWings(x2, y2, ux, uy, size), ...(both ? arrowHeadWings(x1, y1, -ux, -uy, size) : [])]
  return <>{segs.map((s, i) => <Line key={i} {...s} stroke={stroke} strokeWidth={width} />)}</>
}

/** "not to scale", the way real papers print it — small, bottom right. */
export function NotToScale({ x, y }: { x: number; y: number }) {
  return (
    <T x={x} y={y} size={7} anchor="end" fill={MUTED}>
      not to scale
    </T>
  )
}

/** Wraps a label to at most `max` characters per line, for chart categories. */
export function wrapLabel(label: string, max = 12): string[] {
  const words = label.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    if (line && (line + ' ' + w).length > max) {
      lines.push(line)
      line = w
    } else line = line ? `${line} ${w}` : w
  }
  if (line) lines.push(line)
  return lines
}

/** A key box: shade swatches and labels in a column. */
export function Key({ x, y, items, title = 'KEY' }: { x: number; y: number; items: { fill: string; label: string }[]; title?: string }) {
  const rowH = 12
  const w = Math.max(...items.map(i => i.label.length)) * 4.6 + 26
  const h = items.length * rowH + 16
  return (
    <>
      <Polygon points={pts([[x, y], [x + w, y], [x + w, y + h], [x, y + h]])} fill="#fff" stroke={INK} strokeWidth={0.6} />
      <T x={x + w / 2} y={y + 9} size={7} bold>
        {title}
      </T>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          <Polygon
            points={pts([[x + 5, y + 13 + i * rowH], [x + 13, y + 13 + i * rowH], [x + 13, y + 21 + i * rowH], [x + 5, y + 21 + i * rowH]])}
            fill={it.fill}
            stroke={INK}
            strokeWidth={0.6}
          />
          <T x={x + 17} y={y + 20 + i * rowH} size={7} anchor="start">
            {it.label}
          </T>
        </React.Fragment>
      ))}
    </>
  )
}

/** Width a Key will need, so a chart can reserve room for it. */
export const keyWidth = (labels: string[]) => Math.max(...labels.map(l => l.length)) * 4.6 + 26
