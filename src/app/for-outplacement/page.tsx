import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Starting Monday for Outplacement Firms - Partner Guide',
  description: 'How outplacement firms use Starting Monday to give displaced executives an active search platform, not a workshop binder. Bulk seats, activation tracking, and outcomes.',
  alternates: { canonical: 'https://startingmonday.app/for-outplacement' },
  openGraph: {
    title: 'Starting Monday for Outplacement Firms',
    description: 'Give displaced executives a tool built for active search - not a workshop they will forget in two weeks.',
    url: 'https://startingmonday.app/for-outplacement',
  },
}

const FEATURES = [
  {
    name: 'Active Search Infrastructure',
    forFirm: 'Your program graduates executives with a clear understanding of the search process. Starting Monday gives them the platform to actually run it. Pipeline command center, company intelligence scanner, daily briefing, interview prep briefs - it is the operational layer that turns your workshop into an active campaign.',
    outcome: 'Executives leave your program with a running search, not a revised resume and a list of job boards. Your placement outcomes improve. Your client\'s HR team sees the difference.',
  },
  {
    name: 'Company Intelligence Scanner',
    forFirm: 'The scanner monitors every company an executive is tracking - news, executive departures, funding, 8-K filings, career page postings - every 48 hours. When signals cluster into a pattern that precedes a CIO or VP search, the platform names it and alerts the executive before the role is formalized.',
    outcome: 'Executives reach out to target companies before searches go to firms. That is the window that matters at the senior level. Your program delivers it.',
  },
  {
    name: 'Daily Briefing and Accountability',
    forFirm: 'Every morning, the platform sends each enrolled executive a digest of new signals, pending follow-up actions, and pipeline status. It installs the daily discipline that displaced executives often lose when the structure of employment disappears. No coach or counselor needs to manually check in.',
    outcome: 'Search activity stays consistent between check-ins. Executives who were drifting stay in motion. Your counselors spend time on strategy, not accountability.',
  },
  {
    name: 'AI Interview Prep Briefs',
    forFirm: 'Before every interview, the platform generates a full prep brief in about a minute: company situation, the win thesis the executive should lead with, likely objections and how to counter them, and the questions only a peer would ask. It draws from everything the executive has tracked and researched on that company.',
    outcome: 'Executives arrive at interviews prepared at depth. First-round pass rates improve. The difference between a prepared senior candidate and an unprepared one is audible in ten minutes.',
  },
  {
    name: 'Bulk Activation and Usage Tracking',
    forFirm: 'For outplacement programs, we provide bulk seat pricing with centralized billing and activation tracking. You can see which executives have activated their accounts, what their search activity looks like, and who may need a push. No manual check-ins required to know where each program participant stands.',
    outcome: 'Your counselors have a clear view of engagement across the cohort. You can identify who needs attention before they fall behind.',
  },
]

export default function ForOutplacementPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Nav */}
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/demo" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              See a demo
            </Link>
            <Link
              href="/partners"
              className="text-[13px] font-semibold text-slate-900 bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors"
            >
              Become a partner
            </Link>
          </div>
        </div>
      </nav>

      <main>

        {/* Header */}
        <header className="bg-slate-900 px-4 sm:px-6 pt-14 pb-12">
          <div className="max-w-2xl mx-auto">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">
              Partner Guide
            </p>
            <h1 className="text-[30px] sm:text-[38px] font-bold text-white leading-[1.15] tracking-tight mb-4">
              Starting Monday for <span className="whitespace-nowrap">Outplacement Firms</span>
            </h1>
            <p className="text-[16px] text-slate-400 leading-relaxed">
              Give displaced executives an active search platform. Not a workshop they will forget in two weeks.
            </p>
          </div>
        </header>

        {/* Body */}
        <div className="px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto space-y-14">

            {/* What it is */}
            <section className="space-y-4 text-[15px] text-slate-700 leading-relaxed">
              <h2 className="text-[22px] font-bold text-slate-900">What Starting Monday is</h2>
              <p>
                Starting Monday is an AI-powered search platform built for VP and C-suite executives
                in active career transition. Pipeline tracking, company intelligence scanning, AI
                interview prep briefs, daily briefing, and a strategy brief built from their background
                and target list.
              </p>
              <p>
                For outplacement firms, it is the operational layer that turns your program into an
                active campaign. Your counselors provide the strategy and support. Starting Monday
                provides the infrastructure the executive needs to actually run the search.
              </p>
            </section>

            {/* The gap */}
            <section className="space-y-4 text-[15px] text-slate-700 leading-relaxed">
              <h2 className="text-[22px] font-bold text-slate-900">The gap it fills</h2>
              <p>
                Most outplacement programs are built around workshops, resume reviews, and interview
                coaching. Those are necessary. But they do not give the executive the daily operational
                infrastructure to run a modern senior search.
              </p>
              <p>
                Your executive leaves the program with a revised resume, a revised LinkedIn profile,
                and a list of best practices. Then they go home and manage their search in a
                spreadsheet - manually tracking 40 companies, missing signals before roles are posted,
                preparing for interviews the night before with a ten-minute web search.
              </p>
              <p>
                The gap between your program and a successful placement is infrastructure. Starting
                Monday fills it.
              </p>
            </section>

            {/* How firms use it */}
            <section className="space-y-6">
              <h2 className="text-[22px] font-bold text-slate-900">How outplacement firms use it</h2>
              <div className="space-y-8">
                {FEATURES.map(f => (
                  <div key={f.name} className="border-l-2 border-orange-500 pl-5">
                    <p className="text-[13px] font-bold tracking-[0.1em] uppercase text-orange-600 mb-2">{f.name}</p>
                    <p className="text-[15px] text-slate-700 leading-relaxed mb-2">{f.forFirm}</p>
                    <p className="text-[13px] text-slate-500 leading-relaxed">
                      <span className="font-semibold text-slate-700">Outcome: </span>{f.outcome}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* What it does not do */}
            <section className="space-y-4 text-[15px] text-slate-700 leading-relaxed">
              <h2 className="text-[22px] font-bold text-slate-900">What it does not do</h2>
              <p>
                Starting Monday does not replace your counselors, your resume reviewers, or your
                interview coaches. It does not provide the human calibration, the emotional support,
                or the strategic judgment that a displaced senior executive needs in the first weeks
                of transition.
              </p>
              <p>
                It handles the research, the tracking, and the daily search discipline. Your team
                handles everything else.
              </p>
            </section>

            {/* For your practice */}
            <section className="space-y-4 text-[15px] text-slate-700 leading-relaxed">
              <h2 className="text-[22px] font-bold text-slate-900">For your program</h2>
              <p>
                The simplest way to start: enroll your next senior executive cohort and include
                Starting Monday as part of the program package. Activation tracking shows you who
                is using it and who needs encouragement.
              </p>
              <ul className="space-y-2 pl-4">
                {[
                  'Bulk seat pricing with centralized billing for outplacement programs',
                  'Activation tracking: see which executives have enrolled and are active',
                  'Active plan ($199/month per seat) includes all AI features',
                  'Monitor plan ($49/month per seat) for executives not yet in active search mode',
                  'Volume discounts available for program cohorts of 5 or more seats',
                  'Apply to the partner program at startingmonday.app/partners to discuss bulk seat pricing, activation tracking, and preferred partner arrangements',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold shrink-0 mt-0.5">+</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Apply CTA */}
            <section className="bg-slate-50 border border-slate-200 rounded-lg p-7">
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">
                Ready to partner?
              </p>
              <h2 className="text-[20px] font-bold text-slate-900 mb-3 leading-snug">
                Apply to the partner program
              </h2>
              <p className="text-[14px] text-slate-500 leading-relaxed mb-6">
                Fill out the application and we will follow up within 2 business days with your referral link, commission tracking, and partner resource kit.
              </p>
              <Link
                href="/partners#apply"
                className="inline-block bg-orange-500 text-slate-900 text-[14px] font-bold px-7 py-3 rounded hover:bg-orange-600 transition-colors"
              >
                Apply now &rarr;
              </Link>
              <p className="text-[13px] text-slate-400 mt-4">
                Want to see the platform first?{' '}
                <Link href="/demo" className="text-slate-600 underline hover:text-slate-900 transition-colors">
                  Walk through a live demo
                </Link>
                .
              </p>
            </section>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-8 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <p className="text-[11px] text-slate-500">
            Questions? contact@startingmonday.app
          </p>
        </div>
      </footer>

    </div>
  )
}
