import { notFound } from 'next/navigation'
import { Check, NotebookPen, PenLine, Timer } from 'lucide-react'
import Bird, { BirdMark, type BirdPose } from '@/components/brand/Bird'
import { BookSticker, CheckSticker, Cloud, PencilSticker, Sparkle, Star } from '@/components/brand/Decor'
import StaticQuestion from './StaticQuestion'
import HeadlineResults from '@/components/diagnostic/HeadlineResults'
import AreaCard from '@/components/diagnostic/report/AreaCard'
import LevelChip from '@/components/diagnostic/LevelChip'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { catalogueOnlinePaper } from '@/lib/exams/onScreen'
import { BY_ID } from '@/lib/diagnostic/server'
import { richHtml } from '@/lib/web/mathHtml'
import { SHOWCASE } from '@/lib/diagnostic/showcase'
import { guidanceFor } from '@/lib/diagnostic/guidance'

export const dynamic = 'force-dynamic'

// ─────────────────────────────────────────────────────────────────────────────
// Development only: Instagram artboards, drawn with the real product — the
// question screen, the report, the bird — at Instagram's sizes, for
// marketing/instagram/render-social.mjs to capture with headless Edge.
//
//   /dev/social/<id>   1080×1350 feed posts, 1080×1080 profile pictures
//
// Ad copy rules: no emoji, no em dashes, "practice" as the verb, calls to
// action say "try … now". Every product picture is the real component with
// the shared sample child (lib/diagnostic/showcase.ts) or a real free paper.
// ─────────────────────────────────────────────────────────────────────────────

const PAPER = 'math-grade_5-1'

function question(n: number) {
  const exam = PRACTICE_EXAMS.find(e => e.id === PAPER)!
  const paper = catalogueOnlinePaper(exam)!
  const q = paper.sections.flatMap(s => s.questions).find(x => x.n === n)!
  const bank = BY_ID.get(q.id)!
  const answer =
    bank.format === 'short_answer'
      ? richHtml(bank.expected_answer)
      : 'correct_index' in bank && typeof bank.correct_index === 'number'
        ? `${'ABCD'[bank.correct_index]}. ${richHtml(bank.options[bank.correct_index])}`
        : ''
  return { q, answer, explanation: richHtml(bank.explanation) }
}

/** The fixed frame: brand in the bottom-left corner on every post, the slide count top-right. */
function Board({ bg, children, slide, size = 'feed' }: { bg: string; children: React.ReactNode; slide?: string; size?: 'feed' | 'square' }) {
  return (
    <div className={`fixed left-0 top-0 z-[100] overflow-hidden ${bg}`} style={{ width: 1080, height: size === 'feed' ? 1350 : 1080 }}>
      {children}
      {slide && <span className="absolute top-10 right-12 rounded-full bg-white/90 px-5 py-2 text-2xl font-bold text-gray-600">{slide}</span>}
      {size === 'feed' && (
        <div className="absolute left-12 right-12 bottom-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-sm">
            <BirdMark className="w-12 h-12" />
            <span className="text-4xl font-bold tracking-tight text-ink">
              Prep<span className="text-brand-500">Nest</span>
            </span>
          </span>
          <span className="text-2xl font-bold text-ink/70">prepnest.com.au</span>
        </div>
      )}
    </div>
  )
}

function Headline({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h1 className={`text-[84px] leading-[1.02] font-bold tracking-tight ${className}`}>{children}</h1>
}

function BirdBubble({ pose, children, className = '' }: { pose: BirdPose; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-end gap-4 ${className}`}>
      <Bird pose={pose} className="w-72 h-72 shrink-0" />
      <p className="mb-16 max-w-[680px] rounded-[2rem] rounded-bl-md bg-white border-4 border-line px-8 py-6 text-4xl font-bold text-ink leading-snug">{children}</p>
    </div>
  )
}

const BOARDS: Record<string, () => React.ReactNode> = {
  // ── Profile pictures: Instagram crops to a circle, so the bird fills the middle. ──
  'profile-sun': () => (
    <Board bg="bg-brand-500" size="square">
      <div className="absolute inset-[36px] rounded-full bg-sun-400 border-[18px] border-white/30 flex items-center justify-center">
        <Bird pose="nest" className="w-[900px] h-[900px] translate-y-[-20px]" />
      </div>
    </Board>
  ),
  'profile-sky': () => (
    <Board bg="bg-sky" size="square">
      <div className="absolute inset-[36px] rounded-full bg-white flex items-center justify-center">
        <Bird pose="nest" className="w-[900px] h-[900px] translate-y-[-20px]" />
      </div>
    </Board>
  ),

  // ── Can your Grade 5 solve this? (Brilliant-style puzzle, then the answer) ──
  'puzzle-1': () => {
    const { q } = question(5)
    return (
      <Board bg="bg-sky" slide="1/2">
        <Star className="absolute top-[150px] right-16 w-16 h-16" />
        <div className="absolute left-12 right-12 top-24">
          <Headline className="text-brand-600 mb-8 text-[76px] max-w-[860px]">Can your Grade 5 solve this?</Headline>
          <div className="rounded-[2.5rem] bg-white border-4 border-b-[12px] border-line p-8" style={{ zoom: 1.32 }}>
            <StaticQuestion question={q} />
          </div>
          <p className="text-4xl font-bold text-ink mt-8">Answer in the comments. Swipe for the answer.</p>
        </div>
      </Board>
    )
  },
  'puzzle-2': () => {
    const { answer, explanation } = question(5)
    return (
      <Board bg="bg-teal-50" slide="2/2">
        <CheckSticker className="absolute top-20 right-48 w-24 h-24" />
        <div className="absolute left-12 right-12 top-28">
          <Headline className="text-teal-600 mb-10">The answer</Headline>
          <div className="rounded-[2.5rem] bg-white border-4 border-b-[12px] border-teal-200 p-12">
            <p className="text-6xl font-bold text-ink mb-6 flex items-center gap-4">
              <Check className="w-16 h-16 text-teal-600" strokeWidth={3} aria-hidden />
              <span dangerouslySetInnerHTML={{ __html: answer }} />
            </p>
            <p className="text-4xl text-gray-700 leading-snug" dangerouslySetInnerHTML={{ __html: explanation }} />
          </div>
          <p className="text-4xl text-ink leading-snug mt-10">
            From our free Grade 5 practice paper. Every answer comes explained like this.
          </p>
          <p className="mt-8 inline-block rounded-2xl bg-brand-600 border-b-8 border-brand-800 px-10 py-6 text-4xl font-bold text-white">Try the free paper now</p>
        </div>
        <Bird pose="cheer" className="absolute right-10 bottom-32 w-96 h-96" />
      </Board>
    )
  },

  // ── What one short test tells you (Oura / Notion: explain the data on real screens) ──
  'report-1': () => (
    <Board bg="bg-brand-600" slide="1/4">
      <Sparkle className="absolute top-[560px] left-[70%] w-14 h-14" />
      <Cloud className="absolute top-[640px] left-16 w-64 opacity-20" />
      <div className="absolute left-12 right-12 top-28 text-white">
        <Headline className="mb-8">One short test. A clear picture.</Headline>
        <p className="text-5xl font-semibold leading-snug text-white/95 max-w-[880px]">
          What your child knows, what they don’t yet, and how sure we are.
        </p>
      </div>
      <Bird pose="search" className="absolute right-10 bottom-36 w-[520px] h-[520px]" />
      <PencilSticker className="absolute left-24 bottom-60 w-40 h-40" />
    </Board>
  ),
  'report-2': () => (
    <Board bg="bg-sky" slide="2/4">
      <div className="absolute left-12 right-12 top-24">
        <Headline className="text-brand-600 mb-8 text-[72px]">Every area, weakest first</Headline>
        <div style={{ zoom: 1.45 }}>{SHOWCASE && <HeadlineResults headline={SHOWCASE.headline} sample />}</div>
      </div>
    </Board>
  ),
  'report-3': () => {
    const weakest = SHOWCASE?.report.areas[0]
    return (
      <Board bg="bg-sun-50" slide="3/4">
        <div className="absolute left-12 right-12 top-24">
          <Headline className="text-amber-600 mb-8 text-[72px]">The exact skills, and how to help</Headline>
          <div style={{ zoom: 1.4 }}>{weakest && SHOWCASE && <AreaCard area={weakest} subject={SHOWCASE.report.subject} year={SHOWCASE.report.year} name={SHOWCASE.name} />}</div>
        </div>
      </Board>
    )
  },
  'report-4': () => (
    <Board bg="bg-grape-50" slide="4/4">
      <div className="absolute left-12 right-12 top-28">
        <Headline className="text-grape-500 mb-10 text-[76px]">Never over-reads one test</Headline>
        <div className="space-y-6">
          {(
            [
              ['clear', 'Clear result', 'Enough questions agree. Act on it.'],
              ['likely', 'Likely', 'Most of the evidence agrees.'],
              ['early', 'Early sign', 'Too few questions. Never called a weakness.'],
            ] as const
          ).map(([c, t, b]) => (
            <div key={c} className="rounded-[2rem] bg-white border-4 border-b-[10px] border-line p-8">
              <p className="text-4xl font-bold text-ink mb-3">{t}</p>
              <div className="flex items-center gap-6">
                <span style={{ zoom: 1.8 }}>
                  <LevelChip level="focus" confidence={c} />
                </span>
              </div>
              <p className="text-3xl text-gray-600 mt-3">{b}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 inline-block rounded-2xl bg-brand-600 border-b-8 border-brand-800 px-10 py-6 text-4xl font-bold text-white">Try the free test now</p>
      </div>
    </Board>
  ),

  // ── On screen, with a working-out pad (Notion: the product on a flat colour) ──
  'screen-1': () => {
    const { q } = question(28)
    return (
      <Board bg="bg-brand-500">
        <div className="absolute left-12 right-12 top-24 text-white">
          <Headline className="mb-6 text-[76px]">Sit it on screen. Show your working.</Headline>
          <p className="text-4xl font-semibold text-white/95">Every practice paper, with a pad to draw or type beside each question.</p>
        </div>
        <div className="absolute left-12 top-[470px] w-[620px] rounded-[2.5rem] bg-white border-b-[12px] border-black/15 p-9">
          <div className="flex items-center justify-between mb-5 text-2xl font-bold text-gray-500">
            <span>Question 28</span>
            <span className="inline-flex items-center gap-2">
              <Timer className="w-7 h-7" aria-hidden />
              18:42
            </span>
          </div>
          <div style={{ zoom: 1.05 }}>
            <StaticQuestion question={q} />
          </div>
        </div>
        <div className="absolute right-12 top-[520px] w-[390px] h-[600px] rounded-[2.5rem] bg-white border-b-[12px] border-black/15 overflow-hidden flex flex-col">
          <div className="px-6 pt-6 pb-4 border-b-4 border-line">
            <p className="text-2xl font-bold text-gray-700">Working out</p>
            <div className="flex gap-3 mt-4">
              <span className="inline-flex items-center gap-2 rounded-xl border-4 border-line px-4 py-2 text-xl font-bold text-gray-500">
                <PenLine className="w-6 h-6" aria-hidden />
                Draw
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border-4 border-brand-500 bg-brand-50 px-4 py-2 text-xl font-bold text-brand-700">
                <NotebookPen className="w-6 h-6" aria-hidden />
                Notes
              </span>
            </div>
          </div>
          <div
            className="flex-1 p-6 text-3xl leading-[48px] text-ink font-semibold"
            style={{ backgroundImage: 'linear-gradient(to bottom, rgba(29,78,216,0.12) 1px, transparent 1px)', backgroundSize: '100% 48px' }}
          >
            <p>Design 1: 4 tiles</p>
            <p>Design 2: 7 tiles</p>
            <p>Design 3: 10 tiles</p>
            <p className="text-brand-700">+3 each time</p>
          </div>
        </div>
      </Board>
    )
  },

  // ── One tip to help at home (Big Life Journal: a weekly parent tip; Headspace: the character carries it) ──
  'tip-1': () => {
    const g = guidanceFor('math', 'grade_5', 'number_patterns')
    return (
      <Board bg="bg-sun-50">
        <Star className="absolute top-20 right-24 w-16 h-16" />
        <div className="absolute left-12 right-12 top-24">
          <p className="inline-block rounded-full bg-amber-400 px-6 py-2 text-3xl font-bold text-white mb-8">Help at home</p>
          <Headline className="text-amber-600 mb-10 text-[76px]">A 5-minute game for number patterns</Headline>
          <div className="rounded-[2.5rem] bg-white border-4 border-b-[12px] border-amber-200 p-12">
            <p className="text-5xl font-bold text-ink leading-snug">{g.tips[0].replace(/\s*—\s*/g, ': ').replace(/"([^"]*)"/g, '“$1”')}</p>
          </div>
          <p className="text-4xl text-gray-700 leading-snug mt-10">One of three tips in every area of your child’s free report.</p>
        </div>
        <Bird pose="read" className="absolute right-10 bottom-32 w-80 h-80" />
      </Board>
    )
  },

  // ── The mascot moment (Duolingo: the character reacts; Starface: celebrate, don’t hide) ──
  'skip-1': () => (
    <Board bg="bg-grape-50">
      <Sparkle className="absolute top-24 left-24 w-12 h-12" fill="#CE82FF" />
      <BookSticker className="absolute top-[600px] right-24 w-44 h-32 -rotate-12" />
      <div className="absolute left-12 right-12 top-32">
        <Headline className="text-grape-500 mb-8">“I’m not sure” is a great answer.</Headline>
        <p className="text-5xl text-ink leading-snug max-w-[900px]">An honest skip tells us more than a lucky guess, so the report shows what your child really knows.</p>
      </div>
      <BirdBubble pose="think" className="absolute left-12 right-12 bottom-36">
        Take your time. Nobody expects you to know everything.
      </BirdBubble>
    </Board>
  ),
}

export default function SocialBoardPage({ params }: { params: { id: string } }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const board = BOARDS[params.id]
  if (!board) notFound()
  return board()
}
