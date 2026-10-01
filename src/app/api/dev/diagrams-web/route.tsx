import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { DiagramView } from '@/lib/pdf/diagrams'
import { GALLERY, GALLERY_OPTIONS, GALLERY_NET_OPTIONS } from '@/lib/pdf/diagrams/gallery'
import { pdfToHtml, escapeHtml } from '@/lib/web/pdfToHtml'
import { richHtml } from '@/lib/web/mathHtml'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { hasMath } from '@/lib/text/mathPlain'
import { isScreenable } from '@/lib/diagnostic/blueprint'
import { toScreenQuestion } from '@/lib/web/questionHtml'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Development only: every diagram kind drawn for the screen, for comparing
 * by eye with the PDF gallery at /api/dev/diagrams. Also a sample of question
 * stems with typeset maths. Refuses to run in production or off localhost.
 *
 * ?all=1 instead converts every question the diagnostic can ask and reports
 * any that fail, as JSON.
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  if (process.env.NODE_ENV === 'production' || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (req.nextUrl.searchParams.get('all')) {
    const failures: { id: string; error: string }[] = []
    let ok = 0
    let withDiagram = 0
    let bytes = 0
    for (const q of QUESTION_BANK.filter(isScreenable)) {
      try {
        const sq = toScreenQuestion(q, 1)
        bytes += JSON.stringify(sq).length
        if (sq.diagram || sq.optionDiagrams) withDiagram++
        if (Object.keys(sq).some(k => /correct|expected|accepted|explanation/i.test(k))) throw new Error('answer field leaked')
        ok++
      } catch (e) {
        failures.push({ id: q.id, error: e instanceof Error ? e.message : String(e) })
      }
    }
    return NextResponse.json({ ok, withDiagram, averageBytes: Math.round(bytes / Math.max(ok, 1)), failures })
  }

  const draw = (d: (typeof GALLERY)[number]['diagram'], fit?: number, bare?: boolean) => pdfToHtml(React.createElement(DiagramView, { diagram: d, fit, bare }))
  const panel = (title: string, body: string) =>
    `<section style="border-bottom:1px solid #eee;padding:12px 0"><div style="font-size:11px;color:#888;margin-bottom:6px">${escapeHtml(title)}</div>${body}</section>`
  const options = (ds: typeof GALLERY_OPTIONS) =>
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${ds
      .map((d, i) => `<div style="border:1px solid #1a1a1a;border-radius:4px;padding:6px"><b>${'ABCD'[i]}</b>${draw(d, 240, true)}</div>`)
      .join('')}</div>`
  const maths = QUESTION_BANK.filter(q => hasMath(q.question_text)).filter((_q, i) => i % 15 === 0).slice(0, 12)

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Diagrams on screen</title></head>
<body style="font-family:Inter,system-ui,sans-serif;color:#1a1a1a;background:#fff;color-scheme:light;max-width:600px;margin:24px auto;padding:0 16px">
<h1 style="font-size:20px">Diagram gallery — screen</h1>
${GALLERY.map(g => panel(g.name, draw(g.diagram))).join('')}
${panel('option_diagrams — dot plots', options(GALLERY_OPTIONS))}
${panel('option_diagrams — nets', options(GALLERY_NET_OPTIONS))}
<h2 style="font-size:18px;margin-top:24px">Typeset maths</h2>
${maths.map(q => panel(q.id, `<div style="font-size:16px;line-height:1.6">${richHtml(q.question_text)}</div>`)).join('')}
</body></html>`
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
