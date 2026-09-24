import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/logError'
import { safeNext } from '@/lib/auth/safeNext'

/**
 * Finishes every link PrepNest emails: sign-up confirmation, password reset,
 * email change, magic link and invitation.
 *
 * Two kinds of link arrive here.
 *
 * - `token_hash` + `type`, from PrepNest's own email templates
 *   (supabase/email-templates). The token is verified here, on our domain, so
 *   the link works on any device and never passes through Supabase's redirect
 *   allow-list — the thing that sent customers to localhost when the project's
 *   Site URL was left at its development value.
 * - `code`, from Supabase's default templates and from emails sent before the
 *   PrepNest templates were installed. A code can only be exchanged in the
 *   browser that asked for it (PKCE), so a sign-up started on a laptop and
 *   confirmed on a phone fails; that is why the templates above exist.
 *
 * A failed link used to be ignored and the visitor redirected as if it had
 * worked, landing signed out with no explanation. It now goes to a page that
 * says the link has expired and what to do instead.
 */
const OTP_TYPES: ReadonlySet<string> = new Set<EmailOtpType>([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
])

/**
 * Where to go after the link is accepted. A plain `next` path wins. The email
 * templates instead pass Supabase's `redirect_to`, which is the full URL the
 * app asked for (or the Site URL, if that URL was not allow-listed); only its
 * own `next` is taken from it, never its host.
 */
function linkNext(params: URLSearchParams, fallback: string): string {
  const direct = params.get('next')
  if (direct) return safeNext(direct, fallback)
  const redirectTo = params.get('redirect_to')
  if (redirectTo) {
    try {
      return safeNext(new URL(redirectTo).searchParams.get('next'), fallback)
    } catch {
      return fallback
    }
  }
  return fallback
}

export async function completeAuthLink(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const type = searchParams.get('type')
  const isRecovery = type === 'recovery' || searchParams.get('next')?.startsWith('/auth/reset-password')
  const next = linkNext(searchParams, isRecovery ? '/auth/reset-password' : '/practice')

  const tokenHash = searchParams.get('token_hash')
  const code = searchParams.get('code')
  const linkError = searchParams.get('error_description') ?? searchParams.get('error')

  let failed = Boolean(linkError)
  if (!failed && tokenHash && type && OTP_TYPES.has(type)) {
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({ type: type as EmailOtpType, token_hash: tokenHash })
    failed = queryFailed('auth.verifyOtp', error, { type })
  } else if (!failed && code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    failed = queryFailed('auth.exchangeCode', error)
  } else if (!failed && tokenHash) {
    failed = true
  }

  if (failed) {
    if (linkError) console.error(`[auth.link] ${linkError}`)
    const retry = isRecovery ? '/auth/forgot-password' : '/auth/login'
    return NextResponse.redirect(`${origin}${retry}?link=expired`)
  }
  return NextResponse.redirect(`${origin}${next}`)
}
