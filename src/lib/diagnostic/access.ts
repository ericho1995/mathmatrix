import type { YearLevel } from '../../types'
import type { Access } from '../auth/access'
import { isVceYear } from '../pricing.ts'
import { tailoredExamId } from './tailor.ts'

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
