import Link from 'next/link'
import type { Route } from 'next'
import FAQAccordion from '@/components/home/FAQAccordion'
import LookInside from '@/components/marketing/LookInside'
import LibraryGrowth from '@/components/marketing/LibraryGrowth'
import Bird from '@/components/brand/Bird'
import ParentStory, { StepCards } from '@/components/home/ParentStory'
import { ArrowRight, BarChartHorizontal, Check, Download, FileCheck, FileText, GraduationCap, Newspaper, PenLine, SquareFunction, Target, Timer, Users, type LucideIcon } from 'lucide-react'
import { PLANS, VCE_PAPER_PRICE, perMonth, perPaper, savingPercent } from '@/lib/pricing'
import { CATALOGUE_TOTALS, PLAN_TOTALS, YEAR_LEVEL_STATS, releasesIn } from '@/lib/catalogue'
import YearPicker from '@/components/catalogue/YearPicker'
import { formatReleaseDate } from '@/lib/releases'
import { HOME_FAQS } from '@/lib/faqs'
import {
  VCE_EXAM_PERIOD_2026,
  dayWord,
  daysUntil,
  formatWindow,
  nextNaplanWindow,
} from '@/lib/examDates'

/**
 * The homepage a visitor sees before signing in.
 *
 * It used to sell the free quiz — "instant feedback, XP and streaks" — and
 * never mentioned exam papers, answer keys, NAPLAN, VCE, the free sample or the
 * price, which together are the whole paid product. It also said "Grade 5 to
 * Year 12" beside a stat banner saying "Gr 3–Yr 12". Everything quantitative
 * here now comes from lib/catalogue, so the page cannot drift from the catalogue
 * again.
 *
 * The pictures are the product itself: real pages from the free papers and a
 * real topic report, not stock photos. A parent weighing up a plan should be
 * able to see what it buys without downloading anything.
 *
 * No testimonials or usage claims: there are none yet, and inventing them is
 * both dishonest and a consumer-law problem.
 *
 * Since 2026-10 it leads with the parent's question — where does my child need
 * help? — and the free diagnostic test that answers it; the papers library,
 * which the diagnostic's practice exam comes from, follows.
 */
export default function MarketingHome() {
  const naplan = nextNaplanWindow()
  const naplanDays = naplan ? daysUntil(naplan.start) : null
  const vceDays = daysUntil(VCE_EXAM_PERIOD_2026.start)
  const vceOver = daysUntil(VCE_EXAM_PERIOD_2026.end) < 0
  const yearPlan = PLANS.find(p => p.id === 'year') ?? PLANS[PLANS.length - 1]
  const releases = releasesIn('all')
  const latest = releases[0]
  const addedThisMonth = releases
    .filter(r => -daysUntil(r.release.date) <= 30)
    .reduce((n, r) => n + r.papers.length, 0)

  return (
    <main className="flex-1">
      {/* Hero, after Duolingo's: the bird, one sentence, two big buttons. */}
      <section className="max-w-5xl mx-auto px-4 pt-10 sm:pt-16 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <Bird pose="nest" className="w-64 h-64 sm:w-80 sm:h-80 mx-auto" title="The PrepNest bird in its nest" />
          <div className="text-center md:text-left">
            <p className="text-sm font-bold text-brand-600 mb-3">For parents · NAPLAN, school years and VCE</p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-ink mb-5 leading-[1.1]">
              The free, simple way to find exactly where your child needs help.
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Your child takes a short test. We find their weak spots, keep fine-tuning as they practice, and show you
              their progress.
            </p>
            <div className="flex flex-col gap-3 max-w-sm mx-auto md:mx-0">
              <Link href={'/diagnostic' as Route} className="btn-primary text-center text-lg py-3.5">
                Start the free test
              </Link>
              <Link href="/auth/login" className="btn-secondary text-center text-lg py-3">
                I already have an account
              </Link>
            </div>
            <ul className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-sm font-semibold text-gray-500 mt-6">
              {['Free test and report', 'About 20–35 minutes', 'No card needed'].map(t => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-teal-600" strokeWidth={3} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What's coming up — the reason a parent is looking today — and the
          latest release, so the first screen already shows the library moving. */}
      {(naplan || !vceOver || latest) && (
        <section className="border-y border-gray-100 bg-brand-50/60">
          <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-x-10 gap-y-2 text-sm text-center">
            {latest && (
              <Link href={'/whats-new' as Route} className="text-gray-700 hover:text-brand-600">
                <span className="font-medium text-teal-600">New</span> {latest.papers.length}{' '}
                {latest.papers.length === 1 ? 'paper' : 'papers'} added {formatReleaseDate(latest.release.date)} →
              </Link>
            )}
            {!vceOver && (
              <Link href={'/vce' as Route} className="text-gray-700 hover:text-brand-600">
                <span className="font-medium text-brand-600">VCE exams</span>{' '}
                {vceDays > 0 ? `start ${dayWord(vceDays)}` : 'are on now'} →
              </Link>
            )}
            {naplan && naplanDays !== null && (
              <Link href={'/naplan' as Route} className="text-gray-700 hover:text-brand-600">
                <span className="font-medium text-brand-600">NAPLAN {naplan.year}</span>{' '}
                {naplanDays > 0
                  ? `opens ${dayWord(naplanDays)} (${formatWindow(naplan.start, naplan.end)})`
                  : 'is on now'}{' '}
                →
              </Link>
            )}
          </div>
        </section>
      )}

      {/* The journey at a glance, then one illustrated section per step. */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-4">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink text-center mb-10">How PrepNest helps your child</h2>
        <StepCards />
      </section>
      <ParentStory />

      {/* The library at a glance: the totals, then every year level with what
          it holds — so the size of the library is something to explore, not
          just four numbers. Each year opens its papers in the catalogue. */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-1">The library</p>
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Papers for every year, Grade 3 to Year 12</h2>
            </div>
            <Link href="/practice/exams" className="text-sm text-brand-600 hover:underline shrink-0">
              Browse all papers →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { value: CATALOGUE_TOTALS.papers, label: 'practice papers' },
              { value: questionsLabel(CATALOGUE_TOTALS.questions), label: 'exam-style questions' },
              { value: CATALOGUE_TOTALS.free, label: 'free to download' },
              // Growth is the better fourth number while it is large; the subject
              // count stands in when nothing has landed for a while.
              addedThisMonth >= 5
                ? { value: addedThisMonth, label: 'papers added in the last month' }
                : { value: CATALOGUE_TOTALS.subjects, label: 'subjects' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl bg-gray-50 px-4 py-3.5">
                <p className="text-2xl font-semibold tracking-tight text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="-mx-6 px-6 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible pb-1">
            <YearPicker
              items={YEAR_LEVEL_STATS.map(s => ({ yearLevel: s.yearLevel, sub: `${s.papers} papers · ${s.free} free` }))}
              hrefFor={y => `/practice/exams?year=${y}`}
            />
          </div>
        </div>
      </section>

      {/* Choose your exam */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-6 text-center">
          Choose your exam
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ExamCard
            href="/naplan"
            icon={Newspaper}
            eyebrow="Years 3, 5, 7 & 9"
            title="NAPLAN"
            body="Numeracy, Language Conventions and Reading papers in the NAPLAN format — Reading with its own colour magazine."
          />
          <ExamCard
            href="/practice/exams"
            icon={GraduationCap}
            eyebrow="Grade 3 – Year 10"
            title="School years"
            body="Maths, Reading and Language Conventions for every year, and Science in Grade 6 and Years 8 and 10."
          />
          <ExamCard
            href="/vce"
            icon={SquareFunction}
            eyebrow="Year 11 & 12"
            title="VCE"
            body="Mathematical Methods, General Mathematics, Specialist Mathematics, Chemistry and Physics, laid out like VCAA papers with reading time."
          />
        </div>
      </section>

      {/* Look inside — the pages themselves, before anyone has to download. */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-3">Look inside</p>
            <h2 className="text-3xl font-semibold tracking-tight mb-3">See exactly what you&apos;re getting</h2>
            <p className="text-gray-500 leading-relaxed">
              Real pages from the free sample papers. Open any page full size, then download the whole paper — no
              account needed.
            </p>
          </div>
          <LookInside items={['readingCover', 'numeracy', 'answerKey', 'vcePaper']} />
        </div>
      </section>

      {/* Why the papers are worth paying for, in terms a parent can check. */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-3">What makes them different</p>
          <h2 className="text-3xl font-semibold tracking-tight">Built for practice that actually helps</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {FEATURES.map(f => (
            <div key={f.title} className="flex gap-4">
              <span className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5" />
              </span>
              <div>
                <p className="font-medium mb-1">{f.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The loop that makes a paper worth more than its answers. */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-3">Prefer to start with a paper?</p>
            <h2 className="text-3xl font-semibold tracking-tight">From paper to progress in four steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.title} className="card text-left">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm shadow-brand-600/30">
                    <s.icon className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-medium text-gray-300">Step {i + 1}</span>
                </div>
                <p className="font-medium mb-1">{s.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center mt-10">
            Prefer something shorter?{' '}
            <Link href="/practice" className="text-brand-600 underline">
              Free on-screen quizzes
            </Link>{' '}
            on any topic, with an explanation for every answer.
          </p>
        </div>
      </section>

      {/* Will there be more? Answered with dates, just before the price. */}
      <section className="max-w-5xl mx-auto px-4 pt-20">
        <LibraryGrowth />
      </section>

      {/* Pricing, stated plainly on the homepage: the three plans at a glance,
          with the full cards and checkout on /pricing. */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-3">Simple plans</p>
        <h2 className="text-3xl font-semibold tracking-tight mb-2">Every {PLAN_TOTALS.range} paper, for the whole family</h2>
        <p className="text-gray-500 mb-8">
          NAPLAN and school-year papers with answer keys. New papers added throughout the year. Cancel anytime.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {PLANS.map(plan => (
            <Link
              key={plan.id}
              href={'/pricing' as Route}
              className={`card relative hover:border-brand-400 transition-colors ${
                plan.id === 'year' ? 'border-brand-500 ring-1 ring-brand-500' : ''
              }`}
            >
              {plan.badge && (
                <span
                  className={`absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white ${
                    plan.id === 'year' ? 'bg-brand-600' : 'bg-teal-600'
                  }`}
                >
                  {plan.badge}
                </span>
              )}
              <p className="text-sm text-gray-500">{plan.name}</p>
              <p className="text-3xl font-semibold tracking-tight text-gray-900 mt-1">${plan.priceAud}</p>
              <p className="text-xs text-gray-400 mt-1">
                {savingPercent(plan) > 0 ? `${perMonth(plan)}/mo · save ${savingPercent(plan)}%` : 'per month'}
              </p>
            </Link>
          ))}
        </div>
        <p className="text-sm text-gray-600 mb-2">
          The 12-month plan works out at{' '}
          <span className="font-medium text-gray-900">{perPaper(yearPlan, PLAN_TOTALS.papers)} a paper</span> across
          today&apos;s {PLAN_TOTALS.papers} papers, for every child in the family.
        </p>
        <p className="text-sm text-gray-500">
          VCE papers are {VCE_PAPER_PRICE} each.{' '}
          <Link href={'/pricing' as Route} className="text-brand-600 underline">
            Compare plans
          </Link>
        </p>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-8 text-center">
          Frequently asked questions
        </h2>
        <FAQAccordion items={HOME_FAQS} />
        <p className="text-sm text-gray-500 text-center mt-8">
          <Link href={'/help' as Route} className="text-brand-600 underline">
            More answers in the help centre
          </Link>
        </p>
      </section>

      {/* Closing CTA */}
      <section
        className="bg-brand-600"
        style={{
          backgroundImage:
            'radial-gradient(circle at 85% 15%, rgba(55,138,221,0.6), transparent 45%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: 'auto, 44px 44px, 44px 44px',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <span className="inline-flex w-36 h-36 rounded-full bg-white items-center justify-center mb-5">
            <Bird pose="cheer" className="w-28 h-28" />
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
            Find out where to start now.
          </h2>
          <p className="text-brand-100 mb-8">The diagnostic test is free and needs no account to start.</p>
          <Link
            href={'/diagnostic' as Route}
            className="inline-block bg-white text-brand-700 font-bold text-lg px-8 py-3.5 rounded-2xl border-b-4 border-brand-200 hover:bg-brand-50 active:border-b-0 active:translate-y-[4px] transition-colors"
          >
            Start the free diagnostic test
          </Link>
        </div>
      </section>
    </main>
  )
}

/** '3,400+' — a round floor reads as confident and does not go stale with every batch. */
function questionsLabel(n: number): string {
  return n >= 1000 ? `${(Math.floor(n / 100) * 100).toLocaleString('en-AU')}+` : String(n)
}

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: FileText,
    title: 'Laid out like the real test',
    body: 'NAPLAN-format sections and timings, and VCE papers with reading time and the technology-free split.',
  },
  {
    icon: FileCheck,
    title: 'Every answer explained',
    body: 'The answer key says why each answer is right, and VCE keys show where every mark is earned.',
  },
  {
    icon: BarChartHorizontal,
    title: 'A topic report in minutes',
    body: 'Tap the questions that were wrong and see which topics cost marks, weakest first.',
  },
  {
    icon: Newspaper,
    title: 'Colour reading magazines',
    body: 'Reading papers come with a full-colour magazine of stories, reports and persuasive texts.',
  },
  {
    icon: GraduationCap,
    title: 'Aligned to the curriculum',
    body: 'Aligned to the Australian Curriculum v9.0 and the VCE study designs, and pitched at each year level.',
  },
  {
    icon: Users,
    title: 'The whole family, one plan',
    body: `One plan covers every child in the family, at every year level from ${PLAN_TOTALS.range.replace(' – ', ' to ')}.`,
  },
]

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Download,
    title: 'Download',
    body: 'Start with the free paper for your year level. Each comes with a separate answer key.',
  },
  {
    icon: Timer,
    title: 'Sit it',
    body: 'Print it and sit it in one go, timed, the way the real test runs.',
  },
  {
    icon: PenLine,
    title: 'Mark it',
    body: 'Use the answer key, then tap only the questions that were wrong. It takes minutes.',
  },
  {
    icon: Target,
    title: 'Practice the gaps',
    body: 'See which topics lost marks and jump straight into practice on exactly those.',
  },
]

function ExamCard({
  href,
  icon: Glyph,
  eyebrow,
  title,
  body,
}: {
  href: string
  icon: LucideIcon
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <Link
      href={href as Route}
      className="card hover:border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col group"
    >
      <span className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
        <Glyph className="w-5 h-5" />
      </span>
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">{eyebrow}</p>
      <p className="text-xl font-semibold tracking-tight mb-2 group-hover:text-brand-600">{title}</p>
      <p className="text-sm text-gray-500 leading-relaxed flex-1">{body}</p>
      <p className="text-sm font-medium text-brand-600 mt-4 flex items-center gap-1">
        See papers <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </p>
    </Link>
  )
}
