// TODO Phase 4 — wire up real Supabase query
// select profiles.full_name, student_profiles.year_level, sum(practice_sessions.xp_earned)
// from practice_sessions join profiles ... where started_at > now() - interval '7 days'
// group by student_id order by xp desc limit 20

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Jordan T.', year: 'Yr 9',  xp: 940 },
  { rank: 2, name: 'Priya M.',  year: 'Yr 8',  xp: 910 },
  { rank: 3, name: 'Liam C.',   year: 'Yr 10', xp: 875 },
  { rank: 4, name: 'Aisha R.',  year: 'Gr 6',  xp: 840 },
  { rank: 5, name: 'Sam K.',    year: 'Yr 7',  xp: 815 },
]

export default function LeaderboardPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-medium tracking-tight mb-1">Leaderboard</h1>
      <p className="text-gray-500 mb-8">Top students this week</p>

      <div className="flex flex-col gap-2">
        {MOCK_LEADERBOARD.map((entry) => (
          <div key={entry.rank}
            className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white">
            <span className={`w-7 text-sm font-medium ${entry.rank <= 3 ? 'text-amber-500' : 'text-gray-400'}`}>
              {entry.rank}
            </span>
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 text-sm font-medium flex-shrink-0">
              {entry.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{entry.name}</p>
              <p className="text-xs text-gray-400">{entry.year}</p>
            </div>
            <span className="text-sm font-medium text-brand-600">{entry.xp} XP</span>
          </div>
        ))}
      </div>
    </main>
  )
}
