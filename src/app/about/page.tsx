import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'About Richard Rothschild — Starting Monday',
  description: 'Richard Rothschild is a transformation CIO and the founder of Starting Monday. He built the platform after running his own executive search and finding the process broken.',
  alternates: {
    canonical: 'https://startingmonday.app/about',
  },
  openGraph: {
    title: 'About Richard Rothschild — Starting Monday',
    description: 'Transformation CIO. Founder of Starting Monday. Writing about executive search, technology leadership, and what it actually takes to land the right role.',
    url: 'https://startingmonday.app/about',
    type: 'profile',
  },
}

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Richard Rothschild',
  url: 'https://startingmonday.app/about',
  jobTitle: 'Chief Information Officer',
  description: 'Transformation CIO and founder of Starting Monday, an executive search campaign platform for senior technology leaders.',
  sameAs: [
    'https://www.linkedin.com/in/richrothschild',
  ],
  worksFor: {
    '@type': 'Organization',
    name: 'Starting Monday',
    url: 'https://startingmonday.app',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <JsonLd data={personJsonLd} />

      {/* Nav */}
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-white hover:text-slate-300 transition-colors">
            Starting Monday
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/blog" className="hidden sm:inline text-[13px] text-slate-400 hover:text-white transition-colors">
              Blog
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
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-5 mb-6">
            <img
              src="/headshot.jpg"
              alt="Richard Rothschild"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-700 shrink-0"
            />
            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-500 mb-1">
                About
              </p>
              <h1 className="text-[30px] sm:text-[38px] font-bold text-white leading-[1.15] tracking-tight">
                Richard Rothschild
              </h1>
            </div>
          </div>
          <p className="text-[16px] text-slate-400 leading-relaxed mb-4">
            Transformation CIO. Founder of Starting Monday.
          </p>
          <a
            href="https://www.linkedin.com/in/richrothschild"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[13px] text-slate-400 hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            linkedin.com/in/richrothschild
          </a>
        </div>
      </header>

      {/* Bio */}
      <article className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto space-y-6 text-[15px] text-slate-700 leading-relaxed">

          <p>
            I have spent my career as a transformation CIO. The work is the same in every organization: a
            technology function that is not delivering what the business needs, a leadership team that has
            lost confidence in IT, and a mandate to change both. The execution varies. The pattern does not.
          </p>

          <p>
            I built Starting Monday because I ran my own executive search and found the process broken. Not
            broken in the obvious ways. The job boards were there. The search firms returned calls. The
            problem was structural: the preparation tools available to a senior technology executive in active
            search were either built for a different era or built for a different audience. Nothing was built
            for someone operating at my level, running a search that needed to stay invisible until it was
            done.
          </p>

          <p>
            I spent months building a manual version of what Starting Monday does now. Tracking target
            companies. Logging every search firm conversation and every referral. Building the prep brief for
            each interview from scratch. The process worked. But it took time that a search demands you spend
            differently.
          </p>

          <p>
            Starting Monday is the automated version of what I built for myself. Early role intelligence from
            the organizational signals that precede CIO searches. A pipeline that tracks every relationship
            and every conversation. A prep brief that assembles your win thesis, likely objections, and
            company-specific questions in sixty seconds.
          </p>

          <p>
            The blog is the thinking that sits behind the platform. Everything here is what I wish I had read
            before I started my search. Not generic career advice. The specific mechanics of how CIO searches
            work, what search firms actually evaluate, how timing determines outcomes, and what preparation
            looks like when it is done at the right level.
          </p>

          <p>
            If you are a senior technology executive in active search or approaching one, the platform is
            built for you.{' '}
            <Link href="/for-cio" className="text-slate-900 underline hover:text-slate-600 transition-colors">
              Start here.
            </Link>
          </p>

          <div className="pt-4 border-t border-slate-100">
            <a
              href="https://www.linkedin.com/in/richrothschild"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-semibold text-slate-900 hover:text-slate-600 transition-colors"
            >
              Connect on LinkedIn &rarr;
            </a>
          </div>

        </div>
      </article>

      {/* Recent writing */}
      <section className="bg-slate-50 px-4 sm:px-6 py-12 border-t border-slate-100">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-6">
            Recent writing
          </p>
          <div className="space-y-4">
            {[
              { href: '/blog/cio-board-presentation', label: 'How to Prepare for a Board Presentation as a New CIO' },
              { href: '/blog/pe-backed-cio', label: 'What PE-Backed Companies Look for in a CIO' },
              { href: '/blog/executive-resume-gaps', label: 'The Executive Resume Gaps That Kill CIO Candidacies' },
              { href: '/blog/retained-search-firms', label: 'How to Work with Retained Search Firms Without Losing Leverage' },
              { href: '/blog/executive-search-firms-cio', label: 'What Executive Search Firms Actually Want from CIO Candidates' },
              { href: '/blog/cio-job-search-timeline', label: 'How Long Does a CIO Job Search Really Take?' },
              { href: '/blog/vp-to-cio-transition', label: 'How VPs of Technology Make the Move to CIO' },
              { href: '/blog/ciso-interview-preparation', label: 'How to Prepare for a CISO Interview' },
              { href: '/blog/what-companies-want-chief-data-officer', label: 'What Companies Actually Want in a Chief Data Officer' },
              { href: '/blog/cio-compensation-negotiation', label: 'How to Negotiate CIO Compensation' },
            ].map(post => (
              <Link
                key={post.href}
                href={post.href}
                className="block text-[14px] text-slate-700 hover:text-slate-900 transition-colors"
              >
                {post.label} &rarr;
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-5 pb-5 border-b border-slate-800">
            <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 hover:text-slate-300 transition-colors">
              Starting Monday
            </Link>
            <div className="flex items-center gap-4 sm:gap-5 flex-wrap">
              <Link href="/blog" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Blog</Link>
              <Link href="/about" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">About</Link>
              <a href="https://www.linkedin.com/company/starting-monday" target="_blank" rel="noopener noreferrer" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">LinkedIn</a>
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
