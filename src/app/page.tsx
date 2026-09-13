import Link from 'next/link'
import Image from 'next/image'
import { SUBJECTS, SELECTIVE_SUBJECTS, GRADES } from '@/lib/curriculum'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { createClient } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/logError'
import StudentDashboardTabs, { type SessionSummary } from '@/components/home/StudentDashboardTabs'
import FAQAccordion from '@/components/home/FAQAccordion'

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

  const totalSubjects = SUBJECTS.length + SELECTIVE_SUBJECTS.length

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
              : 'Manage the question bank from the admin panel.'}
          </p>
          <Link href={role === 'parent' ? '/parent' : '/admin'} className="btn-primary w-full text-center block">
            {role === 'parent' ? 'Go to parent dashboard' : 'Go to admin panel'}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-4 leading-tight">
              Exam-ready, <span className="text-brand-400">one question at a time.</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              Curriculum-aligned practice exams in Maths, English &amp; Science for
              every Australian student, Grade&nbsp;5 to Year&nbsp;12, with instant
              feedback, XP and streaks to keep them coming back, and a dashboard
              that shows parents exactly where to help.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
              <Link href="/auth/register" className="btn-primary text-center">
                Get started free
              </Link>
              <Link href="/practice" className="btn-secondary text-center">
                Try a practice question
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-gray-400">
              <span>✓ Free to start</span>
              <span>✓ Australian Curriculum v9.0 aligned</span>
              <span>✓ No credit card required</span>
            </div>
          </div>

          <div className="w-full max-w-sm mx-auto lg:max-w-none relative aspect-[4/3] rounded-3xl overflow-hidden">
            <Image
              src="/images/hero-student.jpg"
              alt="A student focused on practice questions at a desk"
              fill
              priority
              sizes="(min-width: 1024px) 480px, 384px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stat banner */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-center">
          {[
            { value: QUESTION_BANK.length, label: 'practice questions' },
            { value: totalSubjects, label: 'subjects' },
            { value: 'Gr 3–Yr 12', label: 'year levels covered' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xl font-medium text-brand-600">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SUBJECTS.map(s => (
            <Link
              key={s.slug}
              href={`/practice?subject=${s.slug}`}
              className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all text-center"
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-medium mb-1">{s.label}</div>
              <div className="text-xs text-gray-500">{s.tagline}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-8 text-center">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Pick a topic', body: 'Choose subject, year level and topic, matched to the Australian Curriculum.' },
              { step: '2', title: 'Practise with feedback', body: 'Answer questions and get an instant explanation, right or wrong.' },
              { step: '3', title: 'Track progress', body: 'Earn XP, build a streak, and climb the weekly leaderboard.' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-medium mx-auto mb-3">
                  {s.step}
                </div>
                <p className="font-medium mb-1">{s.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parent value prop */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">For parents</h2>
            <h3 className="text-2xl font-medium tracking-tight mb-3">
              See exactly where they need help.
            </h3>
            <p className="text-gray-500 leading-relaxed mb-5">
              Link your account to your child&apos;s with a one-time invite
              code and get a live view of their accuracy by topic, session
              history, and the areas most worth focusing on next.
            </p>
            <Link href="/auth/register" className="btn-secondary">
              Create a parent account
            </Link>
          </div>
          <div className="w-full relative pb-10 pr-6">
            <div className="w-full relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/parent-desk.jpg"
                alt="A quiet study desk with a laptop and notebook"
                fill
                sizes="(min-width: 640px) 340px, 90vw"
                className="object-cover"
              />
            </div>
            <div className="card absolute -bottom-0 -right-0 w-56 shadow-lg">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Topic performance</p>
              {[
                { label: 'Number & Operations', pct: 88 },
                { label: 'Geometry & Measurement', pct: 55 },
                { label: 'Reading Comprehension', pct: 72 },
              ].map(t => (
                <div key={t.label} className="flex items-center gap-2 mb-2.5 last:mb-0">
                  <span className="text-[11px] min-w-[90px] text-gray-600 truncate">{t.label}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-brand-400" style={{ width: `${t.pct}%` }} />
                  </div>
                  <span className="text-[11px] font-medium text-gray-400 w-7 text-right">{t.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-8 text-center">
            Frequently asked questions
          </h2>
          <FAQAccordion />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-brand-600">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white mb-3">
            Ready to get ahead?
          </h2>
          <p className="text-brand-100 mb-7">Start practising for free. No credit card required.</p>
          <Link href="/auth/register" className="inline-block bg-white text-brand-600 font-medium px-6 py-3 rounded-xl hover:bg-brand-50 transition-all">
            Get started free
          </Link>
        </div>
      </section>
    </main>
  )
}
