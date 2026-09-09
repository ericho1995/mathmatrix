import Link from 'next/link'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { SUBJECTS, SELECTIVE_SUBJECTS, GRADES } from '@/lib/curriculum'
import PracticeModeTabs from '@/components/practice/PracticeModeTabs'
import { PREMIUM_PRICE } from '@/lib/pricing'

export default function ExamsPage() {
  const generalExams = PRACTICE_EXAMS.filter(e => SUBJECTS.some(s => s.slug === e.subject))
  const selectiveExams = PRACTICE_EXAMS.filter(e => SELECTIVE_SUBJECTS.some(s => s.slug === e.subject))

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full">
      <h1 className="text-2xl font-medium tracking-tight mb-1">Practice</h1>
      <p className="text-gray-500 mb-6">
        Ready-made exams, pre-built for each subject and year level.
      </p>

      <PracticeModeTabs />

      <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">General subjects</h2>
      {SUBJECTS.map(subject => {
        const subjectExams = generalExams.filter(e => e.subject === subject.slug)
        if (subjectExams.length === 0) return null
        return (
          <div key={subject.slug} className="mb-8">
            <p className="font-medium text-sm mb-3 flex items-center gap-2">
              <span>{subject.icon}</span> {subject.label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GRADES.map(grade => {
                const gradeExams = subjectExams.filter(e => e.yearLevel === grade.value)
                if (gradeExams.length === 0) return null
                return (
                  <div key={grade.value} className="card">
                    <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">{grade.label}</p>
                    <div className="flex flex-col gap-1.5">
                      {gradeExams.map((exam, i) => (
                        <Link key={exam.id} href={`/practice/exams/${exam.id}`}
                          className="text-sm text-gray-700 hover:text-brand-600 hover:underline">
                          Practice Exam {i + 1}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1 mt-10">
        Selective subjects (Yr 11-12)
      </h2>
      <p className="text-xs text-gray-400 mb-4">Premium exam papers — {PREMIUM_PRICE} each.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SELECTIVE_SUBJECTS.map(subject => {
          const subjectExams = selectiveExams.filter(e => e.subject === subject.slug)
          if (subjectExams.length === 0) return null
          return (
            <div key={subject.slug} className="card">
              <p className="font-medium text-sm mb-2 flex items-center gap-2">
                <span>{subject.icon}</span> {subject.label}
              </p>
              <div className="flex flex-col gap-1.5">
                {subjectExams.map((exam, i) => (
                  <Link key={exam.id} href={`/practice/exams/${exam.id}`}
                    className="text-sm text-gray-700 hover:text-brand-600 hover:underline flex items-center gap-1.5">
                    🔒 Practice Exam {i + 1}
                    <span className="text-xs text-gray-400">{PREMIUM_PRICE}</span>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
