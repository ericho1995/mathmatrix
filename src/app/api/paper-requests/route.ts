import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isYearLevel } from '@/lib/catalogue'
import { REQUEST_SOURCES, isSubject, submitPaperRequest, type RequestSource } from '@/lib/paperRequests'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * A family asks for more practice papers for a year level and subject.
 * Signed-in visitors are answered at their account email; anyone else gives
 * one. `website` is a honeypot: people never see it, bots fill it in.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (typeof body.website === 'string' && body.website.trim()) return NextResponse.json({ ok: true })

  const { year, subject } = body
  if (!isYearLevel(year)) return NextResponse.json({ error: 'Choose a year level.' }, { status: 400 })
  if (!isSubject(subject)) return NextResponse.json({ error: 'Choose a subject.' }, { status: 400 })
  const note = typeof body.note === 'string' && body.note.trim() ? body.note.trim().slice(0, 1000) : null
  const source = REQUEST_SOURCES.includes(body.source as RequestSource) ? (body.source as RequestSource) : null

  const {
    data: { user },
  } = await createClient().auth.getUser()
  const email = user?.email ?? (typeof body.email === 'string' ? body.email.trim() : '')
  if (!EMAIL.test(email) || email.length > 320) return NextResponse.json({ error: 'Enter an email address we can reply to.' }, { status: 400 })

  const result = await submitPaperRequest({ userId: user?.id ?? null, email, year, subject, note, source })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json({ ok: true, email })
}
