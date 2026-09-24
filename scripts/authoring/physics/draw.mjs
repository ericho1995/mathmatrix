// Drawing helpers for physics diagrams. A diagram is a width × height box with
// y pointing down; each helper appends primitives (see DrawElement in
// src/types/diagrams.ts), so a figure is a short, readable list of parts:
//
//   const d = drawing(300, 140)
//   d.block(40, 60, 50, 30, '2.0 kg'); d.pulley(230, 45, 12); d.arrow(…)
//   diagram: d.done('Figure 1')
//
// Conventions: a line is 1 pt, labels are 9 pt, variables are italic. Keep
// every coordinate inside the box (verify-bank checks it).

const r2 = v => Math.round(v * 100) / 100

export function drawing(width, height) {
  const els = []
  const push = e => { els.push(e); return api }
  const api = {
    els,
    // ── primitives ──
    line: (x1, y1, x2, y2, o = {}) => push({ t: 'line', x1: r2(x1), y1: r2(y1), x2: r2(x2), y2: r2(y2), ...o }),
    arrow: (x1, y1, x2, y2, o = {}) => push({ t: 'line', x1: r2(x1), y1: r2(y1), x2: r2(x2), y2: r2(y2), arrow: 'end', w: 1.3, ...o }),
    poly: (points, o = {}) => push({ t: 'poly', points: points.map(([x, y]) => [r2(x), r2(y)]), ...o }),
    // Options first: `w` is the width here, so { w: 1.6 } meant as a line weight must not replace it.
    // For a heavy outline use poly(corners, { closed: true, w }).
    rect: (x, y, w, h, o = {}) => push({ ...o, t: 'rect', x: r2(x), y: r2(y), w: r2(w), h: r2(h) }),
    circle: (cx, cy, r, o = {}) => push({ t: 'circle', cx: r2(cx), cy: r2(cy), r, ...o }),
    arc: (cx, cy, r, a0, a1, o = {}) => push({ t: 'arc', cx: r2(cx), cy: r2(cy), r, a0, a1, ...o }),
    text: (x, y, text, o = {}) => push({ t: 'text', x: r2(x), y: r2(y), text, ...o }),
    /** A variable name or symbol: italic. */
    sym: (x, y, text, o = {}) => push({ t: 'text', x: r2(x), y: r2(y), text, italic: true, ...o }),
    dot: (cx, cy, r = 2.2) => push({ t: 'circle', cx: r2(cx), cy: r2(cy), r, fill: 'black' }),

    // ── mechanics ──
    /** A labelled block (a mass). */
    block(x, y, w, h, label, o = {}) {
      api.rect(x, y, w, h, { fill: o.fill ?? 'light' })
      if (label) api.text(x + w / 2, y + h / 2 + 3, label, { size: o.size ?? 9 })
      return api
    },
    /** Horizontal ground line from x1 to x2 at y, hatched underneath. */
    ground(x1, x2, y, o = {}) {
      api.line(x1, y, x2, y, { w: 1.2 })
      if (o.hatch !== false) for (let x = x1 + 4; x <= x2; x += 8) api.line(x, y, x - 5, y + 6, { grey: true, w: 0.7 })
      return api
    },
    /** Vertical wall at x from y1 to y2, hatched on the left (side = -1) or right (1). */
    wall(x, y1, y2, side = -1) {
      api.line(x, y1, x, y2, { w: 1.2 })
      for (let y = y1 + 4; y <= y2; y += 8) api.line(x, y, x + side * 6, y + 5, { grey: true, w: 0.7 })
      return api
    },
    /** Horizontal ceiling at y from x1 to x2, hatched above. */
    ceiling(x1, x2, y) {
      api.line(x1, y, x2, y, { w: 1.2 })
      for (let x = x1 + 4; x <= x2; x += 8) api.line(x, y, x - 5, y - 6, { grey: true, w: 0.7 })
      return api
    },
    pulley(cx, cy, r = 11) {
      api.circle(cx, cy, r, { fill: 'white', w: 1.2 })
      api.circle(cx, cy, 2, { fill: 'black' })
      return api
    },
    /** A zigzag spring from (x1, y1) to (x2, y2). */
    spring(x1, y1, x2, y2, coils = 7, amp = 5) {
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy)
      const ux = dx / len, uy = dy / len, px = -uy, py = ux
      const lead = Math.min(8, len * 0.12)
      const p = [[x1, y1], [x1 + ux * lead, y1 + uy * lead]]
      const n = coils * 2
      for (let i = 1; i < n; i++) {
        const s = lead + ((len - 2 * lead) * i) / n
        const side = i % 2 ? 1 : -1
        p.push([x1 + ux * s + px * amp * side, y1 + uy * s + py * amp * side])
      }
      p.push([x2 - ux * lead, y2 - uy * lead], [x2, y2])
      return api.poly(p)
    },
    /** Right-angled incline: base from (x0, y0) running right for `base`, rising
     *  at `deg`. Returns the top corner through api.top. */
    incline(x0, y0, base, deg, o = {}) {
      const h = base * Math.tan((deg * Math.PI) / 180)
      api.poly([[x0, y0], [x0 + base, y0], [x0 + base, y0 - h]], { closed: true, fill: o.fill ?? 'light' })
      if (o.label !== false) api.angle(x0, y0, 26, 0, deg, o.label ?? 'θ')
      api.top = [x0 + base, y0 - h]
      return api
    },
    /** An angle mark at (cx, cy) from a0 to a1 (degrees, anticlockwise from east). */
    angle(cx, cy, r, a0, a1, label) {
      api.arc(cx, cy, r, a0, a1)
      if (label) {
        const m = (((a0 + a1) / 2) * Math.PI) / 180
        api.sym(cx + (r + 9) * Math.cos(m), cy - (r + 9) * Math.sin(m) + 3, label)
      }
      return api
    },
    /** A dimension line with end stops and a label beside its middle. */
    dim(x1, y1, x2, y2, label, o = {}) {
      api.line(x1, y1, x2, y2, { arrow: 'both', w: 0.8 })
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy)
      const off = o.offset ?? 8
      const nx = -dy / len, ny = dx / len
      api.text((x1 + x2) / 2 + nx * off * (o.side ?? 1), (y1 + y2) / 2 + ny * off * (o.side ?? 1) + 3, label, { size: o.size ?? 9, italic: o.italic })
      return api
    },
    /** A dashed trajectory through sampled points. */
    path(points, o = {}) {
      return api.poly(points, { dash: o.dash ?? true, arrow: o.arrow })
    },

    // ── circuits (wires are lines; components sit on them) ──
    /** A resistor box centred on the wire from (x1, y1) to (x2, y2). */
    resistor(x1, y1, x2, y2, label, o = {}) {
      const horizontal = Math.abs(y2 - y1) < Math.abs(x2 - x1)
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
      const L = o.len ?? 26, W = 9
      if (horizontal) {
        api.line(x1, y1, mx - L / 2, my).line(mx + L / 2, my, x2, y2).rect(mx - L / 2, my - W / 2, L, W, { fill: 'white' })
        if (label) api.text(mx, my - 9, label, { size: 8.5 })
      } else {
        api.line(x1, y1, mx, my - L / 2).line(mx, my + L / 2, x2, y2).rect(mx - W / 2, my - L / 2, W, L, { fill: 'white' })
        if (label) api.text(mx + 10, my + 3, label, { size: 8.5, anchor: 'start' })
      }
      return api
    },
    /** A cell on the wire from (x1, y1) to (x2, y2): long plate (+) first. */
    cell(x1, y1, x2, y2, label) {
      const horizontal = Math.abs(y2 - y1) < Math.abs(x2 - x1)
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
      if (horizontal) {
        api.line(x1, y1, mx - 3, my).line(mx + 3, my, x2, y2)
        api.line(mx - 3, my - 10, mx - 3, my + 10, { w: 1.2 }).line(mx + 3, my - 5, mx + 3, my + 5, { w: 2.2 })
        if (label) api.text(mx, my - 13, label, { size: 8.5 })
      } else {
        api.line(x1, y1, mx, my - 3).line(mx, my + 3, x2, y2)
        api.line(mx - 10, my - 3, mx + 10, my - 3, { w: 1.2 }).line(mx - 5, my + 3, mx + 5, my + 3, { w: 2.2 })
        if (label) api.text(mx + 14, my + 3, label, { size: 8.5, anchor: 'start' })
      }
      return api
    },
    /** A meter (A, V, G) or AC source (~) as a circle on the wire. */
    meter(x1, y1, x2, y2, letter, r = 9) {
      const horizontal = Math.abs(y2 - y1) < Math.abs(x2 - x1)
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
      if (horizontal) api.line(x1, y1, mx - r, my).line(mx + r, my, x2, y2)
      else api.line(x1, y1, mx, my - r).line(mx, my + r, x2, y2)
      api.circle(mx, my, r, { fill: 'white' })
      return api.text(mx, my + 3.5, letter, { size: letter === '~' ? 12 : 9, bold: letter !== '~' })
    },
    /** A lamp: a circle with a cross, on the wire. */
    lamp(x1, y1, x2, y2, r = 8) {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
      const horizontal = Math.abs(y2 - y1) < Math.abs(x2 - x1)
      if (horizontal) api.line(x1, y1, mx - r, my).line(mx + r, my, x2, y2)
      else api.line(x1, y1, mx, my - r).line(mx, my + r, x2, y2)
      api.circle(mx, my, r, { fill: 'white' })
      const k = r * 0.7
      return api.line(mx - k, my - k, mx + k, my + k).line(mx - k, my + k, mx + k, my - k)
    },
    /** An open switch on a horizontal wire. */
    switchOpen(x1, y, x2) {
      const mx = (x1 + x2) / 2
      api.line(x1, y, mx - 10, y).line(mx + 10, y, x2, y).dot(mx - 10, y, 1.8).dot(mx + 10, y, 1.8)
      return api.line(mx - 10, y, mx + 8, y - 9)
    },
    /** A coil drawn as loops along a vertical line at x from y1 to y2. */
    coil(x, y1, y2, turns = 6, side = 1) {
      const step = (y2 - y1) / turns
      for (let i = 0; i < turns; i++) {
        const cy = y1 + step * (i + 0.5)
        api.arc(x, cy, step / 2, side > 0 ? 90 : 270, side > 0 ? -90 : 90)
      }
      return api
    },

    // ── fields ──
    /** Crosses (field into the page) filling a rectangle. */
    fieldIn(x, y, w, h, step = 18) {
      for (let cx = x + step / 2; cx < x + w; cx += step) {
        for (let cy = y + step / 2; cy < y + h; cy += step) api.line(cx - 3, cy - 3, cx + 3, cy + 3, { w: 0.8 }).line(cx - 3, cy + 3, cx + 3, cy - 3, { w: 0.8 })
      }
      return api
    },
    /** Dots (field out of the page) filling a rectangle. */
    fieldOut(x, y, w, h, step = 18) {
      for (let cx = x + step / 2; cx < x + w; cx += step) {
        for (let cy = y + step / 2; cy < y + h; cy += step) api.circle(cx, cy, 3, { w: 0.8 }).dot(cx, cy, 0.9)
      }
      return api
    },
    /** Parallel field lines with arrows across a rectangle, pointing 'right' | 'left' | 'up' | 'down'. */
    fieldLines(x, y, w, h, dir = 'right', n = 5) {
      for (let i = 0; i < n; i++) {
        if (dir === 'right' || dir === 'left') {
          const yy = y + (h * (i + 0.5)) / n
          api.line(x, yy, x + w, yy, { w: 0.8 })
          const m = x + w * 0.55
          api.line(dir === 'right' ? m - 6 : m + 6, yy, m, yy, { arrow: 'end', w: 0.8 })
        } else {
          const xx = x + (w * (i + 0.5)) / n
          api.line(xx, y, xx, y + h, { w: 0.8 })
          const m = y + h * 0.55
          api.line(xx, dir === 'down' ? m - 6 : m + 6, xx, m, { arrow: 'end', w: 0.8 })
        }
      }
      return api
    },
    /** A bar magnet pole face: a labelled rectangle (N or S). */
    magnet(x, y, w, h, pole) {
      api.rect(x, y, w, h, { fill: pole === 'N' ? 'mid' : 'light' })
      return api.text(x + w / 2, y + h / 2 + 4, pole, { size: 11, bold: true })
    },
    /** Parallel plates (horizontal): top plate at y, bottom plate at y + gap. */
    plates(x, y, len, gap, top = '', bottom = '') {
      api.rect(x, y - 4, len, 4, { fill: 'dark' }).rect(x, y + gap, len, 4, { fill: 'dark' })
      if (top) api.text(x + len + 6, y + 1, top, { anchor: 'start', size: 10, bold: true })
      if (bottom) api.text(x + len + 6, y + gap + 5, bottom, { anchor: 'start', size: 10, bold: true })
      return api
    },
    /** A point charge: circle with its sign. */
    charge(cx, cy, sign = '+', r = 8, label) {
      api.circle(cx, cy, r, { fill: 'white', w: 1.1 })
      api.text(cx, cy + 3.5, sign, { size: 10, bold: true })
      if (label) api.text(cx, cy - r - 4, label, { size: 9 })
      return api
    },

    // ── waves and light ──
    /** A barrier with slits: vertical line at x from y1 to y2, gaps at ys (each gap 2g). */
    slits(x, y1, y2, ys, g = 3) {
      const cuts = [...ys].sort((a, b) => a - b)
      let from = y1
      for (const c of cuts) { api.line(x, from, x, c - g, { w: 2.2 }); from = c + g }
      return api.line(x, from, x, y2, { w: 2.2 })
    },
    /** Energy level diagram: horizontal lines with labels on the left and values on the right. */
    levels(x1, x2, entries) {
      for (const { y, left, right, dash } of entries) {
        api.line(x1, y, x2, y, { w: 1.1, dash })
        if (left) api.text(x1 - 6, y + 3, left, { anchor: 'end', size: 8.5 })
        if (right) api.text(x2 + 6, y + 3, right, { anchor: 'start', size: 8.5 })
      }
      return api
    },

    /** Finishes the diagram. */
    done(caption, title) {
      return { kind: 'drawing', width, height, elements: els, ...(caption ? { caption } : {}), ...(title ? { title } : {}) }
    },
  }
  return api
}

/** Points of y = f(x) mapped into a drawing: sx, sy convert data to box coordinates. */
export function traced(f, a, b, sx, sy, n = 60) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = a + ((b - a) * i) / n
    return [sx(x), sy(f(x))]
  })
}
