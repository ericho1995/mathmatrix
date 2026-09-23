import type { Metadata } from 'next'
import Link from 'next/link'
import type { Route } from 'next'
import FAQAccordion from '@/components/home/FAQAccordion'
import { FAQ_CATEGORY_LABEL, faqsIn, type FaqCategory } from '@/lib/faqs'
import { SUPPORT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Help & FAQ — PrepNest',
  description:
    'Answers about PrepNest exam papers, purchasing, accounts and the parent dashboard — and how to get in touch.',
}

const ORDER: FaqCategory[] = ['papers', 'purchasing', 'accounts', 'parents']

/**
 * The help centre. Every answer comes from lib/faqs.ts, the same source the
 * homepage and pricing page use.
 *
 * The contact block renders only when NEXT_PUBLIC_SUPPORT_EMAIL is set — see
 * lib/site.ts for why there is no made-up fallback address.
 */
export default function HelpPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full">
      <h1 className="text-3xl font-medium tracking-tight mb-2">Help & FAQ</h1>
      <p className="text-gray-500 mb-8">Quick answers about the papers, purchasing, and accounts.</p>

      <nav aria-label="FAQ sections" className="flex flex-wrap gap-2 mb-10">
        {ORDER.map(c => (
          <a
            key={c}
            href={`#${c}`}
            className="px-3 py-1.5 rounded-full text-sm border border-gray-200 text-gray-600 hover:border-gray-300"
          >
            {FAQ_CATEGORY_LABEL[c]}
          </a>
        ))}
      </nav>

      {ORDER.map(c => (
        <section key={c} id={c} className="mb-12 scroll-mt-24">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
            {FAQ_CATEGORY_LABEL[c]}
          </h2>
          <FAQAccordion items={faqsIn(c)} />
        </section>
      ))}

      <section className="card text-center">
        <h2 className="font-medium mb-2">Still stuck?</h2>
        {SUPPORT_EMAIL ? (
          <p className="text-sm text-gray-500">
            Email{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-600 underline">
              {SUPPORT_EMAIL}
            </a>{' '}
            and include the email address on your account. If it is about a payment, the date you paid helps us find
            it quickly.
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            If something on the site isn&apos;t working, try signing out and back in, and check you are using the
            account you paid with. Your{' '}
            <Link href={'/account' as Route} className="text-brand-600 underline">
              account page
            </Link>{' '}
            lists every year level you have unlocked.
          </p>
        )}
      </section>
    </main>
  )
}
