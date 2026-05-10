import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/onboarding',
          '/invite/',
          '/team/',
          '/unsubscribe/',
          '/coaches-guide',
        ],
      },
    ],
    sitemap: 'https://startingmonday.app/sitemap.xml',
  }
}
