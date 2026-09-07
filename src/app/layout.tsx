import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar, { type NavUser } from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'PrepNest — Practice Exams & Tutoring for Australian Students',
  description:
    'Curriculum-aligned practice exams across Maths, English & Science for Grade 5 to Year 12. Timed challenges, leaderboards, and parent progress reports.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'PrepNest — Practice Exams & Tutoring for Australian Students',
    description:
      'Curriculum-aligned practice exams across Maths, English & Science for Grade 5 to Year 12.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#185FA5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

async function getNavUser(): Promise<NavUser | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return {
    email: user.email ?? '',
    fullName: profile?.full_name ?? user.email ?? '',
    role: (profile?.role as NavUser['role']) ?? 'student',
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navUser = await getNavUser()

  return (
    <html lang="en" className={inter.variable}>
      <body className="flex flex-col min-h-screen">
        <Navbar user={navUser} />
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
