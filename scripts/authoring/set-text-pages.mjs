// Sets how many pages texts in one magazine fill, and renumbers every page
// after them so the magazine's page numbers stay contiguous.
//
//   node scripts/authoring/set-text-pages.mjs <magazine-id> "<title>" ... [--single "<title>" ...]
//
// Titles before --single become two-page texts; titles after it go back to one
// page. Run from the repository root when /api/dev/magazines reports that a
// text overflows its page, or no longer fills the two it claims.
import { readFileSync, writeFileSync } from 'node:fs'

const [magazineId, ...rest] = process.argv.slice(2)
const cut = rest.indexOf('--single')
const double = new Set(cut < 0 ? rest : rest.slice(0, cut))
const single = new Set(cut < 0 ? [] : rest.slice(cut + 1))
if (!magazineId || (!double.size && !single.size)) {
  console.error('Usage: node scripts/authoring/set-text-pages.mjs <magazine-id> "<title>" ... [--single "<title>" ...]')
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
const textRe = /page: (\d+),(\r?\n\s+pages: \d+,)?(\r?\n)(\s+)title: ('(?:[^'\\]|\\.)*'),/g
let page = 2
block = block.replace(textRe, (whole, _p, pagesLine, nl, indent, titleLit) => {
  const title = titleLit.slice(1, -1).replace(/\\'/g, "'")
  const current = pagesLine ? Number(pagesLine.match(/\d+/)[0]) : 1
  const span = single.has(title) ? 1 : double.has(title) ? 2 : current
  const out = `page: ${page},${span > 1 ? `${nl}${indent}pages: ${span},` : ''}${nl}${indent}title: ${titleLit},`
  page += span
  return out
})
writeFileSync(path, src.slice(0, start) + block + src.slice(end))
console.log(`${magazineId}: pages renumbered, magazine now ends on page ${page - 1}`)
