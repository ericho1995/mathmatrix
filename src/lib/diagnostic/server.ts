import { randomBytes, randomInt } from 'node:crypto'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { READING_TEXTS } from '@/lib/questions/magazines'
import { STIMULI } from '@/lib/questions/stimuli'
import { toScreenQuestion, type ScreenQuestion } from '@/lib/web/questionHtml'
import type { ReadingText } from '@/types/reading'
import type { Stimulus, YearLevel } from '@/types'
import type { BankQuestion, Response } from './types'
import type { AnswerIn, TestClaims } from './token'
import { offeredTests } from './blueprint'

// ─────────────────────────────────────────────────────────────────────────────
// What the diagnostic routes share: the bank as a map, the offered tests, the
// reading texts a test needs, and checking what a browser sends back.
// Server-only.
// ─────────────────────────────────────────────────────────────────────────────

export const BANK: readonly BankQuestion[] = QUESTION_BANK
export const BY_ID: ReadonlyMap<string, BankQuestion> = new Map(QUESTION_BANK.map(q => [q.id, q]))
export const OFFERED = offeredTests(QUESTION_BANK)

/**
 * Every question on a catalogue paper. Weak-areas papers draw their new
 * questions only from these, so a generated paper is made of the same vetted
 * questions as the published ones.
 */
export const CATALOGUE_IDS: ReadonlySet<string> = new Set(PRACTICE_EXAMS.flatMap(e => e.sections.flatMap(s => s.question_ids)))
export const CATALOGUE_BANK: readonly BankQuestion[] = QUESTION_BANK.filter(q => CATALOGUE_IDS.has(q.id))

export const isOffered = (year: unknown, subject: unknown): year is YearLevel =>
  OFFERED.some(o => o.year === year && o.subject === subject)

export const newNonce = () => randomBytes(12).toString('base64url')
export const newSeed = () => randomInt(1, 2 ** 31 - 1)

/** A plain passage as paragraphs a reader can lay out (the same as the on-screen Reading paper). */
export function passageAsText(s: Stimulus): ReadingText {
  return {
    id: s.id,
    page: 0,
    title: s.title,
    type: 'report',
    blocks: s.body
      .split(/\n\s*\n/)
      .map(t => ({ kind: 'para' as const, text: t.trim() }))
      .filter(b => b.text),
  }
}

const STIMULUS_BY_ID = new Map(STIMULI.map(s => [s.id, s]))

/** The texts a set of reading questions is about, keyed by stimulus id. */
export function textsFor(ids: readonly string[]): Record<string, ReadingText> {
  const out: Record<string, ReadingText> = {}
  for (const id of ids) {
    const sid = BY_ID.get(id)?.stimulus_id
    if (!sid || out[sid]) continue
    const magazine = READING_TEXTS.get(sid)
    if (magazine) {
      const { magazine: _m, ...text } = magazine
      out[sid] = text
      continue
    }
    const passage = STIMULUS_BY_ID.get(sid)
    if (passage) out[sid] = passageAsText(passage)
  }
  return out
}

/**
 * The texts of the free Reading papers at a year. They are already public, so
 * the free test uses them first rather than texts from the paid papers.
 */
export function freeReadingTexts(year: YearLevel): Set<string> {
  const ids = new Set<string>()
  for (const exam of PRACTICE_EXAMS) {
    if (exam.subject !== 'reading' || exam.yearLevel !== year || exam.premium) continue
    for (const s of exam.sections) for (const id of s.question_ids) {
      const sid = BY_ID.get(id)?.stimulus_id
      if (sid) ids.add(sid)
    }
  }
  return ids
}

export const screenQuestions = (ids: readonly string[], from = 1): ScreenQuestion[] =>
  ids.map((id, i) => toScreenQuestion(BY_ID.get(id)!, from + i))

const MAX_MS = 60 * 60_000

/**
 * The browser's answers, checked against the questions the token names: one
 * per question, a choice inside the options or a short typed answer. Returns
 * the responses to mark (with follow-ups flagged from the token, never from
 * the browser), or null if anything is malformed.
 */
export function parseAnswers(raw: unknown, claims: TestClaims): Response[] | null {
  if (!Array.isArray(raw) || raw.length !== claims.q.length) return null
  const core = claims.c ?? claims.q.length
  const out: Response[] = []
  for (let i = 0; i < raw.length; i++) {
    const q = BY_ID.get(claims.q[i])
    const item = raw[i] as Partial<AnswerIn> | null
    if (!q || !item || typeof item !== 'object') return null
    const a = item.a
    if (a !== null) {
      if (q.format === 'short_answer') {
        if (typeof a !== 'string' || a.length > 200) return null
      } else {
        const options = 'options' in q && q.options ? q.options.length : 0
        if (typeof a !== 'number' || !Number.isInteger(a) || a < 0 || a >= options) return null
      }
    }
    const r: Response = { id: q.id, a: a ?? null }
    if (typeof item.ms === 'number' && Number.isFinite(item.ms) && item.ms >= 0) r.ms = Math.min(Math.round(item.ms), MAX_MS)
    if (typeof item.ch === 'number' && Number.isInteger(item.ch) && item.ch > 0) r.ch = Math.min(item.ch, 99)
    if (item.g === true) r.g = true
    if (i >= core) r.f = true
    out.push(r)
  }
  return out
}

/** Answers as kept in a receipt: no ids (the claims hold them) and no follow-up flag. */
export const answersOf = (responses: readonly Response[]): AnswerIn[] =>
  responses.map(({ id: _id, f: _f, ...rest }) => rest)
