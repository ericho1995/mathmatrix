import { randomUUID } from 'node:crypto'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import type { YearLevel, SubjectSlug } from '@/types'
import type { Answer } from './types'
import type { LoadedResult } from './load'
import type { Mark } from './save'
import type { PaperRights } from './access'
import { loadResult } from './load'
import { composeTailoredExam, type TailoredExam } from './tailor'
import { isViable, lowAreas, monthWindow, paperExamId, type LowArea } from './weakPapers'
import { BANK, CATALOGUE_BANK, CATALOGUE_IDS } from './server'

// ─────────────────────────────────────────────────────────────────────────────
// Weak-areas papers in the database. Server-only.
//
// Reads use the visitor's session, so row-level security decides whose papers
// they see (the same people who can see the result). Writes use the service
// role: the server composes the paper, and create_diagnostic_paper checks the
// monthly allowance under a lock before inserting it.
// ─────────────────────────────────────────────────────────────────────────────

export interface PaperRow {
  id: string
  resultId: string
  seq: number
  year: YearLevel
  subject: SubjectSlug
  exam: TailoredExam
  createdAt: string
  createdBy: string
  onlineAnswers: { id: string; a: Answer }[] | null
  marks: Mark[] | null
  markedAt: string | null
}

const COLUMNS = 'id, result_id, seq, year_level, subject, exam, created_at, created_by, online_answers, marks, marked_at'

interface Row {
  id: string
  result_id: string
  seq: number
  year_level: YearLevel
  subject: SubjectSlug
  exam: TailoredExam
  created_at: string
  created_by: string
  online_answers: { id: string; a: Answer }[] | null
  marks: Mark[] | null
  marked_at: string | null
}

const toPaper = (r: Row): PaperRow => ({
  id: r.id,
  resultId: r.result_id,
  seq: r.seq,
  year: r.year_level,
  subject: r.subject,
  exam: r.exam,
  createdAt: r.created_at,
  createdBy: r.created_by,
  onlineAnswers: r.online_answers,
  marks: r.marks,
  markedAt: r.marked_at,
})

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const missingTable = (code?: string) => code === 'PGRST205' || code === '42P01'
const NOT_SET_UP = 'Practice papers are not set up yet. Please try again later.'

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabase(url, key, { auth: { persistSession: false } })
}

const childKey = (name: string | null) => (name ?? '').trim().toLowerCase()

/** A result's papers, oldest first. `missing` when the migration has not run. */
export async function listPapers(resultId: string): Promise<{ ok: true; papers: PaperRow[] } | { ok: false; missing: boolean }> {
  const { data, error } = await createClient().from('diagnostic_papers').select(COLUMNS).eq('result_id', resultId).order('seq', { ascending: true })
  if (error) {
    console.error('[diagnostic.papers] list failed', { resultId, code: error.code, error: error.message })
    return { ok: false, missing: missingTable(error.code) }
  }
  return { ok: true, papers: (data as Row[]).map(toPaper) }
}

export type PaperOutcome = { ok: true; paper: PaperRow; result: LoadedResult; viewerId: string } | { ok: false; status: 401 | 404 | 500 }

/** One paper with its result, if the visitor may see the result. */
export async function loadPaper(paperId: string): Promise<PaperOutcome> {
  if (!UUID.test(paperId)) return { ok: false, status: 404 }
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, status: 401 }
  const { data, error } = await supabase.from('diagnostic_papers').select(COLUMNS).eq('id', paperId).maybeSingle()
  if (error) {
    console.error('[diagnostic.papers] read failed', { paperId, code: error.code, error: error.message })
    return { ok: false, status: missingTable(error.code) ? 404 : 500 }
  }
  if (!data) return { ok: false, status: 404 }
  const loaded = await loadResult((data as Row).result_id)
  if (!loaded.ok) return loaded
  return { ok: true, paper: toPaper(data as Row), result: loaded.result, viewerId: loaded.viewerId }
}

/**
 * Every question on this child's earlier papers — from any sitting of the same
 * test (same account, year, subject and first name), so a re-test's papers
 * carry on where the last left off rather than starting over.
 */
async function usedQuestionIds(result: LoadedResult): Promise<Set<string> | null> {
  const { data, error } = await createClient()
    .from('diagnostic_papers')
    .select('question_ids')
    .eq('owner_id', result.userId)
    .eq('year_level', result.year)
    .eq('subject', result.subject)
    .eq('child_key', childKey(result.childName))
  if (error) {
    console.error('[diagnostic.papers] used questions read failed', { resultId: result.id, error: error.message })
    return null
  }
  return new Set((data ?? []).flatMap(r => r.question_ids as string[]))
}

/** Papers the account generated this month that count towards the allowance. */
export async function papersThisMonth(userId: string): Promise<number | null> {
  const db = admin()
  if (!db) return null
  const { start } = monthWindow()
  const { count, error } = await db
    .from('diagnostic_papers')
    .select('id', { count: 'exact', head: true })
    .eq('created_by', userId)
    .eq('counted', true)
    .gte('created_at', start.toISOString())
  if (error) {
    console.error('[diagnostic.papers] allowance count failed', { userId, error: error.message })
    return null
  }
  return count ?? 0
}

/** What the next paper for a result would be, without saving it — for the preview. */
export function composeNext(result: LoadedResult, seq: number, used: ReadonlySet<string>, id: string): TailoredExam {
  return composeTailoredExam(
    BANK,
    { resultId: result.id, report: result.report, childName: result.childName },
    { weakOnly: true, seq, used, allowed: CATALOGUE_IDS, id: paperExamId(id) }
  )
}

/** The preview of the first paper, for a visitor who cannot generate yet. */
export const previewPaper = (result: LoadedResult) => composeNext(result, 1, new Set(), 'preview')

/** Logs and records the areas running short, for the admin page. Never fails the caller. */
async function noteLowAreas(result: LoadedResult, low: readonly LowArea[], exhausted: boolean) {
  if (!low.length) return
  console.warn('[diagnostic.papers] question bank running low', {
    year: result.year,
    subject: result.subject,
    areas: low.map(l => `${l.label}: ${l.remaining} left`),
    exhausted,
  })
  const db = admin()
  if (!db) return
  for (const l of low) {
    const { error } = await db.rpc('note_question_bank_alert', {
      p_year: result.year,
      p_subject: result.subject,
      p_area: l.area,
      p_label: l.label,
      p_remaining: l.remaining,
      p_exhausted: exhausted || l.exhausted,
    })
    if (error) console.error('[diagnostic.papers] alert not recorded', { area: l.area, error: error.message })
  }
}

export type GenerateOutcome =
  | { ok: true; paperId: string; existing?: boolean }
  | { ok: false; status: number; error: string; code?: 'limit' | 'exhausted' | 'locked' }

/**
 * Generates the next weak-areas paper for a result. The caller has loaded the
 * result (so the visitor may see it) and worked out their rights. `isOpen`
 * says whether an existing paper is already paid for, so a VCE parent who has
 * one waiting to purchase gets that one back rather than a second.
 */
export async function generatePaper(input: {
  result: LoadedResult
  viewerId: string
  rights: PaperRights
  isOpen: (paperId: string) => boolean
}): Promise<GenerateOutcome> {
  const { result, viewerId, rights } = input
  if (rights.kind === 'locked') return { ok: false, status: 402, code: 'locked', error: 'Practice papers are part of the plan.' }
  const db = admin()
  if (!db) {
    console.error('[diagnostic.papers] SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is not set')
    return { ok: false, status: 503, error: NOT_SET_UP }
  }

  const listed = await listPapers(result.id)
  if (!listed.ok) return { ok: false, status: listed.missing ? 503 : 500, error: listed.missing ? NOT_SET_UP : 'Could not read the papers. Please try again.' }
  if (rights.kind === 'per_paper') {
    const waiting = listed.papers.find(p => !input.isOpen(p.id))
    if (waiting) return { ok: true, paperId: waiting.id, existing: true }
  }

  const { start } = monthWindow()
  let seq = (listed.papers.at(-1)?.seq ?? 0) + 1
  // Two tries: if another paper lands for this result between composing and
  // saving, compose again for the number it really gets.
  for (let attempt = 0; attempt < 2; attempt++) {
    const used = await usedQuestionIds(result)
    if (!used) return { ok: false, status: 500, error: 'Could not read the earlier papers. Please try again.' }
    const id = randomUUID()
    const exam = composeNext(result, seq, used, id)
    const low = lowAreas(CATALOGUE_BANK, result.report, exam, used)
    if (!isViable(exam)) {
      await noteLowAreas(result, low.length ? low : lowAreas(CATALOGUE_BANK, result.report, null, used), true)
      return {
        ok: false,
        status: 409,
        code: 'exhausted',
        error: `${result.childName ?? 'Your child'} has now seen every question we have for these areas. We’ve been told and are writing more — in the meantime, a re-test will show what has improved.`,
      }
    }

    const counted = rights.kind === 'allowance' && rights.limit !== null
    const { data, error } = await db.rpc('create_diagnostic_paper', {
      p_id: id,
      p_result: result.id,
      p_owner: result.userId,
      p_creator: viewerId,
      p_child_key: childKey(result.childName),
      p_year: result.year,
      p_subject: result.subject,
      p_seq: seq,
      p_exam: exam,
      p_question_ids: exam.sections.flatMap(s => s.question_ids),
      p_counted: counted,
      p_limit: rights.kind === 'allowance' ? rights.limit : null,
      p_since: start.toISOString(),
    })
    if (error) {
      console.error('[diagnostic.papers] create failed', { resultId: result.id, code: error.code, error: error.message })
      const missing = missingTable(error.code) || error.code === 'PGRST202'
      return { ok: false, status: missing ? 503 : 500, error: missing ? NOT_SET_UP : 'The paper could not be made. Please try again.' }
    }
    const outcome = data as { ok: boolean; reason?: 'limit' | 'seq'; seq?: number }
    if (outcome.ok) {
      await noteLowAreas(result, low, false)
      return { ok: true, paperId: id }
    }
    if (outcome.reason === 'limit') {
      return { ok: false, status: 429, code: 'limit', error: 'You have used this month’s practice papers.' }
    }
    seq = outcome.seq ?? seq + 1
  }
  return { ok: false, status: 409, error: 'Another paper was being made at the same time. Please try again.' }
}

/** Saves a paper's marks, and the on-screen answers when it was sat online. */
export async function savePaperMarks(paperId: string, marks: Mark[], onlineAnswers?: { id: string; a: Answer }[]): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const db = admin()
  if (!db) return { ok: false, status: 503, error: NOT_SET_UP }
  const { data, error } = await db
    .from('diagnostic_papers')
    .update({ marks, marked_at: new Date().toISOString(), ...(onlineAnswers ? { online_answers: onlineAnswers } : {}) })
    .eq('id', paperId)
    .select('id')
  if (error) {
    console.error('[diagnostic.papers] marks not saved', { paperId, error: error.message })
    return { ok: false, status: 500, error: 'The marks could not be saved. Please try again.' }
  }
  if (!data?.length) return { ok: false, status: 404, error: 'Paper not found.' }
  return { ok: true }
}

export interface BankAlert {
  id: string
  year: YearLevel
  subject: SubjectSlug
  areaId: string
  areaLabel: string
  remaining: number
  exhausted: boolean
  hits: number
  firstSeen: string
  lastSeen: string
  resolvedAt: string | null
}

/** Question-bank alerts, open ones first. Row-level security limits them to admins. */
export async function listBankAlerts(): Promise<{ ok: true; alerts: BankAlert[] } | { ok: false; missing: boolean }> {
  const { data, error } = await createClient()
    .from('question_bank_alerts')
    .select('id, year_level, subject, area_id, area_label, remaining, exhausted, hits, first_seen, last_seen, resolved_at')
    .order('resolved_at', { ascending: false, nullsFirst: true })
    .order('exhausted', { ascending: false })
    .order('hits', { ascending: false })
    .limit(200)
  if (error) {
    console.error('[diagnostic.papers] alerts read failed', { code: error.code, error: error.message })
    return { ok: false, missing: missingTable(error.code) }
  }
  return {
    ok: true,
    alerts: (data ?? []).map(r => ({
      id: r.id,
      year: r.year_level,
      subject: r.subject,
      areaId: r.area_id,
      areaLabel: r.area_label,
      remaining: r.remaining,
      exhausted: r.exhausted,
      hits: r.hits,
      firstSeen: r.first_seen,
      lastSeen: r.last_seen,
      resolvedAt: r.resolved_at,
    })),
  }
}

/** Open alerts, for the admin's account page badge. */
export async function openBankAlertCount(): Promise<number> {
  const { count, error } = await createClient().from('question_bank_alerts').select('id', { count: 'exact', head: true }).is('resolved_at', null)
  return error ? 0 : count ?? 0
}

/** Marks an alert handled (questions added). Row-level security allows admins only. */
export async function resolveBankAlert(id: string, userId: string): Promise<boolean> {
  if (!UUID.test(id)) return false
  const { data, error } = await createClient()
    .from('question_bank_alerts')
    .update({ resolved_at: new Date().toISOString(), resolved_by: userId })
    .eq('id', id)
    .is('resolved_at', null)
    .select('id')
  if (error) console.error('[diagnostic.papers] alert not resolved', { id, error: error.message })
  return !error && Boolean(data?.length)
}
