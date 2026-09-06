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

export type SubjectSlug = 'math' | 'english' | 'science'

export interface Subject {
  slug: SubjectSlug
  label: string
  tagline: string
  icon: string
  color: string
}

export type TopicSlug =
  | 'number_operations' | 'algebra_functions' | 'geometry_measurement' | 'statistics_probability'
  | 'reading_comprehension' | 'grammar_punctuation' | 'vocabulary'
  | 'life_science' | 'physical_science' | 'earth_space'

export interface Topic {
  slug: TopicSlug
  subject: SubjectSlug
  label: string
  description: string
  icon: string
  color: string
}

export type Difficulty = 'foundation' | 'developing' | 'proficient' | 'advanced'

// ─── Questions ────────────────────────────────────────────────────────────────

export interface Question {
  id: string
  topic: TopicSlug
  year_level: YearLevel
  difficulty: Difficulty
  question_text: string
  options: string[]
  correct_index: number
  explanation: string
  curriculum_code?: string   // e.g. "AC9M6N01"
  created_at: string
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
  selected_index: number
  is_correct: boolean
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
