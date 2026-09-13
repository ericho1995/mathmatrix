/**
 * Makes a failed Supabase read visible instead of letting it look like an
 * empty result.
 *
 * The pattern this replaces is `const { data } = await supabase...`, which
 * discards `error` entirely. A broken migration, a missing RPC and an RLS
 * rejection then all produce `data === undefined` — indistinguishable from
 * "this user genuinely has no rows". That has hidden real production bugs
 * more than once: a parent whose `student_profiles` read failed was shown
 * "link your account" as though no child were linked.
 *
 * Destructure `error` and pass it here. The return value says whether the read
 * failed, so a caller can render a "couldn't load" state rather than an empty
 * one:
 *
 *   const { data, error } = await supabase.from('x').select()
 *   if (queryFailed('parent.students', error, { userId })) return <DataLoadError />
 *
 * Where failing closed is the safer default — anything gating paid content or
 * admin access — keep returning the restrictive value, but still log here so
 * the failure is diagnosable. See getEntitlements.ts.
 */

/** The shape of both PostgrestError and AuthError, without importing either. */
interface SupabaseErrorLike {
  message: string
  code?: string
  details?: string | null
  hint?: string | null
}

export function queryFailed(
  scope: string,
  error: SupabaseErrorLike | null | undefined,
  context?: Record<string, unknown>
): boolean {
  if (!error) return false
  console.error(`[supabase:${scope}] ${error.message}`, {
    ...(error.code ? { code: error.code } : {}),
    ...(error.details ? { details: error.details } : {}),
    ...(error.hint ? { hint: error.hint } : {}),
    ...context,
  })
  return true
}
