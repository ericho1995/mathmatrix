'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'Is PrepNest actually aligned to the Australian Curriculum?',
    a: 'Yes — every question is tagged with its Australian Curriculum v9.0 code, and content is organised by year level and topic so it matches what students are covering in class.',
  },
  {
    q: 'Do I need a credit card to start?',
    a: 'No. You can create a free account and start practising straight away — no credit card required.',
  },
  {
    q: 'What year levels and subjects are covered?',
    a: 'Maths, English and Science from Grade 3 to Year 10, plus VCE-style selective subjects (Chemistry, Physics, Maths Methods, Further Maths, Specialist Maths) for Year 11-12.',
  },
  {
    q: 'How do XP and streaks work?',
    a: 'Every correct answer earns XP, and practising on consecutive days builds a streak. Both are shown on your dashboard and on the weekly leaderboard.',
  },
  {
    q: 'How does the parent dashboard work?',
    a: 'A parent creates their own account and links to their child with a one-time invite code the student generates, then gets a live view of accuracy by topic and recent session history.',
  },
]

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="max-w-2xl mx-auto">
      {FAQS.map((item, i) => {
        const open = openIndex === i
        return (
          <div key={item.q} className="border-b border-gray-100 last:border-b-0">
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-4 text-left"
              aria-expanded={open}
            >
              <span className="font-medium text-sm">{item.q}</span>
              <span className={`text-gray-400 transition-transform shrink-0 ${open ? 'rotate-45' : ''}`}>+</span>
            </button>
            {open && <p className="text-sm text-gray-500 leading-relaxed pb-4 pr-8">{item.a}</p>}
          </div>
        )
      })}
    </div>
  )
}
