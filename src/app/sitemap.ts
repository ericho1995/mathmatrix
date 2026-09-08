import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://prepnest.com.au'

  const routes = [
    '',
    '/practice',
    '/practice/exams',
    '/leaderboard',
    '/auth/login',
    '/auth/register',
    '/privacy',
    '/terms',
  ]

  return routes.map(path => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.6,
  }))
}
