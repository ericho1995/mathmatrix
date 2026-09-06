import Link from 'next/link'
import { SUBJECTS } from '@/lib/curriculum'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-medium tracking-tight mb-3">
          Math<span className="text-brand-400">Matrix</span>
        </h1>
        <p className="text-gray-500 mb-8 text-lg leading-relaxed">
          Curriculum-aligned practice exams and tutoring across Maths, English
          &amp; Science, for every Australian student, Grade&nbsp;3 to Year&nbsp;12.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {SUBJECTS.map(s => (
            <div key={s.slug} className="p-4 rounded-2xl border border-gray-100 bg-white">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-medium text-sm">{s.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.tagline}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/practice" className="btn-primary text-center block">
            Start practising
          </Link>
          <Link href="/auth/login" className="btn-secondary text-center block">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
