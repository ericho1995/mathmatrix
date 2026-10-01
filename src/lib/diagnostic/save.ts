import { createClient as createSupabase } from '@supabase/supabase-js'
import type { SubjectSlug, YearLevel } from '@/types'
import type { DiagnosticReport, Response } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Writing diagnostic results, with the service role. Server-only.
//
// Row-level security gives clients no way to write a result: the server marks
// the answers itself and inserts the row here. Every failure is logged and
// returned to the caller, which shows it — a result is never silently lost.
// ─────────────────────────────────────────────────────────────────────────────

export type SaveOutcome = { ok: true; id: string } | { ok: false; status: number; error: string }

const NOT_SET_UP = 'Saving results is not set up yet. Your answers are kept on this device; try again later.'

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabase(url, key, { auth: { persistSession: false } })
}

/** A missing table (migration not run) reads differently from other failures. */
const missingTable = (code?: string) => code === 'PGRST205' || code === '42P01'

function failure(scope: string, error: { message: string; code?: string }, context: Record<string, unknown>): SaveOutcome {
  console.error(`[diagnostic.${scope}] ${error.message}`, { code: error.code, ...context })
  if (missingTable(error.code)) return { ok: false, status: 503, error: NOT_SET_UP }
  return { ok: false, status: 500, error: 'The result could not be saved. Please try again.' }
}

export interface SaveInput {
  userId: string
  year: YearLevel
  subject: SubjectSlug
  childName: string | null
  responses: Response[]
  report: DiagnosticReport
  /** The sitting's nonce, so the same sitting is saved once however often it is sent. */
  receiptRef: string
}

export async function saveResult(input: SaveInput): Promise<SaveOutcome> {
  const db = admin()
  if (!db) {
    console.error('[diagnostic.save] SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is not set')
    return { ok: false, status: 503, error: NOT_SET_UP }
  }
  const row = {
    user_id: input.userId,
    child_name: input.childName,
    year_level: input.year,
    subject: input.subject,
    responses: input.responses,
    correct: input.report.correct,
    total: input.report.total,
    areas: input.report.areas.map(a => ({ id: a.id, label: a.label, pct: a.pct, level: a.level, confidence: a.confidence })),
    receipt_ref: input.receiptRef,
  }
  const inserted = await db
    .from('diagnostic_results')
    .upsert(row, { onConflict: 'receipt_ref', ignoreDuplicates: true })
    .select('id')
  if (inserted.error) return failure('save', inserted.error, { userId: input.userId })

  // A duplicate is ignored rather than returned, so look the row up: it is
  // this user's if they sent the same sitting twice, and someone else's if a
  // receipt was shared.
  const existing = await db.from('diagnostic_results').select('id, user_id').eq('receipt_ref', input.receiptRef).maybeSingle()
  if (existing.error) return failure('save.lookup', existing.error, { userId: input.userId })
  if (!existing.data) return failure('save.lookup', { message: 'row missing after upsert' }, { userId: input.userId })
  if (existing.data.user_id !== input.userId) {
    return { ok: false, status: 409, error: 'This result has already been saved to another account.' }
  }
  return { ok: true, id: existing.data.id as string }
}

export type Mark = { id: string; ok: boolean } | { id: string; m: number; of: number }

/** Saves the marking of a result's tailored exam. The caller has checked the user may see the result. */
export async function saveExamMarks(resultId: string, marks: Mark[]): Promise<SaveOutcome> {
  const db = admin()
  if (!db) return { ok: false, status: 503, error: NOT_SET_UP }
  const updated = await db
    .from('diagnostic_results')
    .update({ exam_marks: marks, exam_marked_at: new Date().toISOString() })
    .eq('id', resultId)
    .select('id')
  if (updated.error) return failure('marks', updated.error, { resultId })
  if (!updated.data?.length) return { ok: false, status: 404, error: 'Result not found.' }
  return { ok: true, id: resultId }
}
