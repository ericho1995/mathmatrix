/**
 * VCE subjects examined in two papers (Mathematical Methods, Specialist and
 * General Mathematics) are practice *sets*: `…-N-exam1` (technology-free or
 * multiple choice) and `…-N-exam2`. The two papers are one exam sitting, so one
 * purchase covers both.
 *
 * Pure string logic with no imports: the paywall, checkout and catalogue share
 * it, and it is unit-tested without Next.js (scripts/tests/vceSets.test.mjs).
 */
const PAIR = /^(.*-(\d+))-exam([12])$/

/** The other exam of the same set, or null for a single-paper subject. */
export function vcePartnerId(examId: string): string | null {
  const m = PAIR.exec(examId)
  return m ? `${m[1]}-exam${m[3] === '1' ? '2' : '1'}` : null
}

/** Owned when this paper, or the other exam of its set, was purchased. */
export function ownsVcePaper(examId: string, purchased: Set<string>): boolean {
  if (purchased.has(examId)) return true
  const partner = vcePartnerId(examId)
  return partner !== null && purchased.has(partner)
}

/** The practice set a two-paper VCE exam belongs to, or null. */
export function setNumber(examId: string): number | null {
  const m = PAIR.exec(examId)
  return m ? Number(m[2]) : null
}

export type SetGroup<T> = { set: number; exams: [T, T] }

/** Exam 1 and Exam 2 of a set become one entry; everything else passes through, in order. */
export function groupIntoSets<T extends { id: string }>(exams: T[]): (T | SetGroup<T>)[] {
  const out: (T | SetGroup<T>)[] = []
  const used = new Set<string>()
  for (const exam of exams) {
    if (used.has(exam.id)) continue
    const partnerId = vcePartnerId(exam.id)
    const partner = partnerId ? exams.find(e => e.id === partnerId) : undefined
    const n = setNumber(exam.id)
    if (partner && n !== null) {
      const pair = (exam.id.endsWith('exam1') ? [exam, partner] : [partner, exam]) as [T, T]
      out.push({ set: n, exams: pair })
      used.add(exam.id)
      used.add(partner.id)
    } else {
      out.push(exam)
    }
  }
  return out
}

export function isSetGroup<T>(item: T | SetGroup<T>): item is SetGroup<T> {
  return typeof item === 'object' && item !== null && 'set' in item && 'exams' in item
}
