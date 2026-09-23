import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReadingMagazineDocument } from '@/lib/pdf/ReadingMagazineDocument'
import { MAGAZINES } from '@/lib/questions/magazines'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Development only: checks that every magazine text prints on the page the
 * question paper sends the student to.
 *
 *   /api/dev/magazines            JSON report for every magazine
 *   /api/dev/magazines?id=<id>    that magazine as a PDF, paid ones included
 *
 * A text too long for its page pushes every later text back a page, and the
 * paper then says "page 5" for a text on page 6. Nothing else catches that,
 * because the page numbers are data and the overflow only exists once the
 * magazine is laid out. Refuses to run in a production build or off
 * localhost: it serves paid content with no entitlement check.
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  if (process.env.NODE_ENV === 'production' || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const titleFor = (id: string) => PRACTICE_EXAMS.find(e => e.magazine_id === id)?.title ?? id
  const only = req.nextUrl.searchParams.get('id')
  if (only) {
    const magazine = MAGAZINES.find(m => m.id === only)
    if (!magazine) return NextResponse.json({ error: 'No such magazine' }, { status: 404 })
    const buffer = await renderToBuffer(<ReadingMagazineDocument magazine={magazine} title={titleFor(magazine.id)} />)
    return new NextResponse(new Uint8Array(buffer), { headers: { 'Content-Type': 'application/pdf' } })
  }

  const report = []
  for (const magazine of MAGAZINES) {
    const placed = new Map<string, Set<number>>()
    await renderToBuffer(
      <ReadingMagazineDocument
        magazine={magazine}
        title={titleFor(magazine.id)}
        onPlaced={(id, page) => {
          if (!placed.has(id)) placed.set(id, new Set())
          placed.get(id)!.add(page)
        }}
      />
    )
    const texts = magazine.texts.map(t => {
      const pages = Array.from(placed.get(t.id) ?? new Set<number>()).sort((a, b) => a - b)
      const expected = Array.from({ length: t.pages ?? 1 }, (_, i) => t.page + i)
      return { title: t.title, expected, actual: pages, ok: pages.join() === expected.join() }
    })
    report.push({ id: magazine.id, ok: texts.every(t => t.ok), texts })
  }
  return NextResponse.json({ ok: report.every(m => m.ok), magazines: report })
}
