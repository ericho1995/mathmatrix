export interface PracticeSummary {
  xpTotal: number
  weeklyXp: number
  sessionsCount: number
  streakDays: number
  /** Weakest first. */
  topicAccuracy: { topic: string; label: string; pct: number }[]
}

/**
 * A linked child's on-screen practice: the four numbers, then accuracy by
 * topic, weakest first. Used on the parent dashboard and, with sample data,
 * on the parents' guide.
 */
export default function PracticeProgress({ student }: { student: PracticeSummary }) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { val: student.xpTotal, lbl: 'Total XP', cls: 'text-sun-600' },
          { val: student.weeklyXp, lbl: 'XP this week', cls: 'text-brand-600' },
          { val: student.sessionsCount, lbl: 'Sessions completed', cls: 'text-grape-600' },
          { val: student.streakDays, lbl: 'Day streak', cls: 'text-amber-600' },
        ].map(s => (
          <div key={s.lbl} className="card p-4">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.val}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.lbl}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Topic performance</h2>
      <div className="card">
        {student.topicAccuracy.length === 0 ? (
          <p className="text-sm text-gray-400">No practice sessions yet.</p>
        ) : (
          student.topicAccuracy.map(t => (
            <div key={t.topic} className="flex items-center gap-3 mb-3 last:mb-0">
              <span className="text-sm min-w-[140px] sm:min-w-[200px]">{t.label}</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${t.pct}%`, background: t.pct < 50 ? '#FF9600' : t.pct < 75 ? '#2F8FEA' : '#58CC02' }}
                />
              </div>
              <span className="text-sm font-medium text-gray-500 min-w-[36px] text-right">{t.pct}%</span>
            </div>
          ))
        )}
      </div>
    </>
  )
}
