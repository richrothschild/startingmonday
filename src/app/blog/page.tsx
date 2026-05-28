import type { Metadata } from 'next'
import Link from 'next/link'
import { BLOG_POSTS } from '@/lib/blog-posts'

export const metadata: Metadata = {
  title: 'Blog - Starting Monday',
  description: 'Practical guidance for VP and C-suite technology executives in active search, and the coaches, search firms, and advisors who work with them.',
  keywords: [
    'CIO job search advice',
    'executive job search blog',
    'technology executive career',
    'CIO career strategy',
    'executive search firm advice',
  ],
  alternates: {
    canonical: 'https://startingmonday.app/blog',
  },
  openGraph: {
    title: 'Blog - Starting Monday',
    description: 'Practical guidance for VP and C-suite technology executives in active search, and the coaches, search firms, and advisors who work with them.',
    url: 'https://startingmonday.app/blog',
    type: 'website',
  },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const INTERMEDIARY_SLUGS = new Set([
  'executive-coaching-candidate-infrastructure',
  'retained-search-candidate-preparation',
  'technology-executive-transition-chro',
])

export default function BlogIndexPage() {
  const executivePosts = BLOG_POSTS.filter(p => !INTERMEDIARY_SLUGS.has(p.slug))
  const intermediaryPosts = BLOG_POSTS.filter(p => INTERMEDIARY_SLUGS.has(p.slug))

  return (
    <div className="min-h-screen bg-white font-sans">

              {/* Nav */}
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-white hover:text-slate-300 transition-colors">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/partners" className="hidden sm:inline text-[13px] text-slate-400 hover:text-white transition-colors">
              Partners
            </Link>
            <Link href="/optimize" className="hidden sm:inline text-[13px] text-slate-400 hover:text-white transition-colors">
              Free Profile Grade
            </Link>
            <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-[13px] font-semibold text-slate-900 bg-white px-4 py-1.5 rounded hover:bg-slate-100 transition-colors"
            >
              Try free
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-slate-900 px-4 sm:px-6 pt-14 pb-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-500 mb-4">
            Starting Monday
          </p>
          <h1 className="text-[34px] sm:text-[42px] font-bold text-white leading-tight mb-4">
            The executive search brief.
          </h1>
          <p className="text-[16px] text-slate-400 leading-relaxed max-w-xl">
            Practical guidance for C-suite technology executives in active search, and the coaches, search firms, and advisors who work with them.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/demo" className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[13px] font-semibold px-5 py-2.5 rounded transition-colors">
              See a live prep brief &rarr;
            </Link>
            <Link href="/pricing" className="inline-block border border-slate-700 hover:border-slate-500 text-slate-200 text-[13px] px-5 py-2.5 rounded transition-colors">
              Review pricing &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Executive post list */}
      <section className="px-4 sm:px-6 py-14 sm:py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-[12px] text-slate-500 mb-5 leading-relaxed">
            Every article should help you decide whether Starting Monday solves your next step. If the post is useful, the next click should be the demo or the pricing page, not another blog post.
          </p>
          <div className="divide-y divide-slate-100">
            {executivePosts.map(post => (
              <article key={post.slug} className="py-9 first:pt-0">
                <Link href={`/blog/${post.slug}`} className="group block">
                  <p className="text-[12px] text-slate-400 mb-3">
                    {formatDate(post.date)} &middot; {post.readTime}
                  </p>
                  <h2 className="text-[22px] font-bold text-slate-900 leading-snug mb-3 group-hover:text-slate-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[15px] text-slate-500 leading-relaxed mb-4">
                    {post.description}
                  </p>
                  <span className="text-[13px] font-semibold text-slate-900 group-hover:text-slate-600 transition-colors">
                    Read &rarr;
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Intermediary section */}
      <section className="px-4 sm:px-6 pb-14 sm:pb-16 border-t border-slate-100">
        <div className="max-w-3xl mx-auto pt-12">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-8">
            For coaches, search firms, and advisors
          </p>
          <div className="mb-6 flex flex-wrap gap-3">
            <Link href="/for-coaches" className="inline-block bg-slate-900 hover:bg-slate-700 text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors">
              Coach guide &rarr;
            </Link>
            <Link href="/partners" className="inline-block border border-slate-300 hover:border-slate-500 text-slate-700 text-[13px] px-5 py-2.5 rounded transition-colors">
              Partner program &rarr;
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {intermediaryPosts.map(post => (
              <article key={post.slug} className="py-9 first:pt-0">
                <Link href={`/blog/${post.slug}`} className="group block">
                  <p className="text-[12px] text-slate-400 mb-3">
                    {formatDate(post.date)} &middot; {post.readTime}
                  </p>
                  <h2 className="text-[22px] font-bold text-slate-900 leading-snug mb-3 group-hover:text-slate-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[15px] text-slate-500 leading-relaxed mb-4">
                    {post.description}
                  </p>
                  <span className="text-[13px] font-semibold text-slate-900 group-hover:text-slate-600 transition-colors">
                    Read &rarr;
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-5 border-b border-slate-800">
            <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 hover:text-slate-300 transition-colors">
              <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
            </Link>
            <div className="flex items-center gap-5 flex-wrap">
              <Link href="/optimize" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Free Profile Grade</Link>
              <Link href="/privacy" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Terms</Link>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} Starting Monday. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  )
}
