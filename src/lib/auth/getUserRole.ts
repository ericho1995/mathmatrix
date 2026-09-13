import { createClient } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/logError'
import type { UserRole } from '@/types'

/**
 * Reads the current session's role from `profiles`, server-side only. Null when
 * signed out.
 *
 * Fails closed: a failed read returns null, so a broken RLS policy can never
 * hand out admin. It is logged rather than swallowed because the two outcomes
 * are otherwise identical from the outside — an admin locked out by a bad
 * policy sees the same "no admin access" page as a regular user, with nothing
 * anywhere to say which happened.
 */
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (queryFailed('auth.getUserRole', error, { userId: user.id })) return null
  return (profile?.role as UserRole | undefined) ?? null
}
