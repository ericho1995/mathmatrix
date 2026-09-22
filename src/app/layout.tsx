import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar, { type NavUser } from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/logError'
import { CATALOGUE_TOTALS } from '@/lib/catalogue'
import { SITE_URL } from '@/lib/site'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

// Built from the catalogue so the search snippet can't drift from the site —
// it said "Grade 5 to Year 12" while the catalogue started at Grade 3.
const DESCRIPTION = `Printable NAPLAN and VCE practice exams for ${CATALOGUE_TOTALS.lowest} to ${CATALOGUE_TOTALS.highest}, each with a separate answer key. ${CATALOGUE_TOTALS.free} papers free to download.`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'PrepNest — NAPLAN & VCE practice exams you can print',
  description: DESCRIPTION,
  manifest: '/manifest.json',
  openGraph: {
    title: 'PrepNest — NAPLAN & VCE practice exams you can print',
    description: DESCRIPTION,
    type: 'website',
    siteName: 'PrepNest',
    locale: 'en_AU',
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

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  // The nav still renders from the auth user alone, so a failed profile read
  // degrades rather than breaking the whole app — but it silently drops the
  // user's role, which is why it must not pass unlogged.
  queryFailed('layout.navProfile', error, { userId: user.id })

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
        {/* Cookieless page-view counts, so no consent banner. Collects nothing until
            Web Analytics is enabled for the project in the Vercel dashboard. */}
        <Analytics />
      </body>
    </html>
  )
}
