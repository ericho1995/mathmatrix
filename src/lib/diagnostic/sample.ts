import type { SubjectSlug, YearLevel } from '../../types'
import type { BankQuestion, DiagnosticReport, Response } from './types.ts'
import { testSpec } from './blueprint.ts'
import { selectReading, selectTest } from './select.ts'
import { buildReport } from './score.ts'
import { classify } from './areas.ts'
import { selectFollowUps, selectReadingFollowUp } from './followup.ts'
import { mulberry32 } from './rng.ts'

// ─────────────────────────────────────────────────────────────────────────────
// A made-up but realistic result, for the dev routes and the homepage's
// labelled sample report. One area goes badly, one well, the rest in between,
// and the sitting includes the follow-up part — so every part of the report
// has something to show.
// ─────────────────────────────────────────────────────────────────────────────

export interface SampleResult {
  responses: Response[]
  report: DiagnosticReport
}

export function sampleResult(bank: readonly BankQuestion[], year: YearLevel, subject: SubjectSlug, seed = 1): SampleResult | null {
  const byId = new Map(bank.map(q => [q.id, q]))
  const spec = subject === 'reading' ? null : testSpec(bank, year, subject)
  const ids = subject === 'reading' ? selectReading(bank, year, seed) : spec ? selectTest(bank, spec, seed) : []
  if (!ids.length) return null

  const areas = Array.from(new Set(ids.map(id => classify(byId.get(id)!).area.id)))
  const weak = areas[seed % areas.length]
  const strong = areas[(seed + 1) % areas.length]
  const rand = mulberry32(seed * 31 + 7)
  const answer = (id: string, followUp: boolean): Response => {
    const q = byId.get(id)!
    const options = q.format === 'short_answer' || !('options' in q) || !q.options ? 0 : q.options.length
    const correct = q.format === 'short_answer' || !('correct_index' in q) ? 0 : (q.correct_index ?? 0)
    const area = classify(q).area.id
    const chance = area === weak ? 0.3 : area === strong ? 0.95 : 0.7
    const ms = 12_000 + Math.floor(rand() * 35_000)
    const f = followUp ? { f: true } : {}
    if (rand() < chance) return { id, a: q.format === 'short_answer' ? q.expected_answer : correct, ms, ...f }
    if (rand() < 0.25) return { id, a: null, ms, ...f }
    if (q.format === 'short_answer') return { id, a: '0', ms, ...f }
    return { id, a: (correct + 1 + Math.floor(rand() * (options - 1))) % options, ms, ...f }
  }

  const first = ids.map(id => answer(id, false))
  const firstReport = buildReport(byId, year, subject, first)
  const more = subject === 'reading' ? selectReadingFollowUp(bank, firstReport, seed) : selectFollowUps(bank, firstReport, seed)
  const responses = [...first, ...more.map(id => answer(id, true))]
  return { responses, report: buildReport(byId, year, subject, responses) }
}
