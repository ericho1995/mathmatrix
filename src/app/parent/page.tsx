// TODO Phase 5 — replace mock data with real Supabase queries
// requires: auth middleware, parent_id check, student session aggregation

const MOCK_STUDENT = {
  name: 'Alex',
  year: 'Grade 6',
  avgScore: 84,
  sessions: 12,
  weakTopics: 3,
}

const MOCK_TOPICS = [
  { label: 'Number & Operations',      pct: 88, color: '#1D9E75' },
  { label: 'Algebra & Functions',      pct: 72, color: '#378ADD' },
  { label: 'Geometry & Measurement',   pct: 55, color: '#BA7517' },
  { label: 'Statistics & Probability', pct: 61, color: '#BA7517' },
]

const MOCK_RECS = [
  { label: 'Perimeter and area of composite shapes', urgency: 'high' },
  { label: 'Reading and interpreting data displays',  urgency: 'medium' },
  { label: 'Introduction to simple equations',        urgency: 'medium' },
]

export default function ParentDashboardPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-medium tracking-tight mb-1">Parent dashboard</h1>
      <p className="text-gray-500 mb-8">Viewing: <strong>{MOCK_STUDENT.name}</strong></p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { val: MOCK_STUDENT.year,       lbl: 'Current level'         },
          { val: `${MOCK_STUDENT.avgScore}%`, lbl: 'Avg score this week' },
          { val: MOCK_STUDENT.sessions,   lbl: 'Sessions completed'    },
          { val: MOCK_STUDENT.weakTopics, lbl: 'Topics need work'      },
        ].map(s => (
          <div key={s.lbl} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xl font-medium">{s.val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.lbl}</p>
          </div>
        ))}
      </div>

      {/* Topic performance */}
      <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Topic performance</h2>
      <div className="card mb-8">
        {MOCK_TOPICS.map(t => (
          <div key={t.label} className="flex items-center gap-3 mb-3 last:mb-0">
            <span className="text-sm min-w-[200px]">{t.label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${t.pct}%`, background: t.color }} />
            </div>
            <span className="text-sm font-medium text-gray-500 min-w-[36px] text-right">{t.pct}%</span>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Recommended focus areas</h2>
      <div className="card">
        {MOCK_RECS.map(r => (
          <div key={r.label} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.urgency === 'high' ? 'bg-red-400' : 'bg-amber-400'}`} />
            <span className="text-sm">{r.label}</span>
          </div>
        ))}
      </div>
    </main>
  )
}
