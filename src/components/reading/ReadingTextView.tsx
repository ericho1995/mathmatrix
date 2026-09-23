import type { ReadingBlock, ReadingText, FlowFigure } from '@/types/reading'
import type { BarChartDiagram, DataTableDiagram, PieChartDiagram } from '@/types'
import { TEXT_ACCENT, tint } from '@/lib/reading/style'

/**
 * A magazine text on screen — the web counterpart of the printed page in
 * ReadingMagazineDocument, from the same typed blocks. No hooks, so it renders
 * inside the client-side reader or on the server alike.
 */
export default function ReadingTextView({ text }: { text: ReadingText }) {
  const accent = TEXT_ACCENT[text.type]
  return (
    <article className="text-[15px] leading-relaxed text-gray-800">
      <h2 className="text-2xl font-semibold tracking-tight mb-2" style={{ color: accent }}>
        {text.title}
      </h2>
      <div className="h-1 w-14 rounded-full mb-5" style={{ backgroundColor: accent }} aria-hidden />
      <div className={text.columns === 2 ? 'sm:columns-2 sm:gap-8' : undefined}>
        {text.blocks.map((b, i) => (
          <Block key={i} block={b} accent={accent} />
        ))}
      </div>
      {text.figure ? (
        <figure className="mt-4 mb-2">
          <Figure figure={text.figure} accent={accent} />
          {text.figureCaption ? <figcaption className="text-xs italic text-gray-500 text-center mt-2">{text.figureCaption}</figcaption> : null}
        </figure>
      ) : null}
    </article>
  )
}

function Block({ block, accent }: { block: ReadingBlock; accent: string }) {
  switch (block.kind) {
    case 'para':
      return <p className="mb-3 break-inside-avoid-column">{block.text}</p>
    case 'heading':
      return <h3 className="font-semibold mt-4 mb-1.5 break-after-avoid" style={{ color: accent }}>{block.text}</h3>
    case 'note':
      return <p className="italic text-gray-600 mb-3">{block.text}</p>
    case 'caption':
      return <p className="text-xs italic text-gray-500 mb-3">{block.text}</p>
    case 'excerpt':
      return (
        <blockquote className="italic text-gray-700 border-l-2 pl-4 ml-2 mb-3" style={{ borderColor: tint(accent, 0.5) }}>
          {block.text}
        </blockquote>
      )
    case 'quote':
      return (
        <p className="text-lg font-semibold italic text-center py-3 my-3 border-y-2" style={{ color: accent, borderColor: accent }}>
          {block.text}
        </p>
      )
    case 'bullets':
      return (
        <ul className="mb-3 flex flex-col gap-1 break-inside-avoid-column">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-bold" style={{ color: accent }} aria-hidden>•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    case 'steps':
      return (
        <ol className="mb-3 flex flex-col gap-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center mt-0.5" style={{ backgroundColor: accent }}>
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      )
    case 'factbox':
      return (
        <aside className="rounded-lg border-l-4 p-4 mb-3 break-inside-avoid-column" style={{ borderColor: accent, backgroundColor: tint(accent, 0.92) }}>
          <p className="font-semibold mb-1.5" style={{ color: accent }}>{block.title}</p>
          <ul className="flex flex-col gap-1 text-sm">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span style={{ color: accent }} aria-hidden>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      )
    case 'verse': {
      const stanzas: string[][] = [[]]
      for (const line of block.lines) {
        if (line === '') stanzas.push([])
        else stanzas[stanzas.length - 1].push(line)
      }
      return (
        <div className="pl-6 mb-3">
          {stanzas.filter(s => s.length).map((stanza, i) => (
            <p key={i} className="mb-4 leading-loose">
              {stanza.map((line, j) => (
                <span key={j} className="block">{line}</span>
              ))}
            </p>
          ))}
        </div>
      )
    }
  }
}

function Figure({ figure, accent }: { figure: NonNullable<ReadingText['figure']>; accent: string }) {
  switch (figure.kind) {
    case 'data_table':
      return <Table table={figure} accent={accent} />
    case 'flow':
      return <Flow flow={figure} accent={accent} />
    case 'bar_chart':
      return <Bars chart={figure} accent={accent} />
    case 'pie_chart':
      return <Pie chart={figure} accent={accent} />
    default:
      return <p className="text-sm text-gray-500 italic text-center">This text has a diagram in the printed magazine.</p>
  }
}

function Table({ table, accent }: { table: DataTableDiagram; accent: string }) {
  return (
    <div className="overflow-x-auto">
      {table.title ? <p className="text-sm font-semibold text-center mb-2" style={{ color: accent }}>{table.title}</p> : null}
      <table className="mx-auto text-sm border-collapse">
        <thead>
          <tr style={{ backgroundColor: tint(accent, 0.85) }}>
            {table.columns.map((c, i) => (
              <th key={i} className="border px-3 py-1.5 text-left font-semibold" style={{ borderColor: accent }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) => (
                <td key={i} className="border px-3 py-1.5" style={{ borderColor: accent }}>{String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Flow({ flow, accent }: { flow: FlowFigure; accent: string }) {
  const back = flow.cycle ? flow.steps[flow.steps.length - 1].then : undefined
  return (
    <div>
      {flow.title ? <p className="text-sm font-semibold text-center mb-2" style={{ color: accent }}>{flow.title}</p> : null}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-1 sm:gap-2">
        {flow.steps.map((step, i) => (
          <div key={i} className="contents">
            <div className="rounded-lg border-2 px-3 py-2 text-sm font-semibold text-center sm:flex-1 sm:max-w-[10rem]" style={{ borderColor: accent, backgroundColor: tint(accent, 0.9) }}>
              {step.text}
            </div>
            {i < flow.steps.length - 1 ? (
              <div className="text-center text-xs" style={{ color: accent }}>
                {step.then ? <span className="block">{step.then}</span> : null}
                <span className="text-lg leading-none" aria-hidden>
                  <span className="sm:hidden">↓</span>
                  <span className="hidden sm:inline">→</span>
                </span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {flow.cycle ? (
        <p className="text-center text-xs mt-2" style={{ color: accent }}>
          ↺ back to the start{back ? ` — ${back}` : ''}
        </p>
      ) : null}
    </div>
  )
}

function Bars({ chart, accent }: { chart: BarChartDiagram; accent: string }) {
  const bars = chart.bars ?? []
  const max = chart.yMax ?? Math.max(...bars.map(b => b.value))
  const step = chart.yStep ?? max / 5
  const W = 520, H = 240, left = 44, bottom = 28, top = 10
  const plotW = W - left - 8, plotH = H - bottom - top
  const bw = plotW / bars.length
  const ticks: number[] = []
  for (let v = 0; v <= max + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100)
  return (
    <div>
      {chart.title ? <p className="text-sm font-semibold text-center mb-2" style={{ color: accent }}>{chart.title}</p> : null}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xl mx-auto" role="img" aria-label={chart.title ?? 'Bar chart'}>
        {ticks.map(t => {
          const y = top + plotH - (t / max) * plotH
          return (
            <g key={t}>
              <line x1={left} x2={W - 8} y1={y} y2={y} stroke="#e5e7eb" />
              <text x={left - 6} y={y + 4} fontSize="11" textAnchor="end" fill="#6b7280">{t}</text>
            </g>
          )
        })}
        {bars.map((b, i) => {
          const h = (b.value / max) * plotH
          const x = left + i * bw + bw * 0.18
          return (
            <g key={b.label}>
              <rect x={x} y={top + plotH - h} width={bw * 0.64} height={h} fill={tint(accent, 0.35)} stroke={accent} />
              <text x={x + bw * 0.32} y={H - 10} fontSize="11" textAnchor="middle" fill="#374151">{b.label}</text>
            </g>
          )
        })}
        {chart.yLabel ? (
          <text x={12} y={top + plotH / 2} fontSize="11" fill="#374151" transform={`rotate(-90 12 ${top + plotH / 2})`} textAnchor="middle">{chart.yLabel}</text>
        ) : null}
      </svg>
    </div>
  )
}

function Pie({ chart, accent }: { chart: PieChartDiagram; accent: string }) {
  const total = chart.sectors.reduce((n, s) => n + s.value, 0)
  const shades = [0.1, 0.35, 0.55, 0.72, 0.86, 0.94]
  let angle = -Math.PI / 2
  const R = 90, C = 100
  return (
    <div>
      {chart.title ? <p className="text-sm font-semibold text-center mb-2" style={{ color: accent }}>{chart.title}</p> : null}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <svg viewBox="0 0 200 200" className="w-44 h-44" role="img" aria-label={chart.title ?? 'Pie chart'}>
          {chart.sectors.map((s, i) => {
            const a0 = angle
            const a1 = angle + (s.value / total) * Math.PI * 2
            angle = a1
            const large = a1 - a0 > Math.PI ? 1 : 0
            const d = `M ${C} ${C} L ${C + R * Math.cos(a0)} ${C + R * Math.sin(a0)} A ${R} ${R} 0 ${large} 1 ${C + R * Math.cos(a1)} ${C + R * Math.sin(a1)} Z`
            return <path key={s.label} d={d} fill={tint(accent, shades[i % shades.length])} stroke="#fff" strokeWidth="1.5" />
          })}
        </svg>
        <ul className="text-sm flex flex-col gap-1">
          {chart.sectors.map((s, i) => (
            <li key={s.label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm border" style={{ backgroundColor: tint(accent, shades[i % shades.length]), borderColor: accent }} aria-hidden />
              <span>{s.label}{chart.showPercent ? ` — ${Math.round((s.value / total) * 100)}%` : ''}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
