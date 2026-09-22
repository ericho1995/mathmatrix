import { BUNDLE_PRICE, REFUND_DAYS } from '@/lib/pricing'
import { CATALOGUE_TOTALS } from '@/lib/catalogue'

/**
 * Every FAQ answer on the site, in one place.
 *
 * The homepage, pricing page and help centre each show a subset. Keeping the
 * text here means an answer cannot be updated on one page and left stale on
 * another — the homepage FAQ was still describing XP and streaks as the
 * product after the product had become printable papers.
 *
 * Rule for editing: every answer must be true of the code as it stands. Refund
 * terms come from REFUND_DAYS, the same value the terms page uses. No promise
 * that future papers are included
 * (a commercial commitment, not a UI line), no payment methods Stripe has not
 * been configured to offer.
 */

export type FaqCategory = 'papers' | 'buying' | 'accounts' | 'parents'

export interface Faq {
  q: string
  a: string
  category: FaqCategory
  /** Shown in the homepage's short FAQ. */
  home?: boolean
}

export const FAQ_CATEGORY_LABEL: Record<FaqCategory, string> = {
  papers: 'The exam papers',
  buying: 'Buying',
  accounts: 'Accounts',
  parents: 'For parents',
}

export const FAQS: Faq[] = [
  // ── Papers ────────────────────────────────────────────────────────────────
  {
    category: 'papers',
    home: true,
    q: 'What exactly do I get?',
    a: 'A printable exam paper as a PDF, and a separate answer key as a second PDF. The paper is laid out like the real test — sections, timing, and calculator rules where they apply — so it can be sat at the kitchen table under real conditions and marked afterwards.',
  },
  {
    category: 'papers',
    home: true,
    q: 'Which year levels and subjects are covered?',
    a: `${CATALOGUE_TOTALS.lowest} to ${CATALOGUE_TOTALS.highest}. Maths, English and Science from Grade 3 to Year 10, in the NAPLAN format for Maths and English. For Year 11 and 12, VCE Chemistry, Physics, Mathematical Methods, General Mathematics and Specialist Mathematics.`,
  },
  {
    category: 'papers',
    q: 'Are these real NAPLAN or VCE papers?',
    a: 'No. They are original practice papers written to match the format, timing and year-level demand of the real tests. PrepNest is independent and is not affiliated with ACARA, which runs NAPLAN, or the VCAA, which runs the VCE.',
  },
  {
    category: 'papers',
    q: 'Does PrepNest cover NAPLAN Writing?',
    a: 'Not yet. The papers cover Numeracy, Reading and Language Conventions. Writing needs a prompt and a marking rubric rather than scored questions, and it is being built separately.',
  },
  {
    category: 'papers',
    home: true,
    q: 'How do I mark a paper?',
    a: 'Use the answer key, then open the paper on PrepNest and choose "Enter results". Everything starts marked correct, so you only tap the questions that were wrong. You will see which topics need work, with a link straight to practice on exactly those topics.',
  },
  {
    category: 'papers',
    q: 'Can I do the papers on screen instead of printing them?',
    a: 'They are designed to be printed. VCE exams are sat on paper. NAPLAN is taken online for most year levels, but sitting a full paper in one go, timed and away from a screen, builds the same pacing and stamina. For on-screen practice, the free Practice section builds short quizzes on any topic with an instant explanation for every answer.',
  },

  // ── Buying ────────────────────────────────────────────────────────────────
  {
    category: 'buying',
    home: true,
    q: 'How much does it cost?',
    a: `${BUNDLE_PRICE} once unlocks every paper for one year level, across every subject at that level. It is a one-off payment, not a subscription. ${CATALOGUE_TOTALS.free} papers — one per subject at every year level — are free, so you can see exactly what you are buying first.`,
  },
  {
    category: 'buying',
    q: 'Is it a subscription?',
    a: 'No. You pay once for a year level and there is nothing to cancel.',
  },
  {
    category: 'buying',
    home: true,
    q: 'Can I get a refund?',
    a: `Yes. If you change your mind within ${REFUND_DAYS} days of buying, email us from the address you signed up with and we will refund you in full — no questions asked. The free sample paper at every year level is there so you can check first.`,
  },
  {
    category: 'buying',
    q: 'Do I need an account to buy?',
    a: 'Yes. The purchase is attached to the account that makes it, and you sign in with that account to download. Creating an account is free.',
  },
  {
    category: 'buying',
    q: 'Is paying online safe?',
    a: 'Payments are handled by Stripe on its own secure checkout page. PrepNest never sees or stores your card details. Stripe emails you a receipt.',
  },
  {
    category: 'buying',
    q: 'I paid but the papers are still locked.',
    a: 'Unlocking usually takes a few seconds after payment. Refresh the exam papers page while signed in to the account you paid with. If it is still locked after a minute, contact us and we will sort it out — you will not be charged twice.',
  },
  {
    category: 'buying',
    q: 'My children are in different year levels.',
    a: 'Each year level is a separate purchase, so buy the year level for each child. One account can hold several.',
  },

  // ── Accounts ──────────────────────────────────────────────────────────────
  {
    category: 'accounts',
    home: true,
    q: 'Do I need a credit card to start?',
    a: 'No. The free papers and the free practice questions need no payment details at all, and marking a free paper does not even need an account.',
  },
  {
    category: 'accounts',
    q: 'What does a free account add?',
    a: 'It keeps your results. Marked papers and practice sessions are saved, so progress by topic builds up over time, and students earn XP and streaks on the weekly leaderboard.',
  },
  {
    category: 'accounts',
    q: 'I forgot my password.',
    a: 'Use "Forgot password?" on the sign-in page and we will email you a reset link.',
  },

  // ── Parents ───────────────────────────────────────────────────────────────
  {
    category: 'parents',
    home: true,
    q: 'How does the parent dashboard work?',
    a: 'Create a parent account, then link it to your child with a one-time invite code. The dashboard shows their accuracy by topic, how many sessions they have completed, and their XP this week.',
  },
  {
    category: 'parents',
    q: 'Should my child sit a paper timed?',
    a: 'For the closest thing to the real test, yes: one sitting, timed, no notes. Each paper shows its time allowance for every section. Earlier in the year, untimed practice on weak topics is often the better use of an hour.',
  },
]

export function faqsIn(category: FaqCategory): Faq[] {
  return FAQS.filter(f => f.category === category)
}

export const HOME_FAQS = FAQS.filter(f => f.home)
