import React from 'react'
import { Line, Rect, Circle } from '@react-pdf/renderer'
import type { SpinnerDiagram, VennDiagram, VennRegion } from '@/types'
import { Canvas, Frame, T, INK, SHADES, Sector, Arrow } from './shared'

type Fit = { fit?: number; bare?: boolean }

/** A spinner: equal sectors clockwise from the top, shaded and labelled, with
 * an arrow. Labels carry the colour words because the paper is greyscale. */
export function Spinner({ diagram: d, fit, bare }: { diagram: SpinnerDiagram } & Fit) {
  const r = 58
  const cx = r + 8, cy = r + 8
  const n = d.sectors.length
  const each = 360 / n
  const defaults = [1, 3, 0, 2, 4] as const
  // Label text must stay readable on dark sectors.
  const pointerAngle = d.pointer === undefined ? 90 : 90 - (d.pointer + 0.5) * each
  const pa = (pointerAngle * Math.PI) / 180
  return (
    <Frame bare={bare}>
      <Canvas w={cx * 2} h={cy * 2} fit={fit}>
        {d.sectors.map((s, i) => {
          const from = 90 - (i + 1) * each
          const to = 90 - i * each
          const shade = s.shade ?? defaults[i % defaults.length]
          const mid = (((from + to) / 2) * Math.PI) / 180
          return (
            <React.Fragment key={i}>
              <Sector cx={cx} cy={cy} r={r} fromDeg={from} toDeg={to} fill={SHADES[shade]} />
              {s.label ? (
                <T x={cx + r * 0.72 * Math.cos(mid)} y={cy - r * 0.72 * Math.sin(mid) + 3} size={n > 8 ? 6.5 : 7.5} fill={shade >= 3 ? '#fff' : INK}>
                  {s.label}
                </T>
              ) : null}
            </React.Fragment>
          )
        })}
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={1.2} />
        <Arrow x1={cx - Math.cos(pa) * 8} y1={cy + Math.sin(pa) * 8} x2={cx + Math.cos(pa) * r * 0.5} y2={cy - Math.sin(pa) * r * 0.5} size={6.5} width={2} />
        <Circle cx={cx} cy={cy} r={3.2} fill={INK} />
      </Canvas>
    </Frame>
  )
}

/**
 * Venn diagram, two or three sets, with values written in regions and/or
 * regions shaded.
 *
 * Shading is drawn as close horizontal scanlines computed from the region's
 * membership test. It prints as a solid tint, and it handles every region —
 * including a three-way intersection or "outside every circle" — with one
 * piece of code instead of hand-built crescent and lens polygons per region.
 */
export function Venn({ diagram: d, fit, bare }: { diagram: VennDiagram } & Fit) {
  const three = d.sets.length === 3
  const W = three ? 250 : 270
  const H = three ? 200 : 162
  const r = three ? 52 : 56
  const circles = three
    ? [
        { x: W / 2 - 30, y: 82 },
        { x: W / 2 + 30, y: 82 },
        { x: W / 2, y: 132 },
      ]
    : [
        { x: W / 2 - 34, y: 92 },
        { x: W / 2 + 34, y: 92 },
      ]
  const inside = (x: number, y: number, i: number) => Math.hypot(x - circles[i].x, y - circles[i].y) <= r
  const regionOf = (x: number, y: number): VennRegion => {
    const m = circles.map((_, i) => inside(x, y, i))
    const key = ['A', 'B', 'C'].filter((_, i) => m[i]).join('')
    return (key || 'none') as VennRegion
  }
  const box = { x: 6, y: 16, w: W - 12, h: H - 22 }

  const shadeLines: React.ReactNode[] = []
  const shaded = new Set(d.shaded ?? [])
  if (shaded.size) {
    for (let y = box.y + 1; y < box.y + box.h - 0.5; y += 1.4) {
      let start: number | null = null
      for (let x = box.x + 0.5; x <= box.x + box.w - 0.5; x += 0.6) {
        const on = shaded.has(regionOf(x, y))
        if (on && start === null) start = x
        if ((!on || x + 0.6 > box.x + box.w - 0.5) && start !== null) {
          shadeLines.push(<Line key={`${y}-${start}`} x1={start} y1={y} x2={x} y2={y} stroke={SHADES[2]} strokeWidth={1.5} />)
          start = null
        }
      }
    }
  }

  // Region label positions, chosen by eye for these fixed layouts.
  const at: Record<VennRegion, [number, number]> = three
    ? {
        A: [W / 2 - 58, 70], B: [W / 2 + 58, 70], C: [W / 2, 165],
        AB: [W / 2, 62], AC: [W / 2 - 34, 122], BC: [W / 2 + 34, 122], ABC: [W / 2, 102],
        none: [W - 24, H - 12],
      }
    : {
        A: [W / 2 - 60, 96], B: [W / 2 + 60, 96], AB: [W / 2, 96],
        C: [0, 0], AC: [0, 0], BC: [0, 0], ABC: [0, 0],
        none: [W - 24, H - 12],
      }

  const labelPos: [number, number][] = three
    ? [[W / 2 - 80, 30], [W / 2 + 80, 30], [W / 2 - 70, H - 10]]
    : [[W / 2 - 64, 31], [W / 2 + 64, 31]]

  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>
        {shadeLines}
        <Rect x={box.x} y={box.y} width={box.w} height={box.h} fill="none" stroke={INK} strokeWidth={0.9} />
        {d.universe ? <T x={box.x + 4} y={box.y - 4} size={7.5} anchor="start">{d.universe}</T> : null}
        {circles.map((c, i) => (
          <Circle key={i} cx={c.x} cy={c.y} r={r} fill="none" stroke={INK} strokeWidth={1} />
        ))}
        {d.sets.map((s, i) => (
          <T key={i} x={labelPos[i][0]} y={labelPos[i][1]} size={8} bold>{s}</T>
        ))}
        {Object.entries(d.values ?? {}).map(([region, v]) => {
          const [x, y] = at[region as VennRegion]
          return <T key={region} x={x} y={y} size={9}>{String(v)}</T>
        })}
      </Canvas>
    </Frame>
  )
}
