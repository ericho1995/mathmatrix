/**
 * How much of a paper a visitor who has not paid for it may see.
 *
 * Since 2026-10-03 every paper is paid (scripts/gen-exams.mjs) and every
 * visitor without a plan or a purchase gets the first half of any paper: the
 * rest is locked, shown only as a blurred outline (preview.ts). That is the
 * default now, not a switch.
 *
 *  - 'full'    the whole paper and its answer key
 *  - 'preview' the first half of the paper and the answers to those
 *              questions, then the rest as a locked, blurred outline that
 *              carries none of the questions (see preview.ts)
 *  - 'none'    nothing: the lock screen only
 *
 * Customers are never limited by this. Anyone with a plan, a purchased paper,
 * an old year-level bundle or admin access gets every paper they can open in
 * full.
 *
 * One environment variable remains, to turn previews off in Vercel (then
 * redeploy) without a code change, leaving the lock screen only:
 *
 *   PDF_PREVIEW_PAID=off         paid papers offer no preview at all
 *
 * The preview is cut on the server, so the questions it leaves out are never
 * sent at all. There is nothing hidden in the file to uncover.
 */
export type OpenAccess = 'full' | 'preview' | 'none'

/** The share of a paper's questions a preview shows. */
export const PREVIEW_SHARE = 1 / 2

/**
 * Per-paper exceptions, by exam id, for when one paper should differ from the
 * switches — for example `'math-grade_5-1': 'preview'`.
 */
const OVERRIDES: Partial<Record<string, OpenAccess>> = {}

const isOff = (name: string) => /^(off|false|no|0)$/i.test(process.env[name]?.trim() ?? '')

export function openAccess(exam: { id: string; premium: boolean }): OpenAccess {
  const override = OVERRIDES[exam.id]
  if (override) return override
  if (!exam.premium) return 'full'
  return isOff('PDF_PREVIEW_PAID') ? 'none' : 'preview'
}
