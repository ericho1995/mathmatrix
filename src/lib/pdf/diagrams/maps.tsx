import React from 'react'
import { Line, Rect, Circle, Polygon, Polyline } from '@react-pdf/renderer'
import type { GridMapDiagram } from '@/types'
import { Canvas, Frame, T, INK, GRID, SHADES, pts } from './shared'

type Fit = { fit?: number; bare?: boolean }

/** A compass rose centred on (cx, cy). */
function Compass({ cx, cy, r = 16 }: { cx: number; cy: number; r?: number }) {
  return (
    <>
      <Polygon points={pts([[cx, cy - r], [cx + 4, cy], [cx, cy + r], [cx - 4, cy]])} fill={SHADES[2]} stroke={INK} strokeWidth={0.7} />
      <Polygon points={pts([[cx - r, cy], [cx, cy - 4], [cx + r, cy], [cx, cy + 4]])} fill="#fff" stroke={INK} strokeWidth={0.7} />
      <Polygon points={pts([[cx, cy - r], [cx + 4, cy], [cx - 4, cy]])} fill={INK} />
      <T x={cx} y={cy - r - 3} size={8} bold>N</T>
      <T x={cx} y={cy + r + 9} size={8} bold>S</T>
      <T x={cx + r + 6} y={cy + 3} size={8} bold>E</T>
      <T x={cx - r - 6} y={cy + 3} size={8} bold>W</T>
    </>
  )
}

/**
 * A map on a lettered grid. Columns are lettered, rows numbered from the bottom,
 * the way street directories and NAPLAN maps label them; features and points are
 * placed by cell.
 */
export function GridMap({ diagram: d, fit, bare }: { diagram: GridMapDiagram } & Fit) {
  const cols = d.cols.length
  const cell = Math.min(30, 280 / cols, 220 / d.rowCount)
  const padL = 18, padT = 8, padB = 18
  const compassW = d.compass ? 64 : 0
  const gridW = cols * cell, gridH = d.rowCount * cell
  const keyH = d.unitLabel ? 16 : 0
  const W = padL + gridW + 10 + compassW
  const H = padT + gridH + padB + keyH + (!d.labelsOnMap && d.points.length ? 14 : 0)
  const cxOf = (col: string) => padL + d.cols.indexOf(col) * cell + cell / 2
  const cyOf = (row: number) => padT + (d.rowCount - row) * cell + cell / 2
  return (
    <Frame title={d.title} bare={bare}>
      <Canvas w={W} h={H} fit={fit}>
        {(d.areas ?? []).flatMap((a, ai) =>
          a.cells.map((c, ci) => (
            <Rect key={`a${ai}-${ci}`} x={cxOf(c.col) - cell / 2} y={cyOf(c.row) - cell / 2} width={cell} height={cell} fill={SHADES[a.shade ?? 1]} />
          ))
        )}
        {(d.areas ?? []).map((a, ai) => {
          if (!a.label || !a.cells.length) return null
          const x = a.cells.reduce((s, c) => s + cxOf(c.col), 0) / a.cells.length
          const y = a.cells.reduce((s, c) => s + cyOf(c.row), 0) / a.cells.length
          return <T key={`al${ai}`} x={x} y={y + 3} size={7} bold>{a.label}</T>
        })}
        {Array.from({ length: cols + 1 }, (_, i) => (
          <Line key={`v${i}`} x1={padL + i * cell} y1={padT} x2={padL + i * cell} y2={padT + gridH} stroke={i === 0 || i === cols ? INK : GRID} strokeWidth={i === 0 || i === cols ? 1 : 0.6} />
        ))}
        {Array.from({ length: d.rowCount + 1 }, (_, i) => (
          <Line key={`h${i}`} x1={padL} y1={padT + i * cell} x2={padL + gridW} y2={padT + i * cell} stroke={i === 0 || i === d.rowCount ? INK : GRID} strokeWidth={i === 0 || i === d.rowCount ? 1 : 0.6} />
        ))}
        {d.cols.map((c, i) => <T key={`c${i}`} x={padL + i * cell + cell / 2} y={padT + gridH + 11} size={8}>{c}</T>)}
        {Array.from({ length: d.rowCount }, (_, i) => (
          <T key={`r${i}`} x={padL - 5} y={padT + (d.rowCount - 1 - i) * cell + cell / 2 + 3} size={8} anchor="end">{String(i + 1)}</T>
        ))}
        {d.route && d.route.length > 1 ? (
          <Polyline points={pts(d.route.map(p => [cxOf(p.col), cyOf(p.row)] as [number, number]))} fill="none" stroke={INK} strokeWidth={1.6} strokeDasharray="4 2.5" />
        ) : null}
        {d.points.map((p, i) => (
          <React.Fragment key={`p${i}`}>
            <Circle cx={cxOf(p.col)} cy={cyOf(p.row)} r={3.6} fill={INK} />
            {d.labelsOnMap ? <T x={cxOf(p.col)} y={cyOf(p.row) - 6} size={7.5} bold>{p.label}</T> : null}
          </React.Fragment>
        ))}
        {d.compass ? <Compass cx={padL + gridW + 10 + compassW / 2} cy={padT + 34} /> : null}
        {d.unitLabel ? (
          <>
            <Rect x={padL} y={padT + gridH + 18} width={cell * 0.5} height={cell * 0.3} fill="none" stroke={INK} strokeWidth={0.6} />
            <T x={padL + cell * 0.5 + 5} y={padT + gridH + 18 + cell * 0.3 - 1} size={7.5} anchor="start">{`Key: each square = ${d.unitLabel}`}</T>
          </>
        ) : null}
        {!d.labelsOnMap && d.points.length ? (
          <T x={padL} y={H - 3} size={7.5} anchor="start">{d.points.map(p => `${p.label} (${p.col}${p.row})`).join('    ')}</T>
        ) : null}
      </Canvas>
    </Frame>
  )
}
