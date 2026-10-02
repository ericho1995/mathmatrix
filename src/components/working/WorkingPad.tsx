'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Eraser, Grid3x3, NotebookPen, PenLine, Trash2, Undo2, X } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// A page of working out beside a question, for the sums, sketches and
// crossings-out a child would otherwise do on scrap paper — drawn (Draw) or
// typed (Notes).
//
// One page of each per question, kept while the test or paper is open. Strokes are
// stored as points scaled to the page width, so a page drawn on a wide screen
// redraws in proportion on a narrow one. Drawing works with a mouse, a finger
// or a stylus; once a stylus has touched the page, finger touches are ignored
// so a resting palm does not draw. Nothing on the pad is marked or saved.
//
// On a wide screen it docks on the right; on a phone it is a sheet over the
// lower half, so the question stays readable above it. Runners leave room for
// it with PAD_ROOM.
// ─────────────────────────────────────────────────────────────────────────────

type Tool = 'pen' | 'blue' | 'eraser'

export interface Stroke {
  tool: Tool
  /** [x, y] as fractions of the page width. */
  points: [number, number][]
}

/** Classes a runner's page adds while the pad is open, so nothing sits under it. */
export const PAD_ROOM = 'pb-[55vh] lg:pb-0 lg:pr-[460px]'
/** For a runner's sticky bottom bar: rides above the sheet on a phone. */
export const PAD_BAR = 'max-lg:bottom-[55vh]'

/** The pages of one sitting, by question id: drawings and typed notes. Hold it in a ref so it outlives the pad closing. */
export interface WorkingPages {
  strokes: Map<string, Stroke[]>
  notes: Map<string, string>
}

export const newWorkingPages = (): WorkingPages => ({ strokes: new Map(), notes: new Map() })

const INK: Record<Exclude<Tool, 'eraser'>, string> = { pen: '#1a1a1a', blue: '#1d4ed8' }

export default function WorkingPad({
  open,
  onClose,
  pageKey,
  pages,
  label,
}: {
  open: boolean
  onClose: () => void
  pageKey: string
  pages: WorkingPages
  /** "Question 4", shown above the page. */
  label: string
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<'draw' | 'notes'>('draw')
  const [note, setNote] = useState('')
  const [tool, setTool] = useState<Tool>('pen')
  const [grid, setGrid] = useState(true)
  const [version, setVersion] = useState(0)
  const drawing = useRef<{ id: number; stroke: Stroke } | null>(null)
  const sawPen = useRef(false)

  const strokes = useCallback(() => {
    let list = pages.strokes.get(pageKey)
    if (!list) {
      list = []
      pages.strokes.set(pageKey, list)
    }
    return list
  }, [pages, pageKey])

  const paint = useCallback((ctx: CanvasRenderingContext2D, s: Stroke, width: number) => {
    if (!s.points.length) return
    ctx.save()
    ctx.globalCompositeOperation = s.tool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.strokeStyle = s.tool === 'eraser' ? '#000' : INK[s.tool]
    ctx.lineWidth = s.tool === 'eraser' ? 22 : 2.4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    const [x0, y0] = s.points[0]
    ctx.moveTo(x0 * width, y0 * width)
    if (s.points.length === 1) ctx.lineTo(x0 * width + 0.1, y0 * width)
    for (const [x, y] of s.points.slice(1)) ctx.lineTo(x * width, y * width)
    ctx.stroke()
    ctx.restore()
  }, [])

  /** Sizes the canvas to its box at the screen's pixel density and redraws the page. */
  const redraw = useCallback(() => {
    const c = canvas.current
    if (!c) return
    const { width, height } = c.getBoundingClientRect()
    if (!width || !height) return
    const dpr = window.devicePixelRatio || 1
    if (c.width !== Math.round(width * dpr) || c.height !== Math.round(height * dpr)) {
      c.width = Math.round(width * dpr)
      c.height = Math.round(height * dpr)
    }
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    for (const s of strokes()) paint(ctx, s, width)
  }, [paint, strokes])

  // Each question's notes come back when it does.
  useEffect(() => setNote(pages.notes.get(pageKey) ?? ''), [pages, pageKey])

  useEffect(() => {
    if (!open || mode !== 'draw') return
    redraw()
    const c = canvas.current
    if (!c) return
    const ro = new ResizeObserver(() => redraw())
    ro.observe(c)
    return () => ro.disconnect()
  }, [open, mode, redraw, version])

  // Escape closes the pad.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function point(e: React.PointerEvent<HTMLCanvasElement>): [number, number] {
    const r = e.currentTarget.getBoundingClientRect()
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.width]
  }

  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    if (e.pointerType === 'pen') sawPen.current = true
    else if (e.pointerType === 'touch' && sawPen.current) return
    if (e.button > 0 || drawing.current) return
    // Capture keeps a stroke going when it leaves the page; drawing works without it.
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* the pointer is already gone */
    }
    const stroke: Stroke = { tool, points: [point(e)] }
    strokes().push(stroke)
    drawing.current = { id: e.pointerId, stroke }
    redraw()
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    const d = drawing.current
    if (!d || d.id !== e.pointerId) return
    const events = typeof e.nativeEvent.getCoalescedEvents === 'function' ? e.nativeEvent.getCoalescedEvents() : [e.nativeEvent]
    const r = e.currentTarget.getBoundingClientRect()
    for (const ev of events.length ? events : [e.nativeEvent]) d.stroke.points.push([(ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.width])
    const ctx = e.currentTarget.getContext('2d')
    // Draw the newest segment only; a full redraw per move is too slow on a long page.
    if (ctx) {
      const tail: Stroke = { tool: d.stroke.tool, points: d.stroke.points.slice(-events.length - 1) }
      paint(ctx, tail, r.width)
    }
  }

  function up(e: React.PointerEvent<HTMLCanvasElement>) {
    if (drawing.current?.id === e.pointerId) drawing.current = null
  }

  function undo() {
    strokes().pop()
    setVersion(v => v + 1)
  }

  function clear() {
    pages.strokes.set(pageKey, [])
    setVersion(v => v + 1)
  }

  if (!open) return null

  const toolButton = (t: Tool, title: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setTool(t)}
      aria-pressed={tool === t}
      title={title}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border-2 ${tool === t ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line bg-white text-gray-600 hover:bg-gray-50'}`}
    >
      {icon}
      <span className="sr-only">{title}</span>
    </button>
  )

  return (
    <aside
      className="fixed z-40 inset-x-0 bottom-0 h-[55vh] rounded-t-3xl border-t-2 lg:rounded-none lg:border-t-0 lg:inset-auto lg:right-0 lg:top-0 lg:bottom-0 lg:h-auto lg:w-[460px] bg-white lg:border-l-2 border-line flex flex-col shadow-[0_-8px_24px_rgba(0,0,0,0.08)] lg:shadow-xl"
      aria-label="Working out"
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-line">
        <p className="text-sm font-bold text-gray-700 mr-auto">
          Working out <span className="font-normal text-gray-400">· {label}</span>
        </p>
        <button type="button" onClick={onClose} className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-brand-600 px-2 py-1">
          <X className="w-4 h-4" aria-hidden />
          Close
        </button>
      </div>
      <div className="flex items-center gap-2 px-3 pt-2" role="tablist" aria-label="Draw or type">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'draw'}
          onClick={() => setMode('draw')}
          className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-sm font-bold ${mode === 'draw' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line bg-white text-gray-500 hover:bg-gray-50'}`}
        >
          <PenLine className="w-4 h-4" aria-hidden />
          Draw
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'notes'}
          onClick={() => setMode('notes')}
          className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-sm font-bold ${mode === 'notes' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line bg-white text-gray-500 hover:bg-gray-50'}`}
        >
          <NotebookPen className="w-4 h-4" aria-hidden />
          Notes
        </button>
      </div>
      {mode === 'notes' ? (
        <div className="flex-1 min-h-0 p-3 flex flex-col">
          <textarea
            className="input flex-1 w-full resize-none text-base leading-relaxed"
            value={note}
            onChange={e => {
              setNote(e.target.value)
              pages.notes.set(pageKey, e.target.value)
            }}
            maxLength={5000}
            placeholder="Type notes or working for this question…"
            aria-label={`Notes for ${label}`}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 px-3 py-2 border-b border-line" role="toolbar" aria-label="Pad tools">
            {toolButton('pen', 'Pencil', <PenLine className="w-5 h-5" aria-hidden />)}
            {toolButton('blue', 'Blue pen', <PenLine className="w-5 h-5 text-blue-700" aria-hidden />)}
            {toolButton('eraser', 'Eraser', <Eraser className="w-5 h-5" aria-hidden />)}
            <span className="w-px h-6 bg-line mx-1" aria-hidden />
            <button
              type="button"
              onClick={undo}
              title="Undo"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl border-2 border-line bg-white text-gray-600 hover:bg-gray-50"
            >
              <Undo2 className="w-5 h-5" aria-hidden />
              <span className="sr-only">Undo</span>
            </button>
            <button
              type="button"
              onClick={() => setGrid(g => !g)}
              aria-pressed={grid}
              title="Squared paper"
              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border-2 ${grid ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid3x3 className="w-5 h-5" aria-hidden />
              <span className="sr-only">Squared paper</span>
            </button>
            <button
              type="button"
              onClick={clear}
              className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-red-600 px-2 py-1"
            >
              <Trash2 className="w-4 h-4" aria-hidden />
              <span className="hidden sm:inline">Clear page</span>
              <span className="sm:hidden">Clear</span>
            </button>
          </div>
          <div className="relative flex-1 min-h-0 bg-white">
            <canvas
              ref={canvas}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              style={{
                touchAction: 'none',
                backgroundImage: grid
                  ? 'linear-gradient(to right, rgba(29,78,216,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(29,78,216,0.10) 1px, transparent 1px)'
                  : undefined,
                backgroundSize: grid ? '24px 24px' : undefined,
              }}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              aria-label={`Drawing area for ${label}`}
              role="img"
            />
          </div>
        </>
      )}
      <p className="hidden lg:block text-xs text-gray-400 px-3 py-2 border-t border-line">
        Each question has its own page to draw and type on. It is for working only — not marked, and cleared when you leave.
      </p>
    </aside>
  )
}

/** The button that opens the pad, for a runner's header. */
export function WorkingPadButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={open}
      className={`text-sm font-bold inline-flex items-center gap-1 rounded-lg px-2 py-1 ${open ? 'text-brand-700 bg-brand-50' : 'text-gray-500 hover:text-brand-600'}`}
    >
      <PenLine className="w-4 h-4" aria-hidden />
      <span className="hidden sm:inline">Working out</span>
    </button>
  )
}
