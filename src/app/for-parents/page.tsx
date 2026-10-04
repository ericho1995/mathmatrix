import type { Metadata, Route } from 'next'
import Link from 'next/link'
import {
  BarChart3,
  BookOpen,
  CheckSquare,
  Clock,
  FileText,
  Gauge,
  HelpCircle,
  Library,
  LineChart,
  Link2,
  ListChecks,
  MonitorPlay,
  PenLine,
  RefreshCw,
  Repeat,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import Bird from '@/components/brand/Bird'
import { BookSticker, Cloud, PencilSticker, Sparkle, Star, Wave } from '@/components/brand/Decor'
import DashboardTour, { type TourTab } from '@/components/parents/DashboardTour'
import HeadlineResults from '@/components/diagnostic/HeadlineResults'
import AreaCard from '@/components/diagnostic/report/AreaCard'
import ProgressPanel from '@/components/diagnostic/report/ProgressPanel'
import LevelChip from '@/components/diagnostic/LevelChip'
import WeakPapersCard from '@/components/papers/WeakPapersCard'
import PracticeProgress from '@/components/parent/PracticeProgress'
import { getUserRole } from '@/lib/auth/getUserRole'
import { isGuardianRole } from '@/lib/auth/roles'
import { SHOWCASE } from '@/lib/diagnostic/showcase'
import { PAPERS_PER_MONTH } from '@/lib/diagnostic/weakPapers'
import { PLAN_TOTALS } from '@/lib/catalogue'
import { FROM_PER_MONTH, VCE_PAPER_PRICE } from '@/lib/pricing'

export const metadata: Metadata = {
  title: 'For parents: your child’s results, explained — PrepNest',
  description:
    'What PrepNest records when your child sits a test, what it works out from it, the dashboard you get, and every tool for helping your child learn — free and paid.',
}

// ─────────────────────────────────────────────────────────────────────────────
// The parents' guide: what a test records, what is worked out from it, a tour
// of the dashboard drawn with the real components, and every tool a parent can
// use, with what it costs. Pictures of the product use the shared sample child
// (lib/diagnostic/showcase.ts), always labelled as a sample.
// ─────────────────────────────────────────────────────────────────────────────

export default async function ForParentsPage() {
  const role = await getUserRole()
  const guardian = isGuardianRole(role)

  return (
    <main className="flex-1 w-full">
      <Hero guardian={guardian} />
      <DataFlow />
      {SHOWCASE && <Tour />}
      <HowSure />
      <Tools />
      <Routine />
      <YourData />
      <Closing guardian={guardian} />
    </main>
  )
}

function Hero({ guardian }: { guardian: boolean }) {
  return (
    <section className="relative overflow-hidden bg-brand-600 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-brand-500 hidden md:block" />
        <Cloud className="absolute top-8 left-[4%] w-32 opacity-20" />
        <Sparkle className="absolute top-12 left-[52%] w-6 h-6" />
        <Star className="absolute bottom-16 left-[6%] w-8 h-8 hidden sm:block" />
      </div>
      <div className="relative max-w-5xl mx-auto px-4 pt-10 pb-12 grid sm:grid-cols-[1fr_auto] gap-8 items-center">
        <div>
          <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold mb-4">For parents</span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">Everything your child’s tests tell you, in one place.</h1>
          <p className="text-white text-lg font-semibold leading-relaxed mb-6 max-w-2xl">
            Each test your child sits builds a clearer picture: what they know, what they don’t yet, and how sure we are. Here is what we record, what
            we work out from it, the dashboard you get — and every tool you can use to help.
          </p>
          <div className="flex flex-wrap gap-3">
            {guardian ? (
              <>
                <Link href={'/parent' as Route} className="btn-secondary text-lg px-8 py-3">
                  Open your dashboard
                </Link>
                <Link href={'/diagnostic' as Route} className="inline-flex items-center rounded-2xl px-6 py-3 font-bold text-white border-2 border-white/40 hover:bg-white/10">
                  Start a new test
                </Link>
              </>
            ) : (
              <>
                <Link href={'/diagnostic' as Route} className="btn-secondary text-lg px-8 py-3">
                  Start the free test
                </Link>
                <a href="#dashboard" className="inline-flex items-center rounded-2xl px-6 py-3 font-bold text-white border-2 border-white/40 hover:bg-white/10">
                  See the dashboard
                </a>
              </>
            )}
          </div>
        </div>
        <div className="relative hidden sm:block">
          <div className="w-52 h-52 rounded-full bg-sun-400 border-8 border-white/25 flex items-center justify-center">
            <Bird pose="search" className="w-44 h-44 animate-float motion-reduce:animate-none" />
          </div>
          <PencilSticker className="absolute -top-4 -left-8 w-16 h-16 animate-wiggle motion-reduce:animate-none" />
          <BookSticker className="absolute -bottom-2 -right-6 w-16 h-12 rotate-12" />
        </div>
      </div>
      <Wave fill="#DDF4FF" />
    </section>
  )
}

// ─── What we record, what we work out, what you get ─────────────────────────

const RECORDED = [
  { icon: CheckSquare, text: 'The answer given — or “I’m not sure”' },
  { icon: Clock, text: 'How long each question took' },
  { icon: Repeat, text: 'Whether the answer was changed' },
  { icon: HelpCircle, text: 'Whether your child marked it “I guessed”' },
  { icon: Target, text: 'Which questions were follow-ups, chosen from earlier answers' },
]

const YOU_GET = [
  'A report, weakest area first, with every question explained',
  'Three ways to help at home for each area, written for parents',
  'Practice papers built only on the areas to work on',
  'Progress over time, each time your child re-tests',
  'One dashboard for every child and every test',
]

function DataFlow() {
  return (
    <section className="bg-sky -mt-px">
      <div className="max-w-5xl mx-auto px-4 pt-4 pb-16">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink mb-3 text-center">From one test to a clear picture</h2>
        <p className="text-gray-600 text-lg text-center max-w-2xl mx-auto mb-10">
          The score is the least of it. How your child answered says as much as what they answered.
        </p>
        <ol className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <FlowCard n={1} title="What we record" tone="border-brand-200" badge="bg-brand-500">
            <ul className="space-y-3">
              {RECORDED.map(r => (
                <li key={r.text} className="flex gap-3 text-gray-700">
                  <r.icon className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" aria-hidden />
                  {r.text}
                </li>
              ))}
            </ul>
          </FlowCard>
          <FlowCard n={2} title="What we work out" tone="border-amber-200" badge="bg-amber-400">
            <ul className="space-y-4 text-gray-700">
              <li>
                <p className="font-bold text-ink mb-1.5">Each area’s level</p>
                <span className="flex flex-wrap gap-2">
                  <LevelChip level="focus" />
                  <LevelChip level="developing" />
                  <LevelChip level="strength" />
                </span>
              </li>
              <li>
                <p className="font-bold text-ink">How sure we are</p>
                <p className="text-sm">A clear result, likely, or an early sign — with a percentage — from how many questions back it up.</p>
              </li>
              <li>
                <p className="font-bold text-ink">Every skill</p>
                <p className="text-sm">Secure, a gap, mixed, or one slip — so you know exactly what to practice.</p>
              </li>
              <li>
                <p className="font-bold text-ink">How the test went</p>
                <p className="text-sm">Rushed answers, running out of time, many skips or guesses are flagged, so a bad day is not read as a bad result.</p>
              </li>
            </ul>
          </FlowCard>
          <FlowCard n={3} title="What you get" tone="border-teal-200" badge="bg-teal-400">
            <ul className="space-y-3">
              {YOU_GET.map(t => (
                <li key={t} className="flex gap-3 text-gray-700">
                  <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </FlowCard>
        </ol>
      </div>
    </section>
  )
}

function FlowCard({ n, title, tone, badge, children }: { n: number; title: string; tone: string; badge: string; children: React.ReactNode }) {
  return (
    <li className={`card p-6 border-2 border-b-[6px] ${tone}`}>
      <div className="flex items-center gap-3 mb-5">
        <span className={`inline-flex w-10 h-10 rounded-xl items-center justify-center text-white font-bold border-b-4 border-black/15 ${badge}`}>{n}</span>
        <h3 className="text-xl font-bold text-ink">{title}</h3>
      </div>
      {children}
    </li>
  )
}

// ─── The dashboard, view by view ────────────────────────────────────────────

/** Sample on-screen practice for the made-up child, from her report's areas, weakest first. */
function samplePractice() {
  const areas = SHOWCASE!.report.areas
  return {
    xpTotal: 1240,
    weeklyXp: 180,
    sessionsCount: 14,
    streakDays: 5,
    topicAccuracy: areas.map(a => ({ topic: a.id, label: a.label, pct: Math.min(96, Math.max(30, a.pct + 8)) })),
  }
}

function Tour() {
  const s = SHOWCASE!
  const weakest = s.report.areas[0]
  const icon = (I: LucideIcon) => <I className="w-5 h-5" aria-hidden />
  const tabs: TourTab[] = [
    {
      id: 'results',
      label: 'Results at a glance',
      icon: icon(BarChart3),
      intro: (
        <>
          The score, a summary in plain English, and every area of the subject with its level and how firm the result is. This is what you see first —
          and, with no account, straight after the test.
        </>
      ),
      use: 'Read the summary, then look for the orange areas: those are the ones to work on.',
      panel: <HeadlineResults headline={s.headline} sample />,
    },
    {
      id: 'skills',
      label: 'Skills and tips',
      icon: icon(ListChecks),
      intro: <>Each area opens up into its skills — which are secure and which are gaps — with three practical ways to help at home.</>,
      use: 'Pick one tip for the weakest area and try it this week, ten minutes at a time.',
      panel: <AreaCard area={weakest} subject={s.report.subject} year={s.report.year} name={s.name} />,
    },
    {
      id: 'papers',
      label: 'Practice papers',
      icon: icon(FileText),
      intro: (
        <>
          Papers built only on the areas to work on, new every time. Sit them on screen, with a working-out pad beside each question, or print them with
          an answer key. Each paper’s mark is kept here.
        </>
      ),
      use: 'One paper a week or so, then go through every wrong answer together.',
      panel: (
        <WeakPapersCard
          resultId="showcase"
          name={s.name}
          weak={s.weak}
          fallback={false}
          rights={{ kind: 'allowance', limit: PAPERS_PER_MONTH }}
          allowance={{ used: s.papers.length, limit: PAPERS_PER_MONTH, resets: '1 November' }}
          papers={s.papers}
          ready
          sellable
        />
      ),
    },
    ...(s.progress
      ? [
          {
            id: 'progress',
            label: 'Over time',
            icon: icon(LineChart),
            intro: <>Every re-test is combined with the ones before, so each area shows whether it has improved, slipped or held steady.</>,
            use: 'Re-test every three to six weeks — it never repeats a question.',
            panel: <ProgressPanel profile={s.progress} name={s.name} />,
          },
        ]
      : []),
    {
      id: 'practice',
      label: 'Everyday practice',
      icon: icon(Gauge),
      intro: (
        <>
          Link your child’s own student account and their free on-screen practice shows up too: points, the week’s effort, their streak, and accuracy by
          topic.
        </>
      ),
      use: 'A short streak of small sessions beats one long one. Check the weakest topic is moving.',
      panel: <PracticeProgress student={samplePractice()} />,
    },
  ]
  return (
    <section id="dashboard" className="scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-3">
          <Bird pose="read" className="w-20 h-20 shrink-0" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">Inside your dashboard</h2>
        </div>
        <p className="text-gray-600 text-lg mb-10 max-w-3xl">
          Every test and every paper lands in one place. Here is each view, drawn with the real dashboard for a made-up Grade 5 student, Mia.
        </p>
        <DashboardTour tabs={tabs} />
      </div>
    </section>
  )
}

// ─── How sure we are ────────────────────────────────────────────────────────

function HowSure() {
  return (
    <section className="bg-grape-50">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-5">
          <Bird pose="think" className="w-20 h-20 shrink-0" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-grape-500">How sure is a result?</h2>
        </div>
        <p className="text-gray-700 text-lg leading-relaxed mb-8 max-w-3xl">
          A child can miss a question they know. So every area says how firm its result is, and a single wrong answer is never called a weakness.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SureCard chip={<LevelChip level="focus" confidence="clear" />} title="Clear result">
            Enough questions pointed the same way. Act on it.
          </SureCard>
          <SureCard chip={<LevelChip level="focus" confidence="likely" />} title="Likely">
            Most of the evidence agrees. Worth working on, and the next test will confirm it.
          </SureCard>
          <SureCard chip={<LevelChip level="focus" confidence="early" />} title="Early sign">
            Too few questions to say. Never treated as a weakness — practice papers leave it out until a re-test firms it up.
          </SureCard>
        </div>
        <p className="text-gray-600 mt-6">
          The test itself adapts: after the first part it asks more where a result could still go either way, and asks again about any skill missed
          once. Answers marked as a guess, or tapped in two seconds, are not counted as evidence.
        </p>
      </div>
    </section>
  )
}

function SureCard({ chip, title, children }: { chip: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="mb-3">{chip}</div>
      <p className="font-bold text-ink mb-1">{title}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
    </div>
  )
}

// ─── Every tool, and what it costs ──────────────────────────────────────────

interface Tool {
  icon: LucideIcon
  title: string
  body: string
  price: string
  href: string
  cta: string
}

const FREE: Tool[] = [
  {
    icon: Target,
    title: 'Diagnostic test',
    body: 'A short adaptive test on screen at your child’s year level, Grade 3 to Year 12. No account needed to start.',
    price: 'Free',
    href: '/diagnostic',
    cta: 'Start the test',
  },
  {
    icon: BarChart3,
    title: 'Full report and home tips',
    body: 'Every area, every skill and every question explained, with three ways to help at home. Saved to your account.',
    price: 'Free with an account',
    href: '/auth/register',
    cta: 'Create an account',
  },
  {
    icon: Sparkles,
    title: 'On-screen practice',
    body: 'Short topic quizzes with points and streaks, marked as they go with every answer explained. Link your child’s account to see it on your dashboard.',
    price: 'Free',
    href: '/practice',
    cta: 'Try a quiz',
  },
  {
    icon: CheckSquare,
    title: 'Mark a paper on screen',
    body: 'Tap the questions your child got wrong on a printed paper and see how each topic went.',
    price: 'Free',
    href: '/practice/exams',
    cta: 'Find a paper',
  },
  {
    icon: RefreshCw,
    title: 'Re-tests and progress',
    body: 'Sit the diagnostic again every few weeks. It never repeats a question, and each area shows how it has moved.',
    price: 'Free',
    href: '/diagnostic',
    cta: 'Plan a re-test',
  },
  {
    icon: Link2,
    title: 'Link your child’s account',
    body: 'Give your child an invite code from your dashboard, and their practice appears beside your tests.',
    price: 'Free',
    href: '/parent',
    cta: 'Open the dashboard',
  },
]

function paidTools(): Tool[] {
  return [
    {
      icon: FileText,
      title: 'Practice papers on the weak areas',
      body: `Generated from your child’s result, new every time, on screen or printed with an answer key. ${PAPERS_PER_MONTH} a month in the plan.`,
      price: `In the plan · ${VCE_PAPER_PRICE} each for VCE`,
      href: '/diagnostic',
      cta: 'Start with the test',
    },
    {
      icon: PenLine,
      title: 'Working-out pad',
      body: 'A page beside every question to draw, sketch and do sums with a finger, stylus or mouse — in the diagnostic and in practice papers sat on screen.',
      price: 'Included',
      href: '/diagnostic',
      cta: 'Try it in the test',
    },
    {
      icon: Library,
      title: 'Exam paper library',
      body: `${PLAN_TOTALS.papers} NAPLAN-style and school papers for ${PLAN_TOTALS.range}, each with a separate answer key. The first half of every paper is free to flip through.`,
      price: `Plan from ${FROM_PER_MONTH} a month`,
      href: '/practice/exams',
      cta: 'Browse the papers',
    },
    {
      icon: MonitorPlay,
      title: 'Reading papers on screen',
      body: 'Read each text and answer its questions on screen, the way NAPLAN Online works, with every answer explained at the end.',
      price: 'In the plan · first half free',
      href: '/naplan',
      cta: 'See NAPLAN practice',
    },
    {
      icon: BookOpen,
      title: 'VCE exams',
      body: 'Year 11 and 12 papers laid out like VCAA exams, with reading time, formula sheets where VCAA gives one, and full marking guides.',
      price: `${VCE_PAPER_PRICE} per paper · first half free`,
      href: '/vce',
      cta: 'See VCE papers',
    },
  ]
}

function Tools() {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink mb-3 text-center">Tools to help your child learn</h2>
        <p className="text-gray-600 text-lg text-center max-w-2xl mx-auto mb-10">Start with what is free. Add more when you know what your child needs.</p>
        <h3 className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-4">Free for everyone</h3>
        <ToolGrid tools={FREE} />
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-600 mt-12 mb-4">With the plan, or per VCE paper</h3>
        <ToolGrid tools={paidTools()} />
        <p className="text-center mt-8">
          <Link href={'/pricing' as Route} className="btn-primary text-lg px-8 py-3">
            See the plans
          </Link>
        </p>
      </div>
    </section>
  )
}

function ToolGrid({ tools }: { tools: Tool[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map(t => (
        <li key={t.title} className="card p-5 flex flex-col">
          <div className="flex items-start gap-3 mb-3">
            <span className="inline-flex w-11 h-11 rounded-xl items-center justify-center bg-brand-50 text-brand-600 shrink-0">
              <t.icon className="w-6 h-6" aria-hidden />
            </span>
            <div>
              <p className="font-bold text-ink leading-snug">{t.title}</p>
              <p className="text-xs font-bold text-gray-500 mt-0.5">{t.price}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">{t.body}</p>
          <Link href={t.href as Route} className="text-sm font-bold text-brand-600 hover:underline">
            {t.cta} →
          </Link>
        </li>
      ))}
    </ul>
  )
}

// ─── A routine ──────────────────────────────────────────────────────────────

const ROUTINE = [
  { when: 'Day 1', what: 'Your child sits the diagnostic (20–35 minutes). You read the report together.' },
  { when: 'Each week', what: 'One practice paper on the weak areas — on screen, or printed and sat in one go. Go through every wrong answer.' },
  { when: 'A few times a week', what: 'Ten to fifteen minutes on one tip or one short quiz. Little and often does more than one long session.' },
  { when: 'Every 3–6 weeks', what: 'Re-test. Your dashboard shows each area improving, slipping or holding steady, and the next papers follow it.' },
]

function Routine() {
  return (
    <section className="bg-teal-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-8">
          <Bird pose="trophy" className="w-20 h-20 shrink-0" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-teal-500">A routine that works</h2>
        </div>
        <ol className="space-y-3">
          {ROUTINE.map(r => (
            <li key={r.when} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <span className="text-sm font-bold text-teal-600 sm:w-40 shrink-0">{r.when}</span>
              <span className="text-gray-700">{r.what}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// ─── Your child's data ──────────────────────────────────────────────────────

function YourData() {
  const points = [
    { icon: ShieldCheck, title: 'Only you see it', body: 'Results are visible to the account they are saved to, and to a parent the child’s account is linked to.' },
    { icon: Clock, title: 'Nothing is kept until you save', body: 'Before a result is saved to an account, it stays only in your browser.' },
    { icon: Trash2, title: 'Delete it any time', body: 'Delete a result from its report, or ask us for a copy of your data or to delete it all.' },
  ]
  return (
    <section>
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink mb-3">Your child’s data</h2>
        <p className="text-gray-600 text-lg mb-8 max-w-3xl">
          We record what a test needs to be useful, and nothing to sell: we do not sell personal data.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {points.map(p => (
            <li key={p.title} className="card p-5">
              <p.icon className="w-6 h-6 text-teal-600 mb-3" aria-hidden />
              <p className="font-bold text-ink mb-1">{p.title}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{p.body}</p>
            </li>
          ))}
        </ul>
        <Link href={'/privacy' as Route} className="text-sm font-bold text-brand-600 hover:underline">
          Read the privacy policy →
        </Link>
      </div>
    </section>
  )
}

function Closing({ guardian }: { guardian: boolean }) {
  return (
    <section className="bg-brand-600 text-white">
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Bird pose="cheer" className="w-28 h-28 mx-auto mb-4" />
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{guardian ? 'Pick up where you left off.' : 'Start with one free test.'}</h2>
        <p className="text-lg font-semibold mb-8">
          {guardian
            ? 'Your dashboard has every test, every paper and what to do next.'
            : 'Twenty to thirty-five minutes, no account needed to start, and a report you can act on straight away.'}
        </p>
        <Link href={(guardian ? '/parent' : '/diagnostic') as Route} className="btn-secondary text-lg px-10 py-3.5">
          {guardian ? 'Open your dashboard' : 'Start the free test'}
        </Link>
      </div>
    </section>
  )
}
