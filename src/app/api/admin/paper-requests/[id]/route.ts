import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/getUserRole'
import { setPaperRequestStatus, type RequestStatus } from '@/lib/paperRequests'

export const dynamic = 'force-dynamic'

const STATUSES = new Set<RequestStatus>(['new', 'in_progress', 'done'])

/** Moves a family's paper request along: in progress, then done. Admins only. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if ((await getUserRole()) !== 'admin') return NextResponse.json({ error: 'Admins only' }, { status: 403 })
  const {
    data: { user },
  } = await createClient().auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const status = (body as { status?: unknown }).status
  if (!STATUSES.has(status as RequestStatus)) return NextResponse.json({ error: 'Unknown status' }, { status: 400 })
  const ok = await setPaperRequestStatus(params.id, status as RequestStatus, user.id)
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Request not found' }, { status: 404 })
}
