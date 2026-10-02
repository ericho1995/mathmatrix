import type { Confidence, Level } from '@/lib/diagnostic/types'

const LEVEL: Record<Level, { label: string; cls: string }> = {
  strength: { label: 'Strength', cls: 'bg-teal-50 text-teal-600 border-teal-400/40' },
  developing: { label: 'Developing', cls: 'bg-brand-50 text-brand-800 border-brand-200' },
  focus: { label: 'Focus area', cls: 'bg-amber-50 text-amber-600 border-amber-400/40' },
}

/** An early-sign weakness is never shown as a weakness: it reads "May need work". */
const EARLY_FOCUS = { label: 'May need work', cls: 'bg-amber-50/60 text-amber-600 border-dashed border-amber-400/40' }

const CONFIDENCE: Record<Confidence, string> = {
  clear: 'Clear result',
  likely: 'Likely',
  early: 'Early sign',
}

export default function LevelChip({ level, confidence }: { level: Level; confidence?: Confidence }) {
  const look = level === 'focus' && confidence === 'early' ? EARLY_FOCUS : LEVEL[level]
  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      <span className={`inline-block text-xs font-medium rounded-full border px-2.5 py-0.5 ${look.cls}`}>{look.label}</span>
      {confidence && <span className="text-xs text-gray-400">{CONFIDENCE[confidence]}</span>}
    </span>
  )
}

export const LEVEL_COLOUR: Record<Level, string> = { strength: '#1D9E75', developing: '#2875C1', focus: '#BA7517' }
