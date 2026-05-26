import { BrandIcon } from '@/components/BrandIcon'
/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import { TrackLink } from '@/components/TrackLink'
import { CHANNEL_ROUTE_SPECS } from '@/lib/channel-ia'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'

export interface SituationCard {
  id: string
  headline: string
  sub: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface LandingHero {
  eyebrow: string
  h1Lines: string[]
  claimMethodLabel?: string
  claimMethodHref?: string
  claimEvidenceLabel?: string
  claimEvidenceHref?: string
  bodyPreamble?: string
  body: string
  note?: string
  steps?: string[]
  trialNote: string
  testimonial?: {
    quote: string
    source: string
    result: string
  }
  competitiveEdge?: string
}

export interface LandingPageProps {
  hero: LandingHero
  situations: SituationCard[]
  faqs?: FAQ[]
  showPersonaSelector?: boolean
}

const CHANNEL_BEST_FOR: Record<string, string> = {
  executives: 'Best for active or near-term C-suite transitions',
  coaches: 'Best for coach-led execution between client sessions',
  outplacement: 'Best for cohort delivery and measurable 30-day momentum',
  search_firms: 'Best for retained-search kickoff quality and shortlist speed',
}

export function LandingPage({ hero, faqs }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-white hover:opacity-80 transition-opacity" aria-label="Go to homepage">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors" aria-label="Log in">
              Log in
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section id="core-clarity" data-emi-section="clarity_block" className="bg-slate-900 px-4 sm:px-6 pt-16 sm:pt-20 pb-20 sm:pb-24">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg sm:text-xl text-slate-300 font-semibold leading-relaxed mb-5 sm:mb-7 whitespace-pre-line">
              {hero.eyebrow}
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
              {hero.h1Lines.map((line, i) => (
                <span key={i}>{line}{i < hero.h1Lines.length - 1 && <br />}</span>
              ))}
            </h1>
            {hero.bodyPreamble && (
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl mb-3 whitespace-pre-line">
                {hero.bodyPreamble}
              </p>
            )}
            <p className="text-base text-slate-300 leading-relaxed max-w-xl mb-4">
              {hero.body}
            </p>

            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-5 mb-6" data-emi-proof="landing_clarity_panel">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-3">Clear in 20 seconds</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                <div className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
                  <p className="text-slate-400">What this is</p>
                  <p className="text-white mt-1">An executive search operating system anchored by one weekly Momentum Signal.</p>
                </div>
                <div className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
                  <p className="text-slate-400">Who it is for</p>
                  <p className="text-white mt-1">Senior technology leaders in active or near-term transition.</p>
                </div>
                <div className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
                  <p className="text-slate-400">Problem it solves</p>
                  <p className="text-white mt-1">Searches stall from weak narrative quality, poor cadence, and late signals.</p>
                </div>
                <div className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
                  <p className="text-slate-400">Why now</p>
                  <p className="text-white mt-1">High-value roles are shaped before formal posting windows appear.</p>
                </div>
              </div>
            </div>

            <p className="text-xs font-bold tracking-[0.08em] uppercase text-green-400 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              Private by default
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Your search is completely private. We never share your identity, targets, or activity. No credit card. No employer access. No recruiter visibility.
            </p>

            <div className="mb-8 rounded-lg border border-slate-700 bg-slate-800/70 p-5">
              <p className="text-xs font-bold tracking-[0.14em] uppercase text-orange-300 mb-3">Pick your channel first</p>
              <p className="text-[13px] text-slate-300 leading-relaxed mb-4">
                Choose the path that matches your context. Messaging, proof, and next actions adapt to your role.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHANNEL_ROUTE_SPECS.map((spec) => (
                  <TrackLink
                    key={spec.channel}
                    href={spec.route}
                    data-emi-cta={`hero_channel_${spec.channel}`}
                    data-emi-to={spec.route}
                    event={EVENT_NAMES.channelEntryClicked}
                    logToUserEvents
                    properties={{
                      channel: spec.channel,
                      cta_label: 'hero_channel_ia_card',
                      source_page: '/',
                    }}
                    className="block rounded-md border border-slate-700 bg-slate-900 px-4 py-3 hover:border-orange-500 transition-colors"
                  >
                    <p className="text-[13px] font-semibold text-white">{spec.label}</p>
                    <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">{CHANNEL_BEST_FOR[spec.channel]}</p>
                  </TrackLink>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div>
                <Link
                  href="/concierge?program=beta&from=landing"
                  data-emi-cta="hero_apply_beta"
                  data-emi-to="/concierge?program=beta&from=landing"
                  className="inline-block bg-orange-500 text-slate-900 text-[14px] font-bold px-7 py-3.5 rounded hover:bg-orange-600 transition-colors"
                >
                  Apply for confidential beta &rarr;
                </Link>
                <p className="text-[12px] text-slate-400 mt-2.5">We are selecting 10 beta leaders now. No subscription required during beta.</p>
              </div>
              <div>
                <Link
                  href="/demo?from=landing"
                  data-emi-cta="hero_see_demo"
                  data-emi-to="/demo?from=landing"
                  className="inline-block text-[14px] font-bold text-white border border-slate-500 px-7 py-3.5 rounded hover:border-slate-300 transition-colors"
                >
                  See it in action &rarr;
                </Link>
                <p className="text-[12px] text-slate-400 mt-2.5">Live prep brief demo. No signup required.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="proof" data-emi-section="proof_block" className="bg-slate-800 px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-700">
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-300 mb-3">Proof and credibility</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-lg border border-slate-700 bg-slate-900 p-5" data-emi-proof="landing_founder_credibility">
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-2">Founder credibility</p>
                <p className="text-[13px] text-slate-200 leading-relaxed">
                  I built Starting Monday after running my own C-suite search and seeing how quickly timing and narrative quality decide outcomes.
                  My background is enterprise technology leadership and transformation operations, where outcomes mattered more than activity.
                  This product is the system I wanted when the stakes were real.
                </p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900 p-5" data-emi-proof="landing_positioning_comparison">
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-2">How this is different</p>
                <p className="text-[13px] text-slate-300 leading-relaxed mb-4">
                  LinkedIn Premium is strong for posted roles. Starting Monday is built for pre-posting windows: one weekly Momentum Signal for executive motion,
                  relationship cadence, and prep depth before formal search begins.
                </p>
                <div className="flex flex-wrap gap-3 text-[12px]">
                  <Link href="/method-and-evidence" data-emi-cta="proof_method_evidence" data-emi-to="/method-and-evidence" className="underline decoration-slate-500 underline-offset-2 text-slate-200 hover:text-white">Method and evidence</Link>
                  <Link href="/evidence-room" data-emi-cta="proof_evidence_room" data-emi-to="/evidence-room" className="underline decoration-slate-500 underline-offset-2 text-slate-200 hover:text-white">Evidence room</Link>
                  <Link href="/pricing" data-emi-cta="proof_pricing" data-emi-to="/pricing" className="underline decoration-slate-500 underline-offset-2 text-slate-200 hover:text-white">Pricing and plans</Link>
                </div>
              </div>
            </div>
            {hero.competitiveEdge && (
              <p className="text-sm text-orange-300 leading-relaxed mt-6 font-medium inline-flex items-start gap-1.5">
                <BrandIcon name="performance" className="h-4 w-4 text-orange-400 mt-[1px] shrink-0" />
                <span>{hero.competitiveEdge}</span>
              </p>
            )}
          </div>
        </section>

        <section id="how-it-works" data-emi-section="how_it_works_block" className="bg-white px-4 sm:px-6 py-16 sm:py-20 border-b border-slate-100">
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">How it works</p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-9 max-w-xl leading-snug">
              Three touchpoints. No wasted motion.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl">
              <div className="border-t-2 border-orange-500 pt-5">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Day 1</p>
                <p className="text-[14px] font-semibold text-slate-900 mb-2">Set your strategy baseline.</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Set targets and narrative once. Keep search private by default.</p>
              </div>
              <div className="border-t-2 border-slate-200 pt-5">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Day 3</p>
                <p className="text-[14px] font-semibold text-slate-900 mb-2">Act on first signal movement.</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Convert signal clusters into one high-value outreach with context.</p>
              </div>
              <div className="border-t-2 border-slate-200 pt-5">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Day 7</p>
                <p className="text-[14px] font-semibold text-slate-900 mb-2">Run weekly review.</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Review stage movement, relationship follow-through, and your next best move.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="objections" data-emi-section="objection_block" className="bg-slate-800 px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-700">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-[20px] font-bold text-white mb-10 leading-snug">
              You might be thinking: Here's exactly where we fit in.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <details data-emi-objection="coach_already_handles_it" className="bg-slate-900 border border-slate-700 rounded-lg p-6">
                <summary className="list-none cursor-pointer">
                  <p className="text-[13px] font-bold text-orange-400 mb-2">If you work with a coach</p>
                  <p className="text-[13px] text-white font-semibold mb-1">"My coach handles this."</p>
                </summary>
                <p className="text-[13px] text-slate-300 leading-relaxed mt-3">
                  Exactly. We handle the infrastructure layer your coach builds on: daily signal triage, relationship cadence, and prep briefs before each key conversation.
                </p>
              </details>
              <details data-emi-objection="already_have_tools" className="bg-slate-900 border border-slate-700 rounded-lg p-6">
                <summary className="list-none cursor-pointer">
                  <p className="text-[13px] font-bold text-orange-400 mb-2">If you use LinkedIn Premium or have a recruiter</p>
                  <p className="text-[13px] text-white font-semibold mb-1">"I already have those tools."</p>
                </summary>
                <p className="text-[13px] text-slate-300 leading-relaxed mt-3">
                  LinkedIn is a strong job board. Recruiters operate in formal processes. Starting Monday helps before either is active by surfacing early transition windows.
                </p>
              </details>
              <details data-emi-objection="privacy_non_negotiable" className="bg-slate-900 border border-slate-700 rounded-lg p-6">
                <summary className="list-none cursor-pointer">
                  <p className="text-[13px] font-bold text-orange-400 mb-2">Privacy is non-negotiable</p>
                  <p className="text-[13px] text-white font-semibold mb-1">"Will my employer find out?"</p>
                </summary>
                <p className="text-[13px] text-slate-300 leading-relaxed mt-3">
                  No. We do not sell leads, we do not share your activity, and your data remains private by default.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section id="start-now" data-emi-section="final_cta_block" className="bg-slate-900 px-4 sm:px-6 py-16 sm:py-24 border-t border-slate-800">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-[34px] sm:text-[44px] font-bold text-slate-50 mb-4 leading-tight">
              The signal comes before<br />the search begins.<br />Be ready when it does.
            </h2>
            <p className="text-[17px] text-slate-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              <span className="block">Start with one confidential brief, and we will confirm fit fast.</span>
              <span className="block">Prefer proof first? Review the method page and browse the evidence room,</span>
              <span className="block">or watch the live demo.</span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/concierge?program=beta&from=landing"
                data-emi-cta="final_apply_beta"
                data-emi-to="/concierge?program=beta&from=landing"
                className="inline-block bg-orange-500 text-slate-900 text-[14px] font-bold px-8 py-3.5 rounded hover:bg-orange-600 transition-colors"
              >
                Apply for confidential beta &rarr;
              </Link>
              <Link
                href="/demo?from=landing"
                data-emi-cta="final_see_demo"
                data-emi-to="/demo?from=landing"
                className="inline-block text-[14px] font-bold text-white border border-slate-500 px-8 py-3.5 rounded hover:border-slate-300 transition-colors"
              >
                See demo first &rarr;
              </Link>
            </div>
            <p className="text-[12px] text-slate-400 mt-3">{hero.trialNote}</p>
          </div>
        </section>

        {faqs && faqs.length > 0 && (
          <JsonLd data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          }} />
        )}

        <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-10">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-xl border border-slate-700 bg-slate-950/40 px-4 sm:px-5 py-4 sm:py-5 mb-6">
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-400 mb-3">Role paths</p>
              <div className="pb-4 mb-4 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-[14px] sm:text-[15px] font-medium text-slate-200">
                <Link href="/for-coaches" className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-center hover:text-white hover:border-slate-500 transition-colors">Coaches</Link>
                <Link href="/for-search-firms" className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-center hover:text-white hover:border-slate-500 transition-colors">Search firms</Link>
                <Link href="/for-outplacement" className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-center hover:text-white hover:border-slate-500 transition-colors">Outplacement firms</Link>
                <Link href="/for-pe-teams" className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-center hover:text-white hover:border-slate-500 transition-colors">PE teams</Link>
                <Link href="/for-cio" className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-center hover:text-white hover:border-slate-500 transition-colors">CIO and CTO search</Link>
                <Link href="/for-vp" className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-center hover:text-white hover:border-slate-500 transition-colors">VP to C-Suite</Link>
                <Link href="/for-vp-technology" className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-center hover:text-white hover:border-slate-500 transition-colors">VP of Technology</Link>
                <Link href="/for-cpo" className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-center hover:text-white hover:border-slate-500 transition-colors">Chief Product Officer</Link>
                <Link href="/for-data-officer" className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-center hover:text-white hover:border-slate-500 transition-colors">Chief Data Officer</Link>
              </div>

              <div className="text-[14px] sm:text-[15px] font-medium text-slate-200 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <Link href="/for-cdo" className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-center hover:text-white hover:border-slate-500 transition-colors">Chief Digital Officer</Link>
                <Link href="/for-ciso" className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-center hover:text-white hover:border-slate-500 transition-colors">CISO</Link>
                <Link href="/for-coo" className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-center hover:text-white hover:border-slate-500 transition-colors">COO</Link>
                <span className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-slate-300">CFO</span>
                <span className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-slate-300">CEO</span>
                <Link href="/for-cio" className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-center hover:text-white hover:border-slate-500 transition-colors">CTO</Link>
                <Link href="/for-cio" className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-center hover:text-white hover:border-slate-500 transition-colors">CIO</Link>
                <Link href="/partners" className="inline-flex items-center justify-center rounded-md border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-center hover:text-white hover:border-slate-500 transition-colors">Partner programs</Link>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400">
                <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
              </span>
              <div className="flex items-center gap-4 sm:gap-5 flex-wrap text-[12px] text-slate-400">
                <Link href="/method-and-evidence" className="hover:text-slate-300 transition-colors">Method and evidence</Link>
                <Link href="/evidence-room" className="hover:text-slate-300 transition-colors">Evidence room</Link>
                <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
                <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
                <Link href="/about" className="hover:text-slate-300 transition-colors">About</Link>
                <Link href="/optimize" className="hover:text-slate-300 transition-colors">Free Profile Grade</Link>
                <a href="https://www.linkedin.com/company/starting-monday" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">LinkedIn</a>
                <Link href="/security" className="hover:text-slate-300 transition-colors">Security</Link>
                <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-5">Privacy-first by design, no employer visibility, and no sale of user search activity.</p>
            <p className="text-[11px] text-slate-500 mt-2">&copy; {new Date().getFullYear()} Starting Monday. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
