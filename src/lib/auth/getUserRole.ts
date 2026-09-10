import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types'

/** Reads the current session's role from `profiles`, server-side only. Null when signed out. */
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return (profile?.role as UserRole | undefined) ?? null
}
