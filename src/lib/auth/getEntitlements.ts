import { createClient } from '@/lib/supabase/server'
import { getUserRole } from './getUserRole'
import type { YearLevel } from '@/types'

/**
 * Whether the signed-in user may download a paper for this year level.
 *
 * Deliberately fails closed: any error reading the entitlement is treated as
 * "not entitled" rather than being swallowed. Most Supabase reads in this app
 * are wrapped so nothing crashes, which has repeatedly made real breakage
 * invisible — that trade is not acceptable on a paywall, where a silent failure
 * in the other direction gives paid content away.
 */
export async function hasEntitlement(yearLevel: YearLevel): Promise<boolean> {
  // Admins bypass the paywall so the catalogue stays inspectable in production.
  if ((await getUserRole()) === 'admin') return true

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('entitlements')
    .select('id')
    .eq('user_id', user.id)
    .eq('year_level', yearLevel)
    .maybeSingle()

  if (error) {
    console.error('[entitlements] lookup failed', { yearLevel, error: error.message })
    return false
  }
  return Boolean(data)
}

/** Every year level the signed-in user has bought, for rendering the catalogue. */
export async function listEntitledYearLevels(): Promise<YearLevel[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase.from('entitlements').select('year_level').eq('user_id', user.id)
  if (error) {
    console.error('[entitlements] list failed', error.message)
    return []
  }
  return (data ?? []).map(r => r.year_level as YearLevel)
}
