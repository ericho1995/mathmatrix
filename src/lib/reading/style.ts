import type { ReadingTextType } from '@/types/reading'

/**
 * One accent colour per kind of text, shared by the printed magazine and the
 * on-screen reader so a text looks like itself in both.
 *
 * The type is shown only through colour, never as a label: "What type of text
 * is this?" is a question the paper asks, and a label would answer it.
 */
export const TEXT_ACCENT: Record<ReadingTextType, string> = {
  story: '#C2410C',
  report: '#0F6E56',
  explanation: '#185FA5',
  persuasive: '#9D174D',
  letter: '#6D28D9',
  poem: '#B45309',
  review: '#0E7490',
  news: '#1D4ED8',
  procedure: '#15803D',
  web: '#475569',
  notice: '#B91C1C',
  interview: '#4338CA',
  diary: '#A16207',
}

/** Mixes a hex colour toward white; 0.9 is a pale tint for a panel background. */
export function tint(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  const mix = (c: number) => Math.round(c + (255 - c) * amount)
  const r = mix((n >> 16) & 255), g = mix((n >> 8) & 255), b = mix(n & 255)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}
