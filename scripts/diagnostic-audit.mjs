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
 *   node scripts/diagnostic-audit.mjs --simulate      how often each test gets
 *                                                     simulated children wrong
 */
import { QUESTION_BANK } from '../src/lib/questions/bank.ts'
import { classify, subjectOfTopic } from '../src/lib/diagnostic/areas.ts'
import { offeredTests } from '../src/lib/diagnostic/blueprint.ts'
import { errorRates } from './lib/diagnosticSim.mjs'

if (process.argv.includes('--simulate')) {
  const byId = new Map(QUESTION_BANK.map(q => [q.id, q]))
  const pct = x => `${(100 * x).toFixed(1)}%`.padStart(6)
  console.log('test                       questions  false focus  strong→focus  missed weak  wrong clear   (first part only: missed weak)')
  for (const o of offeredTests(QUESTION_BANK)) {
    const r = errorRates(QUESTION_BANK, byId, { year: o.year, subject: o.subject, children: 200 })
    const core = errorRates(QUESTION_BANK, byId, { year: o.year, subject: o.subject, children: 200, followUps: false })
    console.log(
      `${`${o.year} ${o.subject}`.padEnd(27)}${r.questions.toFixed(1).padStart(9)}  ${pct(r.falseFocus)}       ${pct(r.strongFocus)}        ${pct(r.missedWeak)}      ${pct(r.clearWrong)}     ${pct(core.missedWeak)}`
    )
  }
  process.exit(0)
}

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
