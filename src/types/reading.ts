// ─── Reading magazines ───────────────────────────────────────────────────────
// A NAPLAN Reading test is two booklets: a colour magazine of short texts, and
// a question booklet whose blocks say "Read <title> on page 3 of the magazine
// and answer questions 7 to 11". The questions live in bank.ts like every other
// question and point at a text through `stimulus_id`; the text itself, and the
// page it prints on, live here.
//
// A text is stored as typed blocks rather than one string of markdown, because
// the magazine's whole point is that it looks like a magazine: headings, fact
// boxes, numbered steps, captions and verse all print differently, and a parser
// guessing at that from prose is how layout bugs start.

import type { Diagram } from './diagrams'
import type { YearLevel } from './index'

/** What kind of text this is — printed on the page and used to keep a magazine varied. */
export type ReadingTextType =
  | 'story' | 'report' | 'explanation' | 'persuasive' | 'letter'
  | 'poem' | 'review' | 'news' | 'procedure' | 'web' | 'notice'

export type ReadingBlock =
  /** A paragraph of prose. */
  | { kind: 'para'; text: string }
  /** A subheading inside the text. */
  | { kind: 'heading'; text: string }
  /** A bulleted list. */
  | { kind: 'bullets'; items: string[] }
  /** A numbered list — the steps of a procedure. */
  | { kind: 'steps'; items: string[] }
  /** A boxed aside: "Did you know?" facts, a key, a summary. */
  | { kind: 'factbox'; title: string; items: string[] }
  /** Verse. Each entry is one line; an empty string is a stanza break. */
  | { kind: 'verse'; lines: string[] }
  /** Small print under a picture or diagram. */
  | { kind: 'caption'; text: string }
  /** A pulled-out quotation, printed large. */
  | { kind: 'quote'; text: string }
  /** Byline, dateline, sign-off — small italic text on its own line. */
  | { kind: 'note'; text: string }

/**
 * A process drawn as labelled boxes joined by arrows — the stages of a cycle,
 * the steps of a sequence. `then` labels the arrow leaving a step; in a cycle,
 * the last step's `then` labels the arrow back to the first.
 */
export interface FlowFigure {
  kind: 'flow'
  title?: string
  steps: { text: string; then?: string }[]
  cycle?: boolean
}

export interface ReadingText {
  /** Stable id. Questions point at this through `stimulus_id`. */
  id: string
  /** Page number inside the magazine. The question booklet prints it. */
  page: number
  /** Pages the text fills (default 1). The next text starts at `page + pages`. */
  pages?: number
  title: string
  type: ReadingTextType
  blocks: ReadingBlock[]
  /** Optional figure printed with the text: a labelled diagram, map, table or process. */
  figure?: Diagram | FlowFigure
  /** Prints beside the figure. */
  figureCaption?: string
  /** Spot illustration from ILLUSTRATIONS, printed after the text. Decoration
   * only: no question may depend on it. */
  art?: string
  /** Lay the prose out in two columns, as the longer magazine texts are. */
  columns?: 1 | 2
}

export interface ReadingMagazine {
  /** e.g. 'reading-grade_3-1' — also the exam id's stem. */
  id: string
  yearLevel: YearLevel
  /** Which practice set: magazine 1 is the free sample. */
  set: number
  texts: ReadingText[]
}
