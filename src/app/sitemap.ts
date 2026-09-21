import type { MetadataRoute } from 'next'
import { PRACTICE_EXAMS } from '@/lib/questions/exams'
import { YEAR_LEVEL_STATS } from '@/lib/catalogue'
import { SITE_URL } from '@/lib/site'

/**
 * Every public page, including one entry per exam paper and per year level.
 *
 * The papers are what people search for ("year 5 NAPLAN practice test",
 * "VCE methods exam 1 practice") and the sitemap previously listed none of
 * them — only eight top-level routes.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const page = (path: string, priority: number, changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly') => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  })

  return [
    page('', 1, 'daily'),
    page('/practice/exams', 0.9),
    page('/naplan', 0.9),
    page('/vce', 0.9),
    page('/pricing', 0.8),
    page('/practice', 0.7),
    page('/help', 0.5, 'monthly'),
    page('/leaderboard', 0.3, 'daily'),
    page('/auth/register', 0.4, 'monthly'),
    page('/auth/login', 0.2, 'monthly'),
    page('/privacy', 0.2, 'monthly'),
    page('/terms', 0.2, 'monthly'),
    ...YEAR_LEVEL_STATS.map(s => page(`/practice/exams?year=${s.yearLevel}`, 0.7)),
    ...PRACTICE_EXAMS.map(e => page(`/practice/exams/${e.id}`, e.premium ? 0.5 : 0.6, 'monthly')),
  ]
}
