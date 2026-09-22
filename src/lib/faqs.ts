import { FROM_PER_MONTH, MONTHLY_PRICE, PLANS, VCE_PAPER_PRICE } from '@/lib/pricing'
import { CATALOGUE_TOTALS, PLAN_TOTALS } from '@/lib/catalogue'

/**
 * Every FAQ answer on the site, in one place.
 *
 * The homepage, pricing page and help centre each show a subset. Keeping the
 * text here means an answer cannot be updated on one page and left stale on
 * another — the homepage FAQ was still describing XP and streaks as the
 * product after the product had become printable papers.
 *
 * Rule for editing: every answer must be true of the code as it stands. Prices
 * come from lib/pricing, the same values the pricing and terms pages use.
 * Refunds are deliberately not mentioned anywhere on the site (owner’s
 * decision, 2026-09-23) — they are handled case by case. New papers joining the plan at no extra cost is a promise
 * the owner made (2026-09-22). No other commercial promise
 * (a commercial commitment, not a UI line), no payment methods Stripe has not
 * been configured to offer.
 */

export type FaqCategory = 'papers' | 'purchasing' | 'accounts' | 'parents'

export interface Faq {
  q: string
  a: string
  category: FaqCategory
  /** Shown in the homepage's short FAQ. */
  home?: boolean
}

export const FAQ_CATEGORY_LABEL: Record<FaqCategory, string> = {
  papers: 'The exam papers',
  purchasing: 'Purchasing',
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

  // ── Purchasing ────────────────────────────────────────────────────────────────
  {
    category: 'purchasing',
    home: true,
    q: 'How much does it cost?',
    a: `A plan unlocks every ${PLAN_TOTALS.range} paper — NAPLAN and school years, every subject, every year level: ${PLANS.map(p => `$${p.priceAud} for ${p.name}`).join(', ')}, from ${FROM_PER_MONTH} a month. VCE papers are ${VCE_PAPER_PRICE} each, purchased once. ${CATALOGUE_TOTALS.free} papers — one per subject at every year level — are free, so you can see exactly what you are getting first.`,
  },
  {
    category: 'purchasing',
    q: 'Is it a subscription?',
    a: `Plans are. They renew automatically at the same price — ${MONTHLY_PRICE} a month, or every 3 or 12 months on the longer plans — until you cancel. VCE papers are one-off purchases with nothing to cancel.`,
  },
  {
    category: 'purchasing',
    q: 'How do I cancel?',
    a: 'From your account page: choose "Manage or cancel plan" and cancel in one click. There is no phone call or form. You keep access until the end of the period you have already paid for, and you are not charged again.',
  },
  {
    category: 'purchasing',
    q: 'Do I need an account to purchase?',
    a: 'Yes. The purchase is attached to the account that makes it, and you sign in with that account to download. Creating an account is free.',
  },
  {
    category: 'purchasing',
    q: 'Is paying online safe?',
    a: 'Payments are handled by Stripe on its own secure checkout page. PrepNest never sees or stores your card details. Stripe emails you a receipt.',
  },
  {
    category: 'purchasing',
    q: 'I paid but the papers are still locked.',
    a: 'Unlocking usually takes a few seconds after payment. Refresh the exam papers page while signed in to the account you paid with. If it is still locked after a minute, contact us and we will sort it out — you will not be charged twice.',
  },
  {
    category: 'purchasing',
    q: 'My children are in different year levels.',
    a: `One plan covers them all: it unlocks every ${PLAN_TOTALS.range} paper, whatever year each child is in.`,
  },
  {
    category: 'purchasing',
    home: true,
    q: 'Will there be more papers?',
    a: 'Yes. New papers are added throughout the year, and every new paper for Grade 3 to Year 10 is included in your plan at no extra cost as soon as it is published.',
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
