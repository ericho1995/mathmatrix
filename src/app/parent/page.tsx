import { createClient } from '@/lib/supabase/server'
import { GRADES, TOPICS } from '@/lib/curriculum'
import InviteCodeCard from '@/components/parent/InviteCodeCard'

interface StudentSummary {
  id: string
  fullName: string
  yearLevel: string
  xpTotal: number
  streakDays: number
  sessionsCount: number
  weeklyXp: number
  topicAccuracy: { topic: string; label: string; pct: number }[]
}

export default async function ParentDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="max-w-md mx-auto px-4 py-10 text-center flex-1">
        <h1 className="text-2xl font-medium tracking-tight mb-2">Parent dashboard</h1>
        <p className="text-gray-500">Sign in with a parent account to view this page.</p>
      </main>
    )
  }

  const { data: linkedStudents } = await supabase
    .from('student_profiles')
    .select('id, year_level, xp_total, streak_days')
    .eq('parent_id', user.id)

  if (!linkedStudents || linkedStudents.length === 0) {
    return (
      <main className="max-w-md mx-auto px-4 py-10 flex-1 w-full">
        <h1 className="text-2xl font-medium tracking-tight mb-1">Parent dashboard</h1>
        <p className="text-gray-500 mb-8">Link your account to see your child&apos;s progress.</p>
        <InviteCodeCard parentId={user.id} />
      </main>
    )
  }

  const studentIds = linkedStudents.map(s => s.id)

  const [{ data: profiles }, { data: sessions }] = await Promise.all([
    supabase.from('profiles').select('id, full_name').in('id', studentIds),
    supabase
      .from('practice_sessions')
      .select('student_id, topic, started_at, total_questions, correct_count, xp_earned')
      .in('student_id', studentIds),
  ])

  const weekAgo = Date.now() - 7 * 86400000

  const students: StudentSummary[] = linkedStudents.map(sp => {
    const name = profiles?.find(p => p.id === sp.id)?.full_name ?? 'Student'
    const studentSessions = sessions?.filter(s => s.student_id === sp.id) ?? []
    const weeklyXp = studentSessions
      .filter(s => new Date(s.started_at).getTime() > weekAgo)
      .reduce((sum, s) => sum + s.xp_earned, 0)

    const byTopic = new Map<string, { correct: number; total: number }>()
    for (const s of studentSessions) {
      const cur = byTopic.get(s.topic) ?? { correct: 0, total: 0 }
      cur.correct += s.correct_count
      cur.total += s.total_questions
      byTopic.set(s.topic, cur)
    }
    const topicAccuracy = Array.from(byTopic.entries())
      .map(([topic, { correct, total }]) => ({
        topic,
        label: TOPICS.find(t => t.slug === topic)?.label ?? topic,
        pct: total > 0 ? Math.round((correct / total) * 100) : 0,
      }))
      .sort((a, b) => a.pct - b.pct)

    return {
      id: sp.id,
      fullName: name,
      yearLevel: GRADES.find(g => g.value === sp.year_level)?.label ?? sp.year_level,
      xpTotal: sp.xp_total,
      streakDays: sp.streak_days,
      sessionsCount: studentSessions.length,
      weeklyXp,
      topicAccuracy,
    }
  })

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 flex-1 w-full">
      <h1 className="text-2xl font-medium tracking-tight mb-8">Parent dashboard</h1>

      {students.map(student => (
        <div key={student.id} className="mb-10 last:mb-0">
          <p className="text-gray-500 mb-4">
            Viewing: <strong className="text-gray-900">{student.fullName}</strong> · {student.yearLevel}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { val: student.xpTotal, lbl: 'Total XP' },
              { val: student.weeklyXp, lbl: 'XP this week' },
              { val: student.sessionsCount, lbl: 'Sessions completed' },
              { val: student.streakDays, lbl: 'Day streak' },
            ].map(s => (
              <div key={s.lbl} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xl font-medium">{s.val}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.lbl}</p>
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
                  <span className="text-sm min-w-[200px]">{t.label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${t.pct}%`, background: t.pct < 60 ? '#BA7517' : '#1D9E75' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-500 min-w-[36px] text-right">{t.pct}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </main>
  )
}
