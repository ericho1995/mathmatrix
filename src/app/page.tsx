import Link from 'next/link'
import type { Route } from 'next'
import { GRADES } from '@/lib/curriculum'
import { createClient } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/logError'
import StudentDashboardTabs, { type SessionSummary } from '@/components/home/StudentDashboardTabs'
import MarketingHome from '@/components/home/MarketingHome'

export default async function HomePage() {
  let user: { id: string; email: string | null } | null = null
  let role: 'student' | 'parent' | 'admin' | null = null
  let fullName = ''
  let studentStats: { xp_total: number; streak_days: number; year_level: string; parent_id: string | null } | null = null
  let sessions: SessionSummary[] = []

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      user = { id: data.user.id, email: data.user.email ?? null }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', data.user.id)
        .single()

      // Defaulting to 'student' on a failed read is the safe direction — it
      // grants nothing — but it would silently demote a parent or admin to the
      // student dashboard, so the failure has to be logged.
      queryFailed('home.profile', profileError, { userId: data.user.id })
      role = (profile?.role as typeof role) ?? 'student'
      fullName = profile?.full_name ?? ''

      if (role === 'student') {
        const { data: sp, error: statsError } = await supabase
          .from('student_profiles')
          .select('xp_total, streak_days, year_level, parent_id')
          .eq('id', data.user.id)
          .single()
        // A failed read here shows a student 0 XP and a broken streak, which
        // looks like lost progress rather than an outage.
        queryFailed('home.studentProfile', statsError, { userId: data.user.id })
        studentStats = sp

        const { data: sessionRows, error: sessionsError } = await supabase
          .from('practice_sessions')
          .select('id, topic, completed_at, correct_count, total_questions')
          .eq('student_id', data.user.id)
          .order('completed_at', { ascending: false })
          .limit(30)
        queryFailed('home.sessions', sessionsError, { userId: data.user.id })
        sessions = sessionRows ?? []
      }
    }
  }

  if (user) {
    const firstName = fullName.split(' ')[0] || 'there'

    if (role === 'student') {
      const gradeLabel = GRADES.find(g => g.value === studentStats?.year_level)?.label
      return (
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <StudentDashboardTabs
            firstName={firstName}
            gradeLabel={gradeLabel}
            xpTotal={studentStats?.xp_total ?? 0}
            streakDays={studentStats?.streak_days ?? 0}
            hasParent={!!studentStats?.parent_id}
            sessions={sessions}
          />
        </main>
      )
    }

    return (
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-sm w-full text-center">
          <h1 className="text-2xl font-medium tracking-tight mb-2">Welcome back, {firstName}</h1>
          <p className="text-gray-500 mb-8">
            {role === 'parent'
              ? 'Check in on your child’s progress.'
              : 'Every exam paper in the catalogue, unlocked.'}
          </p>
          {/* Admins keep their paywall bypass (see getEntitlements), so the
              catalogue is the useful landing place now the admin panel is gone —
              the question bank is edited in the repo, not through a UI. */}
          <Link
            href={(role === 'parent' ? '/parent' : '/practice/exams') as Route}
            className="btn-primary w-full text-center block"
          >
            {role === 'parent' ? 'Go to parent dashboard' : 'Browse exam papers'}
          </Link>
        </div>
      </main>
    )
  }

  return <MarketingHome />
}
