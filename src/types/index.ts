// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'parent' | 'admin'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface StudentProfile extends UserProfile {
  role: 'student'
  year_level: YearLevel
  parent_id?: string
  xp_total: number
  streak_days: number
}

export interface ParentProfile extends UserProfile {
  role: 'parent'
  linked_student_ids: string[]
}

// ─── Curriculum ───────────────────────────────────────────────────────────────

export type YearLevel =
  | 'grade_3' | 'grade_4' | 'grade_5' | 'grade_6'
  | 'year_7'  | 'year_8'  | 'year_9'
  | 'year_10' | 'year_11' | 'year_12'

export type SubjectSlug =
  | 'math' | 'english' | 'science'
  | 'chemistry' | 'physics' | 'maths_methods' | 'general_maths' | 'specialist_maths'

export interface Subject {
  slug: SubjectSlug
  label: string
  tagline: string
  icon: string
  color: string
  /** VCE-style selective subject (Year 11-12), shown in its own practice track. */
  selective?: boolean
}

export type TopicSlug =
  | 'number_operations' | 'number_patterns' | 'algebra_equations' | 'geometry_measurement' | 'statistics_probability'
  | 'reading_comprehension' | 'reading_literary_analysis' | 'grammar_punctuation' | 'vocabulary'
  | 'life_science' | 'physical_science' | 'earth_space'
  | 'chem_atomic_structure' | 'chem_reactions'
  | 'phys_mechanics' | 'phys_electricity'
  | 'mm_functions' | 'mm_algebra' | 'mm_calculus' | 'mm_probability'
  // The four General Mathematics Unit 3 & 4 areas of study. gm_financial is
  // VCAA's "recursion and financial modelling"; the slug predates Unit 3 & 4.
  | 'gm_data_analysis' | 'gm_financial' | 'gm_matrices' | 'gm_networks'
  | 'sm_complex_numbers' | 'sm_vectors'

export interface Topic {
  slug: TopicSlug
  subject: SubjectSlug
  label: string
  description: string
  icon: string
  color: string
}

export type Difficulty = 'foundation' | 'developing' | 'proficient' | 'advanced'

export type StimulusType = 'passage' | 'data_table' | 'image'

// ─── Diagrams (graphical questions) ────────────────────────────────────────
// Per-question graphic, rendered inline above the question text. Starts with
// just 'bar_chart' (see docs/superpowers/specs/2026-09-11-naplan-visual-format-design.md
// Phase 2) — more kinds get added one at a time as content actually needs them.

export interface BarChartDiagram {
  kind: 'bar_chart'
  title?: string
  unit?: string                              // e.g. 'students', '$' — shown on the axis label
  bars: { label: string; value: number }[]
}

export interface NumberLineDiagram {
  kind: 'number_line'
  title?: string
  min: number
  max: number
  step: number
  marks: { value: number; label: string }[]  // highlighted points, e.g. a starting position
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
    label?: string
  }[]
  /** Marked points — intercepts, turning points, a stated coordinate. */
  points?: { x: number; y: number; label?: string }[]
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

export type Diagram =
  | BarChartDiagram | NumberLineDiagram | DotPlotDiagram | GridMapDiagram | SimpleShapeDiagram
  | FunctionGraphDiagram | BoxPlotDiagram | NetworkGraphDiagram | DataTableDiagram | MatrixDiagram
  | IllustrationDiagram

export interface Stimulus {
  id: string
  type: StimulusType
  title: string
  body: string            // markdown/plain text for 'passage'; JSON-stringified rows for 'data_table'; image URL for 'image'
  subject: SubjectSlug
  year_level: YearLevel
  word_count?: number      // 'passage' only, informational
}

// ─── Questions ────────────────────────────────────────────────────────────────

export type QuestionFormat = 'multiple_choice' | 'long_form' | 'short_answer' | 'extended_response'

interface QuestionBase {
  id: string
  topic: TopicSlug
  year_level: YearLevel
  difficulty: Difficulty
  question_text: string
  explanation: string
  curriculum_code?: string   // e.g. "AC9M6N01"
  stimulus_id?: string          // FK into Stimulus — questions sharing an id are asked about the same passage/data
  calculator_allowed?: boolean  // Maths Yr7-9 Numeracy only; true = calculator section, unset/false = non-calculator
  diagram?: Diagram             // per-question graphic (bar chart, etc.) rendered above the question text
  marks?: number                // VCE only; NAPLAN papers are scored by question count, not marks
  created_at: string
}

// format is omitted on existing multiple-choice questions in bank.ts and
// defaults to 'multiple_choice' — only long-form questions need to set it.
export interface MultipleChoiceQuestion extends QuestionBase {
  format?: 'multiple_choice'
  options: string[]
  correct_index: number
}

// Free-response questions (used in premium selective-subject exams). Not
// auto-gradable — the response is saved on QuestionAttempt for later manual review.
export interface LongFormQuestion extends QuestionBase {
  format: 'long_form'
  options?: undefined
  correct_index?: undefined
}

// Auto-gradable, but no multiple-choice options — the student types a short
// answer (a number, word, or short phrase) instead of picking one.
export interface ShortAnswerQuestion extends QuestionBase {
  format: 'short_answer'
  options?: undefined
  correct_index?: undefined
  expected_answer: string        // canonical correct answer, shown in the answer key verbatim
  accepted_answers?: string[]    // additional acceptable phrasings/forms; expected_answer is always accepted too
}

// ─── Extended response (VCE) ─────────────────────────────────────────────────
// A real VCAA exam question is one context with several lettered parts, each
// carrying its own marks — e.g. Methods Exam 2 Section B question 1 is worth 13
// marks across parts a (1), b (1), c (2) and so on, all about the same scenario.
// Modelling that as several separate questions loses both the shared stem and
// the mark allocation, which is most of what makes a VCE paper a VCE paper.

export interface QuestionPart {
  /** 'a', 'b', 'c.i' — printed in the margin, and the order parts appear in. */
  label: string
  prompt: string
  marks: number
  /** Model answer, printed in the answer key. */
  expected_answer: string
  /** Marking guidance: what earns each mark. */
  explanation: string
}

export interface ExtendedResponseQuestion extends QuestionBase {
  format: 'extended_response'
  options?: undefined
  correct_index?: undefined
  /** Shared context for every part. `question_text` carries the scenario. */
  parts: QuestionPart[]
}

export type Question =
  | MultipleChoiceQuestion
  | LongFormQuestion
  | ShortAnswerQuestion
  | ExtendedResponseQuestion

/** Marks a question is worth. VCE multiple choice is 1 mark; an extended
 * response is the sum of its parts. Questions outside VCE carry no marks. */
export function questionMarks(q: Question): number {
  if (q.format === 'extended_response') return q.parts.reduce((sum, p) => sum + p.marks, 0)
  return q.marks ?? 0
}

// ─── Sessions & Attempts ─────────────────────────────────────────────────────

export interface PracticeSession {
  id: string
  student_id: string
  topic: TopicSlug
  year_level: YearLevel
  mode: 'practice' | 'timed_challenge'
  started_at: string
  completed_at?: string
  total_questions: number
  correct_count: number
  xp_earned: number
}

export interface QuestionAttempt {
  id: string
  session_id: string
  question_id: string
  selected_index: number        // -1 for long-form/short-answer (not applicable)
  response_text?: string        // free-text answer for long-form/short-answer questions
  is_correct: boolean | null    // null = not auto-gradable (long-form, pending review)
  time_taken_seconds: number
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number
  student_id: string
  full_name: string
  year_level: YearLevel
  xp_total: number
  sessions_this_week: number
}

// ─── Parent Dashboard ─────────────────────────────────────────────────────────

export interface TopicPerformance {
  topic: TopicSlug
  label: string
  accuracy_percent: number
  sessions_count: number
  last_practiced?: string
}

export interface StudentReport {
  student: StudentProfile
  topic_performance: TopicPerformance[]
  recent_sessions: PracticeSession[]
  recommended_topics: TopicSlug[]
  weekly_xp: number
  avg_accuracy: number
}

// ─── UI State ────────────────────────────────────────────────────────────────

export interface QuizState {
  questions: Question[]
  current_index: number
  answers: (number | null)[]
  time_per_question: number[]
  started_at: number
  status: 'idle' | 'active' | 'reviewing' | 'complete'
}
