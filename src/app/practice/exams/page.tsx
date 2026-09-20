import Link from 'next/link'
import { PRACTICE_EXAMS, type PracticeExam } from '@/lib/questions/exams'
import { SUBJECTS, SELECTIVE_SUBJECTS, GRADES } from '@/lib/curriculum'
import PracticeModeTabs from '@/components/practice/PracticeModeTabs'
import PurchaseBanner from '@/components/practice/PurchaseBanner'
import { BUNDLE_PRICE, YEAR_LEVEL_LABEL } from '@/lib/pricing'
import { listEntitledYearLevels } from '@/lib/auth/getEntitlements'
import { getUserRole } from '@/lib/auth/getUserRole'
import { createClient } from '@/lib/supabase/server'
import type { YearLevel } from '@/types'

/**
 * Strips the subject-and-year prefix a generated title carries, so a card in
 * the Grade 3 Maths group reads "Practice Exam 2" rather than repeating
 * "Maths Grade 3 —" on every line. Kept truthful rather than positional: the
 * VCE papers are "Examination 1"/"Examination 2", not 1 and 2 of a series, and
 * numbering them by index misnamed them.
 */
function shortTitle(exam: PracticeExam): string {
  const parts = exam.title.split(' — ')
  return parts[parts.length - 1] ?? exam.title
}

export default async function ExamsPage({
  searchParams,
}: {
  searchParams?: { purchased?: string }
}) {
  // What this visitor can already download. Admins see everything unlocked so
  // the catalogue stays inspectable in production, matching the exam detail
  // page and the PDF routes — all three decide access the same way.
  const [entitled, role, { data: auth }] = await Promise.all([
    listEntitledYearLevels(),
    getUserRole(),
    createClient().auth.getUser(),
  ])
  const owned = new Set<YearLevel>(entitled)
  const isAdmin = role === 'admin'
  const signedIn = Boolean(auth.user)

  const unlocked = (exam: PracticeExam) => !exam.premium || isAdmin || owned.has(exam.yearLevel)

  // Stripe's success_url comes back here. Validated against the real year
  // levels rather than rendering whatever is in the query string, and only for
  // a signed-in visitor — checkout requires an account, so anyone else reached
  // this by typing the parameter and should not be told a payment succeeded.
  const purchasedParam = searchParams?.purchased
  const purchased =
    signedIn && purchasedParam && purchasedParam in YEAR_LEVEL_LABEL
      ? (purchasedParam as YearLevel)
      : null

  const generalExams = PRACTICE_EXAMS.filter(e => SUBJECTS.some(s => s.slug === e.subject))
  const selectiveExams = PRACTICE_EXAMS.filter(e => SELECTIVE_SUBJECTS.some(s => s.slug === e.subject))

  const freeCount = PRACTICE_EXAMS.filter(e => !e.premium).length

  function ExamLink({ exam }: { exam: PracticeExam }) {
    const open = unlocked(exam)
    return (
      <Link
        href={`/practice/exams/${exam.id}`}
        className="text-sm text-gray-700 hover:text-brand-600 hover:underline flex items-center gap-1.5"
      >
        <span aria-hidden>{open ? '📄' : '🔒'}</span>
        {shortTitle(exam)}
        {!exam.premium && <span className="text-xs text-teal-600">Free</span>}
        {exam.premium && open && <span className="text-xs text-teal-600">Unlocked</span>}
      </Link>
    )
  }

  function YearGroup({ yearLevel, exams }: { yearLevel: YearLevel; exams: PracticeExam[] }) {
    const label = GRADES.find(g => g.value === yearLevel)?.label ?? yearLevel
    const locked = exams.filter(e => !unlocked(e)).length
    return (
      <div className="card">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">{label}</p>
        <div className="flex flex-col gap-1.5">
          {exams.map(exam => (
            <ExamLink key={exam.id} exam={exam} />
          ))}
        </div>
        {locked > 0 && (
          <p className="text-xs text-gray-400 mt-2.5">
            {locked} more {locked === 1 ? 'paper' : 'papers'} — {BUNDLE_PRICE} unlocks{' '}
            {YEAR_LEVEL_LABEL[yearLevel]}
          </p>
        )}
      </div>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full">
      <h1 className="text-2xl font-medium tracking-tight mb-1">Practice</h1>
      <p className="text-gray-500 mb-6">
        Ready-made, downloadable exam papers for each subject and year level.
      </p>

      {purchased && (
        <PurchaseBanner
          yearLabel={YEAR_LEVEL_LABEL[purchased]}
          settled={isAdmin || owned.has(purchased)}
        />
      )}

      <PracticeModeTabs />

      {/* The pricing sentence a visitor reads before anything else. It said
          "{price} each" while the product is a whole-year-level bundle and 31
          of these papers are free — the storefront contradicting the checkout. */}
      <p className="text-sm text-gray-500 mb-8">
        One payment of <span className="font-medium text-gray-700">{BUNDLE_PRICE}</span> unlocks
        every paper for a year level — each with a printable exam and a separate answer key.{' '}
        {freeCount} sample papers are free, so you can see exactly what you are buying first.
      </p>

      <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">
        General subjects
      </h2>
      {SUBJECTS.map(subject => {
        const subjectExams = generalExams.filter(e => e.subject === subject.slug)
        if (subjectExams.length === 0) return null
        return (
          <div key={subject.slug} className="mb-8">
            <p className="font-medium text-sm mb-3 flex items-center gap-2">
              <span aria-hidden>{subject.icon}</span> {subject.label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GRADES.map(grade => {
                const gradeExams = subjectExams.filter(e => e.yearLevel === grade.value)
                if (gradeExams.length === 0) return null
                return <YearGroup key={grade.value} yearLevel={grade.value} exams={gradeExams} />
              })}
            </div>
          </div>
        )
      })}

      <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4 mt-10">
        Selective subjects (Yr 11-12)
      </h2>
      {/* Split by year level, like the general subjects above. These used to
          share one card per subject, which put Year 11 and Year 12 papers in
          a single list under one price — implying a Year 11 purchase covers
          the Unit 3 & 4 papers, which it does not. */}
      {SELECTIVE_SUBJECTS.map(subject => {
        const subjectExams = selectiveExams.filter(e => e.subject === subject.slug)
        if (subjectExams.length === 0) return null
        return (
          <div key={subject.slug} className="mb-8">
            <p className="font-medium text-sm mb-3 flex items-center gap-2">
              <span aria-hidden>{subject.icon}</span> {subject.label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GRADES.map(grade => {
                const gradeExams = subjectExams.filter(e => e.yearLevel === grade.value)
                if (gradeExams.length === 0) return null
                return <YearGroup key={grade.value} yearLevel={grade.value} exams={gradeExams} />
              })}
            </div>
          </div>
        )
      })}
    </main>
  )
}
