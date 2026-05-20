import type { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/lib/blog-posts'

const BASE = 'https://startingmonday.app'
const STATIC_LAST_MODIFIED = new Date('2026-05-13T00:00:00.000Z')

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/about`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/blog`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/references`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/method-and-evidence`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/evidence-room`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/pilot-findings`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/founder-note`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/annual-report-2026`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/research-brief`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/demo`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/pricing`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/optimize`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/for-cio`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/for-coo`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/for-cdo`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/for-ciso`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/for-cpo`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/for-data-officer`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/for-vp-technology`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/for-vp`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/concierge`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/partners`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.55 },
    { url: `${BASE}/privacy`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/security`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map(post => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...blogPages]
}
