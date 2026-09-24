// Renders the artboards in ads.html to PNG with headless Edge, at the exact
// pixel sizes Instagram wants (1080×1350 feed, 1080×1920 Story).
//
//   node marketing/instagram/render.mjs                  every board
//   node marketing/instagram/render.mjs vce-1 vce-story  just these
//   node marketing/instagram/render.mjs --today=2026-10-01
//
// The VCE boards print a countdown ("Under five weeks to go"), worked out from
// today's date in Melbourne unless --today is given, so re-render them before
// posting on a later day. Needs network access for the Inter web font.
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { tmpdir } from 'node:os'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, '..', '..')
const EDGE = process.env.EDGE_PATH ?? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const feed = id => ({ id, w: 1080, h: 1350, out: `marketing/instagram/export/${id}.png` })
const story = id => ({ id, w: 1080, h: 1920, out: `marketing/instagram/export/${id}.png` })
const BOARDS = [
  { id: 'logo', w: 1080, h: 1080, out: 'public/brand/prepnest-logo-1080.png' },
  { id: 'logo-transparent', w: 1200, h: 320, scale: 2, transparent: true, out: 'public/brand/prepnest-logo.png' },
  { id: 'profile', w: 1080, h: 1080, out: 'public/brand/prepnest-profile-1080.png' },
  feed('intro-1'), feed('intro-2'), feed('intro-3'), feed('intro-4'), feed('intro-5'), story('intro-story'),
  feed('vce-1'), feed('vce-2'), feed('vce-3'), feed('vce-4'), story('vce-story'),
]

const args = process.argv.slice(2)
const today = args.find(a => a.startsWith('--today='))?.slice(8) ??
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Melbourne', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const only = args.filter(a => !a.startsWith('--'))
const unknown = only.filter(id => !BOARDS.some(b => b.id === id))
if (unknown.length) throw new Error(`Unknown board: ${unknown.join(', ')}`)
const boards = only.length ? BOARDS.filter(b => only.includes(b.id)) : BOARDS

const port = 9400 + Math.floor(Math.random() * 500)
const profileDir = join(tmpdir(), `prepnest-render-${port}`)
const edge = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb',
  '--allow-file-access-from-files', `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`, 'about:blank',
], { stdio: 'ignore' })

const sleep = ms => new Promise(r => setTimeout(r, ms))
function stopEdge() {
  // Kill this Edge's process tree only, never every msedge.exe on the machine.
  spawn('taskkill', ['/PID', String(edge.pid), '/T', '/F'], { stdio: 'ignore' })
}

let failed = false
try {
  let target
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(200)
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page') } catch {}
  }
  if (!target) throw new Error('Edge did not start')

  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej) })
  let seq = 0
  const pending = new Map()
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data)
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
  })
  const send = (method, params = {}) => new Promise((res, rej) => {
    const id = ++seq
    pending.set(id, m => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)))
    ws.send(JSON.stringify({ id, method, params }))
  })

  const page = pathToFileURL(join(here, 'ads.html')).href
  for (const b of boards) {
    await send('Emulation.setDeviceMetricsOverride', { width: b.w, height: b.h, deviceScaleFactor: b.scale ?? 1, mobile: false })
    await send('Emulation.setDefaultBackgroundColorOverride', b.transparent ? { color: { r: 0, g: 0, b: 0, a: 0 } } : {})
    await send('Page.navigate', { url: `${page}?board=${b.id}&today=${today}` })

    let title = ''
    for (let i = 0; i < 150 && !/^(ready|error)/.test(title); i++) {
      await sleep(100)
      title = String((await send('Runtime.evaluate', { expression: 'document.title' })).result?.value ?? '')
    }
    if (title !== 'ready') {
      console.error(`${b.id}: ${title || 'timed out waiting for the page'}`)
      failed = true
      continue
    }
    const shot = await send('Page.captureScreenshot', { format: 'png' })
    const out = join(repo, b.out)
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, Buffer.from(shot.data, 'base64'))
    console.log(`${b.id} → ${b.out} (${b.w * (b.scale ?? 1)}×${b.h * (b.scale ?? 1)})`)
  }
  ws.close()
} finally {
  stopEdge()
  await sleep(500)
  try { rmSync(profileDir, { recursive: true, force: true }) } catch {}
}
if (failed) process.exit(1)
