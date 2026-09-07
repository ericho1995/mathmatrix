import Link from 'next/link'
import { SUBJECTS, GRADES } from '@/lib/curriculum'
import { createClient } from '@/lib/supabase/server'
import RedeemParentCode from '@/components/home/RedeemParentCode'

export default async function HomePage() {
  let user: { id: string; email: string | null } | null = null
  let role: 'student' | 'parent' | 'admin' | null = null
  let fullName = ''
  let studentStats: { xp_total: number; streak_days: number; year_level: string; parent_id: string | null } | null = null

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      user = { id: data.user.id, email: data.user.email ?? null }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', data.user.id)
        .single()

      role = (profile?.role as typeof role) ?? 'student'
      fullName = profile?.full_name ?? ''

      if (role === 'student') {
        const { data: sp } = await supabase
          .from('student_profiles')
          .select('xp_total, streak_days, year_level, parent_id')
          .eq('id', data.user.id)
          .single()
        studentStats = sp
      }
    }
  }

  if (user) {
    const firstName = fullName.split(' ')[0] || 'there'

    if (role === 'student') {
      const gradeLabel = GRADES.find(g => g.value === studentStats?.year_level)?.label
      return (
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-sm w-full">
            <h1 className="text-2xl font-medium tracking-tight mb-1">Welcome back, {firstName}</h1>
            <p className="text-gray-500 mb-6">{gradeLabel ?? 'Ready to practise?'}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="card text-center py-4">
                <p className="text-2xl font-medium text-brand-600">{studentStats?.xp_total ?? 0}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total XP</p>
              </div>
              <div className="card text-center py-4">
                <p className="text-2xl font-medium text-amber-400">{studentStats?.streak_days ?? 0}</p>
                <p className="text-xs text-gray-400 mt-0.5">Day streak</p>
              </div>
            </div>

            <Link href="/practice" className="btn-primary w-full text-center block mb-6">
              Continue practising
            </Link>

            {!studentStats?.parent_id && (
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
                  Got a code from your parent?
                </p>
                <RedeemParentCode />
              </div>
            )}
          </div>
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
      <section className="max-w-3xl mx-auto px-4 pt-16 pb-14 text-center">
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-4 leading-tight">
          Exam-ready, <span className="text-brand-400">one question at a time.</span>
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
          Curriculum-aligned practice exams in Maths, English &amp; Science for
          every Australian student, Grade&nbsp;5 to Year&nbsp;12 — with instant
          feedback, XP and streaks to keep them coming back, and a dashboard
          that shows parents exactly where to help.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link href="/auth/register" className="btn-primary text-center">
            Get started free
          </Link>
          <Link href="/practice" className="btn-secondary text-center">
            Try a practice question
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
          <span>✓ Free to start</span>
          <span>✓ Australian Curriculum v9.0 aligned</span>
          <span>✓ No credit card required</span>
        </div>
      </section>

      {/* Subjects */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SUBJECTS.map(s => (
            <Link
              key={s.slug}
              href="/practice"
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
              { step: '1', title: 'Pick a topic', body: 'Choose subject, year level and topic — matched to the Australian Curriculum.' },
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
          <div className="card">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Topic performance</p>
            {[
              { label: 'Number & Operations', pct: 88 },
              { label: 'Geometry & Measurement', pct: 55 },
              { label: 'Reading Comprehension', pct: 72 },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-3 mb-3 last:mb-0">
                <span className="text-xs min-w-[130px] text-gray-600">{t.label}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-brand-400" style={{ width: `${t.pct}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-400 w-8 text-right">{t.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-brand-600">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white mb-3">
            Ready to get ahead?
          </h2>
          <p className="text-brand-100 mb-7">Start practising for free — no credit card required.</p>
          <Link href="/auth/register" className="inline-block bg-white text-brand-600 font-medium px-6 py-3 rounded-xl hover:bg-brand-50 transition-all">
            Get started free
          </Link>
        </div>
      </section>
    </main>
  )
}
