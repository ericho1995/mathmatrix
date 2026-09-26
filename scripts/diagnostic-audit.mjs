#!/usr/bin/env node
/**
 * Prints how the diagnostic classifier sorts the question bank: for each
 * subject, area and skill, how many questions land there and a few examples.
 *
 * The skill names in a diagnostic report come from rules over the question's
 * wording (src/lib/diagnostic/areas.ts). A rule that looks right can still
 * file a question somewhere a parent would find odd, and only reading
 * examples shows it. Run this after changing the rules or adding content.
 *
 *   node scripts/diagnostic-audit.mjs                 every subject
 *   node scripts/diagnostic-audit.mjs english 4       one subject, 4 samples each
 *   node scripts/diagnostic-audit.mjs math 3 "Time"   one skill only
 */
import { QUESTION_BANK } from '../src/lib/questions/bank.ts'
import { classify, subjectOfTopic } from '../src/lib/diagnostic/areas.ts'

const [onlySubject, perArg, onlySkill] = process.argv.slice(2)
const per = Number(perArg ?? 3)
const band = y => (/^grade_/.test(y) ? 'Gr 3–6' : /^year_(7|8|9|10)$/.test(y) ? 'Yr 7–10' : 'VCE')

const groups = new Map()
for (const q of QUESTION_BANK) {
  const subject = subjectOfTopic(q.topic)
  if (onlySubject && subject !== onlySubject) continue
  const { area, skill } = classify(q)
  if (onlySkill && skill !== onlySkill) continue
  const key = `${subject} · ${band(q.year_level)} · ${area.label} · ${skill}`
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(q)
}

for (const key of [...groups.keys()].sort()) {
  const qs = groups.get(key)
  console.log(`\n## ${key} (${qs.length})`)
  const step = Math.max(1, Math.floor(qs.length / per))
  for (let i = 0; i < qs.length && i / step < per; i += step) {
    const q = qs[i]
    const d = q.diagram ? ` [${q.diagram.kind}]` : q.option_diagrams?.length ? ' [option diagrams]' : ''
    console.log(`  - ${q.year_level}${d}: ${q.question_text.replace(/\s+/g, ' ').slice(0, 140)}`)
  }
}
