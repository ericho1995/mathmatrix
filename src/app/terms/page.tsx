import type { Metadata } from 'next'
import Link from 'next/link'
import { BUNDLE_PRICE, REFUND_DAYS } from '@/lib/pricing'
import { SUPPORT_EMAIL } from '@/lib/site'

export const metadata: Metadata = { title: 'Terms of Service — PrepNest' }

function Contact() {
  return SUPPORT_EMAIL ? (
    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-600 hover:underline">{SUPPORT_EMAIL}</a>
  ) : (
    <Link href="/help" className="text-brand-600 hover:underline">the help centre</Link>
  )
}

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10 flex-1 w-full">
      <h1 className="text-2xl font-medium tracking-tight mb-1">Terms of Service</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: 22 September 2026</p>

      <div className="flex flex-col gap-6 text-sm text-gray-600 leading-relaxed">
        <p>
          By creating a PrepNest account, buying papers, or using the practice tools at prepnest.com.au, you
          agree to these terms. If you&apos;re under 18, a parent or guardian should read these terms with you,
          and purchases should be made by a parent or guardian.
        </p>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">The service</h2>
          <p>
            PrepNest provides practice exam papers written to the style of NAPLAN and VCE exams and aligned to
            the Australian Curriculum v9.0, for students from Grade 3 to Year 12. Each paper is a printable exam
            with a separate answer key. Practice questions and one sample paper per subject at every year level
            are free.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Buying papers</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>
              A year-level bundle costs {BUNDLE_PRICE} (Australian dollars) and unlocks every paid paper for that
              year level, across every subject at that level. It is a one-off payment, not a subscription, and
              there are no recurring charges.
            </li>
            <li>Access is attached to the account that made the purchase and does not expire.</li>
            <li>
              Payments are processed by Stripe on its secure checkout page. PrepNest never sees or stores your
              card details. Stripe emails you a receipt.
            </li>
            <li>The papers included in a bundle are the ones listed on the exam papers page at the time you buy.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Refunds</h2>
          <p>
            If you change your mind, email us within {REFUND_DAYS} days of your purchase from the address on your
            account and we will refund you in full, whether or not you have downloaded any papers. After{' '}
            {REFUND_DAYS} days, we will still fix or refund a purchase that doesn&apos;t work as described.
          </p>
          <p className="mt-2">
            Nothing in these terms limits your rights under the Australian Consumer Law, including your rights to
            a refund or remedy where a product has a major problem.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Using the papers</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Papers are for use by the students in your own household. Print as many copies as they need.</li>
            <li>
              Please don&apos;t share, upload, resell or distribute the papers or answer keys. Teachers and tutors who
              want to use them with a class or with students outside their household can contact us about a
              licence.
            </li>
            <li>The questions, papers and answer keys are original PrepNest content and remain our property.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Accounts</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>You&apos;re responsible for keeping your login credentials secure.</li>
            <li>
              One account per person. Parent accounts link to a student account via a one-time invite code the
              parent generates and shares directly with their child.
            </li>
            <li>Give us accurate information, in particular a student&apos;s year level, so the content we show fits.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Acceptable use</h2>
          <p>
            Don&apos;t attempt to disrupt the service, scrape the question bank, get around the paywall, or use an
            account that belongs to someone else. We may suspend accounts that do.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Content accuracy</h2>
          <p>
            PrepNest papers are practice material. They are not official NAPLAN or VCAA papers and are not endorsed
            by ACARA or VCAA. We check every question, but we can&apos;t guarantee every question is error-free — if
            you spot a mistake, please tell us and we will fix it.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Availability</h2>
          <p>
            We aim to keep PrepNest available and reliable but can&apos;t guarantee uninterrupted access. We may take
            the service down briefly for maintenance.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Changes</h2>
          <p>
            We may update these terms as the product evolves. Changes don&apos;t affect a purchase you have already
            made. Continued use after an update means you accept the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Contact</h2>
          <p>
            Questions about these terms, or a refund request: <Contact />.
          </p>
        </section>
      </div>
    </main>
  )
}
