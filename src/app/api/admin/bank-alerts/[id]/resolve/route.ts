import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/getUserRole'
import { resolveBankAlert } from '@/lib/diagnostic/papers'

export const dynamic = 'force-dynamic'

/** Marks a question-bank alert handled, once more questions are in. Admins only. */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  if ((await getUserRole()) !== 'admin') return NextResponse.json({ error: 'Admins only' }, { status: 403 })
  const {
    data: { user },
  } = await createClient().auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in' }, { status: 401 })
  const ok = await resolveBankAlert(params.id, user.id)
  return ok ? NextResponse.json({ resolved: true }) : NextResponse.json({ error: 'Alert not found or already handled' }, { status: 404 })
}
