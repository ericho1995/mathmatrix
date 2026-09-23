import Link from 'next/link'
import Image from 'next/image'
import type { Route } from 'next'
import FAQAccordion from '@/components/home/FAQAccordion'
import LookInside from '@/components/marketing/LookInside'
import LibraryGrowth from '@/components/marketing/LibraryGrowth'
import PaperStack from '@/components/marketing/PaperStack'
import { ArrowRight, BarChartHorizontal, Check, Download, FileCheck, FileText, GraduationCap, Newspaper, PenLine, SquareFunction, Target, Timer, Users, type LucideIcon } from 'lucide-react'
import { FROM_PER_MONTH, PLANS, VCE_PAPER_PRICE, perMonth, perPaper, savingPercent } from '@/lib/pricing'
import { CATALOGUE_TOTALS, PLAN_TOTALS, releasesIn } from '@/lib/catalogue'
import { formatReleaseDate } from '@/lib/releases'
import { HOME_FAQS } from '@/lib/faqs'
import { TOPIC_REPORT } from '@/lib/samples'
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
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-12 sm:pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-6 items-center">
          <div className="text-center lg:text-left">
            <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-4">
              NAPLAN &amp; VCE · {CATALOGUE_TOTALS.lowest} to {CATALOGUE_TOTALS.highest}
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-5 leading-[1.08]">
              Practice exams that <span className="text-brand-400">feel like the real thing.</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              Printable practice papers, each with a separate answer key that explains every answer. Sit one at home,
              mark it in minutes, and see exactly which topics to work on next.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-7">
              <Link href="/practice/exams" className="btn-primary text-center px-6 py-3 shadow-md shadow-brand-600/20">
                Download a free paper
              </Link>
              <Link href={'/pricing' as Route} className="btn-secondary text-center px-6 py-3">
                See pricing
              </Link>
            </div>

            <ul className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-gray-500">
              {[
                `${CATALOGUE_TOTALS.free} papers free`,
                'No credit card to start',
                `Plans from ${FROM_PER_MONTH} a month`,
              ].map(t => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-teal-600" strokeWidth={2.5} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <PaperStack />
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

      {/* Stat banner */}
      <section className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
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
          <div key={s.label}>
            <p className="text-3xl font-semibold tracking-tight text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
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
            body="Methods, General, Specialist, Chemistry and Physics, laid out like VCAA papers with reading time."
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
            <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-3">How it works</p>
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

      {/* Parent value prop */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-3">For parents</p>
              <h2 className="text-3xl font-semibold tracking-tight mb-4">See exactly where they need help</h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Mark a paper against the answer key, tap the questions that were wrong, and every topic is ranked
                weakest first — with a link straight to practice on those topics. Link your account to your
                child&apos;s with a one-time invite code, and every paper and quiz builds up their accuracy by topic.
              </p>
              <Link href="/auth/register" className="btn-secondary">
                Create a parent account
              </Link>
            </div>
            <figure>
              <div className="rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
                <div className="flex items-center gap-1.5 border-b border-gray-100 px-4 py-3" aria-hidden>
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                  <span className="ml-3 text-xs text-gray-400">prepnest.com.au</span>
                </div>
                <Image
                  src={TOPIC_REPORT.image}
                  alt={TOPIC_REPORT.alt}
                  sizes="(min-width: 1024px) 480px, 90vw"
                  placeholder="blur"
                  className="w-full h-auto"
                />
              </div>
              <figcaption className="text-xs text-gray-400 mt-3 text-center">
                The topic report after marking the free Grade 5 Maths paper.
              </figcaption>
            </figure>
          </div>
        </div>
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
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
            Start with a free paper tonight.
          </h2>
          <p className="text-brand-100 mb-8">No account needed to download or mark it.</p>
          <Link
            href="/practice/exams"
            className="inline-block bg-white text-brand-600 font-medium px-7 py-3.5 rounded-xl shadow-lg shadow-brand-900/20 hover:bg-brand-50 transition-all"
          >
            Browse free papers
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
