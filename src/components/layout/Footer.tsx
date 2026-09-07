import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-20">
      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium tracking-tight">
            Prep<span className="text-brand-400">Nest</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Australian Curriculum v9.0 aligned practice — Grade 3 to Year 12.
          </p>
        </div>

        <nav className="flex items-center gap-5 text-xs text-gray-400">
          <Link href="/practice" className="hover:text-gray-600">Practice</Link>
          <Link href="/leaderboard" className="hover:text-gray-600">Leaderboard</Link>
          <Link href="/auth/register" className="hover:text-gray-600">Get started</Link>
        </nav>

        <p className="text-xs text-gray-400">© {new Date().getFullYear()} PrepNest</p>
      </div>
    </footer>
  )
}
