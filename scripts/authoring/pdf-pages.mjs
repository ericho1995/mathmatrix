// Renders pages of a PDF to one PNG, for reading a generated paper the way a
// student sees it without the browser pane.
//
//   node scripts/authoring/pdf-pages.mjs <file.pdf> [firstPage=1] [count=2] [out.png] [pageWidth=520]
//
// Serves the PDF and a pdf.js page from a throwaway localhost server, loads it
// in headless Edge and captures the result. Pages are laid out two per row
// (one per row when pageWidth > 600). Needs Edge and network access to
// cdn.jsdelivr.net for pdf.js.
import http from 'node:http'
import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const [pdfPath, first = '1', count = '2', out = 'pages.png', width = '520'] = process.argv.slice(2)
if (!pdfPath || !existsSync(pdfPath)) {
  console.error('Usage: node scripts/authoring/pdf-pages.mjs <file.pdf> [firstPage] [count] [out.png] [pageWidth]')
  process.exit(2)
}
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync)
if (!EDGE) throw new Error('Microsoft Edge not found')

const VIEWER = `<!doctype html><html><head><meta charset="utf-8"><title>loading</title>
<style>body{margin:0;background:#777}canvas{display:inline-block;vertical-align:top;margin:0 4px 6px;background:#fff}#out{text-align:center;padding-top:4px}</style></head>
<body><div id="out"></div><script type="module">
import * as pdfjs from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.min.mjs'
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.worker.min.mjs'
const q = new URLSearchParams(location.search)
const from = +q.get('p'), count = +q.get('n'), width = +q.get('w')
const doc = await pdfjs.getDocument('/doc.pdf').promise
for (let i = from; i < Math.min(from + count, doc.numPages + 1); i++) {
  const page = await doc.getPage(i)
  const v1 = page.getViewport({ scale: 1 })
  const vp = page.getViewport({ scale: (width / v1.width) * 2 })
  const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height
  c.style.width = width + 'px'; c.style.height = (vp.height / 2) + 'px'
  document.getElementById('out').appendChild(c)
  await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise
}
document.title = 'ready ' + doc.numPages
</script></body></html>`

const pdf = readFileSync(pdfPath)
const server = http.createServer((req, res) => {
  const path = new URL(req.url, 'http://x').pathname
  if (path === '/doc.pdf') { res.writeHead(200, { 'Content-Type': 'application/pdf' }); return res.end(pdf) }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(VIEWER)
})
await new Promise(r => server.listen(0, '127.0.0.1', r))
const port = server.address().port

const n = Number(count), w = Number(width)
const perRow = w > 600 ? 1 : 2
const rows = Math.ceil(n / perRow)
const winW = perRow * (w + 8) + 16
const winH = rows * (Math.round(w * 1.4142) + 6) + 12
const cdp = 9300 + Math.floor(Math.random() * 600)
const profile = join(tmpdir(), `pdf-pages-edge-${cdp}`)
const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${cdp}`, `--window-size=${winW},${winH}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
const stop = () => { spawn('taskkill', ['/PID', String(edge.pid), '/T', '/F'], { stdio: 'ignore' }); server.close() }
const sleep = ms => new Promise(r => setTimeout(r, ms))

let target
for (let i = 0; i < 60 && !target; i++) {
  await sleep(200)
  try { target = (await (await fetch(`http://127.0.0.1:${cdp}/json`)).json()).find(t => t.type === 'page') } catch {}
}
if (!target) { stop(); throw new Error('Edge did not start') }
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise(r => ws.addEventListener('open', r))
let id = 0
const pending = new Map()
ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } })
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
await send('Emulation.setDeviceMetricsOverride', { width: winW, height: winH, deviceScaleFactor: 1.5, mobile: false })
await send('Page.navigate', { url: `http://127.0.0.1:${port}/viewer.html?p=${first}&n=${count}&w=${w}` })
let title = ''
for (let i = 0; i < 300 && !title.startsWith('ready'); i++) {
  await sleep(200)
  title = String((await send('Runtime.evaluate', { expression: 'document.title' })).result?.result?.value ?? '')
}
await sleep(300)
const shot = await send('Page.captureScreenshot', { format: 'png' })
writeFileSync(resolve(out), Buffer.from(shot.result.data, 'base64'))
ws.close()
stop()
console.log(title.startsWith('ready') ? `saved ${out} (${title.slice(6)} pages in document)` : `saved ${out} (viewer never reported ready)`)
process.exit(0)
