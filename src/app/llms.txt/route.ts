import { CATALOGUE_TOTALS, PLAN_TOTALS, VCE_TOTALS } from '@/lib/catalogue'
import { PLANS, VCE_PAPER_PRICE } from '@/lib/pricing'
import { NAPLAN_LANDINGS, VCE_LANDINGS, papersFor } from '@/lib/seo'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

/**
 * /llms.txt: a plain summary of the site for AI assistants and answer
 * engines (llmstxt.org), so a parent who asks one for "NAPLAN practice tests"
 * or "VCE Methods practice exams" gets PrepNest described correctly. Built
 * from the catalogue and the prices, like every other page.
 */
export function GET() {
  const vce = VCE_LANDINGS.map(l => {
    const u34 = papersFor(l.subject, 'year_12').length
    const u12 = papersFor(l.subject, 'year_11').length
    const counts = [u34 && `${u34} Unit 3 & 4`, u12 && `${u12} Unit 1 & 2`].filter(Boolean).join(' and ')
    return `- [VCE ${l.name} practice exams](${SITE_URL}/vce/${l.slug}): ${counts} practice exams with marking guides`
  })
  const naplan = NAPLAN_LANDINGS.map(l => {
    const n = ['math', 'reading', 'english'].reduce((sum, s) => sum + papersFor(s as 'math', l.yearLevel).length, 0)
    return `- [${l.naplanName} NAPLAN practice tests](${SITE_URL}/naplan/${l.slug}): ${n} Numeracy, Reading and Language Conventions papers`
  })

  const body = `# PrepNest

> Practice exams and a free diagnostic test for Australian students from ${CATALOGUE_TOTALS.lowest} to ${CATALOGUE_TOTALS.highest}. NAPLAN-format papers in Numeracy, Reading and Language Conventions, school-year papers in Maths, English and Science, and VCE practice exams in Mathematical Methods, Specialist Mathematics, General Mathematics, Physics and Chemistry. Every paper comes with a separate answer key or marking guide, and can be printed or sat on screen.

- ${CATALOGUE_TOTALS.papers} practice papers today; new papers are added throughout the year.
- ${PLAN_TOTALS.range}: one plan unlocks every paper (${PLANS.map(p => `A$${p.priceAud} for ${p.name}`).join(', ')}).
- VCE (Year 11 and 12): ${VCE_TOTALS.papers} papers, ${VCE_PAPER_PRICE} each, purchased once.
- The first half of every paper is free to flip through. The diagnostic test and its report are free.
- PrepNest is independent and not affiliated with ACARA (NAPLAN) or the VCAA (VCE). The papers are original, written in the format of the real tests.

## VCE

- [VCE practice exams and the 2026 exam timetable](${SITE_URL}/vce)
${vce.join('\n')}

## NAPLAN

- [NAPLAN practice papers, Years 3, 5, 7 and 9](${SITE_URL}/naplan)
${naplan.join('\n')}

## Start here

- [Free diagnostic test](${SITE_URL}/diagnostic): a short on-screen test in one subject that reports each area and the skills to work on
- [All exam papers](${SITE_URL}/practice/exams)
- [Pricing](${SITE_URL}/pricing)
- [For parents](${SITE_URL}/for-parents)
- [Help and FAQ](${SITE_URL}/help)
`
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
