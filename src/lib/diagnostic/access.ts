import type { YearLevel } from '../../types'
import type { Access } from '../auth/access'
import { isVceYear } from '../pricing.ts'
import { tailoredExamId } from './tailor.ts'
import { PAPERS_PER_MONTH, paperExamId } from './weakPapers.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Who gets a tailored exam in full.
//
// The diagnostic and its report are free. The exam built from them is part of
// the Grade 3 – Year 10 plan (or the old year-level bundle); a Year 11–12 exam
// is purchased like a VCE paper. Everyone else gets the preview: the first
// third of the paper and a page describing the rest.
// ─────────────────────────────────────────────────────────────────────────────

export type TailoredAccess =
  | { mode: 'full'; reason: 'plan' | 'admin' | 'purchased' }
  | { mode: 'preview'; purchase: 'plan' | 'vce' }

export function tailoredAccess(result: { id: string; year: YearLevel }, access: Access): TailoredAccess {
  if (access.admin) return { mode: 'full', reason: 'admin' }
  if (access.legacyYears.has(result.year)) return { mode: 'full', reason: 'purchased' }
  if (isVceYear(result.year)) {
    return access.papers.has(tailoredExamId(result.id)) ? { mode: 'full', reason: 'purchased' } : { mode: 'preview', purchase: 'vce' }
  }
  return access.plan ? { mode: 'full', reason: 'plan' } : { mode: 'preview', purchase: 'plan' }
}

// ─────────────────────────────────────────────────────────────────────────────
// Weak-areas papers (see weakPapers.ts).
//
// A Grade 3 – Year 10 plan (or the old bundle for that year) generates up to
// PAPERS_PER_MONTH papers a month. A VCE paper is purchased one at a time, at
// the VCE paper price, so it has no monthly cap: generating one makes it
// ready to purchase, and only one unpurchased paper waits at a time. Admins
// generate freely. Anyone else sees a preview of what the next paper holds.
// ─────────────────────────────────────────────────────────────────────────────

export type PaperRights =
  | { kind: 'allowance'; limit: number | null }
  | { kind: 'per_paper' }
  | { kind: 'locked' }

export function paperRights(year: YearLevel, access: Pick<Access, 'admin' | 'plan' | 'legacyYears'>): PaperRights {
  if (access.admin) return { kind: 'allowance', limit: null }
  if (access.legacyYears.has(year)) return { kind: 'allowance', limit: PAPERS_PER_MONTH }
  if (isVceYear(year)) return { kind: 'per_paper' }
  return access.plan ? { kind: 'allowance', limit: PAPERS_PER_MONTH } : { kind: 'locked' }
}

/** Whether a generated paper opens in full: the plan that covers its year, or its own purchase for VCE. */
export function paperOpen(paper: { id: string; year: YearLevel }, access: Pick<Access, 'admin' | 'plan' | 'legacyYears' | 'papers'>): boolean {
  if (access.admin || access.legacyYears.has(paper.year)) return true
  if (isVceYear(paper.year)) return access.papers.has(paperExamId(paper.id))
  return Boolean(access.plan)
}
