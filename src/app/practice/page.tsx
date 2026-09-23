import type { Metadata } from 'next'
import { Suspense } from 'react'
import PracticeBuilder from '@/components/practice/PracticeBuilder'
import { createClient } from '@/lib/supabase/server'
import { practiceRange } from '@/lib/practice'

// A server page so /practice has its own title and description. It was a
// client component, so it inherited the homepage's, and the sitemap entry for
// it pointed search engines at a page that described a different one.
export const metadata: Metadata = {
  title: 'Free practice quizzes by topic — PrepNest',
  description: `Free on-screen practice for ${practiceRange()}. Choose a year level and topics, and every question is marked instantly with a worked explanation. No account needed.`,
}

export default async function PracticePage() {
  // Only used to decide whether to suggest signing in. One auth call, not the
  // full entitlement lookup: nothing on this page is paid.
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    // useSearchParams (the marked-paper hand-off) needs a Suspense boundary.
    <Suspense fallback={null}>
      <PracticeBuilder signedIn={Boolean(user)} />
    </Suspense>
  )
}
