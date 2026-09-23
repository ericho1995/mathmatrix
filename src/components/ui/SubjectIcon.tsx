import {
  Atom,
  BarChart3,
  BookOpen,
  Calculator,
  FileText,
  FlaskConical,
  Microscope,
  Sigma,
  SpellCheck,
  SquareFunction,
  type LucideIcon,
} from 'lucide-react'
import { SELECTIVE_SUBJECTS, SUBJECTS } from '@/lib/curriculum'
import type { SubjectSlug } from '@/types'

/**
 * One line icon per subject, in the subject's colour on a soft tile.
 *
 * Replaces the emoji in the curriculum data wherever a subject is shown. Emoji
 * render differently on every device (and as outlined glyphs on older Windows),
 * which made the catalogue look unfinished next to the rest of the page.
 */
const ICON: Record<SubjectSlug, LucideIcon> = {
  math: Calculator,
  reading: BookOpen,
  english: SpellCheck,
  science: Microscope,
  chemistry: FlaskConical,
  physics: Atom,
  maths_methods: SquareFunction,
  general_maths: BarChart3,
  specialist_maths: Sigma,
}

const COLOR = new Map<string, string>([...SUBJECTS, ...SELECTIVE_SUBJECTS].map(s => [s.slug, s.color]))

const SIZES = {
  sm: { tile: 'w-7 h-7 rounded-lg', icon: 'w-4 h-4' },
  md: { tile: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5' },
}

export default function SubjectIcon({ subject, size = 'md' }: { subject: SubjectSlug; size?: keyof typeof SIZES }) {
  const color = COLOR.get(subject) ?? '#185FA5'
  const Glyph = ICON[subject] ?? FileText
  const s = SIZES[size]
  return (
    <span
      aria-hidden
      className={`${s.tile} inline-flex items-center justify-center flex-shrink-0`}
      style={{ backgroundColor: `${color}14`, color }}
    >
      <Glyph className={s.icon} />
    </span>
  )
}
