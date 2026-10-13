// Adds one Reading Magazine to src/lib/questions/magazines.ts.
//
//   node scripts/authoring/add-magazine.mjs <magazine.mjs> [--dry]
//
// Run from the repository root. The file exports MAGAZINE, a ReadingMagazine
// (src/types/reading.ts) whose texts may leave out `id` — each text gets a fresh
// UUID, since text ids become stimuli.id in the database. The same file usually
// also exports SET, HEADER and ITEMS for append-reading.mjs, with each item
// naming its text by page number (`stim: 3`), so the ids never need copying.
//
// Refuses a magazine whose id is not reading-<yearLevel>-<set>, that already
// exists, or whose pages do not run on from page 2. The magazine is written next
// to the others of its year level, in set order. Afterwards append the questions
// with append-reading.mjs, then `npm run gen` and `npm run verify-bank`, and check
// the layout with /api/dev/magazines.
import { readFileSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const [file, flag] = process.argv.slice(2)
if (!file) {
  console.error('Usage: node scripts/authoring/add-magazine.mjs <magazine.mjs> [--dry]')
  process.exit(2)
}
const dry = flag === '--dry'
const { MAGAZINE } = await import(pathToFileURL(resolve(file)).href + '?t=' + Date.now())

const YEARS = ['grade_3', 'grade_4', 'grade_5', 'grade_6', 'year_7', 'year_8', 'year_9', 'year_10']
const TYPES = new Set(['story', 'report', 'explanation', 'persuasive', 'letter', 'poem', 'review', 'news', 'procedure', 'web', 'notice', 'interview', 'diary'])
const BLOCKS = new Set(['para', 'heading', 'bullets', 'steps', 'factbox', 'verse', 'caption', 'quote', 'note', 'excerpt'])

const path = 'src/lib/questions/magazines.ts'
let src = readFileSync(path, 'utf8').replace(/\r\n/g, '\n')

const m = MAGAZINE
const problems = []
if (!YEARS.includes(m.yearLevel)) problems.push(`unknown yearLevel ${m.yearLevel}`)
if (!Number.isInteger(m.set) || m.set < 1) problems.push('set must be a positive integer')
if (m.id !== `reading-${m.yearLevel}-${m.set}`) problems.push(`id should be reading-${m.yearLevel}-${m.set}`)
if (src.includes(`id: '${m.id}',`)) problems.push(`${m.id} is already in magazines.ts`)
let page = 2
for (const t of m.texts ?? []) {
  const where = `"${t.title}"`
  if (t.page !== page) problems.push(`${where} is on page ${t.page}; the text before it ends on page ${page - 1}`)
  page = t.page + (t.pages ?? 1)
  if (!t.title || !TYPES.has(t.type)) problems.push(`${where}: needs a title and a known type (${t.type})`)
  if (!Array.isArray(t.blocks) || !t.blocks.length) problems.push(`${where}: needs blocks`)
  for (const b of t.blocks ?? []) if (!BLOCKS.has(b.kind)) problems.push(`${where}: unknown block kind ${b.kind}`)
  if (/practis/i.test(JSON.stringify(t))) problems.push(`${where}: uses "practis-"; house spelling is "practice"`)
  if (JSON.stringify(t).includes('\\\\n')) problems.push(`${where}: literal backslash-n`)
}
if (!m.texts?.length) problems.push('no texts')
if (problems.length) {
  console.error('Problems:\n  ' + problems.join('\n  '))
  process.exit(1)
}

// ── Serialise in the file's own style: single quotes, one line per block ──
const str = s => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`
const key = k => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : str(k))
function lit(v, ind, inline = false) {
  if (typeof v === 'string') return str(v)
  if (typeof v !== 'object' || v === null) return String(v)
  const pad = ' '.repeat(ind + 2)
  if (Array.isArray(v)) {
    if (!v.length) return '[]'
    if (inline || v.every(x => typeof x !== 'object' || x === null)) {
      const one = `[${v.map(x => lit(x, ind, true)).join(', ')}]`
      if (inline || one.length + ind < 110) return one
    }
    return `[\n${v.map(x => pad + lit(x, ind + 2)).join(',\n')},\n${' '.repeat(ind)}]`
  }
  const entries = Object.entries(v).filter(([, x]) => x !== undefined)
  if (inline) return `{ ${entries.map(([k, x]) => `${key(k)}: ${lit(x, ind, true)}`).join(', ')} }`
  return `{\n${entries.map(([k, x]) => `${pad}${key(k)}: ${k === 'blocks' ? blocks(x, ind + 2) : lit(x, ind + 2)}`).join(',\n')},\n${' '.repeat(ind)}}`
}
const blocks = (list, ind) => `[\n${list.map(b => ' '.repeat(ind + 2) + lit(b, ind + 2, true)).join(',\n')},\n${' '.repeat(ind)}]`

let assigned = 0
const texts = m.texts.map(({ id, ...rest }) => {
  if (!id || id === 'new') assigned++
  return { id: !id || id === 'new' ? randomUUID() : id, ...rest }
})
const block = lit({ id: m.id, yearLevel: m.yearLevel, set: m.set, texts }, 2)

// ── Place it after the last magazine that sorts before it ──
const rank = (y, s) => YEARS.indexOf(y) * 1000 + s
const mine = rank(m.yearLevel, m.set)
let at = src.indexOf('export const MAGAZINES: ReadingMagazine[] = [\n')
if (at < 0) throw new Error('MAGAZINES export not found')
at += 'export const MAGAZINES: ReadingMagazine[] = [\n'.length
for (const hit of src.matchAll(/\n {4}id: 'reading-(\w+)-(\d+)',\n/g)) {
  if (rank(hit[1], Number(hit[2])) > mine) continue
  const end = src.indexOf('\n  },\n', hit.index)
  if (end > 0 && end + 6 > at) at = end + 6
}
src = src.slice(0, at) + '  ' + block + ',\n' + src.slice(at)
console.log(`${m.id}: ${m.texts.length} texts on pages 2-${page - 1}, ${assigned} new text id(s)`)
if (dry) console.log('(dry run — magazines.ts not written)')
else writeFileSync(path, src)
