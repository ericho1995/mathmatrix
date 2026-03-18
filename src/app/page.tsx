import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-medium tracking-tight mb-3">
          Math<span className="text-brand-400">Matrix</span>
        </h1>
        <p className="text-gray-500 mb-8 text-lg leading-relaxed">
          Curriculum-aligned maths practice for every Australian student,
          Grade&nbsp;3 to Year&nbsp;12.
        </p>
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
