import type { Access } from '@/lib/auth/access'
import { isVcePaperSellable } from '@/lib/stripe'
import type { WeakPapersProps, PaperSummary } from '@/components/papers/WeakPapersCard'
import type { LoadedResult } from './load'
import type { Mark } from './save'
import { paperOpen, paperRights, tailoredAccess } from './access'
import { listPapers, papersThisMonth, type PaperRow } from './papers'
import { tailoredExamId, weakAreas } from './tailor'
import { monthWindow } from './weakPapers'

// The report's practice-papers card, assembled on the server. Server-only.

export function markTotals(marks: readonly Mark[]): { got: number; of: number } {
  let got = 0
  let of = 0
  for (const m of marks) {
    if ('ok' in m) {
      of += 1
      if (m.ok) got += 1
    } else {
      of += m.of
      got += m.m
    }
  }
  return { got, of }
}

export function summarise(paper: PaperRow, access: Access): PaperSummary {
  return {
    id: paper.id,
    seq: paper.seq,
    createdAt: paper.createdAt,
    questions: paper.exam.sections.reduce((n, s) => n + s.question_ids.length, 0),
    focus: paper.exam.focus,
    open: paperOpen({ id: paper.id, year: paper.year }, access),
    marked: paper.marks && paper.markedAt ? { ...markTotals(paper.marks), at: paper.markedAt } : null,
  }
}

const resetsLabel = (d: Date) => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', timeZone: 'Australia/Melbourne' })

export async function papersPanel(result: LoadedResult, access: Access, viewerId: string, fresh?: string): Promise<WeakPapersProps> {
  const weak = weakAreas(result.report)
  const rights = paperRights(result.year, access)
  const [listed, used] = await Promise.all([
    listPapers(result.id),
    rights.kind === 'allowance' && rights.limit !== null ? papersThisMonth(viewerId) : Promise.resolve(null),
  ])
  const legacyBought = access.papers.has(tailoredExamId(result.id))
  return {
    resultId: result.id,
    name: result.childName,
    weak: weak.areas.map(a => ({ label: a.label, level: a.level })),
    fallback: weak.fallback,
    rights,
    allowance: rights.kind === 'allowance' && rights.limit !== null ? { used: used ?? 0, limit: rights.limit, resets: resetsLabel(monthWindow().resets) } : null,
    papers: listed.ok ? listed.papers.map(p => summarise(p, access)) : [],
    ready: listed.ok || !listed.missing,
    sellable: isVcePaperSellable(),
    ...(fresh ? { fresh } : {}),
    legacy: result.marks || legacyBought ? { full: tailoredAccess({ id: result.id, year: result.year }, access).mode === 'full' } : null,
  }
}
