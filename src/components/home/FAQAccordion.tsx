'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * Presentation only — the questions and answers live in lib/faqs.ts so every
 * page that shows an FAQ shows the same, current answer. Each question is a
 * chunky card that opens in place.
 */
export default function FAQAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {items.map((item, i) => {
        const open = openIndex === i
        return (
          <div
            key={item.q}
            className={`rounded-2xl border-2 border-b-4 transition-colors ${open ? 'border-brand-200 bg-brand-50' : 'border-line bg-white hover:bg-gray-50'}`}
          >
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={open}
            >
              <span className="font-bold text-ink">{item.q}</span>
              <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-180 text-brand-600' : 'text-gray-400'}`} aria-hidden />
            </button>
            {open && <p className="text-gray-600 leading-relaxed px-5 pb-5 -mt-1">{item.a}</p>}
          </div>
        )
      })}
    </div>
  )
}
