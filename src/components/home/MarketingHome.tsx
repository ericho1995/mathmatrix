import Link from 'next/link'
import Image from 'next/image'
import type { Route } from 'next'
import FAQAccordion from '@/components/home/FAQAccordion'
import { BUNDLE_PRICE } from '@/lib/pricing'
import { CATALOGUE_TOTALS } from '@/lib/catalogue'
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
 * No testimonials or usage claims: there are none yet, and inventing them is
 * both dishonest and a consumer-law problem.
 */
export default function MarketingHome() {
  const naplan = nextNaplanWindow()
  const naplanDays = naplan ? daysUntil(naplan.start) : null
  const vceDays = daysUntil(VCE_EXAM_PERIOD_2026.start)
  const vceOver = daysUntil(VCE_EXAM_PERIOD_2026.end) < 0

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-14 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-4 leading-tight">
              Practice exams that <span className="text-brand-400">feel like the real thing.</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              Printable NAPLAN and VCE practice papers for {CATALOGUE_TOTALS.lowest} to {CATALOGUE_TOTALS.highest},
              each with a separate answer key. Sit one at home, mark it in minutes, and see exactly which topics to
              work on next.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
              <Link href="/practice/exams" className="btn-primary text-center">
                Download a free paper
              </Link>
              <Link href={'/pricing' as Route} className="btn-secondary text-center">
                See pricing
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-gray-400">
              <span>✓ {CATALOGUE_TOTALS.free} papers free</span>
              <span>✓ No credit card to start</span>
              <span>✓ {BUNDLE_PRICE} per year level, no subscription</span>
            </div>
          </div>

          <div className="w-full max-w-sm mx-auto lg:max-w-none relative aspect-[4/3] rounded-3xl overflow-hidden">
            <Image
              src="/images/hero-student.jpg"
              alt="A student working through a practice paper at a desk"
              fill
              priority
              sizes="(min-width: 1024px) 480px, 384px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* What's coming up — the reason a parent is looking today. */}
      {(naplan || !vceOver) && (
        <section className="border-y border-gray-100 bg-brand-50/60">
          <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-x-10 gap-y-2 text-sm text-center">
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
      <section className="max-w-3xl mx-auto px-4 py-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-center">
        {[
          { value: CATALOGUE_TOTALS.papers, label: 'practice papers' },
          { value: CATALOGUE_TOTALS.free, label: 'free to download' },
          { value: CATALOGUE_TOTALS.questions.toLocaleString('en-AU'), label: 'questions' },
          { value: CATALOGUE_TOTALS.subjects, label: 'subjects' },
        ].map(s => (
          <div key={s.label}>
            <p className="text-xl font-medium text-brand-600">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Choose your exam */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-6 text-center">
          Choose your exam
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ExamCard
            href="/naplan"
            eyebrow="Years 3, 5, 7 & 9"
            title="NAPLAN"
            body="Numeracy, Reading and Language Conventions papers in the NAPLAN format, pitched at each year level."
          />
          <ExamCard
            href="/practice/exams"
            eyebrow="Grade 3 – Year 10"
            title="School years"
            body="Maths, English and Science papers for every year, so practice carries on between NAPLAN years."
          />
          <ExamCard
            href="/vce"
            eyebrow="Year 11 & 12"
            title="VCE"
            body="Methods, General, Specialist, Chemistry and Physics, laid out like VCAA papers with reading time."
          />
        </div>
      </section>

      {/* The loop that makes a paper worth more than its answers. */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-10 text-center">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Download',
                body: 'Start with the free paper for your year level. Each comes with a separate answer key.',
              },
              {
                step: '2',
                title: 'Sit it',
                body: 'Print it and sit it in one go, timed, the way the real test runs.',
              },
              {
                step: '3',
                title: 'Mark it',
                body: 'Use the answer key, then tap only the questions that were wrong. It takes minutes.',
              },
              {
                step: '4',
                title: 'Practise the gaps',
                body: 'See which topics lost marks and jump straight into practice on exactly those.',
              },
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
          <p className="text-sm text-gray-500 text-center mt-10">
            Prefer something shorter?{' '}
            <Link href="/practice" className="text-brand-600 underline">
              Free on-screen quizzes
            </Link>{' '}
            on any topic, with an explanation for every answer.
          </p>
        </div>
      </section>

      {/* Pricing, stated plainly on the homepage. */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="card sm:flex sm:items-center sm:gap-8 text-center sm:text-left">
          <div className="sm:w-40 shrink-0 mb-4 sm:mb-0">
            <p className="text-4xl font-medium tracking-tight text-brand-600">{BUNDLE_PRICE}</p>
            <p className="text-xs text-gray-400">once, per year level</p>
          </div>
          <div className="flex-1">
            <p className="font-medium mb-1">One payment unlocks every paper for a year level.</p>
            <p className="text-sm text-gray-500 mb-4">
              Every subject at that level, each with an answer key. No subscription. The first paper in every subject
              is free, so you can see what you are buying before you buy it.
            </p>
            <Link href={'/pricing' as Route} className="text-sm text-brand-600 underline">
              See what each year level includes
            </Link>
          </div>
        </div>
      </section>

      {/* Parent value prop */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">For parents</h2>
              <h3 className="text-2xl font-medium tracking-tight mb-3">See exactly where they need help.</h3>
              <p className="text-gray-500 leading-relaxed mb-5">
                Link your account to your child&apos;s with a one-time invite code. Every paper you mark and every
                quiz they finish builds up their accuracy by topic, so you know where an hour of practice is best
                spent.
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
              {/* Illustrative, and labelled as such — these are not real results. */}
              <div className="card absolute -bottom-0 -right-0 w-56 shadow-lg">
                <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">Topic performance</p>
                <p className="text-[10px] text-gray-300 mb-3">Example</p>
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
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
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
      <section className="bg-brand-600">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white mb-3">
            Start with a free paper tonight.
          </h2>
          <p className="text-brand-100 mb-7">No account needed to download or mark it.</p>
          <Link
            href="/practice/exams"
            className="inline-block bg-white text-brand-600 font-medium px-6 py-3 rounded-xl hover:bg-brand-50 transition-all"
          >
            Browse free papers
          </Link>
        </div>
      </section>
    </main>
  )
}

function ExamCard({ href, eyebrow, title, body }: { href: string; eyebrow: string; title: string; body: string }) {
  return (
    <Link
      href={href as Route}
      className="card hover:border-gray-200 hover:shadow-md transition-all flex flex-col group"
    >
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">{eyebrow}</p>
      <p className="text-xl font-medium tracking-tight mb-2 group-hover:text-brand-600">{title}</p>
      <p className="text-sm text-gray-500 leading-relaxed flex-1">{body}</p>
      <p className="text-sm text-brand-600 mt-4">See papers →</p>
    </Link>
  )
}
