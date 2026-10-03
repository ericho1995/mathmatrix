import Link from 'next/link'
import type { Route } from 'next'
import { HelpCircle, LineChart, PencilLine, SlidersHorizontal, Target } from 'lucide-react'
import Bird, { type BirdPose } from '@/components/brand/Bird'
import { BlockSticker, BookSticker, CheckSticker, MedalSticker, PencilSticker, Sparkle, Star } from '@/components/brand/Decor'
import SampleReport from '@/components/diagnostic/SampleReport'
import ProgressPanel from '@/components/diagnostic/report/ProgressPanel'
import LevelChip from '@/components/diagnostic/LevelChip'
import { SHOWCASE } from '@/lib/diagnostic/showcase'
import { VCE_PAPER_PRICE } from '@/lib/pricing'

// ─────────────────────────────────────────────────────────────────────────────
// The parent's story, told the way Duolingo's homepage tells its own: four
// bright step cards, then one band of colour per step, each with the bird
// doing that step and the real product beside it.
//
//   Your child takes a test → We find the weak spots → We keep fine-tuning →
//   You watch them improve
//
// Every picture is the real product — the test screen, the report, the
// progress panel — drawn with sample data; the decorations are hand-built SVG.
// ─────────────────────────────────────────────────────────────────────────────

// Full class strings, so Tailwind sees them.
const STEPS = [
  { icon: PencilLine, card: 'bg-brand-50 border-brand-200', badge: 'bg-brand-500', title: 'Your child takes a test', body: 'A short, free test on screen, at their year level.' },
  { icon: Target, card: 'bg-amber-50 border-amber-200', badge: 'bg-amber-400', title: 'We find the weak spots', body: 'The exact skills to work on, area by area.' },
  { icon: SlidersHorizontal, card: 'bg-grape-50 border-grape-200', badge: 'bg-grape-400', title: 'We keep fine-tuning', body: 'Follow-up questions and re-tests firm it up.' },
  { icon: LineChart, card: 'bg-teal-50 border-teal-200', badge: 'bg-teal-400', title: 'You watch them improve', body: 'Practice made for them, and progress you can see.' },
]

export function StepCards() {
  return (
    <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STEPS.map((s, i) => (
        <li key={s.title} className={`rounded-3xl border-2 border-b-[6px] p-6 text-center transition-transform hover:-translate-y-1 ${s.card}`}>
          <span className={`inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-4 text-white border-b-4 border-black/15 ${s.badge}`}>
            <s.icon className="w-8 h-8" strokeWidth={2.5} aria-hidden />
          </span>
          <p className="text-sm font-bold text-gray-500 mb-1">Step {i + 1}</p>
          <p className="font-bold text-xl text-ink leading-snug mb-2">{s.title}</p>
          <p className="text-gray-600 leading-relaxed">{s.body}</p>
        </li>
      ))}
    </ol>
  )
}

interface Band {
  bg: string
  heading: string
  chip: string
}

const BANDS: Band[] = [
  { bg: 'bg-sky', heading: 'text-brand-600', chip: 'bg-brand-500' },
  { bg: 'bg-sun-50', heading: 'text-amber-500', chip: 'bg-amber-400' },
  { bg: 'bg-grape-50', heading: 'text-grape-500', chip: 'bg-grape-400' },
  { bg: 'bg-teal-50', heading: 'text-teal-500', chip: 'bg-teal-400' },
]

/** One step: a band of colour, the bird doing the step, the headline, and the product. */
function StorySection({ step, title, children, art, bird, flip = false }: {
  step: number
  title: string
  children: React.ReactNode
  art: React.ReactNode
  bird: BirdPose
  flip?: boolean
}) {
  const band = BANDS[step - 1]
  return (
    <section className={`relative overflow-hidden ${band.bg}`}>
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className={flip ? 'lg:order-2' : undefined}>
          <div className="flex items-center gap-3 mb-4">
            <Bird pose={bird} className="w-28 h-28 shrink-0 -ml-3 animate-float-slow motion-reduce:animate-none" />
            <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-bold text-white ${band.chip}`}>Step {step}</span>
          </div>
          <h2 className={`text-4xl sm:text-5xl font-bold tracking-tight mb-5 leading-[1.08] ${band.heading}`}>{title}</h2>
          <div className="text-lg text-gray-700 leading-relaxed space-y-3">{children}</div>
        </div>
        <div className={`relative ${flip ? 'lg:order-1' : ''}`}>{art}</div>
      </div>
    </section>
  )
}

/** What the child sees: one question, big answers, and "I'm not sure". */
function TestScreen() {
  return (
    <div className="relative px-2">
      <PencilSticker className="absolute -top-10 -left-4 w-20 h-20 animate-wiggle motion-reduce:animate-none" />
      <Star className="absolute -bottom-6 -right-2 w-14 h-14 animate-float motion-reduce:animate-none" />
      <div className="card p-6 rotate-1">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-sm font-bold text-gray-500 whitespace-nowrap">Question 5 of 24</span>
          <div className="flex-1 h-4 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full w-1/5 rounded-full bg-teal-400 relative">
              <span className="absolute left-2 right-2 top-1 h-1 rounded-full bg-white/40" />
            </div>
          </div>
        </div>
        <p className="text-xl font-bold text-ink mb-4">What number makes this number sentence true?</p>
        <p className="text-3xl font-bold text-ink mb-5">☐ + 8 = 15</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {['6', '7', '8', '9'].map((o, i) => (
            <div
              key={o}
              className={`flex items-center gap-3 rounded-2xl border-2 border-b-4 px-4 py-3 text-lg font-bold ${
                i === 1 ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line bg-white text-ink'
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
    <div className="relative px-2">
      <BlockSticker className="absolute -top-8 -right-2 w-16 h-16 rotate-12 animate-float motion-reduce:animate-none" letter="?" fill="#CE82FF" />
      <Sparkle className="absolute -bottom-4 -left-2 w-10 h-10" fill="#CE82FF" />
      <div className="card p-6 -rotate-1">
        <p className="font-bold text-ink text-xl mb-1">A few more questions</p>
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

const PROGRESS = SHOWCASE?.progress ?? null

export default function ParentStory() {
  return (
    <>
      <StorySection step={1} bird="think" title="A short test that feels like a game." art={<TestScreen />}>
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
        step={2}
        bird="search"
        title="See exactly what they know, and what they don't yet."
        art={
          <div className="relative px-2">
            <CheckSticker className="absolute -top-6 -right-1 w-14 h-14 z-10 animate-float motion-reduce:animate-none" />
            <BookSticker className="absolute -bottom-8 -left-4 w-20 h-16 z-10 -rotate-12" />
            <SampleReport />
          </div>
        }
        flip
      >
        <p>
          You get a clear report, weakest area first: the specific skills to work on, the ones that are already secure,
          and every question explained.
        </p>
        <p>Each area comes with three practical ways to help at home, written for parents, not teachers.</p>
      </StorySection>

      <StorySection step={3} bird="think" title="Built not to over-read a short test." art={<FineTuning />}>
        <p>
          One wrong answer is never called a weakness. Where a result could go either way, the test asks a few more
          questions, and every area says how firm its result is.
        </p>
        <p>Each re-test adds to the picture, so it gets more accurate the more your child uses it.</p>
      </StorySection>

      <StorySection
        step={4}
        bird="trophy"
        title="Practice made for them, and progress you can see."
        art={
          PROGRESS ? (
            <div className="relative px-2">
              <MedalSticker className="absolute -top-10 -right-2 w-16 h-20 z-10 rotate-12 animate-float motion-reduce:animate-none" />
              <ProgressPanel profile={PROGRESS} name="Mia" />
            </div>
          ) : null
        }
        flip
      >
        <p>
          Then you generate practice papers on your child&apos;s weak spots — on screen, with a pad for working out, or
          printed with an answer key. Three a month are included in the plan for Grade 3 to Year 10, and each is{' '}
          {VCE_PAPER_PRICE} for VCE.
        </p>
        <p>
          Re-test every few weeks. It never repeats a question, and your dashboard shows each area improving, slipping or
          holding steady.
        </p>
        <p>
          <Link href={'/diagnostic' as Route} className="btn-primary inline-block mt-2 text-lg px-8 py-3">
            Start the free test
          </Link>
        </p>
      </StorySection>
    </>
  )
}
