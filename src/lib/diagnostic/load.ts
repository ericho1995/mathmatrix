import { createClient } from '@/lib/supabase/server'
import type { SubjectSlug, YearLevel } from '@/types'
import type { DiagnosticReport, Response } from './types'
import type { Mark } from './save'
import { buildReport } from './score'
import { composeTailoredExam, type TailoredExam } from './tailor'
import { buildProfile, type Profile } from './profile'
import { BANK, BY_ID } from './server'
import { parseCohort, type Cohort } from './cohort'

// ─────────────────────────────────────────────────────────────────────────────
// Reading saved results, with the visitor's own session: row-level security
// decides whose results they may see (their own, or a linked child's).
// Server-only.
// ─────────────────────────────────────────────────────────────────────────────

export interface LoadedResult {
  id: string
  userId: string
  childName: string | null
  year: YearLevel
  subject: SubjectSlug
  createdAt: string
  responses: Response[]
  report: DiagnosticReport
  exam: TailoredExam
  marks: Mark[] | null
  markedAt: string | null
}

export type LoadOutcome = { ok: true; result: LoadedResult; viewerId: string } | { ok: false; status: 401 | 404 | 500 }

const COLUMNS = 'id, user_id, child_name, year_level, subject, responses, created_at, exam_marks, exam_marked_at'

interface Row {
  id: string
  user_id: string
  child_name: string | null
  year_level: YearLevel
  subject: SubjectSlug
  responses: Response[]
  created_at: string
  exam_marks: Mark[] | null
  exam_marked_at: string | null
}

function hydrate(row: Row): LoadedResult {
  const report = buildReport(BY_ID, row.year_level, row.subject, row.responses)
  return {
    id: row.id,
    userId: row.user_id,
    childName: row.child_name,
    year: row.year_level,
    subject: row.subject,
    createdAt: row.created_at,
    responses: row.responses,
    report,
    exam: composeTailoredExam(BANK, { resultId: row.id, report, childName: row.child_name }),
    marks: row.exam_marks,
    markedAt: row.exam_marked_at,
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function loadResult(id: string): Promise<LoadOutcome> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, status: 401 }
  if (!UUID.test(id)) return { ok: false, status: 404 }
  const { data, error } = await supabase.from('diagnostic_results').select(COLUMNS).eq('id', id).maybeSingle()
  if (error) {
    console.error('[diagnostic.load] result read failed', { id, userId: user.id, error: error.message })
    return { ok: false, status: 500 }
  }
  if (!data) return { ok: false, status: 404 }
  return { ok: true, result: hydrate(data as Row), viewerId: user.id }
}

/**
 * Every sitting of the same test by the same child — same account, subject,
 * year and first name — pooled into one profile (see profile.ts). The newest
 * sitting counts most.
 */
export async function loadProfile(result: LoadedResult): Promise<{ profile: Profile; sittings: number } | null> {
  const supabase = createClient()
  let query = supabase
    .from('diagnostic_results')
    .select('id, responses, created_at, child_name')
    .eq('user_id', result.userId)
    .eq('year_level', result.year)
    .eq('subject', result.subject)
    .lte('created_at', result.createdAt)
    .order('created_at', { ascending: true })
  query = result.childName ? query.ilike('child_name', result.childName) : query.is('child_name', null)
  const { data, error } = await query
  if (error) {
    console.error('[diagnostic.load] earlier sittings could not be read', { id: result.id, error: error.message })
    return null
  }
  const sittings = (data ?? []).map(row => {
    const report = buildReport(BY_ID, result.year, result.subject, row.responses as Response[])
    return { id: row.id as string, at: row.created_at as string, areas: report.areas.map(a => ({ id: a.id, label: a.label, secure: a.secure, evidence: a.evidence })) }
  })
  if (!sittings.length) return null
  return { profile: buildProfile(sittings), sittings: sittings.length }
}

export interface ResultSummary {
  id: string
  userId: string
  childName: string | null
  year: YearLevel
  subject: SubjectSlug
  correct: number
  total: number
  areas: { id: string; label: string; pct: number; level: string; confidence?: string }[]
  createdAt: string
  markedAt: string | null
}

/** Every result the visitor can see, newest first, for the dashboards. */
export async function listResults(): Promise<{ ok: true; results: ResultSummary[] } | { ok: false }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('diagnostic_results')
    .select('id, user_id, child_name, year_level, subject, correct, total, areas, created_at, exam_marked_at')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) {
    console.error('[diagnostic.load] results list failed', { error: error.message })
    return { ok: false }
  }
  return {
    ok: true,
    results: (data ?? []).map(r => ({
      id: r.id,
      userId: r.user_id,
      childName: r.child_name,
      year: r.year_level,
      subject: r.subject,
      correct: r.correct,
      total: r.total,
      areas: r.areas,
      createdAt: r.created_at,
      markedAt: r.exam_marked_at,
    })),
  }
}

/**
 * How other children who sat the same test scored, for the report's
 * comparison. Null when it cannot be read (or the function is not set up yet),
 * in which case the report leaves the comparison out.
 */
export async function loadCohort(year: YearLevel, subject: SubjectSlug): Promise<Cohort | null> {
  const { data, error } = await createClient().rpc('diagnostic_cohort', { p_year: year, p_subject: subject })
  if (error) {
    console.error('[diagnostic.load] cohort read failed', { year, subject, code: error.code, error: error.message })
    return null
  }
  return parseCohort(data)
}
