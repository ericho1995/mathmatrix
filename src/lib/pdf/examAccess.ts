import { NextResponse } from 'next/server'
import { canOpen, getAccess } from '@/lib/auth/access'
import type { ResolvedExam } from './resolveExam'

/**
 * The paywall for exam PDFs, in one place.
 *
 * The exam paper and its answer key are two routes serving one purchase, and
 * they previously carried the gate as duplicated inline code. They drifted: the
 * paper route was updated to check entitlements while the answer key was left
 * checking only for an admin, so a customer who had paid would have been refused
 * their answer key — and because both return 402 to a signed-out visitor, the
 * obvious test passed. Sharing the check is what stops that recurring.
 *
 * Returns a 402 response when access should be refused, or null to proceed.
 */
export async function denyIfNotEntitled(resolved: ResolvedExam): Promise<NextResponse | null> {
  const exam = { id: resolved.exam.id, yearLevel: resolved.exam.yearLevel, premium: resolved.exam.premium }
  if (canOpen(exam, await getAccess())) return null

  return NextResponse.json({ error: 'Payment required', examId: exam.id, yearLevel: exam.yearLevel }, { status: 402 })
}
