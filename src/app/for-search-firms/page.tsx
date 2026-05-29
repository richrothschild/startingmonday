import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Starting Monday for Retained Search Firms - Partner Guide',
  description: 'How retained search firms use Starting Monday to prepare candidates who arrive at peer level. Features, outcomes, and how to get candidates started.',
  alternates: { canonical: 'https://startingmonday.app/for-search-firms' },
  openGraph: {
    title: 'Starting Monday for Retained Search Firms',
    description: 'Give your candidates the intelligence advantage that determines whether they advance - or get cut before the second round.',
    url: 'https://startingmonday.app/for-search-firms',
  },
}

const FEATURES = [
  {
    name: 'Company Intelligence Before Every Interview',
    forFirm: 'Your candidate has three interviews this week across three different companies. Each requires a different preparation angle - competitive dynamics, recent executive changes, technology posture, sector context. Starting Monday assembles all of it automatically from the signals your candidate has been tracking. No manual research night before.',
    outcome: 'Candidates arrive prepared at the depth of a peer, not a job seeker. The difference is audible in the first ten minutes. That reflects on your firm.',
  },
  {
    name: 'AI Prep Brief',
    forFirm: 'Sixty seconds before any interview, the platform generates a full prep brief: the company situation, the win thesis your candidate should lead with, the objections the hiring committee will raise and how to answer them, and the questions only an insider would think to ask. It draws from everything your candidate has tracked and researched.',
    outcome: 'First-round pass rates improve when candidates are prepared at this level. That is fewer second chances needed and a tighter timeline to close.',
  },
  {
    name: 'Pipeline Visibility',
    forFirm: 'The pipeline shows every company your candidate is actively tracking, the stage of each relationship, pending follow-up actions, and conversation notes. If your candidate shares view access with you, you see exactly where their energy is going - which conversations are active, which are stalled, and where you can add value.',
    outcome: 'Your calls become more strategic. You stop asking for updates and start providing intelligence. The relationship changes.',
  },
  {
    name: 'Daily Search Discipline',
    forFirm: 'The platform sends a morning briefing: new signals on tracked companies, pending follow-ups due, pipeline actions overdue. It installs the daily discipline that candidates in active search often lack. When signals arrive on a company the candidate is pursuing, they arrive before the role is ever posted.',
    outcome: 'Candidates stay in motion between your calls. You stop being the accountability layer and start being the strategic one.',
  },
  {
    name: 'Search Strategy Brief',
    forFirm: 'The strategy brief is an AI synthesis of your candidate\'s background, positioning strengths, narrative gaps, and recommended outreach sequence. Generated from their resume and target list. It is the document you would spend two sessions building manually - available before your first call.',
    outcome: 'You arrive at session one with a clear view of where the candidate is competitive, where the narrative needs work, and what the search should look like. Less briefing. More placing.',
  },
]

export default function ForSearchFirmsPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Nav */}
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/demo?from=search-firms" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              See a demo
            </Link>
            <Link
              href="/partners?from=search-firms"
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
              Starting Monday for <span className="whitespace-nowrap">Retained Search Firms</span>
            </h1>
            <p className="text-[16px] text-slate-400 leading-relaxed">
              Your candidates determine how your firm is perceived at the client. Starting Monday gives them the preparation depth that makes the first round count.
            </p>
          </div>
        </header>

        {/* Body */}
        <div className="px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto space-y-14">

            {/* What it is */}
            <section id="firm-fit" className="space-y-4 text-[15px] text-slate-700 leading-relaxed">
              <h2 className="text-[22px] font-bold text-slate-900">What Starting Monday is</h2>
              <p>
                Starting Monday is an AI-powered search platform built for VP and C-suite executives.
                It gives them the intelligence infrastructure that senior searches require: monitoring of
                target companies for pre-search signals, AI-generated prep briefs for every interview,
                a structured pipeline for tracking relationships and conversations, and a daily briefing
                that keeps the search moving.
              </p>
              <p>
                For retained search firms, the platform serves a specific function: it gives your candidates
                the preparation discipline and company intelligence that determines whether they advance
                beyond the first round - or get cut because they arrived underprepared.
              </p>
            </section>

            {/* The gap */}
            <section className="space-y-4 text-[15px] text-slate-700 leading-relaxed">
              <h2 className="text-[22px] font-bold text-slate-900">The gap it fills</h2>
              <p>
                You brief your candidate. They nod. They go into the first interview and answer questions
                about the company based on a ten-minute read of the 10-K the night before. The hiring
                committee notices. Your placement timeline extends. Sometimes the candidate is cut entirely.
              </p>
              <p>
                The problem is not your briefing. It is the preparation infrastructure your candidate
                is working with. They are managing the search manually - tracking dozens of companies
                in spreadsheets, preparing for interviews the night before, missing signals that precede
                searches at companies they are already watching. The research burden alone is consuming
                the time and attention that should be going toward relationships.
              </p>
              <p>
                Starting Monday replaces the manual infrastructure. Your candidate arrives at interviews
                with depth preparation assembled automatically. You stop being the sole source of
                company context.
              </p>
            </section>

            {/* How firms use it */}
            <section id="firm-playbook" className="space-y-6">
              <h2 className="text-[22px] font-bold text-slate-900">How search firms use it</h2>
              <div className="space-y-8">
                {FEATURES.map(f => (
                  <details key={f.name} className="border-l-2 border-orange-500 pl-5 group" open>
                    <summary className="list-none cursor-pointer flex items-center justify-between">
                      <p className="text-[13px] font-bold tracking-[0.1em] uppercase text-orange-600">{f.name}</p>
                      <span className="text-slate-500 group-open:rotate-180 transition-transform">v</span>
                    </summary>
                    <div className="mt-2">
                      <p className="text-[15px] text-slate-700 leading-relaxed mb-2">{f.forFirm}</p>
                      <p className="text-[13px] text-slate-500 leading-relaxed">
                        <span className="font-semibold text-slate-700">Outcome: </span>{f.outcome}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* What it does not do */}
            <section className="space-y-4 text-[15px] text-slate-700 leading-relaxed">
              <h2 className="text-[22px] font-bold text-slate-900">What it does not do</h2>
              <p>
                Starting Monday does not replace the search firm relationship. It does not have access
                to the client's hiring committee, the internal dynamics at the company, or the political
                considerations that determine who advances. It does not know that the CFO is skeptical
                of external candidates or that the CEO had a prior relationship with someone on the
                long list.
              </p>
              <p>
                It handles the research, the tracking, and the preparation infrastructure. The strategic
                judgment, the relationship capital, and the placement work remain yours.
              </p>
            </section>

            {/* For your practice */}
            <section id="firm-practice" className="space-y-4 text-[15px] text-slate-700 leading-relaxed">
              <h2 className="text-[22px] font-bold text-slate-900">For your practice</h2>
              <p>
                The simplest way to start: refer your next active candidate and ask them to share view
                access to their pipeline. After one week, compare what you know about their search
                activity to what you would have known from a call.
              </p>
              <ul className="space-y-2 pl-4">
                {[
                  'Candidates get a 30-day free trial, no credit card required',
                  'Active plan ($199/month) includes all AI features - prep briefs, strategy brief, interview advisor, resume tailoring',
                  'Intelligence plan ($49/month) for candidates who primarily need signal monitoring and pipeline tracking',
                  'View access for partners: your candidate controls who sees their pipeline',
                  'Partner program: apply at startingmonday.app/partners for your referral link and partner resource kit. Preferred partner pricing available for firms placing multiple candidates.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold shrink-0 mt-0.5">+</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Confidentiality standard: candidate pipeline visibility is opt-in and controlled by each candidate.
              </p>
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
                Get started now &rarr;
              </Link>
              <p className="text-[13px] text-slate-400 mt-4">
                Want to see the platform first?{' '}
                <Link href="/demo?from=search-firms" className="text-slate-600 underline hover:text-slate-900 transition-colors">
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
