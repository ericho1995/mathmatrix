import { createClient as createSupabase } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { sendNotice } from '@/lib/alerts'
import { SELECTIVE_SUBJECTS, SUBJECTS } from '@/lib/curriculum'
import { yearLabel } from '@/lib/yearLevels'
import type { SubjectSlug, YearLevel } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Requests from families for more practice papers (supabase/schema_paper_requests.sql).
//
// Written by the server with the service role (clients have no insert
// policy), read and updated by admins through row-level security, and emailed
// to the owner when alerts are set up (RESEND_API_KEY + ALERT_EMAIL). If the
// table is missing the email still goes, so a request is never silently lost;
// with neither, the family is asked to email support instead.
// ─────────────────────────────────────────────────────────────────────────────

export type RequestStatus = 'new' | 'in_progress' | 'done'
export const REQUEST_SOURCES = ['catalogue', 'paper', 'weak_papers'] as const
export type RequestSource = (typeof REQUEST_SOURCES)[number]

export interface PaperRequest {
  id: string
  createdAt: string
  email: string
  year: YearLevel
  subject: SubjectSlug
  note: string | null
  source: string | null
  status: RequestStatus
  updatedAt: string
}

const SUBJECT_LABEL = new Map([...SUBJECTS, ...SELECTIVE_SUBJECTS].map(s => [s.slug, s.label]))
export const subjectLabel = (s: string) => SUBJECT_LABEL.get(s as SubjectSlug) ?? s
export const isSubject = (s: unknown): s is SubjectSlug => typeof s === 'string' && SUBJECT_LABEL.has(s as SubjectSlug)

const missingTable = (code?: string) => code === 'PGRST205' || code === '42P01'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
/** Requests one email address may send in a day: enough for a family, not for a spammer. */
const DAILY_LIMIT = 3

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabase(url, key, { auth: { persistSession: false } })
}

export async function submitPaperRequest(input: {
  userId: string | null
  email: string
  year: YearLevel
  subject: SubjectSlug
  note: string | null
  source: RequestSource | null
}): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const db = serviceClient()
  const email = input.email.trim().toLowerCase()
  let stored = false
  if (db) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await db.from('paper_requests').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', since)
    if (!countError && (count ?? 0) >= DAILY_LIMIT) {
      return { ok: false, status: 429, error: 'We already have your requests from today. Our team will be in touch.' }
    }
    const { error } = await db.from('paper_requests').insert({
      user_id: input.userId,
      email,
      year_level: input.year,
      subject: input.subject,
      note: input.note,
      source: input.source,
    })
    if (error) console.error('[paper-requests] not stored', { code: error.code, error: error.message, missing: missingTable(error.code) })
    else stored = true
  }
  const emailed = await sendNotice(`Paper request: ${yearLabel(input.year)} ${subjectLabel(input.subject)}`, {
    email,
    year: yearLabel(input.year),
    subject: subjectLabel(input.subject),
    note: input.note ?? '(none)',
    from: input.source ?? 'unknown',
    saved: stored ? 'Listed on /admin/question-bank' : 'NOT saved (run supabase/schema_paper_requests.sql); reply from this email',
  })
  if (!stored && !emailed) {
    return { ok: false, status: 503, error: 'Requests are not set up yet. Please email us instead.' }
  }
  return { ok: true }
}

/** Every request, open ones first. Row-level security limits this to admins. */
export async function listPaperRequests(): Promise<{ ok: true; requests: PaperRequest[] } | { ok: false; missing: boolean }> {
  const { data, error } = await createClient()
    .from('paper_requests')
    .select('id, created_at, email, year_level, subject, note, source, status, updated_at')
    .order('created_at', { ascending: false })
    .limit(300)
  if (error) {
    console.error('[paper-requests] read failed', { code: error.code, error: error.message })
    return { ok: false, missing: missingTable(error.code) }
  }
  return {
    ok: true,
    requests: (data ?? []).map(r => ({
      id: r.id,
      createdAt: r.created_at,
      email: r.email,
      year: r.year_level,
      subject: r.subject,
      note: r.note,
      source: r.source,
      status: r.status,
      updatedAt: r.updated_at,
    })),
  }
}

/** Requests not yet done, for the admin's account page badge. */
export async function openPaperRequestCount(): Promise<number> {
  const { count, error } = await createClient().from('paper_requests').select('id', { count: 'exact', head: true }).neq('status', 'done')
  return error ? 0 : count ?? 0
}

/** Moves a request along (in progress, done). Row-level security allows admins only. */
export async function setPaperRequestStatus(id: string, status: RequestStatus, userId: string): Promise<boolean> {
  if (!UUID.test(id)) return false
  const { data, error } = await createClient()
    .from('paper_requests')
    .update({ status, handled_by: userId, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
  if (error) console.error('[paper-requests] status not saved', { id, error: error.message })
  return !error && Boolean(data?.length)
}
