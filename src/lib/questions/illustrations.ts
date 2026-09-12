import type { Illustration } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Vector artwork for questions that need a picture rather than a data chart —
// clock faces, coins, spinners, balance scales, pictograms, labelled geometric
// figures. These are the figure types real NAPLAN papers lean on that a chart
// renderer cannot express.
//
// Authored as SVG (Gemini drafts it, constrained to the subset
// @react-pdf/renderer can draw; geometry is then checked and corrected by hand),
// and converted to this typed form by
// `node scripts/svg-to-illustration.mjs <file.svg> <id>`. Storing primitives
// rather than SVG markup keeps the artwork typed and diffable, and avoids
// needing an XML parser at render time — the PDF route runs in Node, which has
// no DOMParser.
//
// A question points at one of these with `diagram: { kind: 'illustration', id }`.
// ─────────────────────────────────────────────────────────────────────────────

export const ILLUSTRATIONS: Record<string, Illustration> = {
  'clock-half-past-9': {
    width: 300,
    height: 300,
    elements: [
      { t: 'circle', cx: 150, cy: 150, r: 140, stroke: 'black', strokeWidth: 3, fill: 'white' },
      { t: 'path', d: 'M150 10L150 25M220 28.8L212.5 41.8M271.2 80L258.3 87.5M290 150L275 150', stroke: 'black', strokeWidth: 2, fill: 'none' },
      { t: 'path', d: 'M271.2 220L258.3 212.5M220 271.2L212.5 258.3M150 290L150 275M78.8 271.2L87.5 258.3', stroke: 'black', strokeWidth: 2, fill: 'none' },
      { t: 'path', d: 'M28.8 220L41.8 212.5M10 150L25 150M28.8 80L41.8 87.5M78.8 28.8L87.5 41.8', stroke: 'black', strokeWidth: 2, fill: 'none' },
      { t: 'text', x: 150, y: 60, content: '12', fontSize: 28, textAnchor: 'middle', fill: 'black' },
      { t: 'text', x: 248, y: 160, content: '3', fontSize: 28, textAnchor: 'middle', fill: 'black' },
      { t: 'text', x: 150, y: 262, content: '6', fontSize: 28, textAnchor: 'middle', fill: 'black' },
      { t: 'text', x: 52, y: 160, content: '9', fontSize: 28, textAnchor: 'middle', fill: 'black' },
      { t: 'line', x1: 150, y1: 150, x2: 150, y2: 225, stroke: 'black', strokeWidth: 4 },
      { t: 'line', x1: 150, y1: 150, x2: 92.1, y2: 134.5, stroke: 'black', strokeWidth: 7 },
      { t: 'circle', cx: 150, cy: 150, r: 5, fill: 'black' },
    ],
  },
  'coins-3x20c-2x10c': {
    width: 420,
    height: 120,
    elements: [
      { t: 'circle', cx: 60, cy: 60, r: 40, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'circle', cx: 145, cy: 60, r: 40, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'circle', cx: 230, cy: 60, r: 40, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'circle', cx: 305, cy: 60, r: 30, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'circle', cx: 370, cy: 60, r: 30, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'text', x: 60, y: 68, content: '20c', fontSize: 22, textAnchor: 'middle', fill: 'black' },
      { t: 'text', x: 145, y: 68, content: '20c', fontSize: 22, textAnchor: 'middle', fill: 'black' },
      { t: 'text', x: 230, y: 68, content: '20c', fontSize: 22, textAnchor: 'middle', fill: 'black' },
      { t: 'text', x: 305, y: 67, content: '10c', fontSize: 18, textAnchor: 'middle', fill: 'black' },
      { t: 'text', x: 370, y: 67, content: '10c', fontSize: 18, textAnchor: 'middle', fill: 'black' },
    ],
  },
  'balance-28g-vs-13g-cube': {
    width: 400,
    height: 220,
    elements: [
      { t: 'line', x1: 80, y1: 70, x2: 320, y2: 70, stroke: 'black', strokeWidth: 4 },
      { t: 'circle', cx: 200, cy: 70, r: 4, fill: 'black' },
      { t: 'polygon', points: '185,200 215,200 200,74', stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'line', x1: 165, y1: 200, x2: 235, y2: 200, stroke: 'black', strokeWidth: 3 },
      { t: 'line', x1: 80, y1: 70, x2: 80, y2: 98, stroke: 'black', strokeWidth: 2 },
      { t: 'line', x1: 35, y1: 130, x2: 125, y2: 130, stroke: 'black', strokeWidth: 3 },
      { t: 'line', x1: 35, y1: 130, x2: 80, y2: 98, stroke: 'black', strokeWidth: 1 },
      { t: 'line', x1: 125, y1: 130, x2: 80, y2: 98, stroke: 'black', strokeWidth: 1 },
      { t: 'rect', x: 60, y: 98, width: 40, height: 32, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'text', x: 80, y: 120, content: '28 g', fontSize: 14, textAnchor: 'middle', fill: 'black' },
      { t: 'line', x1: 320, y1: 70, x2: 320, y2: 98, stroke: 'black', strokeWidth: 2 },
      { t: 'line', x1: 275, y1: 130, x2: 365, y2: 130, stroke: 'black', strokeWidth: 3 },
      { t: 'line', x1: 275, y1: 130, x2: 320, y2: 98, stroke: 'black', strokeWidth: 1 },
      { t: 'line', x1: 365, y1: 130, x2: 320, y2: 98, stroke: 'black', strokeWidth: 1 },
      { t: 'rect', x: 280, y: 98, width: 38, height: 32, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'text', x: 299, y: 120, content: '13 g', fontSize: 14, textAnchor: 'middle', fill: 'black' },
      { t: 'rect', x: 324, y: 98, width: 32, height: 32, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'text', x: 340, y: 121, content: '?', fontSize: 16, textAnchor: 'middle', fill: 'black' },
    ],
  },
  'spinner-3red-2blue-1yellow': {
    width: 300,
    height: 230,
    elements: [
      { t: 'circle', cx: 150, cy: 110, r: 90, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'line', x1: 150, y1: 110, x2: 150, y2: 20, stroke: 'black', strokeWidth: 1 },
      { t: 'line', x1: 150, y1: 110, x2: 227.9, y2: 65, stroke: 'black', strokeWidth: 1 },
      { t: 'line', x1: 150, y1: 110, x2: 227.9, y2: 155, stroke: 'black', strokeWidth: 1 },
      { t: 'line', x1: 150, y1: 110, x2: 150, y2: 200, stroke: 'black', strokeWidth: 1 },
      { t: 'line', x1: 150, y1: 110, x2: 72.1, y2: 155, stroke: 'black', strokeWidth: 1 },
      { t: 'line', x1: 150, y1: 110, x2: 72.1, y2: 65, stroke: 'black', strokeWidth: 1 },
      { t: 'text', x: 177.5, y: 62.4, content: 'red', fontSize: 13, textAnchor: 'middle', fill: 'black' },
      { t: 'text', x: 205, y: 110, content: 'red', fontSize: 13, textAnchor: 'middle', fill: 'black' },
      { t: 'text', x: 177.5, y: 157.6, content: 'blue', fontSize: 13, textAnchor: 'middle', fill: 'black' },
      { t: 'text', x: 122.5, y: 157.6, content: 'red', fontSize: 13, textAnchor: 'middle', fill: 'black' },
      { t: 'text', x: 95, y: 110, content: 'yellow', fontSize: 13, textAnchor: 'middle', fill: 'black' },
      { t: 'text', x: 122.5, y: 62.4, content: 'blue', fontSize: 13, textAnchor: 'middle', fill: 'black' },
      { t: 'line', x1: 150, y1: 110, x2: 175, y2: 75, stroke: 'black', strokeWidth: 3 },
      { t: 'polygon', points: '175,75 166,82 174,88', fill: 'black' },
      { t: 'circle', cx: 150, cy: 110, r: 4, fill: 'black' },
    ],
  },
  'unit-squares-13': {
    width: 230,
    height: 130,
    elements: [
      { t: 'rect', x: 20, y: 20, width: 30, height: 30, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'rect', x: 50, y: 20, width: 30, height: 30, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'rect', x: 80, y: 20, width: 30, height: 30, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'rect', x: 20, y: 50, width: 30, height: 30, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'rect', x: 50, y: 50, width: 30, height: 30, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'rect', x: 80, y: 50, width: 30, height: 30, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'rect', x: 110, y: 50, width: 30, height: 30, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'rect', x: 140, y: 50, width: 30, height: 30, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'rect', x: 20, y: 80, width: 30, height: 30, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'rect', x: 50, y: 80, width: 30, height: 30, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'rect', x: 80, y: 80, width: 30, height: 30, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'rect', x: 110, y: 80, width: 30, height: 30, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'rect', x: 140, y: 80, width: 30, height: 30, stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'line', x1: 170, y1: 95, x2: 200, y2: 95, stroke: 'black', strokeWidth: 1 },
      { t: 'text', x: 185, y: 105, content: '1 cm', fontSize: 12, textAnchor: 'start', fill: 'black' },
    ],
  },
  'l-shaped-lawn': {
    width: 300,
    height: 310,
    elements: [
      { t: 'polygon', points: '30,270 230,270 230,110 150,110 150,30 30,30', stroke: 'black', strokeWidth: 2, fill: 'white' },
      { t: 'text', x: 130, y: 292, content: '5 m', fontSize: 15, textAnchor: 'middle', fill: 'black' },
      { t: 'text', x: 242, y: 195, content: '4 m', fontSize: 15, textAnchor: 'start', fill: 'black' },
      { t: 'text', x: 190, y: 102, content: '2 m', fontSize: 15, textAnchor: 'middle', fill: 'black' },
      { t: 'text', x: 142, y: 75, content: '2 m', fontSize: 15, textAnchor: 'end', fill: 'black' },
      { t: 'text', x: 90, y: 22, content: '3 m', fontSize: 15, textAnchor: 'middle', fill: 'black' },
      { t: 'text', x: 40, y: 155, content: '6 m', fontSize: 15, textAnchor: 'start', fill: 'black' },
    ],
  },
  'parallel-lines-63': {
    width: 300,
    height: 280,
    elements: [
      { t: 'line', x1: 20, y1: 90, x2: 280, y2: 90, stroke: 'black', strokeWidth: 2 },
      { t: 'line', x1: 20, y1: 200, x2: 280, y2: 200, stroke: 'black', strokeWidth: 2 },
      { t: 'line', x1: 90, y1: 30, x2: 210, y2: 260, stroke: 'black', strokeWidth: 2 },
      { t: 'polyline', points: '240,84 250,90 240,96', stroke: 'black', strokeWidth: 2, fill: 'none' },
      { t: 'polyline', points: '240,194 250,200 240,206', stroke: 'black', strokeWidth: 2, fill: 'none' },
      { t: 'text', x: 105, y: 114, content: '63°', fontSize: 15, textAnchor: 'end', fill: 'black' },
      { t: 'text', x: 160, y: 188, content: 'x°', fontSize: 15, textAnchor: 'end', fill: 'black' },
    ],
  },
  'pictogram-cats5-dogs3': {
    width: 380,
    height: 140,
    elements: [
      { t: 'text', x: 10, y: 60, content: 'Cats', fontSize: 16, fill: 'black' },
      { t: 'path', d: 'M 63 55 A 7 5 0 1 1 63.1 55 M 62 48 A 2 2 0 1 1 62.1 48 M 67 45 A 2 2 0 1 1 67.1 45 M 73 45 A 2 2 0 1 1 73.1 45 M 78 48 A 2 2 0 1 1 78.1 48', fill: 'black' },
      { t: 'path', d: 'M 118 55 A 7 5 0 1 1 118.1 55 M 117 48 A 2 2 0 1 1 117.1 48 M 122 45 A 2 2 0 1 1 122.1 45 M 128 45 A 2 2 0 1 1 128.1 45 M 133 48 A 2 2 0 1 1 133.1 48', fill: 'black' },
      { t: 'path', d: 'M 173 55 A 7 5 0 1 1 173.1 55 M 172 48 A 2 2 0 1 1 172.1 48 M 177 45 A 2 2 0 1 1 177.1 45 M 183 45 A 2 2 0 1 1 183.1 45 M 188 48 A 2 2 0 1 1 188.1 48', fill: 'black' },
      { t: 'path', d: 'M 228 55 A 7 5 0 1 1 228.1 55 M 227 48 A 2 2 0 1 1 227.1 48 M 232 45 A 2 2 0 1 1 232.1 45 M 238 45 A 2 2 0 1 1 238.1 45 M 243 48 A 2 2 0 1 1 243.1 48', fill: 'black' },
      { t: 'path', d: 'M 283 55 A 7 5 0 1 1 283.1 55 M 282 48 A 2 2 0 1 1 282.1 48 M 287 45 A 2 2 0 1 1 287.1 45 M 293 45 A 2 2 0 1 1 293.1 45 M 298 48 A 2 2 0 1 1 298.1 48', fill: 'black' },
      { t: 'text', x: 10, y: 110, content: 'Dogs', fontSize: 16, fill: 'black' },
      { t: 'path', d: 'M 63 105 A 7 5 0 1 1 63.1 105 M 62 98 A 2 2 0 1 1 62.1 98 M 67 95 A 2 2 0 1 1 67.1 95 M 73 95 A 2 2 0 1 1 73.1 95 M 78 98 A 2 2 0 1 1 78.1 98', fill: 'black' },
      { t: 'path', d: 'M 118 105 A 7 5 0 1 1 118.1 105 M 117 98 A 2 2 0 1 1 117.1 98 M 122 95 A 2 2 0 1 1 122.1 95 M 128 95 A 2 2 0 1 1 128.1 95 M 133 98 A 2 2 0 1 1 133.1 98', fill: 'black' },
      { t: 'path', d: 'M 173 105 A 7 5 0 1 1 173.1 105 M 172 98 A 2 2 0 1 1 172.1 98 M 177 95 A 2 2 0 1 1 177.1 95 M 183 95 A 2 2 0 1 1 183.1 95 M 188 98 A 2 2 0 1 1 188.1 98', fill: 'black' },
    ],
  },
}
