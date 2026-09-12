import { Document, Page, View, Text, Svg, Rect, Line, Circle, Ellipse, Path, Polygon, Polyline, Text as SvgText } from '@react-pdf/renderer'
import { pdfStyles } from './theme'
import { Watermark, PageFooter } from './Brand'
import { SUBJECTS, SELECTIVE_SUBJECTS } from '@/lib/curriculum'
import { ILLUSTRATIONS } from '@/lib/questions/illustrations'
import type { ResolvedExam, ResolvedQuestion } from './resolveExam'
import type { PracticeExam, PracticeExamSection } from '@/lib/questions/exams'
import type { Diagram, NumberLineDiagram, DotPlotDiagram, GridMapDiagram, SimpleShapeDiagram, IllustrationDiagram } from '@/types'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/**
 * Render-time-only, best-effort extraction of a unit/currency symbol to print
 * alongside a short_answer question's blank line (e.g. `$______` or
 * `______ m`), matching real NAPLAN's unit-aware blanks. Never invents a unit
 * that isn't actually present in `expectedAnswer` — an unrecognized shape
 * falls back to a plain blank (the pre-existing behavior). Purely a display
 * helper: `expected_answer` itself and grading (`matchShortAnswer`) are
 * untouched.
 */
function extractAnswerUnit(expectedAnswer: string): { prefix?: string; suffix?: string } {
  const trimmed = expectedAnswer.trim()
  const currencyMatch = trimmed.match(/^([$€£])\s?[\d,.]/)
  if (currencyMatch) return { prefix: currencyMatch[1] }
  const unitMatch = trimmed.match(/^-?[\d,.]+\s+([a-zA-Z]{1,15})$/)
  if (unitMatch) return { suffix: unitMatch[1] }
  return {}
}

/** Simple bar chart, drawn with react-pdf's SVG primitives — the first
 * DiagramKind (see Question.diagram / docs/superpowers/specs/2026-09-11-naplan-
 * visual-format-design.md Phase 2). Sized in points, laid out left-to-right. */
function BarChart({ diagram }: { diagram: Extract<Diagram, { kind: 'bar_chart' }> }) {
  const chartWidth = 420
  const chartHeight = 130
  const barGap = 16
  const barWidth = (chartWidth - barGap * (diagram.bars.length + 1)) / diagram.bars.length
  const maxValue = Math.max(...diagram.bars.map(b => b.value), 1)

  return (
    <View style={pdfStyles.diagramBox} wrap={false}>
      {diagram.title ? <Text style={pdfStyles.diagramTitle}>{diagram.title}</Text> : null}
      <Svg width={chartWidth} height={chartHeight + 20}>
        <Line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#333" strokeWidth={1} />
        {diagram.bars.map((bar, i) => {
          const barHeight = (bar.value / maxValue) * (chartHeight - 20)
          const x = barGap + i * (barWidth + barGap)
          const y = chartHeight - barHeight
          return (
            <Rect key={i} x={x} y={y} width={barWidth} height={barHeight} fill="#185FA5" />
          )
        })}
      </Svg>
      <View style={pdfStyles.diagramLabelsRow}>
        {diagram.bars.map((bar, i) => {
          const isCurrency = diagram.unit && /^[$€£]$/.test(diagram.unit)
          const valueLabel = isCurrency
            ? `${diagram.unit}${bar.value.toFixed(2)}`
            : `${bar.value}${diagram.unit ? ` ${diagram.unit}` : ''}`
          return (
            <Text key={i} style={[pdfStyles.diagramLabel, { width: `${100 / diagram.bars.length}%` }]}>
              {bar.label}{'\n'}({valueLabel})
            </Text>
          )
        })}
      </View>
    </View>
  )
}

/** Number line with tick marks and one or more highlighted points — for
 * integer-arithmetic, translation, and pattern questions. */
function NumberLine({ diagram }: { diagram: NumberLineDiagram }) {
  const width = 380
  const left = 15
  const right = width - 15
  const scale = (right - left) / (diagram.max - diagram.min)
  const ticks: number[] = []
  for (let v = diagram.min; v <= diagram.max; v += diagram.step) ticks.push(v)
  const toX = (v: number) => left + (v - diagram.min) * scale

  return (
    <View style={pdfStyles.diagramBox} wrap={false}>
      {diagram.title ? <Text style={pdfStyles.diagramTitle}>{diagram.title}</Text> : null}
      <Svg width={width} height={50}>
        <Line x1={left} y1={20} x2={right} y2={20} stroke="#333" strokeWidth={1} />
        {ticks.map((t, i) => (
          <Line key={i} x1={toX(t)} y1={16} x2={toX(t)} y2={24} stroke="#333" strokeWidth={1} />
        ))}
        {diagram.marks.map((m, i) => (
          <Circle key={i} cx={toX(m.value)} cy={20} r={4} fill="#185FA5" />
        ))}
      </Svg>
      <View style={{ flexDirection: 'row', width, height: 12, position: 'relative' }}>
        {ticks.map((t, i) => (
          <Text key={i} style={[pdfStyles.diagramLabel, { position: 'absolute', left: toX(t) - 10, width: 20 }]}>{t}</Text>
        ))}
      </View>
      {diagram.marks.length ? (
        <Text style={pdfStyles.diagramCaption}>
          {diagram.marks.map(m => m.label).join('  •  ')}
        </Text>
      ) : null}
    </View>
  )
}

/** Dot plot — stacks one dot per data-point occurrence above a number-line axis. */
function DotPlot({ diagram }: { diagram: DotPlotDiagram }) {
  const width = 380
  const left = 15
  const right = width - 15
  const min = Math.min(...diagram.values)
  const max = Math.max(...diagram.values)
  const scale = (right - left) / Math.max(max - min, 1)
  const toX = (v: number) => left + (v - min) * scale
  const counts = new Map<number, number>()
  for (const v of diagram.values) counts.set(v, (counts.get(v) ?? 0) + 1)
  const maxStack = Math.max(...Array.from(counts.values()), 1)
  const dotR = 4
  const chartHeight = maxStack * (dotR * 2 + 2) + 10

  return (
    <View style={pdfStyles.diagramBox} wrap={false}>
      <Svg width={width} height={chartHeight + 25}>
        {Array.from(counts.entries()).flatMap(([value, count]) =>
          Array.from({ length: count }, (_, i) => (
            <Circle key={`${value}-${i}`} cx={toX(value)} cy={chartHeight - i * (dotR * 2 + 2)} r={dotR} fill="#185FA5" />
          ))
        )}
        <Line x1={left} y1={chartHeight + 8} x2={right} y2={chartHeight + 8} stroke="#333" strokeWidth={1} />
      </Svg>
      <View style={{ flexDirection: 'row', width, height: 12, position: 'relative' }}>
        {Array.from(new Set(diagram.values)).sort((a, b) => a - b).map((v, i) => (
          <Text key={i} style={[pdfStyles.diagramLabel, { position: 'absolute', left: toX(v) - 10, width: 20 }]}>{v}</Text>
        ))}
      </View>
      {diagram.axisLabel ? <Text style={pdfStyles.diagramCaption}>{diagram.axisLabel}</Text> : null}
    </View>
  )
}

/** Coordinate-style grid map (streets/suburb-map questions) — labelled columns
 * and rows with one or more marked, labelled points. */
function GridMap({ diagram }: { diagram: GridMapDiagram }) {
  const cell = 30
  const rowLabelWidth = 16
  const gridWidth = diagram.cols.length * cell
  const gridHeight = diagram.rowCount * cell

  return (
    <View style={pdfStyles.diagramBox} wrap={false}>
      {diagram.title ? <Text style={pdfStyles.diagramTitle}>{diagram.title}</Text> : null}
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: rowLabelWidth, marginTop: 10 }}>
          {Array.from({ length: diagram.rowCount }, (_, i) => (
            <Text key={`rn${i}`} style={[pdfStyles.diagramLabel, { height: cell, paddingTop: cell / 2 - 3, textAlign: 'right', paddingRight: 3 }]}>{diagram.rowCount - i}</Text>
          ))}
        </View>
        <Svg width={gridWidth + 10} height={gridHeight + 10}>
          <Rect x={0} y={10} width={gridWidth} height={gridHeight} fill="none" stroke="#333" strokeWidth={1} />
          {Array.from({ length: diagram.cols.length - 1 }, (_, i) => (
            <Line key={`v${i}`} x1={(i + 1) * cell} y1={10} x2={(i + 1) * cell} y2={10 + gridHeight} stroke="#ccc" strokeWidth={0.5} />
          ))}
          {Array.from({ length: diagram.rowCount - 1 }, (_, i) => (
            <Line key={`h${i}`} x1={0} y1={10 + (i + 1) * cell} x2={gridWidth} y2={10 + (i + 1) * cell} stroke="#ccc" strokeWidth={0.5} />
          ))}
          {diagram.points.map((p, i) => {
            const colIndex = diagram.cols.indexOf(p.col)
            const x = colIndex * cell + cell / 2
            const y = 10 + (diagram.rowCount - p.row) * cell + cell / 2
            return <Circle key={i} cx={x} cy={y} r={4} fill="#0F6E56" />
          })}
        </Svg>
      </View>
      <View style={{ flexDirection: 'row', marginLeft: rowLabelWidth, width: gridWidth }}>
        {diagram.cols.map((c, i) => (
          <Text key={i} style={[pdfStyles.diagramLabel, { width: cell }]}>{c}</Text>
        ))}
      </View>
      {diagram.points.length ? (
        <Text style={pdfStyles.diagramCaption}>
          {diagram.points.map(p => `${p.label} (${p.col}${p.row})`).join('  •  ')}
          {diagram.unitLabel ? ` — each cell = ${diagram.unitLabel}` : ''}
        </Text>
      ) : null}
    </View>
  )
}

// ── Dimension arrows for SimpleShape ────────────────────────────────────────
// A "double arrow" — a shaft with an arrowhead at both ends — drawn entirely
// with Line segments (no SVG Text, which garbles glyphs in this setup; see
// SimpleShape below). Used to mark exactly which edge a length label refers
// to, the way a real geometry-textbook or exam diagram does.
function arrowHeadWings(tipX: number, tipY: number, dirX: number, dirY: number, size: number) {
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
function SimpleShape({ diagram }: { diagram: SimpleShapeDiagram }) {
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
  const offset = 14
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
      {hypLabel ? <Text style={[pdfStyles.diagramLabel, { position: 'absolute', left: hMidX - 25, width: 50, top: hMidY - 10, textAlign: 'center' }]}>{hypLabel}</Text> : null}
    </View>
  )
}

/** Draws authored vector artwork (see src/lib/questions/illustrations.ts) — the
 * pictorial figures real NAPLAN uses that a chart renderer cannot express:
 * clock faces, coins, spinners, balance scales, labelled geometric figures.
 * Scales down to fit the column width while keeping its aspect ratio. */
function IllustrationView({ diagram }: { diagram: IllustrationDiagram }) {
  const art = ILLUSTRATIONS[diagram.id]
  if (!art) return null

  const maxWidth = 300
  const scale = art.width > maxWidth ? maxWidth / art.width : 1

  return (
    <View style={pdfStyles.diagramBox} wrap={false}>
      {diagram.title ? <Text style={pdfStyles.diagramTitle}>{diagram.title}</Text> : null}
      <Svg width={art.width * scale} height={art.height * scale} viewBox={`0 0 ${art.width} ${art.height}`}>
        {art.elements.map((el, i) => {
          const stroke = el.stroke
          const strokeWidth = el.strokeWidth
          const fill = el.fill
          switch (el.t) {
            case 'circle':
              return <Circle key={i} cx={el.cx} cy={el.cy} r={el.r} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
            case 'ellipse':
              return <Ellipse key={i} cx={el.cx} cy={el.cy} rx={el.rx} ry={el.ry} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
            case 'rect':
              return <Rect key={i} x={el.x} y={el.y} width={el.width} height={el.height} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
            case 'line':
              return <Line key={i} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={stroke} strokeWidth={strokeWidth} />
            case 'path':
              return <Path key={i} d={el.d} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
            case 'polygon':
              return <Polygon key={i} points={el.points} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
            case 'polyline':
              return <Polyline key={i} points={el.points} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />
            case 'text':
              return (
                <SvgText key={i} x={el.x} y={el.y} fill={el.fill ?? '#000'} textAnchor={el.textAnchor} style={{ fontSize: el.fontSize ?? 12 }}>
                  {el.content}
                </SvgText>
              )
          }
        })}
      </Svg>
    </View>
  )
}

/** DiagramKind-keyed dispatch — the registry the Phase 2 design calls for.
 * Adding a new kind means adding one component above and one case here. */
function DiagramView({ diagram }: { diagram: Diagram }) {
  switch (diagram.kind) {
    case 'bar_chart': return <BarChart diagram={diagram} />
    case 'number_line': return <NumberLine diagram={diagram} />
    case 'dot_plot': return <DotPlot diagram={diagram} />
    case 'grid_map': return <GridMap diagram={diagram} />
    case 'simple_shape': return <SimpleShape diagram={diagram} />
    case 'illustration': return <IllustrationView diagram={diagram} />
  }
}

function QuestionBlock({ question, number }: { question: ResolvedQuestion; number: number }) {
  return (
    <View style={pdfStyles.questionRow} wrap={false}>
      <Text style={pdfStyles.questionText}>{number}. {question.question_text}</Text>
      {question.diagram ? <DiagramView diagram={question.diagram} /> : null}
      {question.format === 'long_form' ? (
        <>
          <View style={pdfStyles.answerLine} />
          <View style={pdfStyles.answerLine} />
          <View style={pdfStyles.answerLine} />
          <View style={pdfStyles.answerLine} />
          <View style={pdfStyles.answerLine} />
          <View style={pdfStyles.answerLine} />
        </>
      ) : question.format === 'short_answer' ? (
        (() => {
          const { prefix, suffix } = extractAnswerUnit(question.expected_answer)
          // Box width tracks how much the student actually needs to write —
          // a one-digit answer and "$793.50" shouldn't get the same box —
          // generously sized so it reads as a real writing space, not a slot.
          const core = question.expected_answer.replace(/^[$€£]\s?/, '').trim()
          const boxWidth = Math.min(220, Math.max(80, core.length * 15 + 40))
          // Indent to roughly where the question's wording starts (after
          // "N. "), not flush with the number, so the box reads as part of
          // the sentence rather than a new column under the numbering.
          const indent = String(number).length >= 2 ? 26 : 20
          return (
            <View style={[pdfStyles.shortAnswerRow, { marginLeft: indent }]}>
              {prefix ? <Text style={pdfStyles.shortAnswerUnit}>{prefix}</Text> : null}
              <View style={[pdfStyles.answerBox, { width: boxWidth, flexGrow: 0 }]} />
              {suffix ? <Text style={pdfStyles.shortAnswerUnit}>{suffix}</Text> : null}
            </View>
          )
        })()
      ) : (
        <View style={pdfStyles.optionsWrap}>
          {(question.options ?? []).map((opt, i) => (
            <View key={i} style={pdfStyles.optionBox}>
              <Text style={pdfStyles.optionBoxText}>{OPTION_LETTERS[i]}. {opt}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

/** Plain NAPLAN-style running header for a section's content page(s):
 * subject + year level, all-caps, plus calculator status when the section
 * sets one (split exams). Section title/time stay below it — this app's
 * per-section time display is a useful deviation from real NAPLAN's
 * cover-only timing, kept deliberately (see design doc). */
function RunningHeader({ exam, section }: { exam: PracticeExam; section: PracticeExamSection }) {
  const subjectLabel = ([...SUBJECTS, ...SELECTIVE_SUBJECTS].find(s => s.slug === exam.subject)?.label ?? exam.subject).toUpperCase()
  const yearLabel = exam.yearLevel.replace('_', ' ').toUpperCase()
  const calcNote = section.calculator_allowed === true
    ? ' (CALCULATOR ALLOWED)'
    : section.calculator_allowed === false
      ? ' (NON-CALCULATOR)'
      : ''
  return <Text style={pdfStyles.runningHeader}>{yearLabel} {subjectLabel}{calcNote}</Text>
}

export function ExamPaperDocument({ resolved }: { resolved: ResolvedExam }) {
  const { exam, sections } = resolved
  let questionNumber = 0
  const totalMinutes = sections.reduce((sum, s) => sum + s.section.time_minutes, 0)

  return (
    <Document>
      <Page size="A4" style={pdfStyles.coverPage}>
        <View style={pdfStyles.coverBand}>
          <Text style={pdfStyles.coverWordmark}>Prep<Text style={pdfStyles.coverWordmarkAccent}>Nest</Text></Text>
          <Text style={pdfStyles.coverTagline}>Curriculum-aligned practice exams</Text>
        </View>
        <Watermark />
        <View style={pdfStyles.coverBody}>
          <Text style={pdfStyles.coverEyebrow}>Exam paper</Text>
          <Text style={pdfStyles.coverExamTitle}>{exam.title}</Text>
          {exam.reading_minutes ? (
            <View style={pdfStyles.coverTimingBox}>
              <Text style={pdfStyles.coverTimingRow}>Reading time: {exam.reading_minutes} minutes (no writing)</Text>
              <Text style={pdfStyles.coverTimingRow}>Writing time: {totalMinutes} minutes</Text>
              <Text style={pdfStyles.coverTimingTotal}>Total time: {exam.reading_minutes + totalMinutes} minutes</Text>
            </View>
          ) : (
            <Text style={pdfStyles.coverMetaRow}>Total time: {totalMinutes} minutes</Text>
          )}
          <View style={pdfStyles.coverDivider} />
          <Text style={pdfStyles.coverSectionsLabel}>Sections in this paper</Text>
          {sections.map((s, i) => (
            <View key={i} style={pdfStyles.coverSectionRow}>
              <View style={pdfStyles.coverSectionDot} />
              <Text style={pdfStyles.coverSectionText}>
                {s.section.title} — {s.section.time_minutes} min
                {s.section.calculator_allowed !== undefined ? (s.section.calculator_allowed ? ' (calculator allowed)' : ' (no calculator)') : ''}
              </Text>
            </View>
          ))}
          <View style={pdfStyles.coverInstructionsBox}>
            <Text style={pdfStyles.coverInstructionsTitle}>Instructions</Text>
            <Text style={pdfStyles.coverInstructions}>
              {exam.reading_minutes ? 'You are not permitted to write during reading time — you may only read the paper and plan your approach. ' : ''}
              Answer every question you can. Write your working in the space provided for long-answer questions.
              Marking guidance and full explanations are provided in the separate answer key.
            </Text>
          </View>
        </View>
        <PageFooter examTitle={exam.title} />
      </Page>

      {sections.map((s, si) => (
        <Page key={si} size="A4" style={pdfStyles.page}>
          <Watermark />
          <RunningHeader exam={exam} section={s.section} />
          <Text style={pdfStyles.sectionHeader}>{s.section.title}</Text>
          <Text style={pdfStyles.sectionMeta}>
            {s.section.time_minutes} minutes
            {s.section.calculator_allowed !== undefined ? (s.section.calculator_allowed ? ' • Calculator allowed' : ' • No calculator') : ''}
          </Text>
          {(() => {
            const rendered: JSX.Element[] = []
            let lastStimulusId: string | undefined
            for (const q of s.questions) {
              questionNumber++
              if (q.stimulus && q.stimulus.id !== lastStimulusId) {
                rendered.push(
                  <View key={`stim-${q.stimulus.id}`} style={pdfStyles.stimulusBox} wrap={false}>
                    <Text style={pdfStyles.stimulusTitle}>{q.stimulus.title}</Text>
                    <Text style={pdfStyles.stimulusBody}>{q.stimulus.body}</Text>
                  </View>
                )
                lastStimulusId = q.stimulus.id
              }
              rendered.push(<QuestionBlock key={q.id} question={q} number={questionNumber} />)
            }
            return rendered
          })()}
          <PageFooter examTitle={exam.title} />
        </Page>
      ))}
    </Document>
  )
}
