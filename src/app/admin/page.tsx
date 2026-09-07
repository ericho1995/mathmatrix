import { createClient } from '@/lib/supabase/server'
import QuestionsTable from '@/components/admin/QuestionsTable'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="max-w-md mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-medium tracking-tight mb-2">Admin</h1>
        <p className="text-gray-500">Sign in with an admin account to manage questions.</p>
      </main>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return (
      <main className="max-w-md mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-medium tracking-tight mb-2">Admin</h1>
        <p className="text-gray-500">This account doesn&apos;t have admin access.</p>
      </main>
    )
  }

  const { data: questions } = await supabase
    .from('questions')
    .select('id, topic, year_level, difficulty, question_text, is_published, curriculum_code')
    .order('topic')
    .order('year_level')

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-medium tracking-tight mb-1">Question bank</h1>
      <p className="text-gray-500 mb-8">
        {questions?.length ?? 0} questions. Toggle publish state below.
      </p>
      <QuestionsTable initialQuestions={questions ?? []} />
    </main>
  )
}
