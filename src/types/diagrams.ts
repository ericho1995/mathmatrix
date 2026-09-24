// ─── Diagrams (graphical questions) ────────────────────────────────────────
// Per-question graphic, rendered inline above the question text, or as a
// picture answer option (MultipleChoiceQuestion.option_diagrams).
//
// Every kind is parametric data, never artwork: a picture is a few typed lines
// in bank.ts, so varying it is cheap and reviewable in a diff. The renderers
// live in src/lib/pdf/diagrams/. See
// docs/superpowers/specs/2026-09-21-naplan-quality-uplift-design.md for why
// each kind exists — they are the pictures real NAPLAN papers are built from.

/** Greyscale fill, lightest to darkest. Real papers print in greyscale, which is
 * why a spinner labels its sectors with colour words instead of colouring them. */
export type Shade = 0 | 1 | 2 | 3 | 4

/**
 * Column or bar graph.
 *
 * Set `yStep` and the chart is drawn the way real papers draw it: a scaled
 * value axis with gridlines and no printed values, so the reader has to read the
 * graph. Without `yStep` it falls back to the original style, which printed
 * each bar's value underneath — kept only so older items still render.
 */
export interface BarChartDiagram {
  kind: 'bar_chart'
  title?: string
  unit?: string                              // e.g. 'students', '$' — shown on the axis label
  /** One series. For grouped bars use `categories` + `series` instead. */
  bars?: { label: string; value: number }[]
  categories?: string[]
  series?: { label: string; values: number[] }[]
  yMax?: number
  yStep?: number
  yLabel?: string
  xLabel?: string
  horizontal?: boolean
  /** solid grey (default), graded greys per series, or outlined bars. */
  style?: 'solid' | 'shaded' | 'outline'
  showValues?: boolean
}

export interface NumberLineDiagram {
  kind: 'number_line'
  title?: string
  min: number
  max: number
  step: number
  /** Legacy: highlighted points listed in a caption underneath. */
  marks?: { value: number; label: string }[]
  /** Label every nth tick only (1 = every tick). */
  labelEvery?: number
  /** Override tick labels, e.g. { '0.5': '1/2' } for fraction lines. */
  tickLabels?: Record<string, string>
  /** Show only the first and last labels — "what number is at the arrow?" */
  hideLabels?: boolean
  /** Points drawn on the line, labelled above. Open circles for strict inequalities. */
  points?: { value: number; label?: string; open?: boolean }[]
  /** Hops drawn as arcs above the line, for addition and skip counting. */
  jumps?: { from: number; to: number; label?: string }[]
  /** A shaded ray, for inequalities: x > 3 is { from: 3, direction: 'right', open: true }. */
  ray?: { from: number; direction: 'left' | 'right'; open?: boolean }
  /** An arrow pointing down at a position, for "which number is shown?" */
  arrowAt?: number
}

export interface DotPlotDiagram {
  kind: 'dot_plot'
  axisLabel?: string
  values: number[]                           // raw data points; one dot per occurrence, stacked
}

export interface GridMapDiagram {
  kind: 'grid_map'
  title?: string
  cols: string[]                             // column labels, e.g. ['A','B','C','D','E','F','G','H']
  rowCount: number                           // rows numbered 1..rowCount, bottom to top (matches map convention)
  unitLabel?: string                         // e.g. '1 kilometre' per cell, shown in a key
  points: { col: string; row: number; label: string }[]
  /** Draw a compass rose beside the grid. */
  compass?: boolean
  /** Label points on the map itself rather than in a caption. */
  labelsOnMap?: boolean
  /** A path through cell centres, e.g. a walk from home to school. */
  route?: { col: string; row: number }[]
  /** Map features drawn as shaded cells: a park, a lake. */
  areas?: { cells: { col: string; row: number }[]; label?: string; shade?: Shade }[]
}

export interface SimpleShapeDiagram {
  kind: 'simple_shape'
  shape: 'rectangle' | 'right_triangle'
  labels: { side: 'top' | 'bottom' | 'left' | 'right' | 'hypotenuse'; text: string }[]
}

/**
 * A curve on Cartesian axes — the graphic VCE Methods papers are built from.
 * Checking the real papers, they contain almost no photographs: the 2021-2024
 * Exam 2 papers carry zero raster images and 800-1100 vector drawings each,
 * nearly all of them function graphs with light gridlines, solid and dashed
 * curves, and a key.
 *
 * Curves are stored as sampled points rather than an expression to evaluate.
 * The renderer does no maths, the data is typed and diffable, and a curve can
 * be checked by reading it — the same reason illustrations store primitives
 * rather than SVG markup.
 */
export interface FunctionGraphDiagram {
  kind: 'function_graph'
  title?: string
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  /** Gridline and tick spacing. Omit to draw axes without a grid. */
  xStep?: number
  yStep?: number
  xLabel?: string
  yLabel?: string
  curves: {
    points: [number, number][]
    dashed?: boolean
    /** A third line style, so three curves on one graph stay distinguishable in print. */
    dotted?: boolean
    label?: string
  }[]
  /** Marked points — intercepts, turning points, a stated coordinate. */
  points?: { x: number; y: number; label?: string }[]
  // ── Specialist Mathematics additions ──
  /** Straight segments in data coordinates: asymptotes (dashed), rays and
   * vectors (arrow), and the short strokes of a slope field. */
  segments?: { from: [number, number]; to: [number, number]; dashed?: boolean; arrow?: boolean; thin?: boolean }[]
  /** Shaded regions (polygons in data coordinates) — a region of the complex
   * plane, the area under a curve, a tail of a normal distribution. */
  regions?: { points: [number, number][] }[]
  /** Text placed at data coordinates, printed on the graph itself (point
   * names, "Re(z)", curve names). `at` sets which side of the point it sits. */
  labels?: { x: number; y: number; text: string; at?: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | 'c' }[]
  /** Hollow circles: an excluded endpoint. */
  openPoints?: { x: number; y: number }[]
  /** Draw gridlines at xStep / yStep (default). false leaves bare axes with
   * tick marks, the way VCAA prints most graphs. */
  grid?: boolean
  /** One unit on each axis the same length on paper, so circles look round
   * (Argand diagrams, paths of particles). */
  equalAspect?: boolean
  /** Drawing width in points (default 300). */
  width?: number
  /** Custom x-axis ticks, replacing the numeric ones from xStep — for axes
   * marked in multiples of π. */
  xTickLabels?: { x: number; text: string }[]
}

/**
 * An algorithm in the pseudocode VCAA uses in its mathematics papers:
 * ← for assignment, indentation for blocks, keywords in bold.
 */
export interface PseudocodeDiagram {
  kind: 'pseudocode'
  lines: string[]
  title?: string
}

/**
 * Box plot — the display VCE General Mathematics data analysis is built on.
 * Several boxes can share one axis, which is how real papers set up the
 * "compare these groups" questions.
 */
export interface BoxPlotDiagram {
  kind: 'box_plot'
  title?: string
  axisLabel?: string
  min: number
  max: number
  step: number
  boxes: {
    label?: string
    min: number
    q1: number
    median: number
    q3: number
    max: number
    /** Drawn as separate dots beyond the whiskers, as VCAA does. */
    outliers?: number[]
  }[]
}

/**
 * Vertices and edges, for the networks and decision mathematics area — 20 of
 * the 100 marks across the two General Mathematics papers, and unanswerable
 * without the drawing.
 *
 * Positions are authored rather than computed by a layout algorithm. A graph
 * whose coordinates are in the source renders identically every time and can be
 * reviewed in a diff, and no layout library ever has to run at render time —
 * the same reason FunctionGraphDiagram stores sampled points.
 */
export interface NetworkGraphDiagram {
  kind: 'network_graph'
  title?: string
  /** Draw arrowheads — flow networks and project diagrams are directed. */
  directed?: boolean
  /** Coordinates in an abstract 0-100 box, scaled to the drawing area. */
  vertices: { id: string; x: number; y: number }[]
  edges: { from: string; to: string; weight?: number | string }[]
}

/**
 * A table of values. Real General Mathematics papers lean on these in every
 * area of study — raw data sets, assignment costs, activity predecessors.
 *
 * Note `Stimulus` has a `data_table` type that predates this and was never
 * rendered. This is per-question and typed; prefer it.
 */
export interface DataTableDiagram {
  kind: 'data_table'
  title?: string
  columns: string[]
  rows: (string | number)[][]
  /** Render the first column as a row heading rather than as data. */
  rowHeader?: boolean
  /**
   * How the table looks. `grid` is a plain ruled table; `receipt` a shop
   * docket (`torn` rips off its bottom edge, as in real items where part of a
   * receipt is missing); `price_list` a menu board; `timetable` a transport
   * timetable with a heavy header; `tally` draws `tallyColumn` as tally marks.
   */
  style?: 'grid' | 'receipt' | 'price_list' | 'timetable' | 'tally'
  torn?: boolean
  tallyColumn?: number
  /** A bold closing row, e.g. a receipt total. */
  footer?: (string | number)[]
}

/**
 * A matrix, drawn with the square brackets real papers use. Optional row and
 * column labels sit outside the brackets, which is how VCAA labels the rows of
 * a transition matrix.
 */
export interface MatrixDiagram {
  kind: 'matrix'
  /** Printed to the left of the bracket, e.g. 'M =' or 'T ='. */
  name?: string
  rows: (string | number)[][]
  rowLabels?: string[]
  colLabels?: string[]
}

// ─── Illustrations ───────────────────────────────────────────────────────────
// The five diagram kinds above are hand-written chart renderers, which is fine
// for data displays but cannot draw the pictorial figures real NAPLAN papers
// lean on — clock faces, coins, spinners, balance scales, labelled geometric
// figures. Those are authored as vector artwork instead, stored as a flat list
// of primitives (never raw SVG markup, so it stays typed and renders the same
// in the PDF and in the browser). See scripts/svg-to-illustration.mjs for the
// authoring pipeline and src/lib/questions/illustrations.ts for the artwork.

interface SvgBase {
  stroke?: string
  strokeWidth?: number
  fill?: string
}

export interface SvgCircle extends SvgBase { t: 'circle'; cx: number; cy: number; r: number }
export interface SvgEllipse extends SvgBase { t: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
export interface SvgRect extends SvgBase { t: 'rect'; x: number; y: number; width: number; height: number }
export interface SvgLine extends SvgBase { t: 'line'; x1: number; y1: number; x2: number; y2: number }
export interface SvgPath extends SvgBase { t: 'path'; d: string }
export interface SvgPolygon extends SvgBase { t: 'polygon'; points: string }
export interface SvgPolyline extends SvgBase { t: 'polyline'; points: string }
export interface SvgText extends SvgBase {
  t: 'text'
  x: number
  y: number
  content: string
  fontSize?: number
  textAnchor?: 'start' | 'middle' | 'end'
}

export type SvgElement =
  | SvgCircle | SvgEllipse | SvgRect | SvgLine | SvgPath | SvgPolygon | SvgPolyline | SvgText

export interface Illustration {
  width: number
  height: number
  elements: SvgElement[]
}

/** Points at a key in `ILLUSTRATIONS`, so one piece of artwork can be reused by
 * several questions and the bank stays readable. */
export interface IllustrationDiagram {
  kind: 'illustration'
  id: string
  title?: string
}

// ─── Data displays ───────────────────────────────────────────────────────────

export interface LineGraphDiagram {
  kind: 'line_graph'
  title?: string
  xLabels: string[]
  /** null leaves a gap — a missing reading. */
  series: { label?: string; values: (number | null)[]; dashed?: boolean }[]
  yMin: number
  yMax: number
  yStep: number
  xLabel?: string
  yLabel?: string
  /** Draw a dot at each reading (default true). */
  markers?: boolean
}

export interface PieChartDiagram {
  kind: 'pie_chart'
  title?: string
  sectors: { label: string; value: number; shade?: Shade }[]
  /** Print each sector's percentage. Off when the question asks for it. */
  showPercent?: boolean
}

export type PictoIcon = 'star' | 'circle' | 'square' | 'smiley' | 'book' | 'tree' | 'fish' | 'car' | 'apple' | 'ball' | 'cup' | 'person'

/** Rows of icons with a key — "each ★ stands for 4 books". Counts may end in .5. */
export interface PictographDiagram {
  kind: 'pictograph'
  title?: string
  icon: PictoIcon
  keyValue: number
  /** What one icon stands for, e.g. "books". */
  keyNoun: string
  rows: { label: string; count: number }[]
}

export interface StemLeafDiagram {
  kind: 'stem_leaf'
  title?: string
  rows: { stem: string; leaves: string }[]
  /** e.g. "2 | 4 means 24" */
  keyText: string
}

// ─── Chance ──────────────────────────────────────────────────────────────────

export interface SpinnerDiagram {
  kind: 'spinner'
  /** Equal sectors, clockwise from the top. */
  sectors: { label?: string; shade?: Shade }[]
  /** Sector the arrow rests on. Omit for an arrow pointing straight up. */
  pointer?: number
}

export type VennRegion = 'A' | 'B' | 'C' | 'AB' | 'AC' | 'BC' | 'ABC' | 'none'

export interface VennDiagram {
  kind: 'venn'
  sets: [string, string] | [string, string, string]
  /** Numbers or words written in each region. `none` is outside every circle. */
  values?: Partial<Record<VennRegion, string | number>>
  shaded?: VennRegion[]
  /** Label on the surrounding rectangle, e.g. "Year 8 students". */
  universe?: string
}

// ─── Geometry ────────────────────────────────────────────────────────────────

/**
 * A general labelled figure: polygons, lines, angles and circles.
 *
 * Coordinates are abstract units with y pointing UP, origin bottom-left, inside
 * a `width` × `height` box. Covers what `simple_shape` cannot — trapeziums,
 * composite shapes, parallel lines cut by a transversal, angles at a point,
 * a ladder against a wall, a ramp.
 */
export interface FigureDiagram {
  kind: 'figure'
  width: number
  height: number
  points: {
    id: string
    x: number
    y: number
    /** Printed beside the point (A, B, P…). */
    label?: string
    labelAt?: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
    dot?: boolean
  }[]
  segments?: {
    from: string
    to: string
    dashed?: boolean
    /** Length or name, written beside the middle of the segment. */
    label?: string
    /** Which side of from→to the label sits on. Default: left. */
    labelSide?: 'left' | 'right'
    /** Where along from→to the label sits, 0–1 (default 0.5). Moves a label
     * off a point where lines cross, such as the middle of a kite. */
    labelPos?: number
    /** Equal-length ticks. */
    ticks?: 1 | 2 | 3
    /** Parallel-line arrows. */
    arrows?: 1 | 2
    /** Extend past both ends, for lines rather than segments. */
    extend?: boolean
    heavy?: boolean
  }[]
  polygons?: { points: string[]; shade?: Shade; dashed?: boolean }[]
  angles?: {
    at: string
    from: string
    to: string
    label?: string
    /** Draw the square right-angle mark instead of an arc. */
    right?: boolean
    arcs?: 1 | 2
  }[]
  circles?: { center: string; r: number; dashed?: boolean; shade?: Shade }[]
  /** Circular arcs: degrees, 0 = east, counter-clockwise — a semicircle on the
   * end of a rectangle is { fromDeg: -90, toDeg: 90 }. */
  arcs?: { center: string; r: number; fromDeg: number; toDeg: number; dashed?: boolean }[]
  /** Free text, placed in figure units. */
  texts?: { x: number; y: number; text: string }[]
  notToScale?: boolean
}

/** Shapes on a square or dot grid: area, perimeter, symmetry, enlargement. */
export interface GridShapeDiagram {
  kind: 'grid_shape'
  cols: number
  rows: number
  grid?: 'square' | 'dot' | 'none'
  /**
   * Cell fills, top row first, one character per cell: '#' shaded, 'x' dark,
   * '.' empty. Shorter strings leave the rest empty.
   */
  cells?: string[]
  /** Polygons in grid coordinates (0..cols, 0..rows, y up). */
  shapes?: { points: [number, number][]; shade?: Shade; dashed?: boolean; label?: string }[]
  lines?: { from: [number, number]; to: [number, number]; dashed?: boolean; heavy?: boolean }[]
  labels?: { at: [number, number]; text: string }[]
  /** e.g. "Each square is 1 cm²" */
  key?: string
}

export interface CoordinatePlaneDiagram {
  kind: 'coordinate_plane'
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  /** Gridline spacing (default 1). */
  step?: number
  /** Label every nth gridline (default 1). */
  labelEvery?: number
  grid?: boolean
  points?: { x: number; y: number; label?: string }[]
  shapes?: { points: [number, number][]; label?: string; dashed?: boolean; shade?: Shade }[]
  segments?: { from: [number, number]; to: [number, number]; dashed?: boolean }[]
}

/** A 3D solid in oblique projection, hidden edges dashed. */
export interface SolidDiagram {
  kind: 'solid'
  shape: 'cuboid' | 'cube' | 'cylinder' | 'cone' | 'square_pyramid' | 'triangular_prism' | 'cubes'
  /** Dimension labels written against the matching edges. */
  labels?: { length?: string; width?: string; height?: string; radius?: string }
  /** For 'cubes': stack heights, back row first, left to right. */
  heights?: number[][]
  /** Relative proportions for cuboid/prism drawing, [length, width(depth), height]. */
  proportions?: [number, number, number]
  notToScale?: boolean
}

/** A net on a square grid: '#' a face, '.' nothing. Folds are dashed. */
export interface NetDiagram {
  kind: 'net'
  faces: string[]
  /** Letters or symbols printed on faces, in reading order of the '#'s. */
  marks?: string[]
}

// ─── Measurement ─────────────────────────────────────────────────────────────

export type MeasureDiagram =
  | {
      kind: 'measure'
      instrument: 'ruler'
      from: number
      to: number
      unit: 'cm' | 'mm'
      /** An object laid along the ruler. */
      object?: { start: number; end: number; label?: string }
      /** Starts part-way along, as a broken ruler does. */
      broken?: boolean
    }
  | { kind: 'measure'; instrument: 'jug'; max: number; step: number; level: number; unit: string; labelEvery?: number }
  | { kind: 'measure'; instrument: 'thermometer'; min: number; max: number; step: number; value: number; labelEvery?: number }
  | { kind: 'measure'; instrument: 'dial'; max: number; step: number; value: number; unit: string; labelEvery?: number }
  | { kind: 'measure'; instrument: 'protractor'; angle: number }

export interface ClockDiagram {
  kind: 'clock'
  hour: number
  minute: number
  style?: 'analog' | 'digital'
  numerals?: 'all' | 'quarters' | 'none'
  /** Caption under the clock, e.g. "Home time". */
  label?: string
  /** Digital only: print am/pm. */
  meridiem?: 'am' | 'pm'
}

export interface BalanceDiagram {
  kind: 'balance'
  left: string[]
  right: string[]
  tilt?: 'level' | 'left' | 'right'
}

export interface CalendarDiagram {
  kind: 'calendar'
  title: string
  /** Weekday of the 1st: 0 Monday … 6 Sunday. */
  startDay: number
  days: number
  circled?: number[]
  shaded?: number[]
}

// ─── Number ──────────────────────────────────────────────────────────────────

export interface FractionModelDiagram {
  kind: 'fraction_model'
  model: 'bar' | 'circle' | 'grid'
  /** Equal parts in each whole. For 'grid', rows × cols. */
  parts: number
  /** Shaded parts, counted across all wholes. */
  shaded: number
  wholes?: number
  rows?: number
  cols?: number
}

/** Tape diagram — the standard picture for ratio and part–whole problems. */
export interface BarModelDiagram {
  kind: 'bar_model'
  bars: { label?: string; segments: { width: number; text?: string; shade?: Shade }[] }[]
  /** A brace over the whole first bar, e.g. "$48". */
  total?: string
}

export interface PlaceValueDiagram {
  kind: 'place_value'
  thousands?: number
  hundreds: number
  tens: number
  ones: number
}

export interface ArrayDiagram {
  kind: 'array'
  rows: number
  cols: number
  symbol?: 'dot' | 'star' | 'square'
}

export type MoneyItem = '5c' | '10c' | '20c' | '50c' | '$1' | '$2' | '$5' | '$10' | '$20' | '$50' | '$100'

export interface MoneyDiagram {
  kind: 'money'
  items: MoneyItem[]
}

/** Growing patterns: '#' dark tile, 'o' grey tile, '.' white tile, ' ' no tile. */
export interface TilePatternDiagram {
  kind: 'tile_pattern'
  designs: { label: string; rows: string[] }[]
  round?: boolean
}

export type ItemIcon = 'ball' | 'book' | 'cap' | 'drink' | 'apple' | 'pencil' | 'bag' | 'shirt' | 'shoe' | 'sandwich' | 'toy' | 'plant'

/** Shop items with price tags — the "Shana buys the items shown" layout. */
export interface PriceTagsDiagram {
  kind: 'price_tags'
  items: { name: string; price: string; icon: ItemIcon }[]
}

export type Diagram =
  | BarChartDiagram | NumberLineDiagram | DotPlotDiagram | GridMapDiagram | SimpleShapeDiagram
  | FunctionGraphDiagram | BoxPlotDiagram | NetworkGraphDiagram | DataTableDiagram | MatrixDiagram
  | IllustrationDiagram
  | LineGraphDiagram | PieChartDiagram | PictographDiagram | StemLeafDiagram
  | SpinnerDiagram | VennDiagram
  | FigureDiagram | GridShapeDiagram | CoordinatePlaneDiagram | SolidDiagram | NetDiagram
  | MeasureDiagram | ClockDiagram | BalanceDiagram | CalendarDiagram
  | FractionModelDiagram | BarModelDiagram | PlaceValueDiagram | ArrayDiagram | MoneyDiagram
  | TilePatternDiagram | PriceTagsDiagram
  | PseudocodeDiagram

export type DiagramKind = Diagram['kind']
