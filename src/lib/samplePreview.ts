import React from 'react'
import type { StaticImageData } from 'next/image'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { DiagramView } from '@/lib/pdf/diagrams'
import { pdfToHtml } from '@/lib/web/pdfToHtml'
import { richHtml } from '@/lib/web/mathHtml'
import { toScreenQuestion, type ScreenQuestion } from '@/lib/web/questionHtml'
import { isScreenable } from '@/lib/diagnostic/blueprint'
import { classify } from '@/lib/diagnostic/areas'
import { BY_ID, textsFor } from '@/lib/diagnostic/server'
import type { BankQuestion } from '@/lib/diagnostic/types'
import type { ReadingText } from '@/types/reading'
import { SAMPLES, type SampleKey } from '@/lib/samples'

// ─────────────────────────────────────────────────────────────────────────────
// "Look inside" as something to try, not just to look at: three real
// questions from each free sample paper, answerable on screen with the answer
// and explanation straight after.
//
// Only FREE papers are used, and their answer keys are free downloads, so
// sending the answers to the browser here gives nothing away. The picks are
// fixed (not random) so the page renders the same way every time.
// Server-only: it draws diagrams and maths to HTML.
// ─────────────────────────────────────────────────────────────────────────────

export interface TryQuestion {
  kind: 'choice' | 'text'
  question: ScreenQuestion
  /** The right option (choice) — free paper, so safe to send. */
  correct: number | null
  /** Accepted typed answers (text). */
  accepted: string[]
  /** The right answer, as shown after checking. */
  answerHtml: string
  explanationHtml: string
}

export interface WrittenPart {
  label: string
  promptHtml: string
  marks: number
  answerHtml: string
  guideHtml: string
}

export interface WrittenQuestion {
  stemHtml: string
  diagramHtml?: string
  marks: number
  parts: WrittenPart[]
}

export type Tone = 'brand' | 'teal' | 'amber' | 'grape'

export interface SamplePreview {
  key: SampleKey
  title: string
  caption: string
  image: StaticImageData
  alt: string
  paperId: string
  paperTitle: string
  /** Questions in the whole paper, for "that was 3 of 30". */
  paperQuestions: number
  tone: Tone
  /** Multiple choice or typed answers, marked on the spot. */
  questions: TryQuestion[]
  /** VCE: a written question with its worked solution and marking guide. */
  written?: WrittenQuestion
  /** Reading: the text the questions are about. */
  text?: ReadingText
}

const TONE: Record<SampleKey, Tone> = {
  readingCover: 'teal',
  readingPage: 'teal',
  readingQuestions: 'teal',
  numeracy: 'brand',
  answerKey: 'amber',
  conventions: 'grape',
  vcePaper: 'grape',
  vceKey: 'amber',
}

const paperQuestionIds = (paperId: string) => PRACTICE_EXAMS.find(e => e.id === paperId)?.sections.flatMap(s => s.question_ids) ?? []
const questionsOf = (paperId: string) => paperQuestionIds(paperId).map(id => BY_ID.get(id)).filter((q): q is BankQuestion => Boolean(q))

function toTry(q: BankQuestion, n: number): TryQuestion {
  const question = toScreenQuestion(q, n)
  if (q.format === 'short_answer') {
    return {
      kind: 'text',
      question,
      correct: null,
      accepted: [q.expected_answer, ...(q.accepted_answers ?? [])],
      answerHtml: richHtml(q.expected_answer),
      explanationHtml: richHtml(q.explanation),
    }
  }
  const options = 'options' in q && q.options ? q.options : []
  const correct = 'correct_index' in q && typeof q.correct_index === 'number' ? q.correct_index : 0
  return {
    kind: 'choice',
    question,
    correct,
    accepted: [],
    answerHtml: `${'ABCDEF'[correct]}. ${richHtml(options[correct] ?? '')}`,
    explanationHtml: richHtml(q.explanation),
  }
}

/** Up to `n` questions spread through the paper, preferring a test. */
function spread(qs: readonly BankQuestion[], n: number, prefer?: (q: BankQuestion) => boolean): BankQuestion[] {
  const pool = prefer && qs.filter(prefer).length >= n ? qs.filter(prefer) : qs
  if (pool.length <= n) return [...pool]
  return Array.from({ length: n }, (_, i) => pool[Math.floor(((i + 0.5) * pool.length) / n)])
}

function readingPicks(paperId: string, prefer?: RegExp): { questions: BankQuestion[]; text?: ReadingText } {
  const qs = questionsOf(paperId).filter(isScreenable)
  const byText = new Map<string, BankQuestion[]>()
  for (const q of qs) if (q.stimulus_id) byText.set(q.stimulus_id, [...(byText.get(q.stimulus_id) ?? []), q])
  const texts = textsFor(qs.map(q => q.id))
  const ids = Array.from(byText.keys())
  const chosen = ids.find(id => prefer && prefer.test(texts[id]?.title ?? '')) ?? ids[0]
  if (!chosen) return { questions: [] }
  return { questions: (byText.get(chosen) ?? []).slice(0, 3), text: texts[chosen] }
}

function writtenOf(paperId: string): WrittenQuestion | undefined {
  const q = questionsOf(paperId)
    .filter(x => x.format === 'extended_response')
    .sort((a, b) => (a.format === 'extended_response' && b.format === 'extended_response' ? a.parts.length - b.parts.length : 0))[0]
  if (!q || q.format !== 'extended_response') return undefined
  return {
    stemHtml: richHtml(q.question_text),
    ...(q.diagram ? { diagramHtml: pdfToHtml(React.createElement(DiagramView, { diagram: q.diagram, fit: 420 })) } : {}),
    marks: q.parts.reduce((n, p) => n + p.marks, 0),
    parts: q.parts.map(p => ({
      label: p.label,
      promptHtml: richHtml(p.prompt),
      marks: p.marks,
      answerHtml: richHtml(p.expected_answer),
      guideHtml: richHtml(p.explanation),
    })),
  }
}

export function samplePreview(key: SampleKey): SamplePreview {
  const s = SAMPLES[key]
  let picks: BankQuestion[] = []
  let text: ReadingText | undefined
  let written: WrittenQuestion | undefined

  const all = questionsOf(s.paperId).filter(isScreenable)
  switch (key) {
    case 'readingCover':
    case 'readingQuestions':
      ;({ questions: picks, text } = readingPicks(s.paperId))
      break
    case 'readingPage':
      ;({ questions: picks, text } = readingPicks(s.paperId, /compass/i))
      break
    case 'numeracy':
      picks = spread(all, 3, q => Boolean(q.diagram) && q.format !== 'short_answer')
      break
    case 'answerKey':
      picks = spread(all, 3, q => !q.diagram)
      break
    case 'conventions': {
      // One spelling, one grammar, one punctuation question where the paper has them.
      const byArea = (id: string) => all.find(q => classify(q).area.id === id)
      picks = ['spelling', 'grammar', 'punctuation'].map(byArea).filter((q): q is BankQuestion => Boolean(q))
      if (picks.length < 3) picks = spread(all, 3)
      break
    }
    case 'vcePaper':
    case 'vceKey':
      written = writtenOf(s.paperId)
      break
  }

  return {
    key,
    title: s.title,
    caption: s.caption,
    image: s.image,
    alt: s.alt,
    paperId: s.paperId,
    paperTitle: s.paperTitle,
    paperQuestions: paperQuestionIds(s.paperId).length,
    tone: TONE[key],
    questions: picks.map((q, i) => toTry(q, i + 1)),
    ...(written ? { written } : {}),
    ...(text ? { text } : {}),
  }
}
