import type { Metadata } from 'next'
import Link from 'next/link'
import { CoachPreviewActions } from './coach-preview-actions'
import { EmiMarketingTelemetry } from '@/components/EmiMarketingTelemetry'
import { TrackLink } from '@/components/TrackLink'
import { CompactTimelineModule } from '@/components/channel/CompactTimelineModule'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'
import {
  COACH_COMPETITIVE_TABLE,
  COACH_JOURNEY_MAP,
  COACH_PERSONA_JOURNEYS,
  COACH_BUYER_PLANS,
  COACH_PROOF_STRIPS,
  NAMED_COACH_PROOF,
  PILOT_SCORECARD,
  ROLE_BOUNDARY,
} from './page-content'

export const metadata: Metadata = {
  title: 'Starting Monday for Executive Coaches | Coach Partner Preview',
  description: 'A coach-first landing page for executive coaches and coaching firms. See the preview, trust boundary, pilot structure, and economics in one place.',
  alternates: { canonical: 'https://startingmonday.app/for-coaches' },
  openGraph: {
    title: 'Starting Monday for Executive Coaches',
    description: 'Coach-first preview for executive coaches and coaching firms.',
    url: 'https://startingmonday.app/for-coaches',
  },
}

export default function ForCoachesPage() {
  const visibleJourneyStages = COACH_JOURNEY_MAP.slice(0, 3)
  const hiddenJourneyStages = COACH_JOURNEY_MAP.slice(3)
  const visibleComparisonRows = COACH_COMPETITIVE_TABLE.slice(0, 3)
  const hiddenComparisonRows = COACH_COMPETITIVE_TABLE.slice(3)

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[24rem] bg-[radial-gradient(circle_at_top_left,_rgba(193,127,59,0.18),_transparent_36%),linear-gradient(180deg,_rgba(9,14,26,0.96)_0%,_rgba(10,15,28,0.96)_100%)]" />
      <EmiMarketingTelemetry pageSlug="/for-coaches" personaSegment="coaches" />

      <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/72 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/coaches/personas" className="text-[13px] text-slate-200 transition-colors hover:text-white">
              Coach personas
            </Link>
            <Link href="/for-coaches/trust-pack" className="text-[13px] text-slate-200 transition-colors hover:text-white">
              Trust pack
            </Link>
          </div>
        </div>
      </nav>

      <header className="border-b border-white/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">Coach Partner Preview</p>
          <h1 className="mb-5 max-w-3xl text-[30px] font-bold leading-[1.08] tracking-tight text-white sm:text-[42px]">
            Clients arrive prepared.{' '}
            <br className="hidden sm:block" />
            Sessions remain strategic.
          </h1>
          <p className="mb-2 max-w-3xl text-[16px] leading-relaxed text-slate-200">
            Starting Monday gives executive coaches and coaching firms one operating layer for signals and prep so sessions stay strategic.
          </p>
          <p className="mb-6 max-w-2xl text-[13px] leading-relaxed text-slate-200">
            Client-controlled access. No recruiter visibility. Coaching authority intact.
          </p>

          <div className="mb-7 space-y-3">
            <CoachPreviewActions />
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-slate-200">
              <span className="font-semibold text-slate-100">Jump to:</span>
              <a href="#journey-map" className="underline underline-offset-2 transition-colors hover:text-white">
                Journey map
              </a>
              <a href="#competitive-comparison" className="underline underline-offset-2 transition-colors hover:text-white">
                Comparison table
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {COACH_PROOF_STRIPS.map((item) => (
              <article key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950/30 p-3.5">
                <p className="mb-1 text-[20px] font-semibold text-slate-100">{item.value}</p>
                <p className="text-[11px] leading-relaxed text-slate-200">{item.label}</p>
              </article>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-200">
            Proof: clients show up better prepared, session time stays strategic, and between-session momentum is visible.
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-200">
            Source: Jan-May 2026 pilot cohorts with documented denominator and timeframe notes.
          </p>
        </div>
      </header>

      <CompactTimelineModule
        channel="coaches"
        sourcePage="/for-coaches"
        eyebrow="Mini timeline"
        title="See the coach workflow in 3 key phases"
        summary="Preview how features sequence across session prep, execution, and reporting."
        steps={[
          { phase: 'Discover', focus: 'Pre-session signal and context delta review', visual: 'Snapshot strip + top changes' },
          { phase: 'Activate', focus: 'Weekly confidence, momentum, and commitment capture', visual: 'Three-state weekly markers' },
          { phase: 'Operate', focus: 'Portfolio risk and intervention prioritization', visual: 'Command center + exception queue' },
        ]}
      />

      {/* Named coach proof block — Sprint ITS-2 */}
      <section className="border-b border-white/10 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-400">What coaches say</p>
          <h2 className="mb-6 text-[20px] font-bold text-white leading-snug">
            How pilot coaches transformed sessions.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {NAMED_COACH_PROOF.filter((p) => p.tier !== 'placeholder').map((proof) => (
              <figure key={proof.name} className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
                <blockquote className="text-[14px] text-slate-200 leading-relaxed mb-4 italic">
                  &ldquo;{proof.quote}&rdquo;
                </blockquote>
                <figcaption>
                  <p className="text-[13px] font-semibold text-white">{proof.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{proof.descriptor}</p>
                  <p className="text-[11px] text-orange-400 mt-1">{proof.outcome}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-slate-500">
            Named proof assets collected with participant permission. Additional named coach cases in progress.
            See our <Link href="/for-coaches/trust-pack" className="underline underline-offset-2 hover:text-slate-300 transition-colors">trust pack</Link> for methodology and claims policy.
          </p>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-orange-300/20 bg-orange-400/5 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">30-day pilot scorecard</p>
              <h2 className="text-[24px] font-bold leading-snug text-white">Run the preview with live clients, then decide from evidence.</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-200">
                Test 2-3 clients, measure outcomes, and decide at day 30.
              </p>
            </div>
            <div className="grid gap-3">
              {PILOT_SCORECARD.map((item) => (
                <article key={item.metric} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-orange-200">{item.metric}</p>
                  <p className="text-[13px] leading-relaxed text-slate-200">{item.success}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="bg-transparent text-slate-100">
        <section className="px-4 py-10 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.22)] backdrop-blur-sm sm:p-7">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">How this helps</p>
            <h2 className="mb-6 text-[24px] font-bold leading-snug text-white">One workflow: session prep, execution, follow-through.</h2>
            <div className="space-y-5">
              <div className="grid gap-1 md:grid-cols-[280px_1fr]">
                <p className="text-[15px] font-semibold text-white">Before each session</p>
                <p className="text-[14px] leading-relaxed text-slate-200">See signals and prep before meetings start strategic, not with recap.</p>
              </div>
              <div className="grid gap-1 md:grid-cols-[280px_1fr]">
                <p className="text-[15px] font-semibold text-white">Between sessions</p>
                <p className="text-[14px] leading-relaxed text-slate-200">Track commitments and risk markers in one place so client momentum does not disappear between calls.</p>
              </div>
              <div className="grid gap-1 md:grid-cols-[280px_1fr]">
                <p className="text-[15px] font-semibold text-white">At day 30</p>
                <p className="text-[14px] leading-relaxed text-slate-200">Use a pass/fail pilot scorecard with two to three live clients before deciding on full rollout.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="journey-map" className="scroll-mt-24 px-4 pb-14 sm:px-6">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-950/65 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.22)] backdrop-blur-sm sm:p-7">
            <p className="mb-2 text-[12px] font-semibold text-orange-200">Coach journey map</p>
            <h2 className="mb-2 text-[24px] font-bold leading-snug text-white">The path your coaching practice takes with Starting Monday.</h2>
            <p className="mb-7 max-w-3xl text-[14px] leading-relaxed text-slate-200">
              Start with three stages, then expand. Keeps key deltas visible.
            </p>

            <div className="overflow-x-auto pb-1">
              <div className="grid min-w-[620px] grid-cols-3 gap-3">
                {visibleJourneyStages.map((step, index) => (
                  <article key={step.stage} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="mb-2 text-[12px] font-semibold text-orange-200">Stage {index + 1}</p>
                    <h3 className="mb-3 text-[14px] font-semibold text-white">{step.stage}</h3>
                    <div className="space-y-2.5">
                      <div className="rounded-xl border border-red-200/30 bg-red-300/10 p-2.5">
                        <p className="mb-1 text-[12px] font-semibold text-red-100">Without a dedicated operating layer</p>
                        <p className="text-[13px] leading-relaxed text-slate-200">{step.withoutTool}</p>
                      </div>
                      <div className="rounded-xl border border-emerald-200/30 bg-emerald-300/10 p-2.5">
                        <p className="mb-1 text-[12px] font-semibold text-emerald-100">With Starting Monday</p>
                        <p className="text-[13px] leading-relaxed text-slate-100">{step.withStartingMonday}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <details className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <summary className="cursor-pointer text-[14px] font-semibold text-orange-100">
                Show full journey (stages 4-5 + persona paths)
              </summary>
              <div className="mt-4 overflow-x-auto pb-1">
                <div className="grid min-w-[460px] grid-cols-2 gap-3">
                  {hiddenJourneyStages.map((step, index) => (
                    <article key={step.stage} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="mb-2 text-[12px] font-semibold text-orange-200">Stage {visibleJourneyStages.length + index + 1}</p>
                      <h3 className="mb-3 text-[14px] font-semibold text-white">{step.stage}</h3>
                      <div className="space-y-2.5">
                        <div className="rounded-xl border border-red-200/30 bg-red-300/10 p-2.5">
                          <p className="mb-1 text-[12px] font-semibold text-red-100">Without a dedicated operating layer</p>
                          <p className="text-[13px] leading-relaxed text-slate-200">{step.withoutTool}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-200/30 bg-emerald-300/10 p-2.5">
                          <p className="mb-1 text-[12px] font-semibold text-emerald-100">With Starting Monday</p>
                          <p className="text-[13px] leading-relaxed text-slate-100">{step.withStartingMonday}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                {COACH_PERSONA_JOURNEYS.map((item) => (
                  <article key={item.persona} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="mb-2 text-[13px] font-semibold text-orange-200">{item.persona}</p>
                    <div className="grid gap-2">
                      <p className="rounded-lg border border-red-200/30 bg-red-300/10 px-3 py-2 text-[13px] leading-relaxed text-slate-200">
                        <span className="font-semibold text-red-100">Without tool:</span> {item.withoutTool}
                      </p>
                      <p className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-3 py-2 text-[13px] leading-relaxed text-slate-100">
                        <span className="font-semibold text-emerald-100">With Starting Monday:</span> {item.withStartingMonday}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </details>
          </div>
        </section>

        <section id="competitive-comparison" className="scroll-mt-24 px-4 pb-14 sm:px-6">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-950/65 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.22)] backdrop-blur-sm sm:p-7">
            <p className="mb-2 text-[12px] font-semibold text-orange-200">Competitive comparison</p>
            <h2 className="mb-2 text-[24px] font-bold leading-snug text-white">Starting Monday vs coaching.com vs BetterUp vs DIY.</h2>
            <p className="max-w-3xl text-[14px] leading-relaxed text-slate-200">
              A coach-first snapshot of where each option typically performs for executive-transition workflows.
            </p>
            <p className="mt-3 mb-7 max-w-3xl text-[14px] leading-relaxed text-slate-100">
              Key takeaway: Starting Monday is designed to give independent coaches faster session readiness with less manual coordination.
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-white/10 text-left">
                <thead>
                  <tr className="bg-white/[0.04]">
                    <th scope="col" className="px-4 py-3 text-[13px] font-semibold text-slate-100">Dimension</th>
                    <th scope="col" className="px-4 py-3 text-[13px] font-semibold text-emerald-100">Starting Monday</th>
                    <th scope="col" className="px-4 py-3 text-[13px] font-semibold text-slate-100">coaching.com</th>
                    <th scope="col" className="px-4 py-3 text-[13px] font-semibold text-slate-100">BetterUp</th>
                    <th scope="col" className="px-4 py-3 text-[13px] font-semibold text-slate-100">DIY stack</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleComparisonRows.map((row) => (
                    <tr key={row.dimension} className="align-top odd:bg-white/[0.02]">
                      <th scope="row" className="border-t border-white/10 px-4 py-3 text-[13px] font-semibold text-white">{row.dimension}</th>
                      <td className="border-t border-white/10 px-4 py-3 text-[13px] leading-relaxed text-slate-100">{row.startingMonday}</td>
                      <td className="border-t border-white/10 px-4 py-3 text-[13px] leading-relaxed text-slate-200">{row.coachingDotCom}</td>
                      <td className="border-t border-white/10 px-4 py-3 text-[13px] leading-relaxed text-slate-200">{row.betterUp}</td>
                      <td className="border-t border-white/10 px-4 py-3 text-[13px] leading-relaxed text-slate-200">{row.diy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <details className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <summary className="cursor-pointer text-[14px] font-semibold text-orange-100">
                Show full comparison (additional dimensions)
              </summary>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-white/10 text-left">
                  <thead>
                    <tr className="bg-white/[0.04]">
                      <th scope="col" className="px-4 py-3 text-[13px] font-semibold text-slate-100">Dimension</th>
                      <th scope="col" className="px-4 py-3 text-[13px] font-semibold text-emerald-100">Starting Monday</th>
                      <th scope="col" className="px-4 py-3 text-[13px] font-semibold text-slate-100">coaching.com</th>
                      <th scope="col" className="px-4 py-3 text-[13px] font-semibold text-slate-100">BetterUp</th>
                      <th scope="col" className="px-4 py-3 text-[13px] font-semibold text-slate-100">DIY stack</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hiddenComparisonRows.map((row) => (
                      <tr key={row.dimension} className="align-top odd:bg-white/[0.02]">
                        <th scope="row" className="border-t border-white/10 px-4 py-3 text-[13px] font-semibold text-white">{row.dimension}</th>
                        <td className="border-t border-white/10 px-4 py-3 text-[13px] leading-relaxed text-slate-100">{row.startingMonday}</td>
                        <td className="border-t border-white/10 px-4 py-3 text-[13px] leading-relaxed text-slate-200">{row.coachingDotCom}</td>
                        <td className="border-t border-white/10 px-4 py-3 text-[13px] leading-relaxed text-slate-200">{row.betterUp}</td>
                        <td className="border-t border-white/10 px-4 py-3 text-[13px] leading-relaxed text-slate-200">{row.diy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>

            <p className="mt-4 text-[13px] leading-relaxed text-slate-300">
              Comparison note: this is a directional summary for coach evaluation, based on each platform&apos;s typical positioning and use model.
            </p>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Pricing clarity</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {COACH_BUYER_PLANS.map((plan) => (
                <article key={plan.name} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <p className="mb-1 text-[14px] font-semibold text-white">{plan.name}</p>
                  <p className="mb-3 text-[22px] font-bold text-orange-200">{plan.price}</p>
                  <p className="text-[13px] leading-relaxed text-slate-200">{plan.fit}</p>
                </article>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-slate-200">
              <span className="font-semibold text-white">Which plan fits me?</span>{' '}
              <span>1-4 active clients: Starter. Small active roster: Studio. Multi-coach or up to 10 client seats: Team.</span>
            </p>
            <p className="mt-2 text-[12px] text-slate-200">
              Start with a 30-day pass/fail pilot, then choose the plan that matches your active client load. Volume and partner terms are available for larger coaching teams.{' '}
              <TrackLink
                href="/for-coaches/economics"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'coach_pricing_learn_more', source_page: '/for-coaches' }}
                className="font-semibold text-orange-200 underline underline-offset-2 transition-colors hover:text-orange-100"
              >
                Learn more
              </TrackLink>
            </p>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.22)] backdrop-blur-sm sm:p-7">
            <p className="mb-4 text-[12px] font-semibold text-orange-200">Trust and privacy</p>
            <h2 className="mb-4 text-[22px] font-bold leading-snug text-white">Starting Monday supports coaching. It does not replace it.</h2>
            <div className="mb-4 grid gap-8 md:grid-cols-2 md:divide-x md:divide-slate-200">
              <div>
                <p className="mb-2 text-[13px] font-semibold text-slate-100">Platform handles</p>
                <ul className="space-y-2 text-[14px] leading-relaxed text-slate-200">
                  {ROLE_BOUNDARY.platform.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div className="md:pl-8">
                <p className="mb-2 text-[13px] font-semibold text-orange-200">Coach handles</p>
                <ul className="space-y-2 text-[14px] leading-relaxed text-slate-200">
                  {ROLE_BOUNDARY.coach.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mb-5 text-[14px] leading-relaxed text-slate-200">Clients control access and can revoke it at any time. There is no recruiter-side data sharing. The trust pack explains permissions in under one minute.</p>
            <div className="flex flex-wrap gap-3">
              <TrackLink
                href="/for-coaches/trust-pack"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'coach_trust_pack', source_page: '/for-coaches' }}
                className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-[14px] font-semibold text-slate-100 transition-colors hover:border-orange-300/60 hover:bg-white/5"
              >
                Read the trust pack
              </TrackLink>
              <TrackLink
                href="/for-coaches/economics"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'coach_economics', source_page: '/for-coaches' }}
                className="inline-flex items-center justify-center rounded-full border border-orange-300/70 px-5 py-3 text-[14px] font-semibold text-orange-100 transition-colors hover:bg-orange-400/10"
              >
                View pricing and economics
              </TrackLink>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 text-white shadow-[0_18px_70px_rgba(15,23,42,0.22)] backdrop-blur-sm sm:p-7">
            <p className="mb-3 text-[12px] font-semibold text-orange-200">Next step</p>
            <h2 className="mb-3 text-[22px] font-bold leading-snug">Request the preview, then decide from a live client workflow.</h2>
            <p className="mb-6 max-w-3xl text-[14px] leading-relaxed text-slate-200">See the workflow with two to three live clients for 30 days, then decide based on outcomes in your own practice.</p>
            <CoachPreviewActions />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/80 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex flex-wrap gap-4 text-[12px] text-slate-200">
            <Link href="/coaches/personas" className="transition-colors hover:text-slate-200">Coach personas</Link>
            <Link href="/for-coaches/trust-pack" className="transition-colors hover:text-slate-200">Trust pack</Link>
            <Link href="/for-coaches/economics" className="transition-colors hover:text-slate-200">Economics</Link>
            <Link href="/for-coaches/faq" className="transition-colors hover:text-slate-200">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
