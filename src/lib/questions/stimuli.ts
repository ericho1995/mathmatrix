import type { Stimulus } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Shared reading passages / data stimuli — a Question can reference one via
// stimulus_id so multiple questions are asked about the same text/data.
// Mirrored into Supabase via supabase/seed.sql, same as bank.ts. Regenerate
// seed.sql after editing with: node scripts/gen-seed.mjs
// ─────────────────────────────────────────────────────────────────────────────

export const STIMULI: Stimulus[] = [
]
