// Renders the Instagram artboards drawn by the dev page /dev/social/<id> to
// PNG with headless Edge, at Instagram's sizes (1080×1350 feed, 1080×1080
// profile picture). The boards use the real product components, so start the
// dev server first (any port; default 3000):
//
//   node marketing/instagram/render-social.mjs                 every board
//   node marketing/instagram/render-social.mjs puzzle-1 tip-1  just these
//   BASE=http://localhost:3061 node marketing/instagram/render-social.mjs
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, 'export-bird')
const BASE = process.env.BASE ?? 'http://localhost:3000'
const EDGE = [process.env.EDGE_PATH, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(p => p && existsSync(p))
if (!EDGE) throw new Error('Microsoft Edge not found; set EDGE_PATH')

const square = id => ({ id, w: 1080, h: 1080 })
const feed = id => ({ id, w: 1080, h: 1350 })
const BOARDS = [
  square('profile-sun'),
  square('profile-sky'),
  feed('puzzle-1'),
  feed('puzzle-2'),
  feed('report-1'),
  feed('report-2'),
  feed('report-3'),
  feed('report-4'),
  feed('screen-1'),
  feed('tip-1'),
  feed('skip-1'),
]

const only = process.argv.slice(2)
const unknown = only.filter(id => !BOARDS.some(b => b.id === id))
if (unknown.length) throw new Error(`Unknown board: ${unknown.join(', ')}`)
mkdirSync(out, { recursive: true })

for (const b of only.length ? BOARDS.filter(x => only.includes(x.id)) : BOARDS) {
  const file = resolve(out, `${b.id}.png`)
  rmSync(file, { force: true })
  const r = spawnSync(
    EDGE,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-color-profile=srgb',
      '--force-device-scale-factor=1',
      // A fresh profile each time, or Edge hands the job to a running Edge (or
      // one still closing) and writes nothing.
      `--user-data-dir=${join(tmpdir(), `prepnest-social-${process.pid}-${b.id}`)}`,
      // Long enough for the page, its web font and its drawings to settle.
      '--virtual-time-budget=15000',
      `--window-size=${b.w},${b.h}`,
      `--screenshot=${file}`,
      `${BASE}/dev/social/${b.id}`,
    ],
    { stdio: 'ignore', timeout: 120_000 }
  )
  // Edge's launcher returns at once and the browser writes the file a few
  // seconds later, so wait for it to appear and stop growing.
  let size = -1
  for (let i = 0; i < 120; i++) {
    await new Promise(res => setTimeout(res, 500))
    const now = existsSync(file) ? statSync(file).size : -1
    if (now > 10_000 && now === size) break
    size = now
  }
  const ok = r.status === 0 && existsSync(file) && statSync(file).size > 10_000
  console.log(`${ok ? 'saved ' : 'FAILED'} ${b.id}${ok ? ` (${Math.round(statSync(file).size / 1024)} KB)` : ''}`)
  if (!ok) process.exitCode = 1
}
