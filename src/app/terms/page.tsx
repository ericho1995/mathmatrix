import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service — PrepNest' }

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10 flex-1 w-full">
      <h1 className="text-2xl font-medium tracking-tight mb-1">Terms of Service</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: 8 September 2026</p>

      <div className="flex flex-col gap-6 text-sm text-gray-600 leading-relaxed">
        <p>
          By creating a PrepNest account or using the practice tools at prepnest.com.au, you
          agree to these terms. If you&apos;re under 18, a parent or guardian should read these
          terms with you.
        </p>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">The service</h2>
          <p>
            PrepNest provides curriculum-aligned practice questions, exams, and progress
            tracking for Australian students from Grade 3 to Year 12. The core practice
            experience is free. We may introduce paid plans with additional features in the
            future; if we do, existing free features won&apos;t be taken away without notice.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Accounts</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>You&apos;re responsible for keeping your login credentials secure.</li>
            <li>One account per person. Parent accounts link to a student account via a one-time invite code the parent generates and shares directly with their child.</li>
            <li>Give us accurate information (in particular, a student&apos;s year level) so the content we show is appropriately levelled.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Acceptable use</h2>
          <p>
            Use PrepNest for your own study or, as a parent, to support your child&apos;s study.
            Don&apos;t attempt to disrupt the service, scrape or resell the question bank, or use
            an account belonging to someone else.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Content accuracy</h2>
          <p>
            We align questions to the Australian Curriculum v9.0 and check them for accuracy,
            but PrepNest is a practice tool, not a substitute for classroom teaching or official
            exam preparation materials, and we can&apos;t guarantee every question is error-free.
            If you spot a mistake, please tell us — see the contact details below.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Availability</h2>
          <p>
            We aim to keep PrepNest available and reliable but don&apos;t guarantee
            uninterrupted access. We may take the service down briefly for maintenance, and
            reserve the right to suspend accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Changes</h2>
          <p>
            We may update these terms as the product evolves. Continued use after an update
            means you accept the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Contact</h2>
          <p>
            Questions about these terms: <a href="mailto:support@prepnest.com.au" className="text-brand-600 hover:underline">support@prepnest.com.au</a>.
          </p>
        </section>

        <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
          This is a plain-language starting point, not a substitute for formal legal advice.
          Have a solicitor review these terms before launch, particularly if you introduce
          paid plans or school/institutional licensing.
        </p>
      </div>
    </main>
  )
}
