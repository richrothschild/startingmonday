import type { Metadata } from 'next'
import Link from 'next/link'

import {
  BLUF_POINTS,
  COMPARISON_ROWS,
  TARGETED_RELATIONSHIP_CARDS,
  TOP_COMMON_QUESTIONS,
  TOP_OBJECTIONS,
} from './content'
import { CitationSup, LearnMorePageShell, ProofAndCitationsSection } from './shared'

export const metadata: Metadata = {
  title: 'Learn More | Starting Monday',
  description: 'Why Starting Monday is different: comparison, objections, and common questions.',
  alternates: {
    canonical: 'https://startingmonday.app/learn-more',
  },
}

export default function LearnMorePage() {
  return (
    <LearnMorePageShell backHref="/">
      <section className="max-w-5xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200">Learn more</p>
        <h1 className="mt-3 max-w-4xl font-serif text-[2.2rem] leading-[1.03] tracking-tight text-white sm:text-[3rem]">
          The difference lives in the details.
        </h1>
        <p className="mt-6 max-w-3xl text-[16px] leading-relaxed text-slate-200">
          Executive transitions are won before the opportunity becomes obvious. Most leaders feel this in their bones. What they lack is a system that operationalizes this insight: seeing movement earlier, building narrative clarity, staying connected while the market is quiet.
          <CitationSup numbers={[3, 4, 5, 7, 8]} />
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_20px_70px_rgba(2,6,23,0.28)] sm:p-6">
        <div className="max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">Overview</p>
          <h2 className="mt-3 text-[1.5rem] font-serif leading-tight text-white sm:text-[1.9rem]">The short answer before the long explanation.</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {BLUF_POINTS.map((point) => (
            <article key={point.title} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="text-[14px] font-semibold text-white">{point.title}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-300">
                {point.body}
                <CitationSup numbers={point.citations} />
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,165,0,0.08),rgba(255,165,0,0.02))] p-5 shadow-[0_20px_70px_rgba(255,165,0,0.1)] sm:p-8">
        <div className="max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">Feel the quality</p>
          <h2 className="mt-3 text-[1.6rem] font-serif leading-tight text-white sm:text-[2rem]">This is what you prepare with. Every brief. Before every conversation.</h2>
          <p className="mt-4 text-[14px] leading-relaxed text-slate-300">
            Generated in under a minute. Specific to the company, the role, your background, and current market signals. Role-calibrated language. Peer-level questions you haven't seen. Objections positioned as navigation.
          </p>
        </div>
        
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-300">Context</p>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-[12px] font-semibold text-slate-400">Company</p>
                <p className="mt-1 text-[14px] text-white">Databricks (Series E, $43B post-money)</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-400">Role</p>
                <p className="mt-1 text-[14px] text-white">VP Engineering Platform</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-400">Recent signals</p>
                <p className="mt-1 text-[14px] text-white">Platform team reorganization. New SVP Platform appointed 8 weeks ago. Expanded platform hiring requisitions filed with finance.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-300">Your win thesis</p>
            <div className="mt-4">
              <p className="text-[14px] leading-relaxed text-slate-100">
                You unblock platform scaling bottlenecks by building the operational rigor that lets product and infra move faster without creating technical debt. The Databricks platform moment is now: they're consolidating the data engineering layer and need someone who can ship at scale without sacrificing quality. Your track record doing this at [Company Name] makes you the north star for this transition.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-300">Questions they\'ll ask (peer level)</p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-[14px] font-semibold text-white">1. How would you prioritize between velocity and architectural debt?</p>
              <p className="mt-2 text-[13px] text-slate-300">This surfaces whether you\'ve made this tradeoff before and if you understand Databricks\' current inflection point. They\'re moving from "build everything" to "build with taste."</p>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white">2. Tell me about a time you had to re-platform or re-architect after launch.</p>
              <p className="mt-2 text-[13px] text-slate-300">Tests your comfort with technical ambition under risk. Databricks has made some bets; they need leaders who can navigate redemption vs. sunk cost.</p>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white">3. How do you think about engineering org structure at scale?</p>
              <p className="mt-2 text-[13px] text-slate-300">The SVP Platform reporting structure is being finalized. This question flags whether you\'ve thought about your charter relative to adjacent teams.</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link href="/demo" className="inline-flex items-center rounded-full bg-orange-500 px-5 py-2.5 text-[14px] font-semibold text-slate-950 transition-colors hover:bg-orange-600">
            Try a real demo brief
          </Link>
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="max-w-4xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-orange-200">System design</p>
          <h2 className="mt-3 text-[1.6rem] font-serif leading-tight text-white sm:text-[2rem]">Built for the moment when everything still moves.</h2>
          <p className="mt-4 text-[14px] leading-relaxed text-slate-300">
            Typical executive-search tools activate after a posting ships. By then, you're competing in the loudest window. Starting Monday is built for the period when the role is still taking shape, the team is still assembling, and a single conversation can still redirect trajectory.
            <CitationSup numbers={[3, 5, 7, 8]} />
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-white/10">
          <div className="grid grid-cols-1 bg-slate-900/35 text-[12px] font-semibold uppercase tracking-[0.08em] sm:grid-cols-[1fr_1.2fr_1.2fr]">
            <p className="px-4 py-3 text-slate-300">Decision area</p>
            <p className="border-t border-white/10 px-4 py-3 text-slate-300 sm:border-l sm:border-t-0">Typical spray-and-pray</p>
            <p className="border-t border-white/10 px-4 py-3 text-orange-100 sm:border-l sm:border-t-0">Starting Monday</p>
          </div>
          {COMPARISON_ROWS.map((row) => (
            <div key={row.area} className="grid grid-cols-1 border-t border-white/10 sm:grid-cols-[1fr_1.2fr_1.2fr]">
              <p className="px-4 py-3 text-[13px] font-semibold text-white">{row.area}</p>
              <p className="border-t border-white/10 px-4 py-3 text-[13px] text-slate-300 sm:border-l sm:border-t-0">{row.typical}</p>
              <p className="border-t border-white/10 px-4 py-3 text-[13px] text-slate-100 sm:border-l sm:border-t-0">
                {row.startingMonday}
                <CitationSup numbers={row.citations} />
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {TARGETED_RELATIONSHIP_CARDS.map((card) => (
            <article key={card.title} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="text-[14px] font-semibold text-white">{card.title}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                {card.body}
                <CitationSup numbers={card.citations} />
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6">
          <Link href="/learn-more/inside-the-system" className="inline-flex items-center rounded-full bg-orange-500 px-4 py-2 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-orange-600">
            Learn more about the system
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-orange-200">Objections</p>
        <h2 className="mt-3 text-[1.6rem] font-serif leading-tight text-white sm:text-[2rem]">The top objections, answered directly.</h2>
        <div className="mt-3 space-y-3">
          {TOP_OBJECTIONS.map((item) => (
            <article key={item.question} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[14px] font-semibold text-white">{item.question}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                {item.answer}
                <CitationSup numbers={item.citations} />
              </p>
            </article>
          ))}
        </div>
        <div className="mt-5">
          <Link href="/learn-more/objections" className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-slate-100 transition-colors hover:border-white/25 hover:text-white">
            Learn more about objections
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-orange-200">Common questions</p>
        <h2 className="mt-3 text-[1.6rem] font-serif leading-tight text-white sm:text-[2rem]">The questions people usually ask before they commit.</h2>
        <div className="mt-3 space-y-3">
          {TOP_COMMON_QUESTIONS.map((item) => (
            <details key={item.question} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <summary className="cursor-pointer list-none text-[14px] font-semibold text-white">{item.question}</summary>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                {item.answer}
                <CitationSup numbers={item.citations} />
              </p>
            </details>
          ))}
        </div>
        <div className="mt-5">
          <Link href="/learn-more/common-questions" className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-slate-100 transition-colors hover:border-white/25 hover:text-white">
            Learn more questions
          </Link>
        </div>
      </section>

      <ProofAndCitationsSection />
    </LearnMorePageShell>
  )
}
