// Loads the reading content (magazines and authored passages) from a build
// script, which cannot import TypeScript directly.
//
// The magazine is authored as typed blocks so the PDF can lay it out like a
// real magazine (headings, fact boxes, numbered steps, verse). The database
// and the on-screen quiz only need the words, so `plainBody` flattens a text
// back to prose — the same job `stimuli.body` does for every other passage.
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

export async function loadMagazines(repoRoot) {
  const path = join(repoRoot, 'src/lib/questions/magazines.ts')
  const tmp = join(repoRoot, '.magazines-tmp.mjs')
  writeFileSync(
    tmp,
    readFileSync(path, 'utf8')
      .replace(/\r\n/g, '\n') // tolerate a Windows (CRLF) checkout
      .replace(/^import type .+\n/m, '')
      .replace(/: ReadingMagazine\[\]/, '')
      .replace(/ as const/g, ''),
  )
  try {
    const { MAGAZINES } = await import('file://' + tmp)
    return MAGAZINES
  } finally {
    unlinkSync(tmp)
  }
}

/** The authored passages in src/lib/questions/stimuli.ts. */
export async function loadStimuli(repoRoot) {
  const path = join(repoRoot, 'src/lib/questions/stimuli.ts')
  const tmp = join(repoRoot, '.stimuli-content-tmp.mjs')
  writeFileSync(
    tmp,
    readFileSync(path, 'utf8')
      .replace(/\r\n/g, '\n')
      .replace(/^import type .+\n/m, '')
      .replace(/export const STIMULI:[^=]+=\s*\[/, 'export const STIMULI = ['),
  )
  try {
    const { STIMULI } = await import('file://' + tmp)
    return STIMULI
  } finally {
    unlinkSync(tmp)
  }
}

/** A magazine text as plain prose, for `stimuli.body`. */
export function plainBody(text) {
  const parts = []
  for (const b of text.blocks) {
    switch (b.kind) {
      case 'para':
      case 'caption':
      case 'quote':
      case 'note':
        parts.push(b.text)
        break
      case 'heading':
        parts.push(b.text)
        break
      case 'bullets':
        parts.push(b.items.map(i => `• ${i}`).join('\n'))
        break
      case 'steps':
        parts.push(b.items.map((i, n) => `${n + 1}. ${i}`).join('\n'))
        break
      case 'factbox':
        parts.push([b.title, ...b.items.map(i => `• ${i}`)].join('\n'))
        break
      case 'verse':
        parts.push(b.lines.join('\n'))
        break
      default:
        throw new Error(`unknown block kind: ${b.kind}`)
    }
  }
  if (text.figureCaption) parts.push(`[${text.figureCaption}]`)
  return parts.join('\n\n')
}

/**
 * Every magazine text as a `stimuli` row, keyed the way questions point at it.
 *
 * The row's subject is 'english', not 'reading': the database's subject enum
 * predates the Reading subject, and nothing reads stimuli.subject — the app
 * takes passages from the source files. Reading is part of the English
 * learning area, so the label is true, and it spares a migration that would
 * have to run before every seed load.
 */
export function magazineStimuli(magazines) {
  return magazines.flatMap(m =>
    m.texts.map(t => {
      const body = plainBody(t)
      return {
        id: t.id,
        type: 'passage',
        title: t.title,
        body,
        subject: 'english',
        year_level: m.yearLevel,
        word_count: body.split(/\s+/).filter(Boolean).length,
      }
    }),
  )
}
