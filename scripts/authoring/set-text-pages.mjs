// Marks texts in one magazine as spanning two pages and renumbers every page
// after them, so the magazine's page numbers stay contiguous.
//
//   node scripts/authoring/set-text-pages.mjs <magazine-id> "<title>" ["<title>" ...]
//
// Run from the repository root when /api/dev/magazines reports that a text
// overflows onto the next page. Texts already marked `pages: 2` are left alone.
import { readFileSync, writeFileSync } from 'node:fs'

const [magazineId, ...titles] = process.argv.slice(2)
if (!magazineId || !titles.length) {
  console.error('Usage: node scripts/authoring/set-text-pages.mjs <magazine-id> "<title>" ...')
  process.exit(2)
}
const path = 'src/lib/questions/magazines.ts'
const src = readFileSync(path, 'utf8')
const start = src.indexOf(`id: '${magazineId}'`)
if (start < 0) throw new Error(`magazine ${magazineId} not found`)
const nextMagazine = src.indexOf(`id: 'reading-`, start + 10)
const end = nextMagazine < 0 ? src.indexOf('/** Every magazine text') : nextMagazine
let block = src.slice(start, end)

// Walk the texts in order, carrying a running page number.
const textRe = /page: (\d+),(\n\s+pages: \d+,)?\n(\s+)title: ('(?:[^'\\]|\\.)*'),/g
let page = 2
block = block.replace(textRe, (whole, _p, pagesLine, indent, titleLit) => {
  const title = titleLit.slice(1, -1).replace(/\\'/g, "'")
  const span = pagesLine ? Number(pagesLine.match(/\d+/)[0]) : titles.includes(title) ? 2 : 1
  const out = `page: ${page},${span > 1 ? `\n${indent}pages: ${span},` : ''}\n${indent}title: ${titleLit},`
  page += span
  return out
})
writeFileSync(path, src.slice(0, start) + block + src.slice(end))
console.log(`${magazineId}: pages renumbered, magazine now ends on page ${page - 1}`)
