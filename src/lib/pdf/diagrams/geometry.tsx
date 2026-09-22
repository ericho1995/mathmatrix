import React from 'react'
import { Line, Rect, Circle, Polygon, Polyline, Ellipse } from '@react-pdf/renderer'
import type { FigureDiagram, GridShapeDiagram, CoordinatePlaneDiagram, SolidDiagram, NetDiagram } from '@/types'
import { Canvas, Frame, T, INK, MUTED, GRID, SHADES, shadeFill, pts, minus, range, NotToScale, arrowHeadWings } from './shared'

type Fit = { fit?: number; bare?: boolean }
type XY = [number, number]

// ── Figure ───────────────────────────────────────────────────────────────────

const LABEL_OFFSETS: Record<string, XY> = {
  n: [0, -7], s: [0, 12], e: [8, 3], w: [-8, 3], ne: [7, -5], nw: [-7, -5], se: [7, 11], sw: [-7, 11],
}

/**
 * A general labelled figure. Figure coordinates have y up; they are mapped to
 * the page once, here, so every mark below works in page space.
 */
export function Figure({ diagram: d, fit, bare }: { diagram: FigureDiagram } & Fit) {
  const s = Math.min(300 / d.width, 170 / d.height)
  const pad = 30
  const W = d.width * s + pad * 2
  const H = d.height * s + pad * 2 + (d.notToScale ? 8 : 0)
  const map = (x: number, y: number): XY => [pad + x * s, pad + (d.height - y) * s]
  const P = new Map(d.points.map(p => [p.id, { ...p, xy: map(p.x, p.y) }]))
  const cx = d.points.reduce((a, p) => a + p.x, 0) / d.points.length
  const cy = d.points.reduce((a, p) => a + p.y, 0) / d.points.length
  const get = (id: string) => {
    const p = P.get(id)
    if (!p) throw new Error(`figure: unknown point "${id}"`)
    return p
  }

  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>
        {(d.polygons ?? []).map((poly, i) => (
          <Polygon key={`pg${i}`} points={pts(poly.points.map(id => get(id).xy))} fill={shadeFill(poly.shade)} stroke={INK} strokeWidth={1.1} strokeDasharray={poly.dashed ? '4 3' : undefined} />
        ))}
        {(d.circles ?? []).map((c, i) => {
          const [x, y] = get(c.center).xy
          return <Circle key={`c${i}`} cx={x} cy={y} r={c.r * s} fill={c.shade === undefined ? 'none' : SHADES[c.shade]} stroke={INK} strokeWidth={1.1} strokeDasharray={c.dashed ? '4 3' : undefined} />
        })}
        {(d.arcs ?? []).map((a, i) => {
          const c = get(a.center)
          const ps: XY[] = []
          for (let t = 0; t <= 32; t++) {
            const ang = ((a.fromDeg + ((a.toDeg - a.fromDeg) * t) / 32) * Math.PI) / 180
            ps.push(map(c.x + a.r * Math.cos(ang), c.y + a.r * Math.sin(ang)))
          }
          return <Polyline key={`arc${i}`} points={pts(ps)} fill="none" stroke={INK} strokeWidth={1.1} strokeDasharray={a.dashed ? '4 3' : undefined} />
        })}
        {(d.segments ?? []).map((seg, i) => {
          let [x1, y1] = get(seg.from).xy
          let [x2, y2] = get(seg.to).xy
          const len = Math.hypot(x2 - x1, y2 - y1) || 1
          const ux = (x2 - x1) / len, uy = (y2 - y1) / len
          if (seg.extend) {
            x1 -= ux * 18; y1 -= uy * 18; x2 += ux * 18; y2 += uy * 18
          }
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
          const lp = seg.labelPos ?? 0.5
          const lx = x1 + (x2 - x1) * lp, ly = y1 + (y2 - y1) * lp
          // Normal pointing to the left of from→to as seen on the page.
          const side = seg.labelSide === 'right' ? -1 : 1
          const nx = uy * side, ny = -ux * side
          const marks: React.ReactNode[] = []
          for (let t = 0; t < (seg.ticks ?? 0); t++) {
            const o = (t - ((seg.ticks ?? 1) - 1) / 2) * 3.5
            marks.push(<Line key={`t${t}`} x1={mx + ux * o - nx * 4} y1={my + uy * o - ny * 4} x2={mx + ux * o + nx * 4} y2={my + uy * o + ny * 4} stroke={INK} strokeWidth={1} />)
          }
          for (let a = 0; a < (seg.arrows ?? 0); a++) {
            const o = a * 4.5
            for (const wg of arrowHeadWings(mx + ux * (o + 3), my + uy * (o + 3), ux, uy, 5)) marks.push(<Line key={`a${a}-${wg.x2}`} {...wg} stroke={INK} strokeWidth={1} />)
          }
          return (
            <React.Fragment key={`s${i}`}>
              <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={seg.heavy ? 2 : 1.1} strokeDasharray={seg.dashed ? '4 3' : undefined} />
              {marks}
              {seg.label ? (
                // Beside a mostly vertical line the label hangs off to one side
                // (anchored at its near end); beside a mostly horizontal one it
                // centres above or below. Centring beside a vertical line put the
                // text across the line itself.
                Math.abs(nx) > 0.45 ? (
                  <T x={lx + nx * 6} y={ly + ny * 6 + 3} size={8} anchor={nx > 0 ? 'start' : 'end'}>{seg.label}</T>
                ) : (
                  <T x={lx + nx * 9} y={ly + ny * 9 + (ny > 0 ? 6 : 0)} size={8}>{seg.label}</T>
                )
              ) : null}
            </React.Fragment>
          )
        })}
        {(d.angles ?? []).map((a, i) => {
          const V = get(a.at), A = get(a.from), B = get(a.to)
          // Work in figure space (y up) so atan2 gives conventional angles.
          const a1 = Math.atan2(A.y - V.y, A.x - V.x)
          let a2 = Math.atan2(B.y - V.y, B.x - V.x)
          let sweep = a2 - a1
          while (sweep <= -Math.PI) sweep += 2 * Math.PI
          while (sweep > Math.PI) sweep -= 2 * Math.PI
          a2 = a1 + sweep
          const [vx, vy] = V.xy
          if (a.right) {
            const k = 8
            const p1: XY = [vx + Math.cos(a1) * k, vy - Math.sin(a1) * k]
            const p2: XY = [vx + Math.cos(a2) * k, vy - Math.sin(a2) * k]
            const p3: XY = [p1[0] + Math.cos(a2) * k, p1[1] - Math.sin(a2) * k]
            return <Polyline key={`an${i}`} points={pts([p1, p3, p2])} fill="none" stroke={INK} strokeWidth={0.9} />
          }
          const arcs: React.ReactNode[] = []
          for (let k = 0; k < (a.arcs ?? 1); k++) {
            const r = 13 + k * 3.5
            const ps: XY[] = []
            for (let t = 0; t <= 16; t++) {
              const ang = a1 + (sweep * t) / 16
              ps.push([vx + Math.cos(ang) * r, vy - Math.sin(ang) * r])
            }
            arcs.push(<Polyline key={`arc${k}`} points={pts(ps)} fill="none" stroke={INK} strokeWidth={0.9} />)
          }
          const mid = a1 + sweep / 2
          // Long labels such as "(2x + 7)°" sit further out so they clear the
          // arms of the angle instead of lying across them.
          const lr = Math.max(Math.abs(sweep) < 0.6 ? 34 : 25, 16 + (a.label?.length ?? 0) * 2.8)
          return (
            <React.Fragment key={`an${i}`}>
              {arcs}
              {a.label ? <T x={vx + Math.cos(mid) * lr} y={vy - Math.sin(mid) * lr + 3} size={8}>{a.label}</T> : null}
            </React.Fragment>
          )
        })}
        {d.points.map(p => {
          const pp = get(p.id)
          const [x, y] = pp.xy
          // Default label position: away from the figure's centre.
          let dir = p.labelAt
          if (!dir && p.label) {
            const dx = p.x - cx, dy = p.y - cy
            const ns = Math.abs(dy) > Math.abs(dx) * 0.4 ? (dy > 0 ? 'n' : 's') : ''
            const ew = Math.abs(dx) > Math.abs(dy) * 0.4 ? (dx > 0 ? 'e' : 'w') : ''
            dir = ((ns + ew) || 'n') as typeof p.labelAt
          }
          const [ox, oy] = LABEL_OFFSETS[dir ?? 'n']
          return (
            <React.Fragment key={`pt${p.id}`}>
              {p.dot ? <Circle cx={x} cy={y} r={2} fill={INK} /> : null}
              {p.label ? <T x={x + ox} y={y + oy} size={8.5} anchor={ox > 1 ? 'start' : ox < -1 ? 'end' : 'middle'}>{p.label}</T> : null}
            </React.Fragment>
          )
        })}
        {(d.texts ?? []).map((t, i) => {
          const [x, y] = map(t.x, t.y)
          return <T key={`tx${i}`} x={x} y={y + 3} size={8}>{t.text}</T>
        })}
        {d.notToScale ? <NotToScale x={W - 4} y={H - 4} /> : null}
      </Canvas>
    </Frame>
  )
}

// ── Shapes on a grid ─────────────────────────────────────────────────────────

export function GridShape({ diagram: d, fit, bare }: { diagram: GridShapeDiagram } & Fit) {
  const cell = Math.min(20, 300 / d.cols, 190 / d.rows)
  const pad = 10
  // A key such as "Each small square has sides of 1 cm" can be wider than a
  // small grid; widen the canvas to fit it and centre the grid instead.
  const gridW = d.cols * cell + pad * 2
  const W = Math.max(gridW, d.key ? d.key.length * 7.5 * 0.6 + pad * 2 : 0)
  const ox = (W - gridW) / 2 + pad
  const H = d.rows * cell + pad * 2 + (d.key ? 14 : 0)
  const gx = (x: number) => ox + x * cell
  const gy = (y: number) => pad + (d.rows - y) * cell
  const grid = d.grid ?? 'square'
  const fills: React.ReactNode[] = []
  ;(d.cells ?? []).forEach((row, ri) => {
    row.split('').forEach((ch, ci) => {
      if (ch === '#' || ch === 'x') fills.push(<Rect key={`f${ri}-${ci}`} x={ox + ci * cell} y={pad + ri * cell} width={cell} height={cell} fill={ch === 'x' ? SHADES[3] : SHADES[2]} />)
    })
  })
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>
        {fills}
        {grid === 'square' ? (
          <>
            {range(0, d.cols, 1).map(x => <Line key={`v${x}`} x1={gx(x)} y1={gy(0)} x2={gx(x)} y2={gy(d.rows)} stroke={GRID} strokeWidth={0.6} />)}
            {range(0, d.rows, 1).map(y => <Line key={`h${y}`} x1={gx(0)} y1={gy(y)} x2={gx(d.cols)} y2={gy(y)} stroke={GRID} strokeWidth={0.6} />)}
          </>
        ) : grid === 'dot' ? (
          range(0, d.cols, 1).flatMap(x => range(0, d.rows, 1).map(y => <Circle key={`d${x}-${y}`} cx={gx(x)} cy={gy(y)} r={0.9} fill={MUTED} />))
        ) : null}
        {/* Outline every shaded cell's boundary so shaded regions read as shapes. */}
        {(d.cells ?? []).flatMap((row, ri) =>
          row.split('').flatMap((ch, ci) => {
            if (ch !== '#' && ch !== 'x') return []
            const filled = (r: number, c: number) => ['#', 'x'].includes(d.cells?.[r]?.[c] ?? '.')
            const x0 = ox + ci * cell, y0 = pad + ri * cell
            const edges: React.ReactNode[] = []
            if (!filled(ri - 1, ci)) edges.push(<Line key={`e${ri}-${ci}-t`} x1={x0} y1={y0} x2={x0 + cell} y2={y0} stroke={INK} strokeWidth={1.1} />)
            if (!filled(ri + 1, ci)) edges.push(<Line key={`e${ri}-${ci}-b`} x1={x0} y1={y0 + cell} x2={x0 + cell} y2={y0 + cell} stroke={INK} strokeWidth={1.1} />)
            if (!filled(ri, ci - 1)) edges.push(<Line key={`e${ri}-${ci}-l`} x1={x0} y1={y0} x2={x0} y2={y0 + cell} stroke={INK} strokeWidth={1.1} />)
            if (!filled(ri, ci + 1)) edges.push(<Line key={`e${ri}-${ci}-r`} x1={x0 + cell} y1={y0} x2={x0 + cell} y2={y0 + cell} stroke={INK} strokeWidth={1.1} />)
            return edges
          })
        )}
        {(d.shapes ?? []).map((sh, i) => (
          <React.Fragment key={`s${i}`}>
            <Polygon points={pts(sh.points.map(([x, y]) => [gx(x), gy(y)] as XY))} fill={sh.shade === undefined ? 'none' : SHADES[sh.shade]} stroke={INK} strokeWidth={1.3} strokeDasharray={sh.dashed ? '4 3' : undefined} />
            {sh.label ? (
              <T x={sh.points.reduce((a, p) => a + gx(p[0]), 0) / sh.points.length} y={sh.points.reduce((a, p) => a + gy(p[1]), 0) / sh.points.length + 3} size={9} bold>
                {sh.label}
              </T>
            ) : null}
          </React.Fragment>
        ))}
        {(d.lines ?? []).map((l, i) => (
          <Line key={`l${i}`} x1={gx(l.from[0])} y1={gy(l.from[1])} x2={gx(l.to[0])} y2={gy(l.to[1])} stroke={INK} strokeWidth={l.heavy ? 2 : 1.2} strokeDasharray={l.dashed ? '5 3' : undefined} />
        ))}
        {(d.labels ?? []).map((l, i) => (
          <T key={`lb${i}`} x={gx(l.at[0])} y={gy(l.at[1]) + 3} size={8}>{l.text}</T>
        ))}
        {d.key ? <T x={W / 2} y={H - 3} size={7.5} fill={MUTED}>{d.key}</T> : null}
      </Canvas>
    </Frame>
  )
}

// ── Cartesian plane ──────────────────────────────────────────────────────────

export function CoordinatePlane({ diagram: d, fit, bare }: { diagram: CoordinatePlaneDiagram } & Fit) {
  const step = d.step ?? 1
  const every = d.labelEvery ?? 1
  const cols = (d.xMax - d.xMin) / step
  const rows = (d.yMax - d.yMin) / step
  const cell = Math.min(18, 300 / cols, 230 / rows)
  const pad = 20
  const W = cols * cell + pad * 2
  const H = rows * cell + pad * 2
  const sx = (x: number) => pad + ((x - d.xMin) / step) * cell
  const sy = (y: number) => pad + ((d.yMax - y) / step) * cell
  const ax = d.xMin <= 0 && d.xMax >= 0 ? sx(0) : sx(d.xMin)
  const ay = d.yMin <= 0 && d.yMax >= 0 ? sy(0) : sy(d.yMin)
  const xs = range(d.xMin, d.xMax, step)
  const ys = range(d.yMin, d.yMax, step)
  const labelled = (v: number) => v !== 0 && Math.round(v / step) % every === 0
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>
        {d.grid !== false ? (
          <>
            {xs.map(x => <Line key={`gx${x}`} x1={sx(x)} y1={sy(d.yMin)} x2={sx(x)} y2={sy(d.yMax)} stroke={GRID} strokeWidth={0.5} />)}
            {ys.map(y => <Line key={`gy${y}`} x1={sx(d.xMin)} y1={sy(y)} x2={sx(d.xMax)} y2={sy(y)} stroke={GRID} strokeWidth={0.5} />)}
          </>
        ) : null}
        <Line x1={sx(d.xMin) - 6} y1={ay} x2={sx(d.xMax) + 6} y2={ay} stroke={INK} strokeWidth={1} />
        <Line x1={ax} y1={sy(d.yMax) - 6} x2={ax} y2={sy(d.yMin) + 6} stroke={INK} strokeWidth={1} />
        {arrowHeadWings(sx(d.xMax) + 6, ay, 1, 0, 4).map((w, i) => <Line key={`ax${i}`} {...w} stroke={INK} strokeWidth={1} />)}
        {arrowHeadWings(ax, sy(d.yMax) - 6, 0, -1, 4).map((w, i) => <Line key={`ay${i}`} {...w} stroke={INK} strokeWidth={1} />)}
        <T x={sx(d.xMax) + 10} y={ay + 3} size={8} anchor="start">x</T>
        <T x={ax} y={sy(d.yMax) - 10} size={8}>y</T>
        {xs.filter(labelled).map(x => <T key={`lx${x}`} x={sx(x)} y={ay + 10} size={6.5}>{minus(x)}</T>)}
        {ys.filter(labelled).map(y => <T key={`ly${y}`} x={ax - 4} y={sy(y) + 2.5} size={6.5} anchor="end">{minus(y)}</T>)}
        {(d.segments ?? []).map((s, i) => (
          <Line key={`sg${i}`} x1={sx(s.from[0])} y1={sy(s.from[1])} x2={sx(s.to[0])} y2={sy(s.to[1])} stroke={INK} strokeWidth={1.3} strokeDasharray={s.dashed ? '4 3' : undefined} />
        ))}
        {(d.shapes ?? []).map((sh, i) => {
          const ps = sh.points.map(([x, y]) => [sx(x), sy(y)] as XY)
          return (
            <React.Fragment key={`sh${i}`}>
              <Polygon points={pts(ps)} fill={sh.shade === undefined ? 'none' : SHADES[sh.shade]} stroke={INK} strokeWidth={1.3} strokeDasharray={sh.dashed ? '4 3' : undefined} />
              {sh.label ? <T x={ps.reduce((a, p) => a + p[0], 0) / ps.length} y={ps.reduce((a, p) => a + p[1], 0) / ps.length + 3} size={8.5} bold>{sh.label}</T> : null}
            </React.Fragment>
          )
        })}
        {(d.points ?? []).map((p, i) => (
          <React.Fragment key={`p${i}`}>
            <Circle cx={sx(p.x)} cy={sy(p.y)} r={2.4} fill={INK} />
            {p.label ? <T x={sx(p.x) + 5} y={sy(p.y) - 4} size={8.5} anchor="start">{p.label}</T> : null}
          </React.Fragment>
        ))}
      </Canvas>
    </Frame>
  )
}

// ── Solids ───────────────────────────────────────────────────────────────────

/** Oblique projection: depth runs up and to the right at 35°, drawn at 55%. */
const DEPTH = { x: Math.cos((35 * Math.PI) / 180) * 0.55, y: Math.sin((35 * Math.PI) / 180) * 0.55 }

export function Solid({ diagram: d, fit, bare }: { diagram: SolidDiagram } & Fit) {
  if (d.shape === 'cubes') return <CubeStack diagram={d} fit={fit} bare={bare} />
  const [pl, pw, ph] = d.proportions ?? (d.shape === 'cube' ? [2, 2, 2] : [3, 2, 1.6])
  const unit = 190 / Math.max(pl + pw * DEPTH.x, ph + pw * DEPTH.y + 0.4) * 0.72
  const L = pl * unit, Wd = pw * unit, Hh = ph * unit
  const dx = Wd * DEPTH.x, dy = Wd * DEPTH.y
  const padL = 38, padB = 26, padT = 12, padR = 44
  const Wc = padL + L + dx + padR
  const Hc = padT + Hh + dy + padB + (d.notToScale ? 8 : 0)
  const x0 = padL, y0 = padT + dy + Hh // front-bottom-left, page coords
  const lbl = d.labels ?? {}
  const solid = { stroke: INK, strokeWidth: 1.2 }
  const hidden = { stroke: INK, strokeWidth: 0.9, strokeDasharray: '3 2.5' }
  const content: React.ReactNode[] = []

  if (d.shape === 'cuboid' || d.shape === 'cube') {
    const F = { bl: [x0, y0], br: [x0 + L, y0], tr: [x0 + L, y0 - Hh], tl: [x0, y0 - Hh] } as Record<string, XY>
    const B = Object.fromEntries(Object.entries(F).map(([k, [x, y]]) => [k, [x + dx, y - dy] as XY])) as Record<string, XY>
    content.push(
      <Polygon key="top" points={pts([F.tl, F.tr, B.tr, B.tl])} fill={SHADES[1]} {...solid} />,
      <Polygon key="side" points={pts([F.br, B.br, B.tr, F.tr])} fill={SHADES[2]} {...solid} />,
      <Polygon key="front" points={pts([F.bl, F.br, F.tr, F.tl])} fill="#fff" {...solid} />,
      <Line key="h1" x1={B.bl[0]} y1={B.bl[1]} x2={B.br[0]} y2={B.br[1]} {...hidden} />,
      <Line key="h2" x1={B.bl[0]} y1={B.bl[1]} x2={B.tl[0]} y2={B.tl[1]} {...hidden} />,
      <Line key="h3" x1={B.bl[0]} y1={B.bl[1]} x2={F.bl[0]} y2={F.bl[1]} {...hidden} />,
    )
    if (lbl.length) content.push(<T key="ll" x={x0 + L / 2} y={y0 + 13} size={8.5}>{lbl.length}</T>)
    if (lbl.height) content.push(<T key="lh" x={x0 - 6} y={y0 - Hh / 2 + 3} size={8.5} anchor="end">{lbl.height}</T>)
    if (lbl.width) content.push(<T key="lw" x={x0 + L + dx / 2 + 6} y={y0 - dy / 2 + 8} size={8.5} anchor="start">{lbl.width}</T>)
  } else if (d.shape === 'triangular_prism') {
    const F = { bl: [x0, y0], br: [x0 + L, y0], ap: [x0 + L / 2, y0 - Hh] } as Record<string, XY>
    const B = Object.fromEntries(Object.entries(F).map(([k, [x, y]]) => [k, [x + dx, y - dy] as XY])) as Record<string, XY>
    content.push(
      <Polygon key="r" points={pts([F.br, B.br, B.ap, F.ap])} fill={SHADES[2]} {...solid} />,
      <Polygon key="f" points={pts([F.bl, F.br, F.ap])} fill="#fff" {...solid} />,
      <Line key="h1" x1={F.bl[0]} y1={F.bl[1]} x2={B.bl[0]} y2={B.bl[1]} {...hidden} />,
      <Line key="h2" x1={B.bl[0]} y1={B.bl[1]} x2={B.br[0]} y2={B.br[1]} {...hidden} />,
      <Line key="h3" x1={B.bl[0]} y1={B.bl[1]} x2={B.ap[0]} y2={B.ap[1]} {...hidden} />,
      <Line key="e1" x1={F.ap[0]} y1={F.ap[1]} x2={B.ap[0]} y2={B.ap[1]} {...solid} />,
    )
    if (lbl.length) content.push(<T key="ll" x={x0 + L / 2} y={y0 + 13} size={8.5}>{lbl.length}</T>)
    if (lbl.height) {
      content.push(<Line key="hl" x1={F.ap[0]} y1={F.ap[1]} x2={F.ap[0]} y2={y0} {...hidden} />)
      // Left of the dashed height: the hidden back edges cross the right side.
      content.push(<T key="lh" x={F.ap[0] - 4} y={y0 - Hh / 2 + 3} size={8.5} anchor="end">{lbl.height}</T>)
    }
    if (lbl.width) content.push(<T key="lw" x={x0 + L + dx / 2 + 6} y={y0 - dy / 2 + 8} size={8.5} anchor="start">{lbl.width}</T>)
  } else if (d.shape === 'square_pyramid') {
    const b = { fl: [x0, y0], fr: [x0 + L, y0], bl: [x0 + dx, y0 - dy], br: [x0 + L + dx, y0 - dy] } as Record<string, XY>
    const apex: XY = [x0 + L / 2 + dx / 2, y0 - dy / 2 - Hh]
    content.push(
      <Polygon key="f" points={pts([b.fl, b.fr, apex])} fill="#fff" {...solid} />,
      <Polygon key="r" points={pts([b.fr, b.br, apex])} fill={SHADES[2]} {...solid} />,
      <Line key="h1" x1={b.fl[0]} y1={b.fl[1]} x2={b.bl[0]} y2={b.bl[1]} {...hidden} />,
      <Line key="h2" x1={b.bl[0]} y1={b.bl[1]} x2={b.br[0]} y2={b.br[1]} {...hidden} />,
      <Line key="h3" x1={b.bl[0]} y1={b.bl[1]} x2={apex[0]} y2={apex[1]} {...hidden} />,
    )
    if (lbl.length) content.push(<T key="ll" x={x0 + L / 2} y={y0 + 13} size={8.5}>{lbl.length}</T>)
    if (lbl.height) {
      content.push(<Line key="hl" x1={apex[0]} y1={apex[1]} x2={apex[0]} y2={y0 - dy / 2} {...hidden} />)
      content.push(<T key="lh" x={apex[0] + 4} y={apex[1] + Hh / 2 + 3} size={8.5} anchor="start">{lbl.height}</T>)
    }
  } else if (d.shape === 'cylinder' || d.shape === 'cone') {
    const rx = L / 2, ry = Math.max(8, L * 0.16)
    const cxp = x0 + rx, bottom = y0 - 4, top = bottom - Hh
    const front: XY[] = []
    const back: XY[] = []
    for (let t = 0; t <= 24; t++) {
      const a = Math.PI * (t / 24)
      front.push([cxp + rx * Math.cos(a), bottom + ry * Math.sin(a)])
      back.push([cxp + rx * Math.cos(a), bottom - ry * Math.sin(a)])
    }
    if (d.shape === 'cylinder') {
      content.push(
        <Polygon key="body" points={pts([[cxp - rx, top], [cxp - rx, bottom], ...front.slice().reverse().map(p => p), [cxp + rx, top]])} fill="#fff" stroke="none" />,
        <Line key="l" x1={cxp - rx} y1={top} x2={cxp - rx} y2={bottom} {...solid} />,
        <Line key="r" x1={cxp + rx} y1={top} x2={cxp + rx} y2={bottom} {...solid} />,
        <Polyline key="bf" points={pts(front)} fill="none" {...solid} />,
        <Polyline key="bb" points={pts(back)} fill="none" {...hidden} />,
        <Ellipse key="top" cx={cxp} cy={top} rx={rx} ry={ry} fill={SHADES[1]} {...solid} />,
      )
      if (lbl.height) content.push(<T key="lh" x={cxp - rx - 6} y={(top + bottom) / 2 + 3} size={8.5} anchor="end">{lbl.height}</T>)
      if (lbl.radius) {
        content.push(<Line key="rl" x1={cxp} y1={top} x2={cxp + rx} y2={top} stroke={INK} strokeWidth={0.9} />)
        content.push(<Circle key="rc" cx={cxp} cy={top} r={1.4} fill={INK} />)
        content.push(<T key="lr" x={cxp + rx / 2} y={top - 3} size={8}>{lbl.radius}</T>)
      }
    } else {
      const apex: XY = [cxp, top]
      content.push(
        <Polygon key="body" points={pts([apex, ...front])} fill="#fff" stroke="none" />,
        <Line key="l" x1={cxp - rx} y1={bottom} x2={apex[0]} y2={apex[1]} {...solid} />,
        <Line key="r" x1={cxp + rx} y1={bottom} x2={apex[0]} y2={apex[1]} {...solid} />,
        <Polyline key="bf" points={pts(front)} fill="none" {...solid} />,
        <Polyline key="bb" points={pts(back)} fill="none" {...hidden} />,
      )
      if (lbl.height) {
        content.push(<Line key="hl" x1={cxp} y1={top} x2={cxp} y2={bottom} {...hidden} />)
        content.push(<T key="lh" x={cxp + 4} y={(top + bottom) / 2 + 3} size={8.5} anchor="start">{lbl.height}</T>)
      }
      if (lbl.radius) {
        content.push(<Line key="rl" x1={cxp} y1={bottom} x2={cxp + rx} y2={bottom} stroke={INK} strokeWidth={0.9} />)
        content.push(<T key="lr" x={cxp + rx / 2} y={bottom + 12} size={8}>{lbl.radius}</T>)
      }
    }
  }

  return (
    <Frame bare={bare}>
      <Canvas w={Wc} h={Hc} fit={fit}>
        {content}
        {d.notToScale ? <NotToScale x={Wc - 4} y={Hc - 4} /> : null}
      </Canvas>
    </Frame>
  )
}

/** Unit cubes stacked on a grid, drawn back-to-front and bottom-to-top so each
 * nearer cube correctly covers the faces behind it. */
function CubeStack({ diagram: d, fit, bare }: { diagram: SolidDiagram } & Fit) {
  const hs = d.heights ?? [[1]]
  const rows = hs.length
  const cols = Math.max(...hs.map(r => r.length))
  const maxH = Math.max(...hs.flat(), 1)
  const s = Math.min(24, 220 / (cols + rows * 0.6), 170 / (maxH + rows * 0.5))
  const ddx = s * 0.5, ddy = s * 0.42
  const W = cols * s + rows * ddx + 16
  const H = maxH * s + rows * ddy + 16
  const cubes: React.ReactNode[] = []
  for (let r = 0; r < rows; r++) {
    const depth = rows - 1 - r // back row sits deepest
    for (let c = 0; c < cols; c++) {
      for (let z = 0; z < (hs[r][c] ?? 0); z++) {
        const x = 8 + c * s + depth * ddx
        const y = H - 8 - z * s - depth * ddy
        const fl: XY = [x, y], fr: XY = [x + s, y], ftr: XY = [x + s, y - s], ftl: XY = [x, y - s]
        const btr: XY = [x + s + ddx, y - s - ddy], btl: XY = [x + ddx, y - s - ddy], bbr: XY = [x + s + ddx, y - ddy]
        cubes.push(
          <React.Fragment key={`${r}-${c}-${z}`}>
            <Polygon points={pts([ftl, ftr, btr, btl])} fill={SHADES[1]} stroke={INK} strokeWidth={0.9} />
            <Polygon points={pts([fr, bbr, btr, ftr])} fill={SHADES[2]} stroke={INK} strokeWidth={0.9} />
            <Polygon points={pts([fl, fr, ftr, ftl])} fill="#fff" stroke={INK} strokeWidth={0.9} />
          </React.Fragment>
        )
      }
    }
  }
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>{cubes}</Canvas>
    </Frame>
  )
}

// ── Nets ─────────────────────────────────────────────────────────────────────

export function Net({ diagram: d, fit, bare }: { diagram: NetDiagram } & Fit) {
  const rows = d.faces.length
  const cols = Math.max(...d.faces.map(r => r.length))
  const s = Math.min(34, 240 / cols, 200 / rows)
  const pad = 6
  const W = cols * s + pad * 2, H = rows * s + pad * 2
  const isFace = (r: number, c: number) => d.faces[r]?.[c] === '#'
  // Fills first, then every edge: a later face's fill must not half-cover a
  // fold line an earlier face already drew along their shared edge.
  const fills: React.ReactNode[] = []
  const lines: React.ReactNode[] = []
  const marks: React.ReactNode[] = []
  let n = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!isFace(r, c)) continue
      const x = pad + c * s, y = pad + r * s
      fills.push(<Rect key={`f${r}-${c}`} x={x} y={y} width={s} height={s} fill="#fff" />)
      const mark = d.marks?.[n++]
      if (mark) marks.push(<T key={`m${r}-${c}`} x={x + s / 2} y={y + s / 2 + 4} size={11} bold>{mark}</T>)
      // Each edge once: top and left always, bottom/right only where no face follows.
      const edge = (x1: number, y1: number, x2: number, y2: number, shared: boolean, k: string) =>
        lines.push(<Line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={shared ? 0.8 : 1.3} strokeDasharray={shared ? '3 2.5' : undefined} />)
      edge(x, y, x + s, y, isFace(r - 1, c), `t${r}-${c}`)
      edge(x, y, x, y + s, isFace(r, c - 1), `l${r}-${c}`)
      if (!isFace(r + 1, c)) edge(x, y + s, x + s, y + s, false, `b${r}-${c}`)
      if (!isFace(r, c + 1)) edge(x + s, y, x + s, y + s, false, `r${r}-${c}`)
    }
  }
  return (
    <Frame bare={bare}>
      <Canvas w={W} h={H} fit={fit}>
        {fills}
        {lines}
        {marks}
      </Canvas>
    </Frame>
  )
}
