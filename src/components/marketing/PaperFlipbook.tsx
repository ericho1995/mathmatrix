'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react'

// pdf.js, loaded only when a paper is opened — the same build the authoring
// tools render pages with (scripts/authoring/pdf-pages.mjs).
const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.min.mjs'
const WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.worker.min.mjs'

interface PdfPage {
  getViewport(o: { scale: number }): { width: number; height: number }
  render(o: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }): { promise: Promise<void> }
  getTextContent(): Promise<{ items: { str?: string }[] }>
}
interface PdfDocument {
  numPages: number
  getPage(n: number): Promise<PdfPage>
  destroy(): Promise<void>
}
interface PdfJs {
  GlobalWorkerOptions: { workerSrc: string }
  getDocument(src: string): { promise: Promise<PdfDocument> }
}

let pdfjs: Promise<PdfJs> | null = null
function loadPdfJs(): Promise<PdfJs> {
  pdfjs ??= (import(/* webpackIgnore: true */ PDFJS) as Promise<PdfJs>).then(m => {
    m.GlobalWorkerOptions.workerSrc = WORKER
    return m
  })
  return pdfjs
}

/** Page width, in CSS pixels, a page is drawn at; sharp on a phone held close and on a laptop. */
const DRAW_WIDTH = 820

/**
 * A preview's locked pages carry a banner (lib/pdf/PreviewPages.tsx,
 * LockedPages): "LOCKED … comes with a PrepNest plan · prepnest.com.au/pricing".
 * The banner is letter-spaced, so the text is compared with spaces taken out;
 * the address keeps the cover's "the rest is locked" note from matching.
 */
const isLockedPage = (text: string) => {
  const t = text.replace(/\s+/g, '').toLowerCase()
  return t.includes('locked') && t.includes('prepnest.com.au/pricing')
}

/**
 * A printed paper to flip through, page by page: swipe on a phone, arrows or
 * the keyboard on a computer, thumbnails to jump. Every page is the real PDF
 * exactly as it downloads, drawn in the browser by pdf.js. If drawing fails,
 * the download link stays.
 *
 * A preview's locked half (outlines only; none of its words are in the file)
 * is blurred, with `unlock` laid over each locked page.
 */
export default function PaperFlipbook({ url, title, unlock = { href: '/pricing', label: 'See the plans' } }: { url: string; title: string; unlock?: { href: string; label: string } }) {
  const track = useRef<HTMLDivElement>(null)
  const [pages, setPages] = useState<(string | null)[]>([])
  const [locked, setLocked] = useState<boolean[]>([])
  const [current, setCurrent] = useState(0)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  // Draw every page, first page first, as an image the slides and thumbnails share.
  useEffect(() => {
    let cancelled = false
    let doc: PdfDocument | null = null
    setState('loading')
    setPages([])
    setLocked([])
    setCurrent(0)
    track.current?.scrollTo({ left: 0 })
    ;(async () => {
      try {
        const lib = await loadPdfJs()
        doc = await lib.getDocument(url).promise
        if (cancelled) return
        setPages(Array(doc.numPages).fill(null))
        setLocked(Array(doc.numPages).fill(false))
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const canvas = document.createElement('canvas')
        for (let i = 1; i <= doc.numPages && !cancelled; i++) {
          const page = await doc.getPage(i)
          const viewport = page.getViewport({ scale: (DRAW_WIDTH / page.getViewport({ scale: 1 }).width) * dpr })
          canvas.width = viewport.width
          canvas.height = viewport.height
          const ctx = canvas.getContext('2d')!
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          await page.render({ canvasContext: ctx, viewport }).promise
          const src = canvas.toDataURL('image/jpeg', 0.85)
          const isLocked = isLockedPage((await page.getTextContent()).items.map(t => t.str ?? '').join(' '))
          if (cancelled) return
          setPages(prev => prev.map((p, k) => (k === i - 1 ? src : p)))
          if (isLocked) setLocked(prev => prev.map((l, k) => (k === i - 1 ? true : l)))
          if (i === 1) setState('ready')
        }
      } catch (e) {
        console.error('[PaperFlipbook] could not draw the paper', e)
        if (!cancelled) setState('error')
      }
    })()
    return () => {
      cancelled = true
      void doc?.destroy()
    }
  }, [url])

  const go = useCallback((i: number) => {
    const el = track.current
    if (!el) return
    const n = Math.max(0, Math.min(i, el.children.length - 1))
    el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' })
  }, [])

  // The page in view follows the swipe.
  const onScroll = () => {
    const el = track.current
    if (el) setCurrent(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)))
  }

  // Arrow keys turn the page while the flipbook is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(current + 1)
      if (e.key === 'ArrowLeft') go(current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, go])

  if (state === 'error') {
    return (
      <p className="text-sm text-gray-600 py-10 text-center" role="alert">
        The paper could not be shown here.{' '}
        <a href={url} className="underline font-bold">
          Download it instead
        </a>
        .
      </p>
    )
  }

  const total = pages.length
  return (
    <div aria-roledescription="carousel" aria-label={title}>
      <div className="relative">
        <div
          ref={track}
          onScroll={onScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-2xl bg-gray-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {(total ? pages : [null]).map((src, i) => (
            <div
              key={i}
              className="relative w-full shrink-0 snap-center flex items-center justify-center p-3 sm:p-5 h-[50vh] sm:h-[54vh] min-h-[22rem]"
              role="group"
              aria-roledescription="page"
              aria-label={total ? `Page ${i + 1} of ${total}` : 'Loading'}
            >
              {src ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- drawn in the browser from the PDF */}
                  <img
                    src={src}
                    alt={`${title}, page ${i + 1} of ${total}${locked[i] ? ': locked' : ''}`}
                    className={`max-h-full max-w-full w-auto h-auto rounded-lg shadow-md ring-1 ring-black/5 bg-white ${locked[i] ? 'blur-[5px]' : ''}`}
                    draggable={false}
                  />
                  {locked[i] && (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <div className="w-full max-w-[19rem] rounded-2xl bg-white/95 border-2 border-line border-b-4 px-5 py-4 text-center shadow-lg">
                        <Lock className="w-6 h-6 mx-auto text-brand-600" aria-hidden />
                        <p className="font-bold text-ink mt-1">This half is locked</p>
                        <p className="text-sm text-gray-600 mt-1">The rest of the paper, and its answers, come with a PrepNest plan.</p>
                        <Link href={unlock.href as Route} className="btn-primary inline-block mt-3 text-sm">
                          {unlock.label}
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full aspect-[1/1.414] max-w-full rounded-lg bg-white ring-1 ring-black/5 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-400 animate-pulse">{total ? `Page ${i + 1}…` : 'Opening the paper…'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(current - 1)}
              disabled={current === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border-2 border-line border-b-4 text-ink flex items-center justify-center disabled:opacity-0 transition-opacity"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => go(current + 1)}
              disabled={current >= total - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-brand-600 border-b-4 border-brand-700 text-white flex items-center justify-center disabled:opacity-0 transition-opacity"
              aria-label="Next page"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {total > 0 && (
        <>
          <p className="text-center text-sm font-bold text-gray-500 mt-3" aria-live="polite">
            Page {current + 1} of {total}
            <span className="font-semibold text-gray-400 sm:hidden"> · swipe to turn</span>
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 mt-3 justify-start sm:justify-center">
            {pages.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                className={`shrink-0 w-12 rounded-md overflow-hidden border-2 transition-colors ${i === current ? 'border-brand-500' : 'border-line hover:border-brand-200'}`}
                aria-label={`Go to page ${i + 1}`}
                aria-current={i === current ? 'page' : undefined}
              >
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a thumbnail of the drawn page
                  <img src={src} alt="" className={`block w-full h-auto bg-white ${locked[i] ? 'blur-[2px]' : ''}`} />
                ) : (
                  <span className="block w-full aspect-[1/1.414] bg-white" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
