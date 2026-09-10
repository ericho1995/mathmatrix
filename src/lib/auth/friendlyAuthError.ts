/** Translates raw Supabase Auth error text into something a user can act on. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase()

  if (m.includes('rate limit')) {
    return "We've hit the limit on confirmation emails for now — please wait a while and try again, or contact support if this keeps happening."
  }
  if (m.includes('already registered') || m.includes('already exists') || m.includes('user already')) {
    return 'An account with that email already exists. Try signing in instead, or use "Forgot password" if you need to reset it.'
  }
  if (m.includes('invalid') && m.includes('email')) {
    return 'That email address doesn\'t look valid — double check it and try again.'
  }
  if (m.includes('password') && (m.includes('weak') || m.includes('short') || m.includes('least'))) {
    return 'Choose a stronger password (at least 6 characters).'
  }
  if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
    return 'Incorrect email or password.'
  }
  if (m.includes('email not confirmed')) {
    return 'Please confirm your email first — check your inbox for the confirmation link.'
  }

  return message
}
