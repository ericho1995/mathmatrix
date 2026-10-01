import { NextRequest, NextResponse } from 'next/server'
import { loadResult } from '@/lib/diagnostic/load'
import { marksFromWrong } from '@/lib/diagnostic/marking'
import { saveExamMarks } from '@/lib/diagnostic/save'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Records the marking of a result's tailored exam: POST { wrong: [{ s, n }] },
 * the positions marked wrong. Anyone who can see the result may mark it.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const loaded = await loadResult(params.id)
  if (!loaded.ok) return NextResponse.json({ error: loaded.status === 401 ? 'Sign in to save' : 'Result not found' }, { status: loaded.status })

  let body: { wrong?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Malformed request' }, { status: 400 })
  }
  const raw = Array.isArray(body.wrong) ? body.wrong : null
  if (!raw || raw.length > 200 || raw.some(w => typeof w?.s !== 'number' || typeof w?.n !== 'number')) {
    return NextResponse.json({ error: 'Expected a list of marks' }, { status: 400 })
  }
  const marks = marksFromWrong(loaded.result, raw as { s: number; n: number }[])
  if (!marks) return NextResponse.json({ error: 'A mark does not match a question on this paper' }, { status: 400 })

  const saved = await saveExamMarks(loaded.result.id, marks)
  if (!saved.ok) return NextResponse.json({ error: saved.error }, { status: saved.status })
  return NextResponse.json({ saved: true })
}
