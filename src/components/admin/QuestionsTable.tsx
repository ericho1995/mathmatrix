'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface QuestionRow {
  id: string
  topic: string
  year_level: string
  difficulty: string
  question_text: string
  is_published: boolean
  curriculum_code: string | null
}

export default function QuestionsTable({ initialQuestions }: { initialQuestions: QuestionRow[] }) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function togglePublished(id: string, current: boolean) {
    setPendingId(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('questions')
      .update({ is_published: !current })
      .eq('id', id)

    if (!error) {
      setQuestions(qs => qs.map(q => (q.id === id ? { ...q, is_published: !current } : q)))
    }
    setPendingId(null)
  }

  if (questions.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No questions found. Run <code>supabase/seed.sql</code> in the SQL editor to load the bank.
      </p>
    )
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
            <th className="pb-3 pr-4">Question</th>
            <th className="pb-3 pr-4">Topic</th>
            <th className="pb-3 pr-4">Year</th>
            <th className="pb-3 pr-4">Difficulty</th>
            <th className="pb-3 pr-4">Curriculum</th>
            <th className="pb-3">Published</th>
          </tr>
        </thead>
        <tbody>
          {questions.map(q => (
            <tr key={q.id} className="border-b border-gray-50 last:border-0">
              <td className="py-3 pr-4 max-w-sm">{q.question_text}</td>
              <td className="py-3 pr-4 text-gray-500">{q.topic}</td>
              <td className="py-3 pr-4 text-gray-500">{q.year_level}</td>
              <td className="py-3 pr-4 text-gray-500">{q.difficulty}</td>
              <td className="py-3 pr-4 text-gray-500">{q.curriculum_code ?? 'N/A'}</td>
              <td className="py-3">
                <button
                  onClick={() => togglePublished(q.id, q.is_published)}
                  disabled={pendingId === q.id}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all
                    ${q.is_published ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {q.is_published ? 'Published' : 'Draft'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
