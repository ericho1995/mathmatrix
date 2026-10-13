// Renders the Reels/TikTok ad drawn by the dev page /dev/ad (AdTimeline) to an
// MP4: headless Edge steps the page through every frame (window.__setAdTime),
// then ffmpeg encodes the frames with the soundtrack.
//
//   BASE=http://localhost:3000 node marketing/instagram/render-ad.mjs --audio=ad-audio.wav --out=ad.mp4
//   ... --stills=1.5,4,7.5,11.5   only these moments, as PNGs, to check the layout
//   ... --page=dev/ad-grow --length=58.5 --fps=12 --outfps=30
//        another reel; shot at 12 fps for a stop-motion feel, played at 30
//
// Needs the dev server running, and ffmpeg (FFMPEG=path, or on PATH).
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')))
const BASE = process.env.BASE ?? 'http://localhost:3000'
const FPS = Number(args.fps ?? 30)
const OUT_FPS = Number(args.outfps ?? FPS)
// Given without its leading slash: Git Bash rewrites "/dev/..." into a Windows path.
const PAGE = '/' + (args.page ?? 'dev/ad').replace(/^\/+/, '')
const LENGTH = Number(args.length ?? 15)
const OUT = resolve(args.out ?? 'marketing/instagram/export-bird/reel-ad.mp4')
const FFMPEG = process.env.FFMPEG ?? 'ffmpeg'
const EDGE = process.env.EDGE_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const W = 1080
const H = 1920

const port = 9300 + Math.floor(Math.random() * 500)
const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'ad-'))}`, `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const stop = () => spawn('taskkill', ['/PID', String(edge.pid), '/T', '/F'], { stdio: 'ignore' })

try {
  let target
  for (let i = 0; i < 80 && !target; i++) {
    await sleep(250)
    try {
      target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page')
    } catch {}
  }
  if (!target) throw new Error('Edge did not start')
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise(r => ws.addEventListener('open', r))
  let id = 0
  const pending = new Map()
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m)
      pending.delete(m.id)
    }
  })
  const send = (method, params = {}) =>
    new Promise(r => {
      const n = ++id
      pending.set(n, r)
      ws.send(JSON.stringify({ id: n, method, params }))
    })
  await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url: `${BASE}${PAGE}` })
  // Wait for the page, its web font and its clock hook.
  for (let i = 0; i < 120; i++) {
    await sleep(500)
    const r = await send('Runtime.evaluate', { expression: 'typeof window.__setAdTime === "function" && document.fonts.status === "loaded"', returnByValue: true })
    if (r.result?.result?.value) break
  }
  await sleep(1000)

  const frameAt = async (t, file) => {
    await send('Runtime.evaluate', {
      expression: `(async () => { window.__setAdTime(${t}); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))) })()`,
      awaitPromise: true,
    })
    const shot = await send('Page.captureScreenshot', { format: file.endsWith('.png') ? 'png' : 'jpeg', quality: 95, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } })
    writeFileSync(file, Buffer.from(shot.result.data, 'base64'))
  }

  if (args.stills) {
    const dir = resolve(args.dir ?? 'marketing/instagram/export-bird')
    mkdirSync(dir, { recursive: true })
    for (const s of args.stills.split(',')) {
      const file = join(dir, `ad-still-${s}.png`)
      await frameAt(Number(s), file)
      console.log('saved', file)
    }
  } else {
    const dir = mkdtempSync(join(tmpdir(), 'ad-frames-'))
    const frames = Math.round(LENGTH * FPS)
    for (let i = 0; i < frames; i++) {
      await frameAt(i / FPS, join(dir, `f${String(i).padStart(4, '0')}.jpg`))
      if (i % 30 === 0) console.log(`frame ${i}/${frames}`)
    }
    const audio = args.audio ? ['-i', resolve(args.audio)] : []
    const enc = spawnSync(
      FFMPEG,
      [
        '-y', '-framerate', String(FPS), '-i', join(dir, 'f%04d.jpg'), ...audio,
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(OUT_FPS),
        ...(args.audio ? ['-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
        '-movflags', '+faststart', OUT,
      ],
      { stdio: 'inherit' }
    )
    rmSync(dir, { recursive: true, force: true })
    if (enc.status !== 0) throw new Error('ffmpeg failed')
    console.log('saved', OUT)
  }
  ws.close()
} finally {
  stop()
}
