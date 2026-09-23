/**
 * How much of a paper a visitor who has not paid for it may download.
 *
 *  - 'full'    the whole paper and its answer key
 *  - 'preview' about the first third of the paper and the answers to those
 *              questions, then a page listing what the rest contains and where
 *              to get it (see preview.ts)
 *  - 'none'    nothing: the lock screen only
 *
 * Customers are never limited by this. Anyone with a plan, a purchased paper,
 * an old year-level bundle or admin access gets every paper they can open in
 * full, including the free samples.
 *
 * Both switches are environment variables so they can be flipped in Vercel
 * (then redeploy) without a code change. Both are off unless set to "on":
 *
 *   PDF_PREVIEW_PAID=on          every paid paper offers a free preview
 *   PDF_PREVIEW_FREE_SAMPLES=on  the free sample papers become previews
 *
 * The preview is cut on the server, so the questions it leaves out are never
 * sent at all. There is nothing hidden in the file to uncover.
 */
export type OpenAccess = 'full' | 'preview' | 'none'

/** The share of a paper's questions a preview shows. */
export const PREVIEW_SHARE = 1 / 3

/**
 * Per-paper exceptions, by exam id, for when one paper should differ from the
 * switches — for example `'math-grade_5-1': 'preview'`.
 */
const OVERRIDES: Partial<Record<string, OpenAccess>> = {}

const isOn = (name: string) => /^(on|true|yes|1)$/i.test(process.env[name]?.trim() ?? '')

export function openAccess(exam: { id: string; premium: boolean }): OpenAccess {
  const override = OVERRIDES[exam.id]
  if (override) return override
  if (!exam.premium) return isOn('PDF_PREVIEW_FREE_SAMPLES') ? 'preview' : 'full'
  return isOn('PDF_PREVIEW_PAID') ? 'preview' : 'none'
}
