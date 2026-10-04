// ─────────────────────────────────────────────────────────────────────────────
// Comparing a child with other children who sat the same test.
//
// Only ever from real results, and only once at least COHORT_MIN children
// have sat that test (the database function enforces it; see
// supabase/schema_diagnostic_cohort.sql). Until then the report says the
// comparison opens later, and shows no count.
// ─────────────────────────────────────────────────────────────────────────────

/** Children who must have sat a test before it is compared at all. Mirrors the SQL. */
export const COHORT_MIN = 30

export type Cohort = { open: false } | { open: true; students: number; pcts: number[] }

/** The share of the cohort, 0–100, that scored lower than `pct`. */
export function percentBelow(pct: number, pcts: readonly number[]): number {
  if (!pcts.length) return 0
  return Math.round((100 * pcts.filter(p => p < pct).length) / pcts.length)
}

/** Ten bands of score (0–9 %, 10–19 % … 90–100 %), each the share of the cohort in it, 0–100. */
export function bands(pcts: readonly number[]): number[] {
  const out = Array.from({ length: 10 }, () => 0)
  for (const p of pcts) out[Math.min(9, Math.max(0, Math.floor(p / 10)))]++
  return out.map(n => (pcts.length ? Math.round((100 * n) / pcts.length) : 0))
}

/** The band a score falls in, matching `bands`. */
export const bandOf = (pct: number) => Math.min(9, Math.max(0, Math.floor(pct / 10)))

/** What the database answered, checked: anything unexpected reads as closed. */
export function parseCohort(raw: unknown): Cohort {
  const r = raw as { open?: unknown; students?: unknown; pcts?: unknown } | null
  if (!r || r.open !== true || typeof r.students !== 'number' || !Array.isArray(r.pcts)) return { open: false }
  const pcts = r.pcts.filter((p): p is number => typeof p === 'number' && p >= 0 && p <= 100)
  return pcts.length >= COHORT_MIN ? { open: true, students: r.students, pcts } : { open: false }
}
