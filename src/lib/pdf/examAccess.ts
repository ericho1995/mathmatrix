import { NextResponse } from 'next/server'
import { getAccess } from '@/lib/auth/access'
import { paperDownload } from './paperDownload'
import type { ResolvedExam } from './resolveExam'

/**
 * The paywall for exam PDFs, in one place.
 *
 * The exam paper, its answer key and its Reading Magazine are three routes
 * serving one purchase, and they previously carried the gate as duplicated
 * inline code. They drifted: the paper route was updated to check entitlements
 * while the answer key was left checking only for an admin, so a customer who
 * had paid would have been refused their answer key — and because both return
 * 402 to a signed-out visitor, the obvious test passed. Sharing the check is
 * what stops that recurring.
 *
 * Returns a 402 response when access should be refused, or whether to serve
 * the preview instead of the whole paper (see previewPolicy.ts).
 */
export async function gatePdf(
  resolved: ResolvedExam
): Promise<{ denied: NextResponse; preview?: undefined } | { denied?: undefined; preview: boolean }> {
  const exam = { id: resolved.exam.id, yearLevel: resolved.exam.yearLevel, premium: resolved.exam.premium }
  const download = paperDownload(exam, await getAccess())
  if (!download) {
    return {
      denied: NextResponse.json({ error: 'Payment required', examId: exam.id, yearLevel: exam.yearLevel }, { status: 402 }),
    }
  }
  return { preview: download.mode === 'preview' }
}
