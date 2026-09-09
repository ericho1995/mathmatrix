'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function PracticeModeTabs() {
  const pathname = usePathname()
  const isExams = pathname?.startsWith('/practice/exams')

  return (
    <div className="inline-flex rounded-xl border border-gray-100 p-1 mb-6">
      <Link
        href="/practice"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isExams ? 'bg-brand-600 text-white' : 'text-gray-500'}`}
      >
        Build your own
      </Link>
      <Link
        href="/practice/exams"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isExams ? 'bg-brand-600 text-white' : 'text-gray-500'}`}
      >
        Ready-made exam
      </Link>
    </div>
  )
}
