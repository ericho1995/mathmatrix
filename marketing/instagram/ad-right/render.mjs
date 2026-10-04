// Renders "The right practice" (/dev/ad-right) to an MP4. Headless Edge steps
// the page through time (window.__setAdTime); ffmpeg encodes the frames with
// the soundtrack.
//
// Motion blur: every output frame is the average of SUB samples spread over
// half the frame (a 180° shutter), so fast moves blur the way a camera's do
// instead of strobing.
//
//   BASE=http://localhost:3071 FFMPEG=path/to/ffmpeg node marketing/instagram/ad-right/render.mjs
//   ... --stills=1.2,5.5,9    only these moments, as PNGs, to check the layout
//   ... --sub=1               no motion blur (a quick draft)
//   ... --from=8 --to=12      part of it (a draft of one scene)
//
// Needs the dev server running.
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')))
const BASE = process.env.BASE ?? 'http://localhost:3000'
const FPS = 30
const SUB = Number(args.sub ?? 2)
const timings = JSON.parse(readFileSync(join(HERE, 'timings.json'), 'utf8'))
const FROM = Number(args.from ?? 0)
const TO = Number(args.to ?? timings.length)
const OUT = resolve(args.out ?? join(HERE, '../export-bird/reel-right-practice.mp4'))
const AUDIO = args.audio === 'none' ? null : resolve(args.audio ?? join(HERE, 'ad-audio.wav'))
const FFMPEG = process.env.FFMPEG ?? 'ffmpeg'
const EDGE = process.env.EDGE_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const W = 1080
const H = 1920

const port = 9300 + Math.floor(Math.random() * 500)
const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'ad-'))}`, `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' })
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
  await send('Page.navigate', { url: `${BASE}/dev/ad-right` })
  // Wait for the page, its fonts, its images and its clock hook.
  for (let i = 0; i < 240; i++) {
    await sleep(500)
    const r = await send('Runtime.evaluate', { expression: 'typeof window.__setAdTime === "function" && document.fonts.status === "loaded"', returnByValue: true })
    if (r.result?.result?.value) break
  }
  // Every scene mounts its images only when on screen: visit each once so they are cached.
  for (let s = 0; s < timings.length; s += 0.5) {
    await send('Runtime.evaluate', { expression: `window.__setAdTime(${s})` })
  }
  await send('Runtime.evaluate', {
    expression: `Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r })))`,
    awaitPromise: true,
  })
  await sleep(1500)

  const shoot = async (t, file) => {
    await send('Runtime.evaluate', {
      expression: `(async () => { window.__setAdTime(${t}); await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r }))); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))) })()`,
      awaitPromise: true,
    })
    const shot = await send('Page.captureScreenshot', { format: file.endsWith('.png') ? 'png' : 'jpeg', quality: 96, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } })
    writeFileSync(file, Buffer.from(shot.result.data, 'base64'))
  }

  if (args.stills) {
    const dir = resolve(args.dir ?? join(HERE, 'stills'))
    mkdirSync(dir, { recursive: true })
    for (const s of args.stills.split(',')) {
      const file = join(dir, `still-${s}.png`)
      await shoot(Number(s), file)
      console.log('saved', file)
    }
  } else {
    const dir = mkdtempSync(join(tmpdir(), 'ad-frames-'))
    const frames = Math.round((TO - FROM) * FPS)
    let k = 0
    const t0 = Date.now()
    for (let f = 0; f < frames; f++) {
      for (let s = 0; s < SUB; s++) {
        // Samples across the first half of the frame interval, centred on it.
        const t = FROM + f / FPS + (SUB > 1 ? (s / (SUB - 1) - 0.5) * (0.5 / FPS) : 0)
        await shoot(Math.max(0, t), join(dir, `f${String(k++).padStart(5, '0')}.jpg`))
      }
      if (f % 30 === 0) console.log(`frame ${f}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)}s)`)
    }
    const blur = SUB > 1 ? ['-vf', `tmix=frames=${SUB}:weights='${Array(SUB).fill(1).join(' ')}',select='not(mod(n+1\\,${SUB}))',setpts=N/${FPS}/TB`] : []
    const audio = AUDIO ? ['-ss', String(FROM), '-t', String(TO - FROM), '-i', AUDIO] : []
    const enc = spawnSync(
      FFMPEG,
      [
        '-y', '-framerate', String(FPS * SUB), '-i', join(dir, 'f%05d.jpg'), ...audio,
        ...blur,
        '-r', String(FPS), '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-tune', 'animation',
        ...(AUDIO ? ['-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest'] : []),
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
