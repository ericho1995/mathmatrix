import type { Metadata } from 'next'
import ScienceLab from '@/components/lab/ScienceLab'

// Not linked from the site yet, and kept out of search results, while the
// owner decides which tab it belongs under.
export const metadata: Metadata = {
  title: 'Science lab — PrepNest',
  description: 'Build atoms, wire circuits and make motion graphs, with challenges that explain the science as you go.',
  robots: { index: false, follow: false },
}

export default function LabPage() {
  return (
    <main className="flex-1 w-full bg-gradient-to-b from-sky to-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-600">Science lab · Years 7 to 10 and VCE Unit 1</p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">Play with the science, then prove you get it</h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Change something and watch what happens. Each lab has challenges that tick themselves off as you solve them, with the science
          explained the moment you do.
        </p>
        <div className="mt-6">
          <ScienceLab />
        </div>
      </div>
    </main>
  )
}
