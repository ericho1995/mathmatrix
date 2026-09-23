import type { StaticImageData } from 'next/image'
import readingCover from '@/assets/samples/reading-magazine-cover.webp'
import readingPage from '@/assets/samples/reading-magazine-page.webp'
import readingQuestions from '@/assets/samples/reading-questions.webp'
import numeracyPage from '@/assets/samples/numeracy-page.webp'
import numeracyKey from '@/assets/samples/numeracy-answer-key.webp'
import conventionsPage from '@/assets/samples/conventions-page.webp'
import vcePage from '@/assets/samples/vce-methods-page.webp'
import vceKey from '@/assets/samples/vce-methods-answer-key.webp'
import topicReport from '@/assets/samples/topic-report.webp'

// ─────────────────────────────────────────────────────────────────────────────
// Real pages from the free sample papers, shown so a parent can see what a plan
// buys before paying for it.
//
// Every image is rendered from a FREE paper's actual PDF (and the topic report
// is a screenshot of marking one), so nothing here gives away paid content and
// every picture is something the visitor can download in full, which is what
// `paperId` links to. If a sample paper is rewritten, re-render its page rather
// than leaving a picture of content that no longer exists.
// ─────────────────────────────────────────────────────────────────────────────

export interface SamplePage {
  image: StaticImageData
  alt: string
  title: string
  caption: string
  /** The free paper this page comes from. */
  paperId: string
  paperTitle: string
}

export const SAMPLES = {
  readingCover: {
    image: readingCover,
    alt: 'Cover of the colour Reading Magazine for Reading Grade 5, Practice Paper 1, listing seven texts',
    title: 'Colour Reading Magazine',
    caption: 'Reading papers come as two booklets, as the real test does: a colour magazine of texts and a question paper.',
    paperId: 'reading-grade_5-1',
    paperTitle: 'Reading Grade 5 — Practice Paper 1',
  },
  readingPage: {
    image: readingPage,
    alt: 'A page from the Grade 5 Reading Magazine: a procedure called Make a floating compass',
    title: 'Inside the magazine',
    caption: 'Stories, reports, poems and persuasive texts, each set out the way the test sets them.',
    paperId: 'reading-grade_5-1',
    paperTitle: 'Reading Grade 5 — Practice Paper 1',
  },
  readingQuestions: {
    image: readingQuestions,
    alt: 'A page of Grade 5 reading questions that sends the reader to a text in the magazine',
    title: 'Reading question paper',
    caption: 'Each set of questions points to its text by page, so students practice moving between the two booklets.',
    paperId: 'reading-grade_5-1',
    paperTitle: 'Reading Grade 5 — Practice Paper 1',
  },
  numeracy: {
    image: numeracyPage,
    alt: 'A page of Grade 5 Numeracy questions with a protractor, a dot plot and an area diagram',
    title: 'Numeracy paper',
    caption: 'Diagrams, graphs and measurement questions, laid out like the real test.',
    paperId: 'math-grade_5-1',
    paperTitle: 'Maths Grade 5 — Practice Exam 1',
  },
  answerKey: {
    image: numeracyKey,
    alt: 'The first page of the Grade 5 Maths answer key, showing each answer with its explanation',
    title: 'Answer key with explanations',
    caption: 'Every answer comes with a short explanation, so marking a paper teaches as well as scores.',
    paperId: 'math-grade_5-1',
    paperTitle: 'Maths Grade 5 — Practice Exam 1',
  },
  conventions: {
    image: conventionsPage,
    alt: 'A page of Grade 5 Language Conventions questions on spelling and grammar',
    title: 'Language Conventions',
    caption: 'Spelling, grammar and punctuation questions pitched at the year level.',
    paperId: 'english-grade_5-1',
    paperTitle: 'Language Conventions Grade 5 — Practice Exam 1',
  },
  vcePaper: {
    image: vcePage,
    alt: 'A page of a VCE Mathematical Methods Examination 1 practice paper, with marks shown for each part',
    title: 'VCE exam layout',
    caption: 'Marks for every part, reading time, and the technology-free and technology-active split.',
    paperId: 'maths_methods-year_12-1-exam1',
    paperTitle: 'Mathematical Methods Unit 3 & 4 — Examination 1 (Practice 1)',
  },
  vceKey: {
    image: vceKey,
    alt: 'The VCE Mathematical Methods answer key, showing where each mark is earned',
    title: 'VCE marking guide',
    caption: 'The answer key shows where each mark is earned, part by part.',
    paperId: 'maths_methods-year_12-1-exam1',
    paperTitle: 'Mathematical Methods Unit 3 & 4 — Examination 1 (Practice 1)',
  },
} satisfies Record<string, SamplePage>

export type SampleKey = keyof typeof SAMPLES

/** The report a marked paper produces, captured from the real marking screen. */
export const TOPIC_REPORT = {
  image: topicReport,
  alt: 'The results screen after marking a Grade 5 Maths paper: 23 of 30 correct, with each topic ranked weakest first',
}
