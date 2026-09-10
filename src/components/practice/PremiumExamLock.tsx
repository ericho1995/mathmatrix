import { PREMIUM_PRICE } from '@/lib/pricing'

export default function PremiumExamLock({ title, subjectLabel }: { title: string; subjectLabel: string }) {
  return (
    <main className="max-w-md mx-auto px-4 py-10 text-center flex-1 w-full">
      <div className="text-3xl mb-3">🔒</div>
      <h1 className="text-2xl font-medium tracking-tight mb-2">{title}</h1>
      <p className="text-gray-500 mb-1">
        This is a downloadable {subjectLabel} exam paper (plus a separate answer key) — {PREMIUM_PRICE}.
      </p>
      <p className="text-sm text-gray-400 mb-8">
        Payments aren&apos;t live yet, so exam PDFs can&apos;t be purchased right now.
      </p>
      <button disabled className="btn-primary w-full mb-3 opacity-50 cursor-not-allowed">
        Unlock for {PREMIUM_PRICE} — coming soon
      </button>
    </main>
  )
}
