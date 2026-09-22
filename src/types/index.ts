// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'parent' | 'admin'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface StudentProfile extends UserProfile {
  role: 'student'
  year_level: YearLevel
  parent_id?: string
  xp_total: number
  streak_days: number
}

export interface ParentProfile extends UserProfile {
  role: 'parent'
  linked_student_ids: string[]
}

// ─── Curriculum ───────────────────────────────────────────────────────────────

export type YearLevel =
  | 'grade_3' | 'grade_4' | 'grade_5' | 'grade_6'
  | 'year_7'  | 'year_8'  | 'year_9'
  | 'year_10' | 'year_11' | 'year_12'

export type SubjectSlug =
  | 'math' | 'english' | 'science'
  | 'chemistry' | 'physics' | 'maths_methods' | 'general_maths' | 'specialist_maths'

export interface Subject {
  slug: SubjectSlug
  label: string
  tagline: string
  icon: string
  color: string
  /** VCE-style selective subject (Year 11-12), shown in its own practice track. */
  selective?: boolean
}

export type TopicSlug =
  | 'number_operations' | 'number_patterns' | 'algebra_equations' | 'geometry_measurement' | 'statistics_probability'
  | 'reading_comprehension' | 'reading_literary_analysis' | 'grammar_punctuation' | 'vocabulary'
  | 'life_science' | 'physical_science' | 'earth_space'
  | 'chem_atomic_structure' | 'chem_reactions'
  | 'phys_mechanics' | 'phys_electricity'
  | 'mm_functions' | 'mm_algebra' | 'mm_calculus' | 'mm_probability'
  // The four General Mathematics Unit 3 & 4 areas of study. gm_financial is
  // VCAA's "recursion and financial modelling"; the slug predates Unit 3 & 4.
  | 'gm_data_analysis' | 'gm_financial' | 'gm_matrices' | 'gm_networks'
  | 'sm_complex_numbers' | 'sm_vectors'

export interface Topic {
  slug: TopicSlug
  subject: SubjectSlug
  label: string
  description: string
  icon: string
  color: string
}

export type Difficulty = 'foundation' | 'developing' | 'proficient' | 'advanced'

export type StimulusType = 'passage' | 'data_table' | 'image'

// Diagram types live in ./diagrams — re-exported so '@/types' stays the one import.
export * from './diagrams'
import type { Diagram } from './diagrams'


export interface Stimulus {
  id: string
  type: StimulusType
  title: string
  body: string            // markdown/plain text for 'passage'; JSON-stringified rows for 'data_table'; image URL for 'image'
  subject: SubjectSlug
  year_level: YearLevel
  word_count?: number      // 'passage' only, informational
}

// ─── Questions ────────────────────────────────────────────────────────────────

export type QuestionFormat = 'multiple_choice' | 'long_form' | 'short_answer' | 'extended_response'

interface QuestionBase {
  id: string
  topic: TopicSlug
  year_level: YearLevel
  difficulty: Difficulty
  question_text: string
  explanation: string
  curriculum_code?: string   // e.g. "AC9M6N01"
  stimulus_id?: string          // FK into Stimulus — questions sharing an id are asked about the same passage/data
  calculator_allowed?: boolean  // Maths Yr7-9 Numeracy only; true = calculator section, unset/false = non-calculator
  diagram?: Diagram             // per-question graphic (bar chart, etc.) rendered above the question text
  marks?: number                // VCE only; NAPLAN papers are scored by question count, not marks
  /** VCE Unit 3 & 4 only: which practice set (1, 2, 3…) the question belongs to. Each set is composed
   * into its own Examination 1 and Examination 2, so a set is a complete paper pair. Defaults to 1. */
  practice_set?: number
  created_at: string
}

// format is omitted on existing multiple-choice questions in bank.ts and
// defaults to 'multiple_choice' — only long-form questions need to set it.
export interface MultipleChoiceQuestion extends QuestionBase {
  format?: 'multiple_choice'
  options: string[]
  correct_index: number
  /**
   * Picture answers — "Select the dot plot that correctly displays the data",
   * "Which net folds into this cube?". One diagram per option, drawn as a 2×2
   * grid of lettered panels; `options` then holds each panel's caption (which
   * may be empty) and is what the answer key prints.
   */
  option_diagrams?: Diagram[]
}

// Free-response questions (used in premium selective-subject exams). Not
// auto-gradable — the response is saved on QuestionAttempt for later manual review.
export interface LongFormQuestion extends QuestionBase {
  format: 'long_form'
  options?: undefined
  correct_index?: undefined
}

// Auto-gradable, but no multiple-choice options — the student types a short
// answer (a number, word, or short phrase) instead of picking one.
export interface ShortAnswerQuestion extends QuestionBase {
  format: 'short_answer'
  options?: undefined
  correct_index?: undefined
  expected_answer: string        // canonical correct answer, shown in the answer key verbatim
  accepted_answers?: string[]    // additional acceptable phrasings/forms; expected_answer is always accepted too
}

// ─── Extended response (VCE) ─────────────────────────────────────────────────
// A real VCAA exam question is one context with several lettered parts, each
// carrying its own marks — e.g. Methods Exam 2 Section B question 1 is worth 13
// marks across parts a (1), b (1), c (2) and so on, all about the same scenario.
// Modelling that as several separate questions loses both the shared stem and
// the mark allocation, which is most of what makes a VCE paper a VCE paper.

export interface QuestionPart {
  /** 'a', 'b', 'c.i' — printed in the margin, and the order parts appear in. */
  label: string
  prompt: string
  marks: number
  /** Model answer, printed in the answer key. */
  expected_answer: string
  /** Marking guidance: what earns each mark. */
  explanation: string
}

export interface ExtendedResponseQuestion extends QuestionBase {
  format: 'extended_response'
  options?: undefined
  correct_index?: undefined
  /** Shared context for every part. `question_text` carries the scenario. */
  parts: QuestionPart[]
}

export type Question =
  | MultipleChoiceQuestion
  | LongFormQuestion
  | ShortAnswerQuestion
  | ExtendedResponseQuestion

/** Marks a question is worth. VCE multiple choice is 1 mark; an extended
 * response is the sum of its parts. Questions outside VCE carry no marks. */
export function questionMarks(q: Question): number {
  if (q.format === 'extended_response') return q.parts.reduce((sum, p) => sum + p.marks, 0)
  return q.marks ?? 0
}

// ─── Sessions & Attempts ─────────────────────────────────────────────────────

export interface PracticeSession {
  id: string
  student_id: string
  topic: TopicSlug
  year_level: YearLevel
  mode: 'practice' | 'timed_challenge'
  started_at: string
  completed_at?: string
  total_questions: number
  correct_count: number
  xp_earned: number
}

export interface QuestionAttempt {
  id: string
  session_id: string
  question_id: string
  selected_index: number        // -1 for long-form/short-answer (not applicable)
  response_text?: string        // free-text answer for long-form/short-answer questions
  is_correct: boolean | null    // null = not auto-gradable (long-form, pending review)
  time_taken_seconds: number
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number
  student_id: string
  full_name: string
  year_level: YearLevel
  xp_total: number
  sessions_this_week: number
}

// ─── Parent Dashboard ─────────────────────────────────────────────────────────

export interface TopicPerformance {
  topic: TopicSlug
  label: string
  accuracy_percent: number
  sessions_count: number
  last_practiced?: string
}

export interface StudentReport {
  student: StudentProfile
  topic_performance: TopicPerformance[]
  recent_sessions: PracticeSession[]
  recommended_topics: TopicSlug[]
  weekly_xp: number
  avg_accuracy: number
}

// ─── UI State ────────────────────────────────────────────────────────────────

export interface QuizState {
  questions: Question[]
  current_index: number
  answers: (number | null)[]
  time_per_question: number[]
  started_at: number
  status: 'idle' | 'active' | 'reviewing' | 'complete'
}
