import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://prepnest.com.au'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/parent', '/auth/callback'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
