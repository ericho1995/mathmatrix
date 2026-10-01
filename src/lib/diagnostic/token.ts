import { createHmac, timingSafeEqual } from 'node:crypto'
import type { SubjectSlug, YearLevel } from '../../types'
import type { Answer, Response } from './types.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Signed test tokens and result receipts.
//
// Starting a test hands the browser a token naming the questions it was given.
// Submitting sends it back, and only those questions are marked — so the
// submit route cannot be used to look up the answer to any question in the
// bank. A signed-out result comes back as a receipt (the token plus the
// answers, signed again) that can be saved to an account after sign-up; the
// server marks it afresh from the answers and never trusts a score it is sent.
//
// The key is derived from SUPABASE_SERVICE_ROLE_KEY, which every deployment
// already has, so the feature needs no new environment variable.
// ─────────────────────────────────────────────────────────────────────────────

export interface TestClaims {
  v: 1
  y: YearLevel
  s: SubjectSlug
  /** Question ids, in the order asked. */
  q: string[]
  /** The child's first name, if the parent gave one. */
  n: string | null
  /** Issued at (ms). */
  t: number
  /** Random nonce: identifies this sitting, so a receipt is saved once. */
  r: string
  /** Which part of the test this token is for: 1, or 2 once follow-ups are added. */
  p?: 1 | 2
  /** How many of `q` were in the first part; the rest are follow-ups. */
  c?: number
  /** Seed the questions were chosen with, so follow-ups are chosen the same way. */
  e?: number
}

/** An answer as the browser sends it: the answer and what the screen saw. */
export type AnswerIn = Omit<Response, 'id' | 'f'>

export interface ReceiptClaims extends TestClaims {
  /** Answers, aligned with `q`. */
  a: AnswerIn[]
  /** Submitted at (ms). */
  d: number
}

/** The type of a bare answer, for code that has not been given telemetry. */
export type { Answer }

/** How long a test may stay open. */
export const TEST_TTL_MS = 7 * 86_400_000
/** How long a signed-out result can still be saved to an account. */
export const RECEIPT_TTL_MS = 30 * 86_400_000

const b64url = (buf: Buffer) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const fromB64url = (s: string) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64')

function mac(payload: string, key: string): Buffer {
  return createHmac('sha256', key).update(payload).digest()
}

export function signClaims(claims: object, key: string): string {
  const payload = b64url(Buffer.from(JSON.stringify(claims), 'utf8'))
  return `${payload}.${b64url(mac(payload, key))}`
}

/** The claims, or null if the token is malformed or its signature is wrong. */
export function verifyClaims<T>(token: unknown, key: string): T | null {
  if (typeof token !== 'string' || token.length > 20_000) return null
  const dot = token.indexOf('.')
  if (dot <= 0 || dot !== token.lastIndexOf('.')) return null
  const payload = token.slice(0, dot)
  const given = fromB64url(token.slice(dot + 1))
  const expected = mac(payload, key)
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  try {
    const claims = JSON.parse(fromB64url(payload).toString('utf8'))
    return claims && typeof claims === 'object' && claims.v === 1 ? (claims as T) : null
  } catch {
    return null
  }
}

export function deriveKey(secret: string): string {
  return createHmac('sha256', secret).update('prepnest-diagnostic-v1').digest('hex')
}

/** The signing key, or null when the server has no service key to derive it from. */
export function diagnosticKey(): string | null {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  return secret ? deriveKey(secret) : null
}

export function isFresh(issuedAt: number, ttl: number, now = Date.now()): boolean {
  return Number.isFinite(issuedAt) && issuedAt <= now + 60_000 && now - issuedAt <= ttl
}

/** A first name as a parent typed it: trimmed, no control characters, at most 40 characters. */
export function cleanName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const name = raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40)
    .trim()
  return name || null
}
