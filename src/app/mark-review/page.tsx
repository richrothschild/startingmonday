import type { Metadata } from 'next'
import Link from 'next/link'
import TrackedCtaLink from '@/components/TrackedCtaLink'
import {
  DEMO_EXECUTIVE,
  LOOP_CLOSURE_SCORECARD,
  RELATIONSHIP_FIRST,
  WHAT_STARTING_MONDAY_IS,
  WHAT_STARTING_MONDAY_IS_NOT,
  WHO_SHOULD_NOT_USE,
  WHO_SHOULD_USE,
} from './content'

export const metadata: Metadata = {
  title: 'Starting Monday | Review Brief for Mark Horstman',
  description:
    'Mark-facing review brief: what Starting Monday is, what it is not, and the specific feedback request.',
  alternates: { canonical: 'https://startingmonday.app/mark-review' },
  openGraph: {
    title: 'Starting Monday | Review Brief for Mark Horstman',
    description:
      'Mark-facing review brief: what Starting Monday is, what it is not, and the specific feedback request.',
    url: 'https://startingmonday.app/mark-review',
  },
}

const BLUF = [
  'This is a workflow product, not a content product. It matters only if it creates better executive conversations.',
  'The strongest part is the loop: find the right signal, contact the right person, and close follow-up every week.',
  'The open issue is proof. I need your judgment on whether the behavior change is strong enough to defend as advice, not just as a demo.',
]

const CORE_BEHAVIOR_LOOP = [
  {
    title: 'Find the reason',
    detail:
      'Use one real company signal to decide which person and which conversation matters this week.',
  },
  {
    title: 'Start the conversation',
    detail:
      'Turn that signal into company-specific outreach and sharper meeting prep, not generic AI copy.',
  },
  {
    title: 'Close the loop',
    detail:
      'Track follow-up, next owner, and next action so the search does not reset every Friday.',
  },
]
const BUSINESS_PLAN_LINK = '/mark-review/business-plan'
const APPENDIX_LINK = '/mark-review/appendix'
const INTERVIEW_BRIEF_DEMO_LINK = '/demo/cio'
const STRATEGY_BRIEF_DEMO_LINK = '/demo/cio/notes'

export default function MarkReviewPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase" aria-label="Go to Starting Monday homepage">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              Main site
            </Link>
            <Link href={BUSINESS_PLAN_LINK} className="text-[13px] text-slate-300 hover:text-white transition-colors">
              Business plan
            </Link>
            <TrackedCtaLink
              href="/signup"
              eventName="mark_review_cta_click"
              eventProps={{ placement: 'top_nav', cta: 'try_free' }}
              className="text-[13px] font-semibold text-slate-900 bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors"
            >
              Try free
            </TrackedCtaLink>
          </div>
        </div>
      </nav>

      <header className="bg-slate-900 px-4 sm:px-6 pt-14 pb-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-400 mb-4">Executive memo</p>
          <h1 className="text-[30px] sm:text-[40px] font-bold text-white leading-[1.12] tracking-tight mb-5">
            Starting Monday: review brief for Mark
          </h1>
          <p className="text-[16px] text-slate-300 leading-relaxed max-w-3xl">
            This brief is for your review: what Starting Monday is, what it is not, and where I need your candid feedback.
          </p>
          <p className="text-[13px] text-orange-300 leading-relaxed mt-4 max-w-3xl">
            This page is public and does not require a login, so you can review it directly before we meet.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-18">
        <div className="max-w-4xl mx-auto space-y-8">
          <section className="border border-slate-900 rounded-lg p-6 bg-slate-950">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-4">Bottom line</p>
            <ul className="space-y-2.5">
              {BLUF.map((item) => (
                <li key={item} className="text-[14px] text-slate-100 leading-relaxed flex items-start gap-2.5">
                  <span className="text-orange-300 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">The one question for this meeting</p>
            <p className="text-[18px] font-semibold text-slate-900 leading-snug mb-3">
              Does Starting Monday reliably change executive search behavior, or does it mainly improve the feeling of being prepared?
            </p>
            <p className="text-[14px] text-slate-700 leading-relaxed">
              If the answer is no, this is polished workflow theater. If yes, it has a real reason to exist.
            </p>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-2">The weekly behavior loop</p>
                <p className="text-[14px] text-slate-700 leading-relaxed">If this works, it should make this loop easier to run every week.</p>
              </div>
              <TrackedCtaLink
                href={APPENDIX_LINK}
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'behavior_loop', target: 'appendix' }}
                className="text-[13px] font-semibold text-slate-900 underline underline-offset-2"
              >
                Open appendix with full demo materials
              </TrackedCtaLink>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CORE_BEHAVIOR_LOOP.map((item) => (
                <div key={item.title} className="rounded border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[12px] font-semibold text-slate-900 mb-2">{item.title}</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Demo setup</p>
            <div className="rounded border border-slate-200 bg-slate-50 p-4">
              <p className="text-[13px] font-semibold text-slate-900">
                Fictional user: {DEMO_EXECUTIVE.name}, {DEMO_EXECUTIVE.currentTitle} at {DEMO_EXECUTIVE.currentCompany}
              </p>
              <p className="text-[13px] text-slate-700 mt-2 leading-relaxed">
                Demo scenario: a senior enterprise IT operator targeting the {DEMO_EXECUTIVE.targetRole} role at {DEMO_EXECUTIVE.targetCompany}. The point is not generic AI output. It is role-specific judgment, operating cadence, and prep quality for a real executive search situation.
              </p>
              <p className="text-[13px] text-slate-700 mt-2 leading-relaxed">
                The proof standard is simple: can this lead to a better conversation with a real person at Salesforce, not just a better-looking brief?
              </p>
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Live demo run in meeting</p>
            <p className="text-[14px] text-slate-700 leading-relaxed mb-4">
              If you want to click through live examples, start with the interview brief and then open the strategy brief view.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <TrackedCtaLink
                href={INTERVIEW_BRIEF_DEMO_LINK}
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'live_demo_run', target: 'interview_brief_demo' }}
                className="inline-flex items-center justify-center rounded bg-slate-900 text-white text-[13px] font-semibold px-4 py-2.5 hover:bg-slate-800 transition-colors"
              >
                Open interview brief demo
              </TrackedCtaLink>
              <TrackedCtaLink
                href={STRATEGY_BRIEF_DEMO_LINK}
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'live_demo_run', target: 'strategy_brief_demo' }}
                className="inline-flex items-center justify-center rounded border border-slate-300 text-slate-900 text-[13px] font-semibold px-4 py-2.5 hover:border-slate-500 transition-colors"
              >
                Open strategy brief demo
              </TrackedCtaLink>
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Relationship-first framing</p>
            <div className="space-y-2.5">
              {RELATIONSHIP_FIRST.map((item) => (
                <div key={item} className="text-[14px] text-slate-800 leading-relaxed flex items-start gap-2.5">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">What Starting Monday is and is not</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[12px] font-semibold text-slate-900 mb-2">Is</p>
                    <ul className="space-y-1.5">
                      {WHAT_STARTING_MONDAY_IS.map((item) => (
                        <li key={item} className="text-[13px] text-slate-800 leading-relaxed flex items-start gap-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[12px] font-semibold text-slate-900 mb-2">Is not</p>
                    <ul className="space-y-1.5">
                      {WHAT_STARTING_MONDAY_IS_NOT.map((item) => (
                        <li key={item} className="text-[13px] text-slate-800 leading-relaxed flex items-start gap-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Fit and non-fit</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[12px] font-semibold text-slate-900 mb-2">Who should use this</p>
                    <ul className="space-y-2">
                      {WHO_SHOULD_USE.map((item) => (
                        <li key={item} className="text-[13px] text-slate-700 leading-relaxed flex items-start gap-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[12px] font-semibold text-slate-900 mb-2">Who should not use this</p>
                    <ul className="space-y-2">
                      {WHO_SHOULD_NOT_USE.map((item) => (
                        <li key={item} className="text-[13px] text-slate-700 leading-relaxed flex items-start gap-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-2">Control scorecard</p>
                <p className="text-[14px] text-slate-700 leading-relaxed">If these measures stay vague, the behavior-change claim stays weak.</p>
              </div>
              <TrackedCtaLink
                href={BUSINESS_PLAN_LINK}
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'control_scorecard', target: 'business_plan' }}
                className="text-[13px] font-semibold text-slate-900 underline underline-offset-2"
              >
                Open full planning view
              </TrackedCtaLink>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Metric</th>
                    <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Current baseline</th>
                    <th className="py-2 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Lane 1 target</th>
                  </tr>
                </thead>
                <tbody>
                  {LOOP_CLOSURE_SCORECARD.map((row) => (
                    <tr key={row.metric} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-3 text-[13px] font-semibold text-slate-900">{row.metric}</td>
                      <td className="py-3 pr-3 text-[13px] text-slate-700">{row.baseline}</td>
                      <td className="py-3 text-[13px] text-slate-700">{row.laneOneTarget}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="border border-orange-300 rounded-lg p-6 bg-orange-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-600 mb-4">What I'm asking from you</p>
            <p className="text-[14px] text-slate-800 leading-relaxed mb-4">
              I am not asking for an endorsement. I am asking for direct product feedback.
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-[14px] text-slate-900 leading-relaxed">
              <li>What is strongest here, and what is still not credible?</li>
              <li>What is the single biggest gap that keeps this from being advice-defensible?</li>
              <li>If the product is good enough, would you suggest one or two executives who could review it and give candid feedback?</li>
            </ol>
          </section>

          <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Appendix and links</p>
            <div className="space-y-3 text-[14px]">
              <TrackedCtaLink
                href={APPENDIX_LINK}
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'supporting_material', target: 'appendix' }}
                className="block text-slate-800 hover:text-slate-900 underline underline-offset-2"
              >
                Public appendix: demo brief, onboarding, strategy notes, and diligence detail
              </TrackedCtaLink>
              <TrackedCtaLink
                href="/demo"
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'supporting_material', target: 'demo' }}
                className="block text-slate-800 hover:text-slate-900 underline underline-offset-2"
              >
                Demo: https://startingmonday.app/demo
              </TrackedCtaLink>
              <TrackedCtaLink
                href="/demo/cio/notes"
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'supporting_material', target: 'notes_mode' }}
                className="block text-slate-800 hover:text-slate-900 underline underline-offset-2"
              >
                Notes mode: https://startingmonday.app/demo/cio/notes
              </TrackedCtaLink>
              <TrackedCtaLink
                href={BUSINESS_PLAN_LINK}
                eventName="mark_review_navigation_click"
                eventProps={{ placement: 'supporting_material', target: 'business_plan' }}
                className="block text-slate-800 hover:text-slate-900 underline underline-offset-2"
              >
                Business plan: https://startingmonday.app/mark-review/business-plan
              </TrackedCtaLink>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
