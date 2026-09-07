import type { YearLevel, Topic, Subject } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Curriculum metadata — subjects, year levels, and topics shown throughout
// the app (landing page, practice flow, parent dashboard).
// ─────────────────────────────────────────────────────────────────────────────

export const SUBJECTS: Subject[] = [
  { slug: 'math',    label: 'Maths',   tagline: 'Number, algebra, geometry, statistics', icon: '📐', color: '#185FA5' },
  { slug: 'english', label: 'English', tagline: 'Reading, grammar, vocabulary',          icon: '📖', color: '#0F6E56' },
  { slug: 'science', label: 'Science', tagline: 'Life, physical & earth science',        icon: '🔬', color: '#BA7517' },
]

// Selective subjects — VCE-style Year 11-12 electives, practised separately
// from the general Grade 5-10 subjects above.
export const SELECTIVE_SUBJECTS: Subject[] = [
  { slug: 'chemistry',        label: 'Chemistry',          tagline: 'Atomic structure, reactions',      icon: '⚗️', color: '#0F6E56', selective: true },
  { slug: 'physics',          label: 'Physics',             tagline: 'Mechanics, electricity',           icon: '🧲', color: '#185FA5', selective: true },
  { slug: 'maths_methods',    label: 'Maths Methods',       tagline: 'Calculus, probability',            icon: '∫',  color: '#185FA5', selective: true },
  { slug: 'further_maths',    label: 'Further Mathematics', tagline: 'Data analysis, financial maths',   icon: '📊', color: '#BA7517', selective: true },
  { slug: 'specialist_maths', label: 'Specialist Maths',    tagline: 'Complex numbers, vectors',         icon: '🧮', color: '#0C447C', selective: true },
]

export const GRADES: { value: YearLevel; label: string }[] = [
  { value: 'grade_3',  label: 'Gr 3'  },
  { value: 'grade_4',  label: 'Gr 4'  },
  { value: 'grade_5',  label: 'Gr 5'  },
  { value: 'grade_6',  label: 'Gr 6'  },
  { value: 'year_7',   label: 'Yr 7'  },
  { value: 'year_8',   label: 'Yr 8'  },
  { value: 'year_9',   label: 'Yr 9'  },
  { value: 'year_10',  label: 'Yr 10' },
  { value: 'year_11',  label: 'Yr 11' },
  { value: 'year_12',  label: 'Yr 12' },
]

export const TOPICS: Topic[] = [
  // Maths
  { slug: 'number_operations',      subject: 'math',    label: 'Number & Operations',      description: 'Arithmetic, fractions, decimals', icon: '#️⃣', color: '#185FA5' },
  { slug: 'algebra_functions',      subject: 'math',    label: 'Algebra & Functions',      description: 'Equations, patterns, graphs',      icon: '🧮', color: '#185FA5' },
  { slug: 'geometry_measurement',   subject: 'math',    label: 'Geometry & Measurement',   description: 'Shapes, area, volume',             icon: '📏', color: '#185FA5' },
  { slug: 'statistics_probability', subject: 'math',    label: 'Statistics & Probability', description: 'Data, graphs, chance',             icon: '📊', color: '#185FA5' },

  // English
  { slug: 'reading_comprehension',  subject: 'english', label: 'Reading Comprehension',    description: 'Passages, inference, literary devices', icon: '📗', color: '#0F6E56' },
  { slug: 'grammar_punctuation',    subject: 'english', label: 'Grammar & Punctuation',    description: 'Sentence structure, punctuation rules', icon: '✍️', color: '#0F6E56' },
  { slug: 'vocabulary',             subject: 'english', label: 'Vocabulary',               description: 'Synonyms, antonyms, word roots',        icon: '🔤', color: '#0F6E56' },

  // Science
  { slug: 'life_science',           subject: 'science', label: 'Life Science',             description: 'Living things, biology, the body',      icon: '🌱', color: '#BA7517' },
  { slug: 'physical_science',       subject: 'science', label: 'Physical Science',         description: 'Matter, forces, energy',                icon: '⚡', color: '#BA7517' },
  { slug: 'earth_space',            subject: 'science', label: 'Earth & Space',            description: 'Earth systems, the solar system',       icon: '🌍', color: '#BA7517' },

  // Chemistry
  { slug: 'chem_atomic_structure',  subject: 'chemistry', label: 'Atomic Structure',       description: 'Electrons, atomic number, shells',      icon: '⚛️', color: '#0F6E56' },
  { slug: 'chem_reactions',         subject: 'chemistry', label: 'Chemical Reactions',      description: 'Reaction types, balancing equations',   icon: '🧪', color: '#0F6E56' },

  // Physics
  { slug: 'phys_mechanics',         subject: 'physics',   label: 'Mechanics',              description: 'Motion, forces, energy',                icon: '🎯', color: '#185FA5' },
  { slug: 'phys_electricity',       subject: 'physics',   label: 'Electricity',            description: 'Current, voltage, resistance',          icon: '🔌', color: '#185FA5' },

  // Maths Methods
  { slug: 'mm_calculus',            subject: 'maths_methods', label: 'Calculus',           description: 'Differentiation basics',                icon: '📈', color: '#185FA5' },
  { slug: 'mm_probability',         subject: 'maths_methods', label: 'Probability',        description: 'Independent events, distributions',     icon: '🎲', color: '#185FA5' },

  // Further Maths
  { slug: 'fm_data_analysis',       subject: 'further_maths', label: 'Data Analysis',      description: 'Median, quartiles, spread',             icon: '📉', color: '#BA7517' },
  { slug: 'fm_financial',           subject: 'further_maths', label: 'Financial Maths',    description: 'Interest, loans, investments',          icon: '💰', color: '#BA7517' },

  // Specialist Maths
  { slug: 'sm_complex_numbers',     subject: 'specialist_maths', label: 'Complex Numbers', description: 'Imaginary unit, modulus',               icon: '🔢', color: '#0C447C' },
  { slug: 'sm_vectors',             subject: 'specialist_maths', label: 'Vectors',         description: 'Magnitude, dot product',                icon: '➡️', color: '#0C447C' },
]
