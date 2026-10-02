import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/** Deletes a result. Row-level security allows only its owner to. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in' }, { status: 401 })
  const { data, error } = await supabase.from('diagnostic_results').delete().eq('id', params.id).eq('user_id', user.id).select('id')
  if (error) {
    console.error('[diagnostic.delete] failed', { id: params.id, userId: user.id, error: error.message })
    return NextResponse.json({ error: 'Could not delete' }, { status: 500 })
  }
  if (!data?.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ deleted: true })
}
