import Link from 'next/link'
import type { Route } from 'next'
import { HelpCircle, LineChart, PencilLine, SlidersHorizontal, Target } from 'lucide-react'
import Bird from '@/components/brand/Bird'
import SampleReport from '@/components/diagnostic/SampleReport'
import ProgressPanel from '@/components/diagnostic/report/ProgressPanel'
import LevelChip from '@/components/diagnostic/LevelChip'
import { QUESTION_BANK } from '@/lib/questions/bank'
import { sampleResult } from '@/lib/diagnostic/sample'
import { buildProfile } from '@/lib/diagnostic/profile'
import { VCE_PAPER_PRICE } from '@/lib/pricing'

// ─────────────────────────────────────────────────────────────────────────────
// The parent's story, told the way Duolingo's homepage tells its own: four
// steps at a glance, then one section per step with the product beside it.
//
//   Your child takes a test → We find the weak spots → We keep fine-tuning →
//   You watch them improve
//
// Every picture here is the real product — the test screen, the report, the
// progress panel — drawn with sample data, never a stock image.
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
  { icon: PencilLine, colour: 'text-brand-600 bg-brand-50', title: 'Your child takes a test', body: 'A short, free test on screen, at their year level.' },
  { icon: Target, colour: 'text-amber-600 bg-amber-50', title: 'We find the weak spots', body: 'The exact skills to work on, area by area.' },
  { icon: SlidersHorizontal, colour: 'text-grape-600 bg-grape-50', title: 'We keep fine-tuning', body: 'Follow-up questions and re-tests firm it up.' },
  { icon: LineChart, colour: 'text-teal-600 bg-teal-50', title: 'You watch them improve', body: 'Practice made for them, and progress you can see.' },
]

export function StepCards() {
  return (
    <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STEPS.map((s, i) => (
        <li key={s.title} className="card text-center">
          <span className={`inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-3 ${s.colour}`}>
            <s.icon className="w-6 h-6" aria-hidden />
          </span>
          <p className="text-xs font-bold text-gray-400 mb-1">Step {i + 1}</p>
          <p className="font-bold text-lg text-ink leading-snug mb-1">{s.title}</p>
          <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
        </li>
      ))}
    </ol>
  )
}

/** One step: a short bold headline and a few lines, the product beside it, sides alternating. */
function StorySection({ eyebrow, title, children, art, flip = false, tint = false }: {
  eyebrow: string
  title: string
  children: React.ReactNode
  art: React.ReactNode
  flip?: boolean
  tint?: boolean
}) {
  return (
    <section className={tint ? 'bg-brand-50/70' : undefined}>
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className={flip ? 'lg:order-2' : undefined}>
          <p className="text-sm font-bold text-brand-600 mb-2">{eyebrow}</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink mb-4 leading-tight">{title}</h2>
          <div className="text-lg text-gray-600 leading-relaxed space-y-3">{children}</div>
        </div>
        <div className={flip ? 'lg:order-1' : undefined}>{art}</div>
      </div>
    </section>
  )
}

/** What the child sees: one question, big answers, and "I'm not sure". */
function TestScreen() {
  return (
    <div className="relative">
      <Bird pose="think" className="absolute -top-16 -right-2 w-28 h-28 hidden sm:block" />
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-sm font-bold text-gray-500 whitespace-nowrap">Question 5 of 24</span>
          <div className="flex-1 h-4 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full w-1/5 rounded-full bg-teal-400 relative">
              <span className="absolute left-2 right-2 top-1 h-1 rounded-full bg-white/40" />
            </div>
          </div>
        </div>
        <p className="text-xl font-bold text-ink mb-4">What number makes this number sentence true?</p>
        <p className="text-2xl font-bold text-ink mb-5">☐ + 8 = 15</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {['6', '7', '8', '9'].map((o, i) => (
            <div
              key={o}
              className={`flex items-center gap-3 rounded-2xl border-2 border-b-4 px-4 py-3 text-lg font-bold ${
                i === 1 ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line text-ink'
              }`}
            >
              <span className={`w-7 h-7 rounded-lg text-sm inline-flex items-center justify-center ${i === 1 ? 'bg-brand-500 text-white' : 'border-2 border-line text-gray-400'}`}>
                {'ABCD'[i]}
              </span>
              {o}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500">
            <HelpCircle className="w-4 h-4" aria-hidden />
            I&apos;m not sure
          </span>
          <span className="btn-primary pointer-events-none">Next</span>
        </div>
      </div>
    </div>
  )
}

/** How a result firms up: follow-ups, confidence on every area, guesses left out. */
function FineTuning() {
  const rows = [
    { what: 'Fractions', why: 'Missed once — asked again to tell a slip from a gap', chip: <LevelChip level="focus" confidence="likely" /> },
    { what: 'Measurement', why: 'Could go either way — three more questions', chip: <LevelChip level="developing" confidence="early" /> },
    { what: 'Statistics', why: 'Seven of seven — no more questions needed', chip: <LevelChip level="strength" confidence="clear" /> },
  ]
  return (
    <div className="relative">
      <div className="card p-6">
        <p className="font-bold text-ink text-lg mb-1">A few more questions</p>
        <p className="text-sm text-gray-500 mb-4">Chosen from the first part&apos;s answers, before anything is reported.</p>
        <ul className="space-y-3">
          {rows.map(r => (
            <li key={r.what} className="rounded-2xl border-2 border-line p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="font-bold text-ink">{r.what}</span>
                {r.chip}
              </div>
              <p className="text-sm text-gray-500">{r.why}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-500 mt-4">Answers marked as a guess, or tapped in two seconds, are not counted.</p>
      </div>
    </div>
  )
}

function sampleProgress() {
  const before = sampleResult(QUESTION_BANK, 'grade_5', 'math', 9)
  const after = sampleResult(QUESTION_BANK, 'grade_5', 'math', 3)
  if (!before || !after) return null
  const sitting = (id: string, at: string, r: typeof after.report) => ({
    id,
    at,
    areas: r.areas.map(a => ({ id: a.id, label: a.label, secure: a.secure, evidence: a.evidence })),
  })
  return buildProfile([sitting('a', '2026-08-20', before.report), sitting('b', '2026-10-01', after.report)])
}

const PROGRESS = sampleProgress()

export default function ParentStory() {
  return (
    <>
      <StorySection
        eyebrow="Step 1 · Your child takes a test"
        title="A short test that feels like a game, not an exam."
        art={<TestScreen />}
      >
        <p>
          Your child answers one question at a time on screen, at their year level, or in one VCE subject. Diagrams and
          maths look exactly as they do on a real paper.
        </p>
        <p>
          It takes 20 to 35 minutes, needs no account to start, and saves as they go. Saying <em>I&apos;m not sure</em> is
          encouraged: an honest skip tells us more than a lucky guess.
        </p>
      </StorySection>

      <StorySection
        eyebrow="Step 2 · We find the weak spots"
        title="See exactly what they know, and what they don't yet."
        art={<SampleReport />}
        flip
        tint
      >
        <p>
          You get a clear report, weakest area first: the specific skills to work on, the ones that are already secure,
          and every question explained.
        </p>
        <p>Each area comes with three practical ways to help at home, written for parents, not teachers.</p>
      </StorySection>

      <StorySection
        eyebrow="Step 3 · We keep fine-tuning"
        title="Built not to over-read a short test."
        art={<FineTuning />}
      >
        <p>
          One wrong answer is never called a weakness. Where a result could go either way, the test asks a few more
          questions, and every area says how firm its result is.
        </p>
        <p>Each re-test adds to the picture, so it gets more accurate the more your child uses it.</p>
      </StorySection>

      <StorySection
        eyebrow="Step 4 · You watch them improve"
        title="Practice made for them, and progress you can see."
        art={PROGRESS ? <ProgressPanel profile={PROGRESS} name="Mia" /> : null}
        flip
        tint
      >
        <p>
          The test builds a printable practice exam around your child&apos;s weak spots, with an answer key. It&apos;s
          included in the plan for Grade 3 to Year 10, and {VCE_PAPER_PRICE} for VCE.
        </p>
        <p>
          Re-test every few weeks. It never repeats a question, and your dashboard shows each area improving, slipping or
          holding steady.
        </p>
        <p>
          <Link href={'/diagnostic' as Route} className="btn-primary inline-block mt-2">
            Start the free test
          </Link>
        </p>
      </StorySection>
    </>
  )
}
