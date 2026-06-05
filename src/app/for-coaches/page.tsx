import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { CoachPreviewActions } from './coach-preview-actions'
import { SampleOutputSection } from './sample-output-section'
import { BrandIcon } from '@/components/BrandIcon'
import { EmiMarketingTelemetry } from '@/components/EmiMarketingTelemetry'
import { TrackedAccordionItem } from '@/components/TrackedAccordionItem'
import { TrackLink } from '@/components/TrackLink'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'
import {
  WHAT_CHANGES,
  SAMPLE_SIGNAL_ITEMS,
  FULL_SAMPLE_SIGNAL_BRIEF,
  SAMPLE_PREP_BRIEF_POINTS,
  FULL_SAMPLE_PREP_BRIEF,
  PROOF_METRICS,
  COACH_FIT,
  COACH_SCOREBOARD,
  PREVIEW_SENTENCE,
  COUNCIL_BUY_SIGNALS,
  PILOT_SCORECARD,
  ROLE_BOUNDARY,
  WEEKLY_REVIEW_TEMPLATE,
} from './page-content'

export const metadata: Metadata = {
  title: 'EMI Coach Partner Preview | Starting Monday for Executive Coaches',
  description: 'Executive Momentum Intelligence (EMI) for coaches: a private signal and readiness layer that improves between-session execution without adding admin drag.',
  alternates: { canonical: 'https://startingmonday.app/for-coaches' },
  openGraph: {
    title: 'Coach Partner Preview | Starting Monday',
    description: 'Help clients identify signals earlier, stay accountable between sessions, and show up better prepared for high-stakes conversations.',
    url: 'https://startingmonday.app/for-coaches',
  },
}

export default function ForCoachesPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <EmiMarketingTelemetry pageSlug="/for-coaches" personaSegment="coaches" />
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <Link href="/partners" className="text-[13px] text-slate-400 hover:text-white transition-colors">
            Become a partner
          </Link>
        </div>
      </nav>

      <header className="bg-slate-900 px-4 sm:px-6 pt-14 pb-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">
            Coach Partner Preview
          </p>
          <h1 className="text-[30px] sm:text-[38px] font-bold text-white leading-[1.12] tracking-tight mb-5">
            <span className="block sm:whitespace-nowrap">Stay on top of every client in one place.</span>
            <span className="block">Clients arrive prepared.</span>
            <span className="block">You stay in strategy.</span>
          </h1>
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-lg mb-2">
            Starting Monday is the between-session system for executive coaches. One shared place for signals, prep briefs, and accountability.
          </p>
          <p className="text-[13px] text-slate-300 leading-relaxed max-w-lg mb-3">
            Built for senior clients in transition who need more structure between sessions.
          </p>
          <p className="text-[13px] text-orange-300 leading-relaxed max-w-lg mb-6">
            Goal: less context rebuild, more strategy time.
          </p>
          <p className="text-[13px] text-slate-300 leading-relaxed max-w-lg mb-6">
            Clients show up prepared. You coach at a higher level.
          </p>
          <section className="mb-6">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-3">At a glance</p>
            <div className="grid grid-cols-1 gap-3 max-w-xl">
              <TrackedAccordionItem
                title="What changes in week one"
                summary="Clients operate in a visible cadence before each session."
                detail="You can quickly spot stalls in follow-through, signal response, and prep depth without extra admin tracking."
                href="/for-coaches#execution-rhythm"
                channel="coaches"
                route="/for-coaches"
                blockId="week_one_change"
              />
              <TrackedAccordionItem
                title="How to evaluate fit"
                summary="Use a short preview with explicit pass/fail criteria."
                detail="Test with live clients, review scorecard movement, and decide based on coaching outcomes rather than promises."
                href="/for-coaches#why-coaches-buy"
                channel="coaches"
                route="/for-coaches"
                blockId="fit_evaluation"
              />
            </div>
          </section>
          <div className="mb-6">
            <TrackLink
              href="/for-coaches/coach-prep-worksheet"
              event={EVENT_NAMES.channelEntryClicked}
              logToUserEvents
              properties={{ channel: 'coaches', cta_label: 'coaches_top_prep_worksheet', source_page: '/for-coaches' }}
              className="inline-flex items-center rounded-lg border border-orange-400/50 bg-orange-500/10 px-3 py-2 text-[12px] font-semibold text-orange-200 hover:bg-orange-500/20 transition-colors"
            >
              Open the one-page coach prep worksheet
            </TrackLink>
          </div>
          <div className="mb-6">
            <TrackLink
              href="/for-coaches/micro-products"
              event={EVENT_NAMES.channelEntryClicked}
              logToUserEvents
              properties={{ channel: 'coaches', cta_label: 'coaches_top_micro_products', source_page: '/for-coaches' }}
              className="inline-flex items-center rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-[12px] font-semibold text-emerald-200 hover:bg-emerald-500/20 transition-colors"
            >
              Browse coach micro products
            </TrackLink>
          </div>
          <div className="border border-slate-700 rounded-2xl p-4 bg-slate-950/40 mb-6">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-orange-400 mb-2">
              You might be thinking
            </p>
            <div className="space-y-2 text-[13px] text-slate-300 leading-relaxed">
              <p><span className="text-white font-semibold">"I do not want another tool to manage."</span> {PREVIEW_SENTENCE}</p>
            </div>
          </div>
          <CoachPreviewActions />
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto space-y-16">

          <section className="border border-slate-200 rounded-2xl p-6 sm:p-7 bg-white">
            <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Decision lanes</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="text-[12px] font-semibold text-slate-900 mb-2">Economic buyer lane</div>
                <ul className="space-y-1 text-[12px] text-slate-700 leading-relaxed">
                  <li>• Improve interview momentum across active clients</li>
                  <li>• Reduce paid-session context rebuild time</li>
                  <li>• Validate pass/fail impact in 30 days</li>
                </ul>
              </div>
              <div className="border border-orange-200 rounded-xl p-4 bg-orange-50/40">
                <div className="text-[12px] font-semibold text-slate-900 mb-2">Practitioner lane</div>
                <ul className="space-y-1 text-[12px] text-slate-700 leading-relaxed">
                  <li>• Keep one shared view of pipeline and signal flow</li>
                  <li>• Improve prep depth before high-stakes calls</li>
                  <li>• Run a reliable Monday-through-Friday cadence</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="why-coaches-buy" className="border border-slate-200 rounded-2xl p-6 sm:p-7 bg-white">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              Why coaches buy
            </p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-5 leading-[1.2] max-w-2xl">
              Coaches buy outcomes first, emotional relief second, workflow proof third.
            </h2>
            <p className="text-[14px] text-slate-600 leading-relaxed mb-7 max-w-xl">This is an outcomes purchase: prepared clients, lower context rebuild, and visible between-session momentum.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="text-[12px] font-semibold text-slate-900 mb-2">1) Outcome they want</div>
                <ul className="space-y-1 text-[12px] text-slate-700 leading-relaxed">
                  <li>• Clients come to meetings prepared</li>
                  <li>• Less paid time rebuilding context</li>
                  <li>• Faster momentum toward interviews</li>
                </ul>
              </div>
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="text-[12px] font-semibold text-slate-900 mb-2">2) Feeling they are buying</div>
                <ul className="space-y-1 text-[12px] text-slate-700 leading-relaxed">
                  <li>• "I am not coaching half-blind"</li>
                  <li>• "I can see stalls before confidence drops"</li>
                  <li>• "I am spending time on strategy, not admin"</li>
                </ul>
              </div>
              <div className="border border-orange-200 rounded-xl p-4 bg-orange-50/40">
                <div className="text-[12px] font-semibold text-slate-900 mb-2">3) Offer that lowers risk</div>
                <ul className="space-y-1 text-[12px] text-slate-700 leading-relaxed">
                  <li>• 30-day test with two to three live clients</li>
                  <li>• Pass/fail scorecard before rollout</li>
                  <li>• Keep if it improves coaching outcomes</li>
                </ul>
              </div>
            </div>
            <div data-emi-proof="coaches_credibility_proof" className="border border-slate-200 rounded-xl p-4 bg-white mb-4">
              <div className="text-[12px] font-semibold text-slate-900 mb-2">What makes this credible</div>
              <p className="text-[13px] text-slate-700 leading-relaxed mb-2">
                Directional pilot signal: 81 percent of the Jan.-May 2026 cohort reached a first interview within 30 days.
              </p>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Denominator: 27 pilot executives. Window: Jan-May 2026. Source path: docs/strategy/emi-sprints/artifacts/production-exports/emi-production-query-results-2026-05-29.json. Use this as decision support, then validate fit with your own 30-day pass-fail test.
              </p>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              More details live in <Link href="/references" className="underline underline-offset-2 hover:text-slate-700 transition-colors">Evidence and References</Link> and <Link href="/for-coaches/faq#proof" className="text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-2">our proof methodology</Link>.
            </p>
          </section>

          <section className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-6 sm:p-7">
            <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-emerald-700 mb-3">
              From pressure to control
            </div>
            <h2 className="text-[22px] font-bold text-slate-900 mb-4 leading-snug">
              Start with a 30-day preview and evaluate real outcomes.
            </h2>
            <div className="space-y-3 text-[14px] text-slate-700 leading-relaxed mb-6">
              <p>{PREVIEW_SENTENCE}</p>
              <p>This is designed for one practical test: can you spend less time on prep/admin and more time on strategy while clients show up better prepared?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Free coach access during the preview window',
                '2-3 live client seats to test with real workflows',
                'One shared place for pipeline, signals, and prep',
                'Scorecards that reveal where momentum is stalling',
              ].map((item) => (
                <div key={item} className="bg-white border border-emerald-100 rounded-lg px-4 py-3">
                  <p className="text-[13px] text-slate-700 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 border border-emerald-300 bg-emerald-50 rounded-lg p-4">
              <p className="text-[12px] font-semibold text-slate-900 mb-2">What coaches see during preview:</p>
              <ul className="space-y-1 text-[12px] text-slate-700">
                <li>• Complete company pipeline with fit scores and stage tracking</li>
                <li>• Real-time signals with detection dates and relevance scores</li>
                <li>• Interview prep briefs showing your approach before each conversation</li>
              </ul>
            </div>
            <div className="mt-4 border border-emerald-300 bg-white rounded-lg p-4">
              <p className="text-[12px] font-semibold text-slate-900 mb-3">30-day pilot success scorecard</p>
              <div className="space-y-2">
                {PILOT_SCORECARD.slice(0, 3).map((row) => (
                  <div key={row.metric} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 text-[12px] text-slate-700">
                    <p className="font-semibold text-slate-900">{row.metric}</p>
                    <p>{row.success}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <details id="role-boundary" data-emi-objection="coaches_replacement_risk" className="group border border-slate-200 rounded-2xl bg-white overflow-hidden">
            <summary className="list-none cursor-pointer px-6 sm:px-7 py-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-1">Role boundary</p>
                <p className="text-[16px] font-semibold text-slate-900">Starting Monday supports coaching. It does not replace it.</p>
              </div>
              <span className="text-slate-400 text-[18px] leading-none group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="px-6 sm:px-7 pb-7 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <p className="text-[12px] font-semibold text-slate-900 mb-2">Platform owns</p>
                  <ul className="space-y-2 text-[13px] text-slate-700 leading-relaxed">
                    {ROLE_BOUNDARY.platform.slice(0, 2).map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                </div>
                <div className="border border-orange-200 rounded-xl p-4 bg-orange-50/40">
                  <p className="text-[12px] font-semibold text-slate-900 mb-2">Coach owns</p>
                  <ul className="space-y-2 text-[13px] text-slate-700 leading-relaxed">
                    {ROLE_BOUNDARY.coach.slice(0, 2).map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-[12px] text-slate-500 mt-4">
                Need compliance-ready details? Read the <Link href="/for-coaches/trust-pack" className="underline underline-offset-2 hover:text-slate-700 transition-colors">Coach Trust Pack</Link>.
              </p>
            </div>
          </details>

          <details data-emi-objection="coaches_needs_deep_dive_proof" className="group border border-slate-200 rounded-2xl bg-white overflow-hidden">
            <summary className="list-none cursor-pointer px-6 sm:px-7 py-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-1">Deep dive</p>
                <p className="text-[16px] font-semibold text-slate-900">Expand fit, workflow proof, and operating rhythm</p>
              </div>
              <span className="text-slate-400 text-[18px] leading-none group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="px-6 sm:px-7 pb-7 border-t border-slate-100 space-y-8">
          <section id="execution-rhythm">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              Execution rhythm
            </p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-8 max-w-xl leading-snug">
              Three touchpoints. Roughly 12 minutes.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
              <div className="border-t-2 border-orange-500 pt-5">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Monday morning</p>
                <p className="text-[15px] font-semibold text-slate-900 mb-2">Review the pipeline together. 5 minutes.</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Update 3 to 5 company stages. Drop what has gone cold. Choose one priority contact and one priority company for the week.</p>
              </div>
              <div className="border-t-2 border-slate-200 pt-5">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Every morning</p>
                <p className="text-[15px] font-semibold text-slate-900 mb-2">Act on overnight signals. 2 minutes.</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">One decision: which company to contact first. One action: send the note, make the intro ask, or move the follow-up date. The briefing surfaces it.</p>
              </div>
              <div className="border-t-2 border-slate-200 pt-5">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Before each interview</p>
                <p className="text-[15px] font-semibold text-slate-900 mb-2">Run the prep brief. 5 minutes.</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Usually about a minute to generate, a few minutes to review. Win thesis, likely objections, peer-level questions, and what to leave out before the session starts.</p>
              </div>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed mt-6 max-w-xl">This loop makes gaps visible early: signal response, follow-through, or prep depth.</p>
          </section>
            </div>
          </details>

          <details id="next-step" data-emi-objection="coaches_scope_guardrail" className="group border-t border-slate-100 pt-10">
            <summary className="list-none cursor-pointer flex items-center justify-between gap-4 hover:text-slate-700 transition-colors">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-2">What this is not</p>
                <p className="text-[16px] font-semibold text-slate-900">Scope guardrails for coaches evaluating fit</p>
              </div>
              <span className="text-slate-400 text-[18px] leading-none group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="space-y-4 text-[14px] text-slate-600 leading-relaxed max-w-xl mt-4">
              <p>It does not replace coaching judgment. It provides the between-session signal, prep, and execution layer.</p>
            </div>
          </details>

          <section className="border-t border-slate-100 pt-10">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">
              Next step
            </p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-4 leading-snug">
              Start with the preview. Review pricing and FAQ only if the workflow fits.
            </h2>
            <CoachPreviewActions />
            <div className="flex flex-wrap gap-4 mt-6 text-[13px]">
              <TrackLink
                href="/for-coaches/faq"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'coaches_read_faq_bottom', source_page: '/for-coaches' }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
              >
                <BrandIcon name="faq" className="h-4 w-4 text-orange-600" />
                Read the coach FAQ
              </TrackLink>
              <TrackLink
                href="/for-coaches/faq#security"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'coaches_security_guide', source_page: '/for-coaches' }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
              >
                <BrandIcon name="security" className="h-4 w-4 text-orange-600" />
                Data security guide
              </TrackLink>
              <TrackLink
                href="/for-coaches/trust-pack"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'coaches_trust_pack', source_page: '/for-coaches' }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
              >
                <BrandIcon name="trust" className="h-4 w-4 text-orange-600" />
                Coach trust pack
              </TrackLink>
              <TrackLink
                href="/for-coaches/economics"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'coaches_pricing_economics', source_page: '/for-coaches' }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
              >
                <BrandIcon name="pricing" className="h-4 w-4 text-orange-600" />
                Pricing & economics
              </TrackLink>
            </div>
          </section>

        </div>
      </main>

      <section className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto">
          <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <summary className="list-none cursor-pointer px-6 sm:px-8 py-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-1">More resources</p>
                <p className="text-[16px] font-semibold text-slate-900">Questions? We&rsquo;ve got answers.</p>
              </div>
              <span className="text-slate-400 text-[18px] leading-none group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="px-6 sm:px-8 pb-8 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-5">
                <Link href="/for-coaches/faq" className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/30 transition-colors group">
                  <Image src="/brand/icon-exploration-v1/faq.svg" alt="FAQ icon" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900">Coaching FAQs</div>
                    <div className="text-[12px] text-slate-500">Objections & responses</div>
                  </div>
                </Link>
                <Link href="/for-coaches/faq#security" className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/30 transition-colors group">
                  <Image src="/brand/icon-exploration-v1/security.svg" alt="Security icon" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900">Data Security</div>
                    <div className="text-[12px] text-slate-500">Privacy & compliance</div>
                  </div>
                </Link>
                <Link href="/for-coaches/trust-pack" className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/30 transition-colors group">
                  <Image src="/brand/icon-exploration-v1/security.svg" alt="Trust pack icon" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900">Coach Trust Pack</div>
                    <div className="text-[12px] text-slate-500">No recruiter-side sharing + controls</div>
                  </div>
                </Link>
                <Link href="/for-coaches/economics" className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/30 transition-colors group">
                  <Image src="/brand/icon-exploration-v1/pricing.svg" alt="Pricing icon" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900">Pricing</div>
                    <div className="text-[12px] text-slate-500">Investment & ROI</div>
                  </div>
                </Link>
                <a href="mailto:contact@startingmonday.app?subject=Coach%20Feedback" className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/30 transition-colors group">
                  <Image src="/brand/icon-exploration-v1/feedback.svg" alt="Feedback icon" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900">Feedback</div>
                    <div className="text-[12px] text-slate-500">Share your thoughts</div>
                  </div>
                </a>
                <Link href="/references" className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/30 transition-colors group">
                  <Image src="/brand/icon-exploration-v1/evidence.svg" alt="Evidence icon" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900">Evidence</div>
                    <div className="text-[12px] text-slate-500">Research & references</div>
                  </div>
                </Link>
                <Link href="/partners" className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/30 transition-colors group">
                  <Image src="/brand/icon-exploration-v1/partner.svg" alt="Partner program icon" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900">Partner Program</div>
                    <div className="text-[12px] text-slate-500">Affiliate & referral</div>
                  </div>
                </Link>
              </div>
            </div>
          </details>
        </div>
      </section>

      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <p className="text-[11px] text-slate-500">
            Questions?{' '}
            <a href="mailto:contact@startingmonday.app" className="hover:text-slate-300 transition-colors">
              contact@startingmonday.app
            </a>{' '}
            •{' '}
            <a href="mailto:contact@startingmonday.app?subject=Coach%20Feedback" className="hover:text-slate-300 transition-colors">
              Send feedback
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
