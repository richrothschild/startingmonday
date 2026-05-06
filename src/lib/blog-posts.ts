export interface BlogPostMeta {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  keywords: string[]
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: 'executive-search-firms-cio',
    title: 'What Executive Search Firms Actually Want from CIO Candidates',
    description: 'Most technology executives think about executive search firms the wrong way. Here is how retained search actually works, what gets you on the short list, and why timing matters more than almost anything else.',
    date: '2026-05-06',
    readTime: '6 min read',
    keywords: [
      'executive search firms CIO',
      'how to work with executive search firms',
      'CIO search firms',
      'what executive recruiters want',
      'CIO job search strategy',
      'retained executive search',
      'how to get on CIO short list',
    ],
  },
  {
    slug: 'cio-job-search-timeline',
    title: 'How Long Does a CIO Job Search Really Take?',
    description: 'The honest answer most people do not say out loud: six to eighteen months. The range is that wide for a reason, and where you land in it depends on decisions you make before you start.',
    date: '2026-05-06',
    readTime: '5 min read',
    keywords: [
      'CIO job search timeline',
      'how long does executive job search take',
      'CIO job search strategy',
      'executive job search timeline',
      'technology executive search',
      'CIO career transition',
    ],
  },
]

export function getPost(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}
