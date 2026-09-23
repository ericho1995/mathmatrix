import { accessReason, type Access, type AccessReason, type GatedPaper } from '@/lib/auth/access'
import { openAccess } from './previewPolicy'

export type PaperDownload = { mode: 'full'; reason: AccessReason } | { mode: 'preview' }

/** Has this visitor paid for anything? Customers get the free samples whole. */
function isCustomer(access: Access): boolean {
  return access.admin || access.plan !== null || access.papers.size > 0 || access.legacyYears.size > 0
}

/**
 * What this visitor may download of a paper: all of it, a preview, or nothing
 * (null). The paper page and all three PDF routes ask this one function, so
 * the page never offers a download the route would refuse.
 */
export function paperDownload(exam: GatedPaper, access: Access): PaperDownload | null {
  const reason = accessReason(exam, access)
  if (reason && reason !== 'free') return { mode: 'full', reason }

  const open = openAccess(exam)
  if (reason === 'free' && isCustomer(access)) return { mode: 'full', reason: 'free' }
  if (open === 'full') return { mode: 'full', reason: 'free' }
  return open === 'preview' ? { mode: 'preview' } : null
}
