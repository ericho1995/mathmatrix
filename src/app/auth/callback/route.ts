import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/auth/safeNext'

// Handles the confirmation/recovery link Supabase emails after sign-up or a password reset request.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Validated, not trusted: see safeNext for why prepending the origin is not
  // enough on its own.
  const next = safeNext(searchParams.get('next'), '/practice')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
