import type { Metadata } from 'next'
import Link from 'next/link'
import { TrackLink } from '@/components/TrackLink'
import { ChannelMicroProductRail } from '@/components/micro-products/ChannelMicroProductRail'
import { SiteFooter } from '@/components/SiteFooter'
import { CompactTimelineModule } from '@/components/channel/CompactTimelineModule'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'

export const metadata: Metadata = {
  title: 'Starting Monday for Search Firms',
  description:
    'Pre-search briefs for retained search firms. Win mandates with sharper kickoff quality, reduce team rework, and improve shortlist velocity.',
  alternates: {
    canonical: 'https://startingmonday.app/search-firms',
  },
  openGraph: {
    title: 'Starting Monday for Search Firms',
    description:
      'Built for retained search firms: better kickoff quality, stronger shortlists, and faster mandate cycles.',
    url: 'https://startingmonday.app/search-firms',
  },
}

const lanes = [
  {
    title: 'Finance',
    body: 'CFO transitions, sponsor moves, and mandate positioning context before kickoff.',
  },
  {
    title: 'Operations',
    body: 'COO transition context, integration mandates, and org-shape signals.',
  },
  {
    title: 'Technology',
    body: 'CIO, CTO, and CISO market context with candidate positioning angles.',
  },
  {
    title: 'People and Revenue',
    body: 'CHRO and CRO context focused on mandate clarity and candidate story quality.',
  },
]

const outcomes = [
  'Win credibility earlier with clients by showing role-specific context at kickoff.',
  'Reduce consultant prep and partner rework before candidate outreach begins.',
  'Present stronger first slates with tighter candidate positioning.',
  'Shorten mandate-to-shortlist cycles with fewer mid-search resets.',
]

const firmBenefits = [
  {
    title: 'Protect partner time',
    body: 'Your consultants start with a clear market narrative, so partners spend less time re-briefing teams and fixing search direction mid-cycle.',
  },
  {
    title: 'Increase shortlist confidence',
    body: 'Candidates enter interviews with stronger role framing and better objection handling, improving first-round quality and client confidence.',
  },
  {
    title: 'Differentiate your process',
    body: 'Use pre-search briefs as a visible quality signal in competitive pitches and high-stakes retained mandates.',
  },
]

const cadence = [
  'Monday: mandate intake and role lane selection.',
  'Tuesday: brief delivery with market context and candidate framing.',
  'Wednesday: consultant prep and kickoff refinement.',
  'Thursday: candidate outreach and interview prep.',
  'Friday: shortlist review and search reset check.',
]

const metrics = [
  'Consultant prep hours saved per search',
  'First-slate acceptance rate',
  'Mid-search resets avoided',
]

const governanceCards = [
  {
    title: 'Trust and confidentiality',
    body: 'Candidate sharing stays role-scoped and revocable. Pilot reviews use explicit access boundaries before kickoff begins.',
    primaryLabel: 'Review sample brief',
    primaryHref: '/search-firms/sample-cfo-brief',
    secondaryLabel: 'Run a pilot',
    secondaryHref: '/partners#apply',
  },
  {
    title: 'Procurement-ready pilot path',
    body: 'Start with one mandate, a named sponsor, and a day-30 scorecard. No broad rollout, no open-ended software program.',
    primaryLabel: 'Apply to partner program',
    primaryHref: '/partners#apply',
    secondaryLabel: 'See demo',
    secondaryHref: '/demo?from=search-firms',
  },
]

export default function SearchFirmsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <nav className="sticky top-0 z-10 border-b border-white/10 bg-slate-950 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[11px] font-bold uppercase tracking-[0.16em]">
            Starting Monday
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/demo" className="text-sm text-slate-600 hover:text-slate-900">
              See demo
            </Link>
            <Link
              href="/partners#apply"
              className="rounded bg-orange-500 px-4 py-1.5 text-sm font-semibold text-slate-900 hover:bg-orange-600"
            >
              Partner with us
            </Link>
          </div>
        </div>
      </nav>

      <main>
<section className="bg-slate-950 px-4 pb-14 pt-16 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-4xl">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">
              For retained search firms
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
              Single comprehensive brief.<br />No rework.
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-200">
              Starting Monday gives your team role-specific pre-search briefs that improve kickoff quality, sharpen candidate positioning, and compress mandate-to-shortlist timelines.
            </p>
            <div className="mt-6 rounded-lg border border-slate-700 bg-slate-950/60 p-4 text-sm leading-relaxed text-slate-200">
              If your firm already researches every mandate, this is not a replacement. It is the briefing layer that keeps partners from starting from zero.
            </div>
            <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-950/20 p-4 text-sm leading-relaxed text-emerald-100">
              Trust and confidentiality: candidate context stays private to authorized firm workflows, and partner pilots are measured against explicit pass/fail scorecards.
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <TrackLink
                href="/search-firms/personas"
                event={EVENT_NAMES.personaRouteSelected}
                logToUserEvents
                properties={{ channel: 'search_firms', persona: 'persona_hub', source_route: '/search-firms', target_route: '/search-firms/personas' }}
                className="rounded bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-white"
              >
                Explore search-firm personas
              </TrackLink>
              <TrackLink
                href="/search-firms/sample-cfo-brief"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'search_firms', cta_label: 'See sample CFO brief', source_page: '/search-firms' }}
                className="rounded bg-orange-500 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-orange-600"
              >
                See sample CFO brief
              </TrackLink>
              <TrackLink
                href="/partners#apply"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'search_firms', cta_label: 'Run a pilot', source_page: '/search-firms' }}
                className="rounded border border-slate-500 px-6 py-3 text-sm font-semibold text-slate-100 hover:border-slate-300"
              >
                Run a pilot
              </TrackLink>
              <TrackLink
                href="/partners#apply"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'search_firms', cta_label: 'Request legal and pilot packet', source_page: '/search-firms' }}
                className="rounded border border-emerald-500/50 bg-emerald-950/20 px-6 py-3 text-sm font-semibold text-emerald-100 hover:border-emerald-400"
              >
                Request legal and pilot packet
              </TrackLink>
              <Link
                href="/features/search-firms"
                className="rounded border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-slate-400"
              >
                Feature one-pager
              </Link>
              <Link
                href="/features"
                className="rounded border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-slate-400"
              >
                Docs hub
              </Link>
            </div>

            <div className="mt-8">
              <ChannelMicroProductRail channel="search_firms" sourceRoute="/search-firms" />
            </div>

            <CompactTimelineModule
              channel="search_firms"
              sourcePage="/search-firms"
              eyebrow="Mini timeline"
              title="See the retained-search workflow in 3 phases"
              summary="A fast visual sequence of kickoff readiness, candidate prep quality, and shortlist reporting outcomes."
              steps={[
                { phase: 'Discover', focus: 'Mandate intake and lane-specific context build', visual: 'Role-lane brief panel' },
                { phase: 'Activate', focus: 'Deliver pre-search brief before kickoff', visual: 'Kickoff readiness timeline' },
                { phase: 'Operate', focus: 'Improve shortlist quality and reduce resets', visual: 'Shortlist quality scoreboard' },
              ]}
              theme="light"
            />
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-bold text-slate-900">What is in it for your firm</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Better search economics without operational drag. We deliver before kickoff with no software rollout, no integration project, and no workflow disruption.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {outcomes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="font-bold text-orange-500">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">How it fits your current process</h2>
              <ol className="mt-4 space-y-3 text-sm text-slate-700">
                {cadence.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6 sm:pb-16">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">Why this is credible in retained search</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                We use the same language your team uses every day: mandate, kickoff, slate, shortlist, candidate prep. The goal is not to replace research. It is to make the first conversation sharper and the search easier to run.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-bold text-slate-900">Track it with a simple scoreboard</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {metrics.map((metric) => (
                  <li key={metric} className="flex gap-2">
                    <span className="font-bold text-orange-500">+</span>
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6 sm:pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-4 md:grid-cols-2">
              {governanceCards.map((card) => (
                <article key={card.title} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">Sprint 1 foundation</p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">{card.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.body}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={card.primaryHref}
                      className="rounded bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      {card.primaryLabel}
                    </Link>
                    <Link
                      href={card.secondaryHref}
                      className="rounded border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-500"
                    >
                      {card.secondaryLabel}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6 sm:pb-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold text-slate-900">Built for firm outcomes, not activity metrics</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {firmBenefits.map((benefit) => (
                <div key={benefit.title} className="rounded-lg border border-slate-200 p-5">
                  <h3 className="text-base font-semibold text-slate-900">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{benefit.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold text-slate-900">Role lanes we support</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {lanes.map((lane) => (
                <div key={lane.title} className="rounded-lg border border-slate-200 p-5">
                  <h3 className="text-base font-semibold text-slate-900">{lane.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{lane.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">Next step</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Pilot this on your next two retained mandates</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Start with CFO or COO mandates. Measure team prep hours, first-slate acceptance rate, and mandate-to-shortlist speed.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              We will align sponsor ownership, legal review path, and procurement scope before kickoff so the pilot stays reversible and decision-ready at day 30.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <TrackLink
                href="/search-firms/sample-cfo-brief"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'search_firms', cta_label: 'Review sample brief', source_page: '/search-firms' }}
                className="rounded bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Review sample brief
              </TrackLink>
              <TrackLink
                href="/partners#apply"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'search_firms', cta_label: 'Apply to partner program', source_page: '/search-firms' }}
                className="rounded border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-500"
              >
                Apply to partner program
              </TrackLink>
              <TrackLink
                href="/partners#apply"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'search_firms', cta_label: 'Request procurement packet', source_page: '/search-firms' }}
                className="rounded border border-emerald-400 px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:border-emerald-600"
              >
                Request procurement packet
              </TrackLink>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
