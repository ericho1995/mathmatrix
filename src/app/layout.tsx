import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'MathMatrix — Practice Exams & Tutoring for Australian Students',
  description:
    'Curriculum-aligned practice exams across Maths, English & Science for Grade 3 to Year 12. Timed challenges, leaderboards, and parent progress reports.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#185FA5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
