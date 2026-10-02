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
 * Every page of a PDF, drawn one under another at the width of the box —
 * the real printed paper, exactly as it downloads, without leaving the page.
 * Pages appear as they are drawn; if anything fails, the download link stays.
 */
export default function PdfPages({ url, title }: { url: string; title: string }) {
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
          canvas.className = 'block w-full h-auto bg-white rounded-lg ring-1 ring-gray-200 mb-4'
          canvas.setAttribute('role', 'img')
          canvas.setAttribute('aria-label', `${title}, page ${i} of ${doc.numPages}`)
          el.appendChild(canvas)
          await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise
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
  }, [url, title])

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
