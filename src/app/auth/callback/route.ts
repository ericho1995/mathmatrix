import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Handles the confirmation/recovery link Supabase emails after sign-up or a password reset request.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/practice'

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
