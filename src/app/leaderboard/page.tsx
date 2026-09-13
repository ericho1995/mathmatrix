import { createClient } from '@/lib/supabase/server'
import { GRADES } from '@/lib/curriculum'
import { queryFailed } from '@/lib/supabase/logError'

interface LeaderboardRow {
  student_id: string
  display_name: string
  year_level: string
  xp_this_week: number
}

export default async function LeaderboardPage() {
  let rows: LeaderboardRow[] = []

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_weekly_leaderboard', { limit_count: 20 })
    // A missing RPC renders identically to a quiet week, which is how this one
    // stayed broken before. The empty state below is still the right thing to
    // show a student, but the failure now reaches the logs.
    queryFailed('leaderboard.rpc', error)
    rows = data ?? []
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10 flex-1 w-full">
      <h1 className="text-2xl font-medium tracking-tight mb-1">Leaderboard</h1>
      <p className="text-gray-500 mb-8">Top students this week, by XP earned</p>

      {rows.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-gray-500 text-sm">
            No practice sessions yet this week. Be the first to earn XP and
            claim the top spot.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((entry, i) => (
            <div key={entry.student_id}
              className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white">
              <span className={`w-7 text-sm font-medium ${i < 3 ? 'text-amber-500' : 'text-gray-400'}`}>
                {i + 1}
              </span>
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 text-sm font-medium flex-shrink-0">
                {entry.display_name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{entry.display_name}</p>
                <p className="text-xs text-gray-400">
                  {GRADES.find(g => g.value === entry.year_level)?.label ?? entry.year_level}
                </p>
              </div>
              <span className="text-sm font-medium text-brand-600">{entry.xp_this_week} XP</span>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
