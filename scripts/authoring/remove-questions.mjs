// Removes every question matching a topic list and year level from bank.ts.
//
//   node scripts/authoring/remove-questions.mjs <year_level> <topic,topic,...> [--dry]
//
// Works on the top-level objects of each BANK_PART array (two-space indent),
// so multi-line items and single-line items are both handled. Run `npm run gen`
// afterwards so the papers, the seed file and the quiz coverage follow.
import { readFileSync, writeFileSync } from 'node:fs'

const [yearLevel, topicList, flag] = process.argv.slice(2)
if (!yearLevel || !topicList) {
  console.error('Usage: node scripts/authoring/remove-questions.mjs <year_level> <topic,topic,...> [--dry]')
  process.exit(2)
}
const topics = new Set(topicList.split(','))
const path = 'src/lib/questions/bank.ts'
const raw = readFileSync(path, 'utf8')
const crlf = raw.includes('\r\n')
const lines = raw.replace(/\r\n/g, '\n').split('\n')

const out = []
let removed = 0
for (let i = 0; i < lines.length; i++) {
  if (lines[i] !== '  {') { out.push(lines[i]); continue }
  let j = i
  while (j < lines.length && lines[j] !== '  },') j++
  const block = lines.slice(i, j + 1).join('\n')
  const topic = block.match(/topic: '(\w+)'/)?.[1]
  const year = block.match(/year_level: '(\w+)'/)?.[1]
  if (topics.has(topic) && year === yearLevel) removed++
  else out.push(...lines.slice(i, j + 1))
  i = j
}
console.log(`removed ${removed} questions (${[...topics].join(', ')} at ${yearLevel})`)
if (flag !== '--dry') writeFileSync(path, crlf ? out.join('\n').replace(/\n/g, '\r\n') : out.join('\n'))
