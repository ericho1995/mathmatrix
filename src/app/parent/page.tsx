import { createClient } from '@/lib/supabase/server'
import { GRADES, TOPICS } from '@/lib/curriculum'
import { QUESTION_BANK } from '@/lib/questions/bank'
import InviteCodeCard from '@/components/parent/InviteCodeCard'
import DataLoadError from '@/components/DataLoadError'
import DiagnosticsList from '@/components/diagnostic/DiagnosticsList'
import Bird from '@/components/brand/Bird'
import Link from 'next/link'
import type { Route } from 'next'
import PracticeProgress from '@/components/parent/PracticeProgress'

/** The dashboard's greeting: the bird, and what this page is for. */
function Greeting({ sub }: { sub: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Bird pose="nest" className="w-20 h-20 shrink-0" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Parent dashboard</h1>
        <p className="text-gray-600">{sub}</p>
        <Link href={'/for-parents' as Route} className="text-sm font-bold text-brand-600 hover:underline">
          What everything here means, and more ways to help
        </Link>
      </div>
    </div>
  )
}
import { queryFailed } from '@/lib/supabase/logError'

const TOPIC_BY_QUESTION_ID = new Map(QUESTION_BANK.map(q => [q.id, q.topic]))

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

  const { data: linkedStudents, error: studentsError } = await supabase
    .from('student_profiles')
    .select('id, year_level, xp_total, streak_days')
    .eq('parent_id', user.id)

  // Distinguished from "no children linked" on purpose. Rendering the invite
  // card after a failed read tells a parent who has already linked their child
  // that nothing is linked, and invites them to fix a problem that is ours.
  if (queryFailed('parent.linkedStudents', studentsError, { userId: user.id })) {
    return <DataLoadError title="Parent dashboard" what="your children's progress" />
  }

  if (!linkedStudents || linkedStudents.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10 flex-1 w-full">
        <Greeting sub="Every test your child sits, what it found, and where to go next." />
        {/* A parent's own diagnostics need no linked child: the test is sat on the parent's account. */}
        <DiagnosticsList />
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Practice progress</h2>
        <p className="text-gray-500 mb-4">Link your child&apos;s student account to see their practice by topic.</p>
        <div className="max-w-md">
          <InviteCodeCard parentId={user.id} />
        </div>
      </main>
    )
  }

  const studentIds = linkedStudents.map(s => s.id)

  const [{ data: profiles, error: profilesError }, { data: sessions, error: sessionsError }] = await Promise.all([
    supabase.from('profiles').select('id, full_name').in('id', studentIds),
    supabase
      .from('practice_sessions')
      .select('id, student_id, started_at, xp_earned')
      .in('student_id', studentIds),
  ])

  // A failed sessions read would show every child at zero XP and 0% accuracy,
  // which reads as "my child has done nothing" rather than as an outage.
  if (
    queryFailed('parent.profiles', profilesError, { studentIds }) ||
    queryFailed('parent.sessions', sessionsError, { studentIds })
  ) {
    return <DataLoadError title="Parent dashboard" what="your children's progress" />
  }

  const sessionIds = sessions?.map(s => s.id) ?? []
  const { data: attempts, error: attemptsError } = sessionIds.length
    ? await supabase.from('question_attempts').select('session_id, question_id, is_correct').in('session_id', sessionIds)
    : { data: [] as { session_id: string; question_id: string; is_correct: boolean }[], error: null }

  if (queryFailed('parent.attempts', attemptsError, { sessionCount: sessionIds.length })) {
    return <DataLoadError title="Parent dashboard" what="your children's progress" />
  }

  const sessionToStudent = new Map(sessions?.map(s => [s.id, s.student_id]) ?? [])
  const weekAgo = Date.now() - 7 * 86400000

  const students: StudentSummary[] = linkedStudents.map(sp => {
    const name = profiles?.find(p => p.id === sp.id)?.full_name ?? 'Student'
    const studentSessions = sessions?.filter(s => s.student_id === sp.id) ?? []
    const weeklyXp = studentSessions
      .filter(s => new Date(s.started_at).getTime() > weekAgo)
      .reduce((sum, s) => sum + s.xp_earned, 0)

    // Per-topic accuracy from individual question attempts, not the
    // session's single topic tag, so multi-topic custom exams are
    // attributed correctly across every topic they actually covered.
    const byTopic = new Map<string, { correct: number; total: number }>()
    for (const a of attempts ?? []) {
      if (sessionToStudent.get(a.session_id) !== sp.id) continue
      const topic = TOPIC_BY_QUESTION_ID.get(a.question_id)
      if (!topic) continue
      const cur = byTopic.get(topic) ?? { correct: 0, total: 0 }
      cur.total += 1
      if (a.is_correct) cur.correct += 1
      byTopic.set(topic, cur)
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
      <Greeting sub="Every test, every practice session, and how each area is moving." />

      <DiagnosticsList />

      {students.map(student => (
        <div key={student.id} className="mb-10 last:mb-0">
          <p className="text-gray-500 mb-4">
            Viewing: <strong className="text-gray-900">{student.fullName}</strong> · {student.yearLevel}
          </p>

          <PracticeProgress student={student} />
        </div>
      ))}
    </main>
  )
}
