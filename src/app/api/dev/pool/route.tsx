import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { ExamPaperDocument } from '@/lib/pdf/ExamPaperDocument'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { STIMULI } from '@/lib/questions/stimuli'
import { TOPICS } from '@/lib/curriculum'
import type { ResolvedExam } from '@/lib/pdf/resolveExam'
import type { Question, SubjectSlug, YearLevel } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Development only: every question in one pool rendered as a paper, in bank
 * order, so a whole rewrite can be read the way a student will see it —
 * including the items that only ever land in the paid papers.
 *
 *   /api/dev/pool?year=year_8&subject=math
 *
 * Refuses to run in a production build or off localhost: it prints paid
 * content with no entitlement check.
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  if (process.env.NODE_ENV === 'production' || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const year = (req.nextUrl.searchParams.get('year') ?? 'year_8') as YearLevel
  const subject = (req.nextUrl.searchParams.get('subject') ?? 'math') as SubjectSlug
  const topics = new Set(TOPICS.filter(t => t.subject === subject).map(t => t.slug))
  const stimulusById = new Map(STIMULI.map(s => [s.id, s]))
  const pool = (QUESTION_BANK as Question[]).filter(q => q.year_level === year && topics.has(q.topic))

  const groups: { title: string; calculator_allowed?: boolean; questions: Question[] }[] = pool.some(q => q.calculator_allowed)
    ? [
        { title: 'Non-calculator pool', calculator_allowed: false, questions: pool.filter(q => !q.calculator_allowed) },
        { title: 'Calculator pool', calculator_allowed: true, questions: pool.filter(q => q.calculator_allowed) },
      ]
    : [{ title: 'Pool', questions: pool }]

  const resolved: ResolvedExam = {
    exam: { id: `pool-${subject}-${year}`, subject, yearLevel: year, title: `${subject} ${year} — full pool (${pool.length})`, premium: false, sections: [] },
    sections: groups.map(g => ({
      section: { title: g.title, time_minutes: 0, calculator_allowed: g.calculator_allowed, question_ids: g.questions.map(q => q.id) },
      questions: g.questions.map(q => ({ ...q, stimulus: q.stimulus_id ? stimulusById.get(q.stimulus_id) : undefined })),
    })),
  }

  const buffer = await renderToBuffer(<ExamPaperDocument resolved={resolved} />)
  return new NextResponse(new Uint8Array(buffer), { headers: { 'Content-Type': 'application/pdf' } })
}
