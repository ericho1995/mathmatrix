import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy — PrepNest' }

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10 flex-1 w-full prose-sm">
      <h1 className="text-2xl font-medium tracking-tight mb-1">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: 8 September 2026</p>

      <div className="flex flex-col gap-6 text-sm text-gray-600 leading-relaxed">
        <p>
          PrepNest (&quot;we&quot;, &quot;us&quot;) provides curriculum-aligned practice exams for
          Australian students. This page explains what we collect, why, and how it&apos;s
          used. It applies to prepnest.com.au and any subdomain.
        </p>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">What we collect</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Account details: name, email address, and account role (student, parent, or admin).</li>
            <li>For students: year level, and practice activity — questions attempted, answers, accuracy, time taken, XP and streaks.</li>
            <li>For parents: the invite code used to link to a student&apos;s account, and read-only access to that student&apos;s progress.</li>
            <li>Standard technical data collected by our hosting provider (Vercel) and database provider (Supabase), such as IP address and request logs, for security and reliability.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Why we collect it</h2>
          <p>
            Solely to run the product: authenticate accounts, personalise practice content to
            year level, track progress and streaks, power the leaderboard, and let a linked
            parent see their child&apos;s accuracy by topic. We do not sell personal data, and we
            do not use it for advertising.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Children&apos;s accounts</h2>
          <p>
            PrepNest is designed for use by school-age students. Where a student is a child,
            we rely on a parent or guardian to review this policy and to use the parent-linking
            feature to oversee their child&apos;s account. We collect the minimum information
            needed to run the practice and progress-tracking features described above.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Who can see your data</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>You can always see and manage your own account data.</li>
            <li>A parent can see a linked student&apos;s progress once that student redeems the parent&apos;s invite code — never the reverse, and never before linking.</li>
            <li>The leaderboard shows a student&apos;s first name, last initial, year level, and weekly XP to other signed-in users. It never shows accuracy, answers, or email address.</li>
            <li>Admins can manage the question bank but do not see individual student answers as part of normal operation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Where it&apos;s stored</h2>
          <p>
            Data is stored with Supabase (PostgreSQL, hosted in Australia where available) and
            the app is hosted on Vercel. Both are reputable infrastructure providers used widely
            by production applications; access is protected by database-level row security so
            that, for example, one student can never read another student&apos;s answers.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Your rights</h2>
          <p>
            You can request a copy of your data, ask us to correct it, or ask us to delete your
            account and associated data at any time by contacting us (see below). We&apos;ll
            action deletion requests within a reasonable time, except where we&apos;re required
            to retain something by law.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Contact</h2>
          <p>
            Questions about this policy or your data: <a href="mailto:privacy@prepnest.com.au" className="text-brand-600 hover:underline">privacy@prepnest.com.au</a>.
          </p>
        </section>

        <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
          This is a plain-language summary of our practices, not a substitute for formal legal
          advice. Before launch, have this reviewed against the Australian Privacy Act 1988
          (and the Australian Privacy Principles) given the product handles children&apos;s data.
        </p>
      </div>
    </main>
  )
}
