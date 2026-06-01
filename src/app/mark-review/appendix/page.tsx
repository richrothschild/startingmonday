import type { Metadata } from 'next'
import Link from 'next/link'
import TrackedCtaLink from '@/components/TrackedCtaLink'
import {
  CAREER_TOOLS_LINKS,
  DEMO_EXECUTIVE,
  DETAILED_BEHAVIOR_LOOP,
  FEATURE_CHANNELS,
  INTERVIEW_BRIEF_SECTIONS,
  MARK_DILIGENCE_GAPS,
  NEXT_7_DAYS,
  OBSTACLE_AND_COMPETITION_SNAPSHOT,
  ONBOARDING_STEPS,
  STRATEGY_BRIEF,
  WHAT_TO_DEMO_NEXT,
} from '../content'

export const metadata: Metadata = {
  title: 'Starting Monday | Mark Horstman Review Appendix',
  description:
    'Supporting appendix for the Mark Horstman review memo: demo setup, onboarding, strategy brief, diligence gaps, and supporting links.',
  alternates: { canonical: 'https://startingmonday.app/mark-review/appendix' },
  openGraph: {
    title: 'Starting Monday | Mark Horstman Review Appendix',
    description:
      'Supporting appendix for the Mark Horstman review memo: demo setup, onboarding, strategy brief, diligence gaps, and supporting links.',
    url: 'https://startingmonday.app/mark-review/appendix',
  },
}

const BUSINESS_PLAN_LINK = '/mark-review/business-plan'

export default function MarkReviewAppendixPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/mark-review" className="text-[10px] font-bold tracking-[0.18em] uppercase" aria-label="Go to Mark review memo">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/mark-review" className="text-[13px] text-slate-300 hover:text-white transition-colors">
              Memo
            </Link>
            <Link href={BUSINESS_PLAN_LINK} className="text-[13px] text-slate-400 hover:text-white transition-colors">
              Business plan
            </Link>
          </div>
        </div>
      </nav>

      <header className="bg-slate-900 px-4 sm:px-6 pt-14 pb-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-400 mb-4">Supporting appendix</p>
          <h1 className="text-[30px] sm:text-[40px] font-bold text-white leading-[1.12] tracking-tight mb-5">
            Mark review appendix
          </h1>
          <p className="text-[16px] text-slate-300 leading-relaxed max-w-3xl">
            The longer-form materials behind the pre-meeting memo: demo content, onboarding, strategy detail, expansion framing, and diligence gaps.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-18">
        <div className="max-w-4xl mx-auto space-y-8">
          <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Read order</p>
            <ol className="list-decimal pl-5 space-y-2 text-[14px] text-slate-900 leading-relaxed">
              <li>Read the memo first.</li>
              <li>Use this appendix only if you want the full demo and execution detail.</li>
              <li>Use the business plan for broader market, risk, and planning detail.</li>
            </ol>
            <div className="mt-4 space-y-2 text-[14px]">
              <TrackedCtaLink
                href="/mark-review"
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'appendix_read_order', target: 'memo' }}
                className="block text-slate-800 hover:text-slate-900 underline underline-offset-2"
              >
                Back to memo: https://startingmonday.app/mark-review
              </TrackedCtaLink>
              <TrackedCtaLink
                href={BUSINESS_PLAN_LINK}
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'appendix_read_order', target: 'business_plan' }}
                className="block text-slate-800 hover:text-slate-900 underline underline-offset-2"
              >
                Business plan: https://startingmonday.app/mark-review/business-plan
              </TrackedCtaLink>
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Detailed weekly loop</p>
            <div className="space-y-3">
              {DETAILED_BEHAVIOR_LOOP.map((item) => (
                <div key={item.label} className="rounded border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[12px] font-semibold text-slate-900 mb-1">{item.label}</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Tomorrow's demo setup</p>
            <div className="rounded border border-slate-200 bg-slate-50 p-4">
              <p className="text-[13px] font-semibold text-slate-900">
                Fictional user: {DEMO_EXECUTIVE.name}, {DEMO_EXECUTIVE.currentTitle} at {DEMO_EXECUTIVE.currentCompany}
              </p>
              <p className="text-[13px] text-slate-700 mt-2 leading-relaxed">
                Demo scenario: a senior enterprise IT operator targeting the {DEMO_EXECUTIVE.targetRole} role at {DEMO_EXECUTIVE.targetCompany}. The point is to show role-specific judgment, operating cadence, and prep quality for a real senior-executive search situation.
              </p>
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Interview brief demo: Salesforce CIO</p>
            <div className="space-y-4">
              {INTERVIEW_BRIEF_SECTIONS.map((section) => (
                <article key={section.title} className="rounded border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[13px] font-semibold text-slate-900 mb-2">{section.title}</p>
                  <ul className="space-y-2">
                    {section.points.map((point) => (
                      <li key={point} className="text-[13px] text-slate-700 leading-relaxed flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">New executive onboarding, explained simply</p>
            <div className="space-y-4">
              {ONBOARDING_STEPS.map((item) => (
                <article key={item.step} className="rounded border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-[13px] font-semibold text-slate-900">{item.step}</p>
                    <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">{item.timing}</p>
                  </div>
                  <p className="text-[13px] text-slate-700 leading-relaxed mt-2">{item.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Strategy brief for the same fictional user</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STRATEGY_BRIEF.map((item) => (
                <article key={item.title} className="rounded border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[13px] font-semibold text-slate-900 mb-2">{item.title}</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{item.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">What else to demo live</p>
            <ol className="list-decimal pl-5 space-y-2 text-[14px] text-slate-900 leading-relaxed">
              {WHAT_TO_DEMO_NEXT.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Where this can expand later</p>
            <div className="space-y-4">
              {FEATURE_CHANNELS.map((item) => (
                <article key={item.channel} className="rounded border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[13px] font-semibold text-slate-900">{item.channel}</p>
                  <p className="text-[13px] text-slate-700 mt-1">{item.audience}</p>
                  <p className="text-[12px] text-slate-600 mt-3">Expansion value: {item.value}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Key obstacles and competitive pressure</p>
            <div className="space-y-4">
              {OBSTACLE_AND_COMPETITION_SNAPSHOT.map((item) => (
                <div key={item.heading} className="border-l-4 border-slate-300 pl-4">
                  <p className="text-[13px] font-semibold text-slate-900 mb-1">{item.heading}</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Next 7-day priorities</p>
            <ol className="list-decimal pl-5 space-y-2 text-[14px] text-slate-900 leading-relaxed">
              {NEXT_7_DAYS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>

          <section className="border border-blue-300 rounded-lg p-6 bg-blue-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-blue-700 mb-4">How to assess the risk of execution</p>
            <ul className="space-y-2.5">
              {MARK_DILIGENCE_GAPS.map((item) => (
                <li key={item} className="text-[14px] text-slate-800 leading-relaxed flex items-start gap-2.5">
                  <span className="text-blue-700 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Relevant links</p>
            <div className="space-y-3 text-[14px]">
              <TrackedCtaLink
                href="/demo"
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'appendix_links', target: 'demo' }}
                className="block text-slate-800 hover:text-slate-900 underline underline-offset-2"
              >
                Demo: https://startingmonday.app/demo
              </TrackedCtaLink>
              <TrackedCtaLink
                href="/demo/cio/notes"
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'appendix_links', target: 'notes_mode' }}
                className="block text-slate-800 hover:text-slate-900 underline underline-offset-2"
              >
                Notes mode: https://startingmonday.app/demo/cio/notes
              </TrackedCtaLink>
              {CAREER_TOOLS_LINKS.map((link) => (
                <TrackedCtaLink
                  key={link.href}
                  href={link.href}
                  eventName="mark_review_navigation_click"
                  eventProps={{ placement: 'appendix_links', target: link.href }}
                  className="block text-slate-800 hover:text-slate-900 underline underline-offset-2"
                >
                  {link.label}
                </TrackedCtaLink>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}