'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'
import { ArrowLeft, ArrowRight, Download, Maximize2, X } from 'lucide-react'
import { SAMPLES, type SampleKey } from '@/lib/samples'

/**
 * "Look inside": real pages from the free sample papers, each opening full size.
 *
 * Every page links to the free paper it came from, so the step after "that
 * looks good" is downloading the whole thing, not hunting for it in the
 * catalogue.
 */
export default function LookInside({ items }: { items: SampleKey[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open !== null && !d.open) d.showModal()
    if (open === null && d.open) d.close()
  }, [open])

  const step = useCallback(
    (by: number) => setOpen(i => (i === null ? i : (i + by + items.length) % items.length)),
    [items.length]
  )

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, step])

  const current = open === null ? null : SAMPLES[items[open]]
  const grid =
    items.length <= 2 ? 'grid-cols-2 max-w-xl mx-auto' : items.length === 3 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'

  return (
    <>
      <ul className={`grid ${grid} gap-x-4 gap-y-8 sm:gap-x-6`}>
        {items.map((key, i) => {
          const s = SAMPLES[key]
          return (
            <li key={key} className="flex flex-col">
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group relative block overflow-hidden rounded-lg bg-white ring-1 ring-gray-200 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                aria-label={`Open full size: ${s.title}`}
              >
                <Image
                  src={s.image}
                  alt={s.alt}
                  sizes="(min-width: 1024px) 230px, 45vw"
                  placeholder="blur"
                  className="w-full h-auto"
                />
                <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-gray-700 shadow ring-1 ring-black/5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Maximize2 className="w-3.5 h-3.5" />
                  View
                </span>
              </button>
              <p className="font-medium text-sm mt-3">{s.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed mt-1">{s.caption}</p>
            </li>
          )
        })}
      </ul>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        // A click on the backdrop lands on the dialog element itself.
        onClick={e => e.target === dialog.current && setOpen(null)}
        className="m-auto w-full max-w-3xl bg-transparent p-4 backdrop:bg-gray-950/75 backdrop:backdrop-blur-sm"
        aria-label={current?.title}
      >
        {current && (
          <div className="rounded-2xl bg-white p-3 sm:p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3 px-1 pb-3">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{current.title}</p>
                <p className="text-xs text-gray-500 truncate">From {current.paperTitle}, a free paper</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative overflow-auto rounded-lg ring-1 ring-gray-200 max-h-[70vh]">
              <Image
                src={current.image}
                alt={current.alt}
                sizes="(min-width: 800px) 760px, 100vw"
                placeholder="blur"
                className="w-full h-auto"
              />
            </div>
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                  aria-label="Previous page"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                  aria-label="Next page"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <Link
                href={`/practice/exams/${current.paperId}` as Route}
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Download this paper free
              </Link>
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}
