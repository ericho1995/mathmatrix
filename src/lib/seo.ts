import type { SubjectSlug, TopicSlug, YearLevel } from '@/types'
import { PRACTICE_EXAMS, type PracticeExam } from '@/lib/questions/exams'
import { TOPICS } from '@/lib/curriculum'
import { NAPLAN_SOURCE, VCE_EXAMS_2026, VCE_SOURCE, daysUntil, formatLongDate, formatWindow, nextNaplanWindow } from '@/lib/examDates'
import { FROM_PER_MONTH, VCE_PAPER_PRICE, VCE_PAPER_PRICE_AUD } from '@/lib/pricing'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { summarisePaper, yearLabel } from '@/lib/catalogue'

/**
 * Search landing pages and the structured data that describes the site.
 *
 * People search by subject and year ("vce methods practice exam", "year 5
 * naplan practice test"), so each VCE subject and each NAPLAN year has its own
 * page at a readable address. Every fact on those pages is derived from the
 * catalogue and the exam dates, the same sources the rest of the site reads,
 * so a page cannot promise a paper or a date that does not exist.
 */

// ── VCE subjects ────────────────────────────────────────────────────────────

export interface VceLanding {
  /** /vce/<slug> */
  slug: string
  subject: SubjectSlug
  name: string
  /** What students call it. */
  shortName: string
  /** Unit 3 & 4 areas of study, as tagged in the bank. */
  topics: TopicSlug[]
}

export const VCE_LANDINGS: VceLanding[] = [
  {
    slug: 'mathematical-methods',
    subject: 'maths_methods',
    name: 'Mathematical Methods',
    shortName: 'Methods',
    topics: ['mm_functions', 'mm_algebra', 'mm_calculus', 'mm_probability'],
  },
  {
    slug: 'specialist-mathematics',
    subject: 'specialist_maths',
    name: 'Specialist Mathematics',
    shortName: 'Specialist',
    topics: ['sm_proof', 'sm_complex_numbers', 'sm_functions', 'sm_vectors', 'sm_calculus', 'sm_statistics'],
  },
  {
    slug: 'general-mathematics',
    subject: 'general_maths',
    name: 'General Mathematics',
    shortName: 'General',
    topics: ['gm_data_analysis', 'gm_financial', 'gm_matrices', 'gm_networks'],
  },
  {
    slug: 'physics',
    subject: 'physics',
    name: 'Physics',
    shortName: 'Physics',
    topics: ['phys_motion', 'phys_fields', 'phys_electrical_power', 'phys_light_matter', 'phys_investigation'],
  },
  {
    slug: 'chemistry',
    subject: 'chemistry',
    name: 'Chemistry',
    shortName: 'Chemistry',
    topics: ['chem_atomic_structure', 'chem_reactions'],
  },
]

export function vceLanding(slug: string): VceLanding | undefined {
  return VCE_LANDINGS.find(l => l.slug === slug)
}

export function vceLandingFor(subject: SubjectSlug): VceLanding | undefined {
  return VCE_LANDINGS.find(l => l.subject === subject)
}

export function papersFor(subject: SubjectSlug, yearLevel: YearLevel): PracticeExam[] {
  return PRACTICE_EXAMS.filter(e => e.subject === subject && e.yearLevel === yearLevel)
}

/** This subject's 2026 written exams still to come, soonest first. */
export function upcomingExamsFor(subject: SubjectSlug, now: Date = new Date()) {
  return VCE_EXAMS_2026.filter(e => e.subject === subject)
    .map(e => ({ ...e, days: daysUntil(e.date, now) }))
    .filter(e => e.days >= 0)
    .sort((a, b) => a.days - b.days)
}

export function topicsOf(slugs: TopicSlug[]) {
  return slugs.map(s => TOPICS.find(t => t.slug === s)).filter((t): t is (typeof TOPICS)[number] => Boolean(t))
}

/**
 * One line per kind of paper ("Examination 1", "Examination 2", or the single
 * Physics paper), worked out from the first paper of each kind so it always
 * matches what is sold.
 */
export interface PaperShape {
  kind: string
  readingMinutes?: number
  writingMinutes: number
  sections: { title: string; questions: number; calculator?: boolean }[]
  formulaSheet: boolean
}

export function paperShapes(papers: PracticeExam[]): PaperShape[] {
  const kindOf = (e: PracticeExam) => {
    if (e.id.endsWith('-exam1')) return 'Examination 1'
    if (e.id.endsWith('-exam2')) return 'Examination 2'
    return 'The examination'
  }
  const seen = new Map<string, PaperShape>()
  for (const e of papers) {
    const kind = kindOf(e)
    if (seen.has(kind)) continue
    const s = summarisePaper(e)
    seen.set(kind, {
      kind,
      readingMinutes: s.readingMinutes,
      writingMinutes: s.minutes,
      sections: s.sections.map(x => ({ title: x.title, questions: x.questions, calculator: x.calculator })),
      formulaSheet: Boolean(e.formula_sheet),
    })
  }
  return Array.from(seen.values())
}

export function minutesLabel(m: number): string {
  if (m < 60) return `${m} minutes`
  const h = Math.floor(m / 60)
  const rest = m % 60
  const hours = h === 1 ? '1 hour' : `${h} hours`
  return rest ? `${hours} ${rest} minutes` : hours
}

/** "15 minutes reading, then 2 hours writing; Section A — multiple choice (20 questions) and …" */
export function shapeSentence(shape: PaperShape): string {
  const time = shape.readingMinutes
    ? `${shape.readingMinutes} minutes reading, then ${minutesLabel(shape.writingMinutes)} writing`
    : minutesLabel(shape.writingMinutes)
  const techFree = shape.sections.every(s => s.calculator === false)
  // A single untitled part ("Examination 1 — technology-free", "Chemistry")
  // reads as a question count; named sections keep their names.
  const parts =
    shape.sections.length === 1
      ? [`${shape.sections[0].questions} questions`]
      : shape.sections.map(s => `${s.title} (${s.questions} questions)`)
  return `${time}${techFree ? ', technology-free' : ''}: ${parts.join('; ')}${shape.formulaSheet ? ', with the formula sheet at the back' : ''}.`
}

// ── NAPLAN years ────────────────────────────────────────────────────────────

export interface NaplanLanding {
  /** /naplan/<slug> */
  slug: string
  yearLevel: YearLevel
  /** "Year 3", as NAPLAN names the year. */
  naplanName: string
}

export const NAPLAN_LANDINGS: NaplanLanding[] = [
  { slug: 'year-3', yearLevel: 'grade_3', naplanName: 'Year 3' },
  { slug: 'year-5', yearLevel: 'grade_5', naplanName: 'Year 5' },
  { slug: 'year-7', yearLevel: 'year_7', naplanName: 'Year 7' },
  { slug: 'year-9', yearLevel: 'year_9', naplanName: 'Year 9' },
]

export function naplanLanding(slug: string): NaplanLanding | undefined {
  return NAPLAN_LANDINGS.find(l => l.slug === slug)
}

export function naplanLandingFor(yearLevel: YearLevel): NaplanLanding | undefined {
  return NAPLAN_LANDINGS.find(l => l.yearLevel === yearLevel)
}

/** "Year 3 (Grade 3)" where the site's own label differs from NAPLAN's. */
export function naplanYearName(l: NaplanLanding): string {
  const ours = yearLabel(l.yearLevel)
  return ours === l.naplanName ? l.naplanName : `${l.naplanName} (${ours})`
}

// ── FAQs for the landing pages ──────────────────────────────────────────────

export interface LandingFaq {
  q: string
  a: string
}

export function vceFaqs(l: VceLanding, now: Date = new Date()): LandingFaq[] {
  const u34 = papersFor(l.subject, 'year_12')
  const u12 = papersFor(l.subject, 'year_11')
  // The written exam is Unit 3 & 4: its date only answers a question on a page with Unit 3 & 4 papers.
  const upcoming = u34.length > 0 ? upcomingExamsFor(l.subject, now) : []
  const faqs: LandingFaq[] = []

  if (upcoming.length > 0) {
    faqs.push({
      q: `When is the 2026 VCE ${l.name} exam?`,
      a: `${upcoming.map(e => `${e.label.replace(`${l.name} — `, '')}: ${formatLongDate(e.date)}, ${e.time}`).join('. ')} (Melbourne time). Always confirm against the official VCAA timetable.`,
    })
  }

  const shapes = paperShapes(u34.length > 0 ? u34 : u12)
  if (shapes.length > 0) {
    faqs.push({
      q: `What is in a PrepNest ${l.name} practice exam?`,
      a: `${shapes.map(s => `${s.kind}: ${shapeSentence(s)}`).join(' ')} Every paper comes with a separate marking guide with worked solutions.`,
    })
  }

  faqs.push(
    {
      q: 'Are these past VCAA exams?',
      a: 'No. Every question is new, written in the VCAA format for the current study design. The VCAA publishes past examinations and examination reports free on its website, and they are worth working through first; PrepNest papers give you more practice in the same format once you have used those.',
    },
    {
      q: 'How much do they cost?',
      a: `${VCE_PAPER_PRICE} per paper, purchased once and yours to keep. You can flip through the first half of any paper free before you purchase, and there is nothing to cancel.`,
    },
    {
      q: 'Can I sit a paper on screen?',
      a: 'Yes. Once purchased, a paper can be sat on screen with a countdown timer and a working-out pad, then checked against the marking guide, or printed and sat on paper the way the real exam is.',
    },
  )

  if (u34.length === 0 && u12.length > 0) {
    faqs.push({
      q: `Are there Unit 3 & 4 ${l.name} papers?`,
      a: `Not yet. PrepNest has ${u12.length} Unit 1 & 2 ${l.name} papers today. Unit 3 & 4 papers are on the way, and you can ask for them with "Request more papers" on the exam papers page.`,
    })
  }
  return faqs
}

export function naplanFaqs(l: NaplanLanding, now: Date = new Date()): LandingFaq[] {
  const w = nextNaplanWindow(now)
  const faqs: LandingFaq[] = []
  if (w) {
    faqs.push({
      q: `When is NAPLAN ${w.year}?`,
      a: `The NAPLAN ${w.year} test window is ${formatWindow(w.start, w.end)}. Each school sets its own days inside the window, so check your school's timetable.`,
    })
  }
  faqs.push(
    {
      q: `What does the ${l.naplanName} NAPLAN test?`,
      a: 'NAPLAN has four tests, sat in this order: Writing, Reading, Conventions of Language, then Numeracy.',
    },
    {
      q: 'Do PrepNest papers cover NAPLAN Writing?',
      a: 'Not yet. The papers cover Numeracy, Reading and Language Conventions. Writing needs a prompt and a marking rubric rather than scored questions, and it is being built separately.',
    },
    {
      q: 'Are these real NAPLAN papers?',
      a: 'No. They are original practice papers written to match the format, timing and year-level demand of the real tests. PrepNest is independent and is not affiliated with ACARA, which runs NAPLAN.',
    },
    {
      q: 'How much do they cost?',
      a: `One plan unlocks every paper from Grade 3 to Year 10, from ${FROM_PER_MONTH} a month. The first half of every paper is free to flip through, and the diagnostic test is free.`,
    },
  )
  return faqs
}

// ── Structured data (schema.org JSON-LD) ────────────────────────────────────

const abs = (path: string) => `${SITE_URL}${path}`

export const ORGANIZATION_LD = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': abs('/#organization'),
  name: SITE_NAME,
  url: SITE_URL,
  logo: abs('/apple-icon.png'),
  description:
    'Practice exams and a free diagnostic test for Australian students from Grade 3 to Year 12, in the NAPLAN and VCE formats.',
  areaServed: { '@type': 'Country', name: 'Australia' },
}

export const WEBSITE_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': abs('/#website'),
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'en-AU',
  publisher: { '@id': abs('/#organization') },
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  }
}

export function faqLd(faqs: LandingFaq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

/** A practice paper: a learning resource, and for VCE papers a product with its price. */
export function paperLd(exam: PracticeExam, vce: boolean) {
  const s = summarisePaper(exam)
  const url = abs(`/practice/exams/${exam.id}`)
  const resource = {
    '@context': 'https://schema.org',
    '@type': vce ? ['LearningResource', 'Product'] : 'LearningResource',
    name: exam.title,
    url,
    description: `A printable ${s.questions}-question practice paper with a separate answer key.`,
    learningResourceType: 'Practice exam',
    educationalLevel: yearLabel(exam.yearLevel),
    inLanguage: 'en-AU',
    timeRequired: `PT${s.minutes + (s.readingMinutes ?? 0)}M`,
    isAccessibleForFree: false,
    provider: { '@id': abs('/#organization') },
  }
  if (!vce) return resource
  return {
    ...resource,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      price: VCE_PAPER_PRICE_AUD.toFixed(2),
      priceCurrency: 'AUD',
      availability: 'https://schema.org/InStock',
      url,
    },
  }
}

/** The papers on a landing page, as a list search engines can read. */
export function paperListLd(name: string, papers: PracticeExam[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: papers.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: abs(`/practice/exams/${e.id}`),
      name: e.title,
    })),
  }
}

export { NAPLAN_SOURCE, VCE_SOURCE }
