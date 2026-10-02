import type { Metadata } from 'next'
import { BarChart3, CheckCircle2, ClipboardList, FileText, RefreshCw, ShieldCheck } from 'lucide-react'
import DiagnosticSetup, { type SetupTest } from '@/components/diagnostic/DiagnosticSetup'
import FAQAccordion from '@/components/home/FAQAccordion'
import { faqsIn } from '@/lib/faqs'
import { OFFERED } from '@/lib/diagnostic/server'
import { followUpBudget } from '@/lib/diagnostic/followup'
import { VCE_PAPER_PRICE } from '@/lib/pricing'
import type { YearLevel } from '@/types'

export const metadata: Metadata = {
  title: 'Free diagnostic test — find out where your child needs help | PrepNest',
  description:
    'A free on-screen test for Grade 3 to Year 12 that pinpoints your child’s strengths and the exact skills to work on, with a report for parents and a practice exam built around the result.',
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
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-600 mb-3">Free diagnostic test</p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">Find out exactly where your child needs help.</h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-6">
          Your child sits a short test on screen in one subject at their year level. You get a clear report of what they are
          confident with, the specific skills to work on and how to help at home — and a practice exam built around the
          result.
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
          {['Free test and full report', 'About 20–35 minutes', 'No account needed to start'].map(f => (
            <li key={f} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-14">
        <DiagnosticSetup tests={tests} initialYear={initialYear} />
      </section>

      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-14">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-8 text-center">How it works</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <HowStep icon={ClipboardList} n={1} title="The test" body="One question at a time, on screen. Then a few follow-up questions chosen from the answers, to check anything that could go either way." />
            <HowStep icon={BarChart3} n={2} title="The report" body="Every area of the subject, weakest first: the skills answered right and wrong, how firm each result is, and three ways to help at home." />
            <HowStep icon={FileText} n={3} title="The practice exam" body={`A printable paper and answer key built from the result, most of it on the areas to work on. Included in the plan; ${VCE_PAPER_PRICE} for VCE.`} />
            <HowStep icon={RefreshCw} n={4} title="Re-test" body="A few weeks later, sit it again. It never repeats a question, and the report shows each area going up, down or holding steady." />
          </ol>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-14">
        <div className="flex items-start gap-3 mb-4">
          <ShieldCheck className="w-6 h-6 text-brand-600 shrink-0 mt-0.5" aria-hidden />
          <h2 className="text-xl font-semibold tracking-tight">Built not to over-read a short test</h2>
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
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">Questions parents ask</h2>
        <FAQAccordion items={faqsIn('diagnostic')} />
      </section>
    </main>
  )
}

function HowStep({ icon: Icon, n, title, body }: { icon: React.ComponentType<{ className?: string }>; n: number; title: string; body: string }) {
  return (
    <li className="card">
      <Icon className="w-6 h-6 text-brand-600 mb-3" />
      <p className="text-xs text-gray-400 mb-1">Step {n}</p>
      <p className="font-medium text-gray-900 mb-1.5">{title}</p>
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
