// ─────────────────────────────────────────────────────────────────────────────
// What has been added to the library, and what is being written next.
//
// A plan is only worth keeping if it keeps growing, and a parent can only see
// that it grows if it is written down with dates. Every entry here is a real
// release: the dates are the merge dates on main, and `examIds` are the papers
// that release added (worked out from exams.ts before and after the merge).
//
// Add an entry, newest first, whenever papers are published. Pages resolve the
// ids against the catalogue at render time, so a paper that is later retired
// simply drops out of its entry instead of leaving a dead link.
//
// ROADMAP is what is being written now. It must only list work that is really
// under way — it is shown to people deciding whether to keep paying.
// ─────────────────────────────────────────────────────────────────────────────

export interface Release {
  /** YYYY-MM-DD, Melbourne time. */
  date: string
  title: string
  detail: string
  /** Papers this release added. */
  examIds: string[]
}

export const RELEASES: Release[] = [
  {
    date: '2026-09-24',
    title: 'Ten papers each for Methods, General and Specialist',
    detail:
      'Specialist Mathematics Unit 3 & 4 arrives with five full practice sets, and Maths Methods and General Mathematics gain their fifth sets, so each subject now has ten Year 12 papers in the VCAA format with full marking guides.',
    examIds: [
      'specialist_maths-year_12-1-exam1',
      'specialist_maths-year_12-1-exam2',
      'specialist_maths-year_12-2-exam1',
      'specialist_maths-year_12-2-exam2',
      'specialist_maths-year_12-3-exam1',
      'specialist_maths-year_12-3-exam2',
      'specialist_maths-year_12-4-exam1',
      'specialist_maths-year_12-4-exam2',
      'specialist_maths-year_12-5-exam1',
      'specialist_maths-year_12-5-exam2',
      'maths_methods-year_12-5-exam1',
      'maths_methods-year_12-5-exam2',
      'general_maths-year_12-4-exam1',
      'general_maths-year_12-4-exam2',
      'general_maths-year_12-5-exam1',
      'general_maths-year_12-5-exam2',
    ],
  },
  {
    date: '2026-09-23',
    title: 'Four new VCE Year 12 papers',
    detail:
      'A third General Mathematics practice set and a fourth Maths Methods set, each an Examination 1 and 2 in the VCAA format with a full marking guide.',
    examIds: [
      'general_maths-year_12-3-exam1',
      'general_maths-year_12-3-exam2',
      'maths_methods-year_12-4-exam1',
      'maths_methods-year_12-4-exam2',
    ],
  },
  {
    date: '2026-09-23',
    title: 'More Language Conventions, Reading on screen, and Year 11 papers',
    detail:
      'Two more Language Conventions papers at Grades 4 and 6 and Years 8 and 10, a second Year 11 Chemistry, Physics and Specialist Maths paper, and Reading papers you can now also sit on screen, the way NAPLAN Online runs.',
    examIds: [
      'english-grade_4-2',
      'english-grade_4-3',
      'english-grade_6-2',
      'english-grade_6-3',
      'english-year_8-2',
      'english-year_8-3',
      'english-year_10-2',
      'english-year_10-3',
      'chemistry-year_11-2',
      'physics-year_11-2',
      'specialist_maths-year_11-2',
    ],
  },
  {
    date: '2026-09-23',
    title: 'Reading papers with colour magazines',
    detail:
      'NAPLAN-style Reading papers from Grade 3 to Year 10, each with its own colour Reading Magazine of stories, reports, poems and persuasive texts.',
    examIds: [
      'reading-grade_3-1',
      'reading-grade_3-2',
      'reading-grade_3-3',
      'reading-grade_4-1',
      'reading-grade_5-1',
      'reading-grade_5-2',
      'reading-grade_5-3',
      'reading-grade_6-1',
      'reading-year_7-1',
      'reading-year_7-2',
      'reading-year_7-3',
      'reading-year_8-1',
      'reading-year_9-1',
      'reading-year_9-2',
      'reading-year_9-3',
      'reading-year_10-1',
    ],
  },
  {
    date: '2026-09-22',
    title: 'VCE Year 12 sets and a fourth Maths paper at every level',
    detail:
      'Maths Methods practice sets 2 and 3 and General Mathematics set 2 for Year 12, and a new Maths paper for every year from Grade 3 to Year 10.',
    examIds: [
      'maths_methods-year_12-2-exam1',
      'maths_methods-year_12-2-exam2',
      'maths_methods-year_12-3-exam1',
      'maths_methods-year_12-3-exam2',
      'general_maths-year_12-2-exam1',
      'general_maths-year_12-2-exam2',
      'math-grade_3-4',
      'math-grade_4-4',
      'math-grade_5-4',
      'math-grade_6-4',
      'math-year_7-4',
      'math-year_8-4',
      'math-year_9-4',
      'math-year_10-4',
    ],
  },
]

export interface RoadmapItem {
  title: string
  detail: string
  /** Who it is for, shown as a small label. */
  audience: string
}

export const ROADMAP: RoadmapItem[] = [
  {
    title: 'More VCE Maths Methods, General and Specialist sets',
    detail: 'Further Examination 1 and 2 practice sets for Year 12, in the VCAA format.',
    audience: 'VCE',
  },
  {
    title: 'VCE Unit 3 & 4 Chemistry and Physics',
    detail: 'Year 12 papers for the two subjects that only have Unit 1 & 2 papers so far.',
    audience: 'VCE',
  },
  {
    title: 'More Language Conventions papers for Years 3, 5, 7 and 9',
    detail: 'Extra spelling, grammar and punctuation papers for the NAPLAN years.',
    audience: 'NAPLAN',
  },
  {
    title: 'More Science papers',
    detail: 'Further Science papers for Grade 6 and Years 8 and 10.',
    audience: 'Grade 3 – Year 10',
  },
  {
    title: 'NAPLAN Writing',
    detail: 'Writing prompts in the NAPLAN style, with a marking rubric a parent can follow.',
    audience: 'NAPLAN',
  },
]

/** "23 September 2026" */
export function formatReleaseDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d))
  )
}
