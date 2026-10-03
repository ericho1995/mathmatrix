'use client'

import { useEffect, useRef, useState } from 'react'

// pdf.js, loaded only when a whole paper is opened — the same build the
// authoring tools render pages with (scripts/authoring/pdf-pages.mjs).
const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.min.mjs'
const WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.worker.min.mjs'

interface PdfJs {
  GlobalWorkerOptions: { workerSrc: string }
  getDocument(src: string): { promise: Promise<PdfDocument> }
}
interface PdfDocument {
  numPages: number
  getPage(n: number): Promise<{
    getViewport(o: { scale: number }): { width: number; height: number }
    render(o: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }): { promise: Promise<void> }
    getTextContent(): Promise<{ items: { str?: string }[] }>
  }>
  destroy(): Promise<void>
}

let pdfjs: Promise<PdfJs> | null = null
function loadPdfJs(): Promise<PdfJs> {
  pdfjs ??= (import(/* webpackIgnore: true */ PDFJS) as Promise<PdfJs>).then(m => {
    m.GlobalWorkerOptions.workerSrc = WORKER
    return m
  })
  return pdfjs
}

/**
 * A preview's locked pages carry a banner (lib/pdf/PreviewPages.tsx,
 * LockedPages): "LOCKED … comes with a PrepNest plan · prepnest.com.au/pricing".
 * Its letter-spacing comes out of the PDF as "LO C K E D", so match with the
 * spaces taken out; the address keeps the cover's "the rest is locked" note
 * from matching.
 */
const isLockedPage = (text: string) => {
  const t = text.replace(/\s+/g, '').toLowerCase()
  return t.includes('locked') && t.includes('prepnest.com.au/pricing')
}

/** The card laid over a locked page: built from DOM nodes, so nothing here is parsed as HTML. */
function lockCard(unlock: { href: string; label: string }): HTMLElement {
  const veil = document.createElement('div')
  veil.className = 'absolute inset-0 flex items-center justify-center p-4'
  const card = document.createElement('a')
  card.href = unlock.href
  card.className = 'rounded-2xl bg-white border-2 border-b-4 border-line px-6 py-5 text-center shadow-lg max-w-xs hover:-translate-y-0.5 transition-transform'
  const title = document.createElement('p')
  title.className = 'font-bold text-lg text-ink'
  title.textContent = 'This half is locked'
  const body = document.createElement('p')
  body.className = 'text-sm text-gray-600 mt-1'
  body.textContent = 'The rest of the paper, and its answers, come with a PrepNest plan.'
  const button = document.createElement('span')
  button.className = 'btn-primary inline-block mt-4 text-sm'
  button.textContent = unlock.label
  card.append(title, body, button)
  veil.append(card)
  return veil
}

/**
 * Every page of a PDF, drawn one under another at the width of the box —
 * the real printed paper, exactly as it downloads, without leaving the page.
 * Pages appear as they are drawn; if anything fails, the download link stays.
 *
 * A preview's locked half (outlines only; none of its words are in the file)
 * is blurred, with `unlock` laid over each locked page.
 */
export default function PdfPages({ url, title, unlock = { href: '/pricing', label: 'See the plans' } }: { url: string; title: string; unlock?: { href: string; label: string } }) {
  const { href: unlockHref, label: unlockLabel } = unlock
  const box = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [pages, setPages] = useState(0)

  useEffect(() => {
    let cancelled = false
    let doc: PdfDocument | null = null
    const el = box.current
    if (!el) return
    el.replaceChildren()
    setState('loading')
    setPages(0)
    ;(async () => {
      try {
        const lib = await loadPdfJs()
        doc = await lib.getDocument(url).promise
        if (cancelled) return
        setPages(doc.numPages)
        const width = el.clientWidth || 600
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        for (let i = 1; i <= doc.numPages && !cancelled; i++) {
          const page = await doc.getPage(i)
          const viewport = page.getViewport({ scale: (width / page.getViewport({ scale: 1 }).width) * dpr })
          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          canvas.className = 'block w-full h-auto bg-white rounded-lg ring-1 ring-gray-200'
          canvas.setAttribute('role', 'img')
          canvas.setAttribute('aria-label', `${title}, page ${i} of ${doc.numPages}`)
          const frame = document.createElement('div')
          frame.className = 'relative mb-4 overflow-hidden rounded-lg'
          frame.appendChild(canvas)
          el.appendChild(frame)
          await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise
          const text = (await page.getTextContent()).items.map(t => t.str ?? '').join(' ')
          if (isLockedPage(text) && !cancelled) {
            canvas.classList.add('blur-[5px]')
            canvas.setAttribute('aria-label', `${title}, page ${i} of ${doc.numPages}: locked`)
            frame.appendChild(lockCard({ href: unlockHref, label: unlockLabel }))
          }
          if (i === 1 && !cancelled) setState('ready')
        }
      } catch (e) {
        console.error('[PdfPages] could not draw the paper', e)
        if (!cancelled) setState('error')
      }
    })()
    return () => {
      cancelled = true
      void doc?.destroy()
    }
  }, [url, title, unlockHref, unlockLabel])

  return (
    <div>
      {state === 'loading' && (
        <p className="text-sm text-gray-500 py-10 text-center" role="status">
          Opening the paper…
        </p>
      )}
      {state === 'error' && (
        <p className="text-sm text-gray-600 py-6 text-center" role="alert">
          The paper could not be shown here.{' '}
          <a href={url} className="underline font-bold">
            Download it instead
          </a>
          .
        </p>
      )}
      {pages > 0 && <p className="text-xs font-bold text-gray-400 mb-2">{pages} pages</p>}
      <div ref={box} />
    </div>
  )
}
