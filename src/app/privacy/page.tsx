import type { Metadata } from 'next'
import Link from 'next/link'
import { SUPPORT_EMAIL } from '@/lib/site'

export const metadata: Metadata = { title: 'Privacy Policy — PrepNest' }

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10 flex-1 w-full prose-sm">
      <h1 className="text-2xl font-medium tracking-tight mb-1">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: 4 October 2026</p>

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
            <li>For diagnostic tests saved to an account: the answers given, how long each question took, whether an answer was changed or marked as a guess, the child&apos;s first name if you chose to give one, and, for practice papers built from a result, the answers given on screen and any marks entered. Before a result is saved, it is kept only in your browser.</li>
            <li>For purchases: which plan or paper you purchased, when, and Stripe&apos;s reference for the payment. Card details go to Stripe, never to us.</li>
            <li>Standard technical data collected by our hosting provider (Vercel) and database provider (Supabase), such as IP address and request logs, for security and reliability.</li>
            <li>Anonymous usage statistics (Vercel Web Analytics): which pages are visited and roughly where from. It uses no cookies and does not identify you.</li>
            <li>The advertising campaign you first arrived from, if any (for example a link from one of our Instagram ads), kept in a first-party cookie for 90 days and recorded with a purchase.</li>
            <li>Errors that happen in your browser while using the site (the error message, the page and the browser type), so we can fix them.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Why we collect it</h2>
          <p>
            Solely to run the product: authenticate accounts, personalise practice content to
            year level, track progress and streaks, power the leaderboard, and let a linked
            parent see their child&apos;s accuracy by topic. We do not sell personal data, and we
            never use a child&apos;s information, answers or results for advertising.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Advertising cookies</h2>
          <p>
            We advertise on Meta (Facebook and Instagram) and TikTok. If you choose <strong>Allow</strong> on our
            cookie notice, their tracking pixels load on this site so we can see which ads bring parents to
            PrepNest. They record that something happened (a page was visited, the free test was started or
            finished, a parent or teacher account was created, a checkout started or a purchase was made),
            never what a child answered or scored, and a student&apos;s sign-up is never reported. For a purchase,
            we also send Meta the purchase amount with the account&apos;s email address in hashed (scrambled) form
            so it can match the purchase to the ad. Meta and TikTok handle this under their own privacy
            policies. If you choose <strong>No thanks</strong>, none of this loads or is sent. To change your mind,
            clear this site&apos;s cookies in your browser and the notice will appear again.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">Payments</h2>
          <p>
            Payments are processed by Stripe, which receives your card details and email address to take the
            payment and send your receipt, under{' '}
            <a href="https://stripe.com/au/privacy" className="text-brand-600 hover:underline">Stripe&apos;s privacy policy</a>.
            We keep a record of the purchase so the papers stay unlocked on your account.
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
            Questions about this policy or your data:{' '}
            {SUPPORT_EMAIL ? (
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-600 hover:underline">{SUPPORT_EMAIL}</a>
            ) : (
              <Link href="/help" className="text-brand-600 hover:underline">the help centre</Link>
            )}
            .
          </p>
        </section>

      </div>
    </main>
  )
}
