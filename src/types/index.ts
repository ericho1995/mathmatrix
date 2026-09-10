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
  | 'mm_calculus' | 'mm_probability'
  | 'gm_data_analysis' | 'gm_financial'
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

export type QuestionFormat = 'multiple_choice' | 'long_form' | 'short_answer'

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
  created_at: string
}

// format is omitted on existing multiple-choice questions in bank.ts and
// defaults to 'multiple_choice' — only long-form questions need to set it.
export interface MultipleChoiceQuestion extends QuestionBase {
  format?: 'multiple_choice'
  options: string[]
  correct_index: number
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

export type Question = MultipleChoiceQuestion | LongFormQuestion | ShortAnswerQuestion

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
