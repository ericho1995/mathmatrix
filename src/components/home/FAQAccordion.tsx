'use client'

import { useState } from 'react'

/**
 * Presentation only — the questions and answers live in lib/faqs.ts so every
 * page that shows an FAQ shows the same, current answer.
 */
export default function FAQAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="max-w-2xl mx-auto">
      {items.map((item, i) => {
        const open = openIndex === i
        return (
          <div key={item.q} className="border-b border-gray-100 last:border-b-0">
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-4 text-left"
              aria-expanded={open}
            >
              <span className="font-medium text-sm">{item.q}</span>
              <span className={`text-gray-400 transition-transform shrink-0 ${open ? 'rotate-45' : ''}`} aria-hidden>
                +
              </span>
            </button>
            {open && <p className="text-sm text-gray-500 leading-relaxed pb-4 pr-8">{item.a}</p>}
          </div>
        )
      })}
    </div>
  )
}
