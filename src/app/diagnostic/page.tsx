import type { Metadata } from 'next'
import { BarChart3, CheckCircle2, ClipboardList, FileText, RefreshCw, type LucideIcon } from 'lucide-react'
import DiagnosticSetup, { type SetupTest } from '@/components/diagnostic/DiagnosticSetup'
import Bird from '@/components/brand/Bird'
import { BlockSticker, Cloud, PencilSticker, Sparkle, Star, Wave } from '@/components/brand/Decor'
import FAQAccordion from '@/components/home/FAQAccordion'
import { faqsIn } from '@/lib/faqs'
import { OFFERED } from '@/lib/diagnostic/server'
import { followUpBudget } from '@/lib/diagnostic/followup'
import { VCE_PAPER_PRICE } from '@/lib/pricing'
import type { YearLevel } from '@/types'

export const metadata: Metadata = {
  title: 'Free diagnostic test — find out where your child needs help | PrepNest',
  description:
    'A free on-screen test for Grade 3 to Year 12 that pinpoints your child’s strengths and the exact skills to work on, with a report for parents and practice papers built on the weak areas.',
}

const YEARS = new Set(['grade_3', 'grade_4', 'grade_5', 'grade_6', 'year_7', 'year_8', 'year_9', 'year_10', 'year_11', 'year_12'])

/**
 * The diagnostic's front door. A parent chooses the year and subject here; the
 * child sits the test on the next screen.
 */
export default function DiagnosticPage({ searchParams }: { searchParams: { year?: string } }) {
  const tests: SetupTest[] = OFFERED.map(o => {
    const extra = followUpBudget(o.subject, o.year)
    const perQuestion = o.minutes / o.questions
    return {
      year: o.year,
      subject: o.subject,
      questions: o.questions,
      followUps: extra,
      minutes: [o.minutes, Math.round((o.minutes + extra * perQuestion) / 5) * 5],
    }
  })
  const initialYear = searchParams.year && YEARS.has(searchParams.year) ? (searchParams.year as YearLevel) : undefined

  return (
    <main className="flex-1 w-full">
      <section className="relative overflow-hidden bg-brand-600 text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-brand-500 hidden md:block" />
          <Cloud className="absolute top-8 left-[4%] w-32 opacity-20" />
          <Sparkle className="absolute top-12 left-[52%] w-6 h-6" />
          <Star className="absolute bottom-16 left-[6%] w-8 h-8 hidden sm:block" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 pt-10 pb-10 grid sm:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
        <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold mb-4">Free diagnostic test</span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">Find out exactly where your child needs help.</h1>
        <p className="text-white text-lg font-semibold leading-relaxed mb-6">
          Your child sits a short test on screen in one subject at their year level. You get a clear report of what they are
          confident with, the specific skills to work on and how to help at home — and practice papers on the areas to work
          on, to sit on screen or print.
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold">
          {['Free test and full report', 'About 20–35 minutes', 'No account needed to start'].map(f => (
            <li key={f} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-teal-400" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
        </div>
        <div className="relative hidden sm:block">
          <div className="w-52 h-52 rounded-full bg-sun-400 border-8 border-white/25 flex items-center justify-center">
            <Bird pose="nest" className="w-44 h-44 animate-float motion-reduce:animate-none" />
          </div>
          <PencilSticker className="absolute -top-4 -left-8 w-16 h-16 animate-wiggle motion-reduce:animate-none" />
          <BlockSticker className="absolute -bottom-2 -right-4 w-12 h-12 rotate-12" letter="B" fill="#CE82FF" />
        </div>
        </div>
        <Wave fill="#DDF4FF" />
      </section>

      <section className="bg-sky -mt-px">
        <div className="max-w-3xl mx-auto px-4 pt-2 pb-16">
          <DiagnosticSetup tests={tests} initialYear={initialYear} />
        </div>
      </section>

      <section>
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold tracking-tight text-ink mb-10 text-center">How it works</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <HowStep tone={TONES[0]} icon={ClipboardList} n={1} title="The test" body="One question at a time, on screen. Then a few follow-up questions chosen from the answers, to check anything that could go either way." />
            <HowStep tone={TONES[1]} icon={BarChart3} n={2} title="The report" body="Every area of the subject, weakest first: the skills answered right and wrong, how firm each result is, and three ways to help at home." />
            <HowStep tone={TONES[2]} icon={FileText} n={3} title="Practice papers" body={`Papers built only on the areas to work on, new every time — sat on screen or printed with an answer key. Three a month in the plan; ${VCE_PAPER_PRICE} each for VCE.`} />
            <HowStep tone={TONES[3]} icon={RefreshCw} n={4} title="Re-test" body="A few weeks later, sit it again. It never repeats a question, and the report shows each area going up, down or holding steady." />
          </ol>
        </div>
      </section>

      <section className="bg-grape-50">
        <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-5">
          <Bird pose="think" className="w-24 h-24 shrink-0" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-grape-500">Built not to over-read a short test</h2>
        </div>
        <p className="text-gray-600 leading-relaxed mb-4">
          A child can miss a question they know. So the test never turns one wrong answer into a weakness:
        </p>
        <ul className="space-y-3 text-gray-600">
          <Reason title="Every result says how firm it is.">
            Each area is a <em>clear result</em>, <em>likely</em>, or an <em>early sign</em>, depending on how many questions
            back it up. An early sign is never called a weakness.
          </Reason>
          <Reason title="Unsettled results get more questions.">
            After the first part, the test asks again where the answer could still go either way, and asks a second question
            on any skill missed once, to tell a slip from a gap.
          </Reason>
          <Reason title="Luck is left out.">
            Answers your child marks as a guess, and answers tapped in a couple of seconds, count in the score but not as
            evidence.
          </Reason>
          <Reason title="Re-tests add up.">
            Each sitting is combined with the ones before it, so the picture firms up — and shows progress — over time.
          </Reason>
        </ul>
        <p className="text-sm text-gray-500 mt-5">
          It is a snapshot from a short test, not a formal assessment or a comparison with other children.
        </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold tracking-tight text-ink text-center mb-8">Questions parents ask</h2>
        <FAQAccordion items={faqsIn('diagnostic')} />
      </section>
    </main>
  )
}

const TONES = [
  { card: 'bg-brand-50 border-brand-200', badge: 'bg-brand-500' },
  { card: 'bg-amber-50 border-amber-200', badge: 'bg-amber-400' },
  { card: 'bg-grape-50 border-grape-200', badge: 'bg-grape-400' },
  { card: 'bg-teal-50 border-teal-200', badge: 'bg-teal-400' },
]

function HowStep({ tone, icon: Icon, n, title, body }: { tone: (typeof TONES)[number]; icon: LucideIcon; n: number; title: string; body: string }) {
  return (
    <li className={`rounded-3xl border-2 border-b-[6px] p-5 ${tone.card}`}>
      <span className={`inline-flex w-12 h-12 rounded-2xl text-white border-b-4 border-black/15 items-center justify-center mb-3 ${tone.badge}`}>
        <Icon className="w-6 h-6" strokeWidth={2.5} />
      </span>
      <p className="text-sm font-bold text-gray-500 mb-1">Step {n}</p>
      <p className="font-bold text-lg text-ink mb-1.5">{title}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
    </li>
  )
}

function Reason({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" aria-hidden />
      <span>
        <strong className="font-medium text-gray-900">{title}</strong> {children}
      </span>
    </li>
  )
}
