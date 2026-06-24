import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TrackLink } from '@/components/TrackLink'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'
import { SEARCH_FIRM_PERSONAS } from '@/lib/persona-routes'

const personaRoleDetails: Record<string, { outcomes: string[]; pilotFocus: string; governance: string }> = {
  'partner-firm-lead': {
    outcomes: ['Mandate economics improve before rollout expands.', 'Partner time is spent on judgment, not recap.', 'Bid differentiation is visible in kickoff quality.'],
    pilotFocus: 'Name one sponsor, pick one mandate, and measure prep-hour recovery plus first-slate confidence.',
    governance: 'Legal review should confirm confidentiality boundaries and commercial scope before candidate activation.',
  },
  'principal-delivery-lead': {
    outcomes: ['Kickoff materials become consistent across consultants.', 'Candidate prep gets measured before round one.', 'Search resets are reviewed against one scorecard.'],
    pilotFocus: 'Use one live mandate and one weekly review to compare kickoff quality before and after the brief layer.',
    governance: 'Procurement and sponsor decisions should be settled early so delivery teams are not waiting mid-pilot.',
  },
  'candidate-success-owner': {
    outcomes: ['Candidate handoff quality becomes easier to audit.', 'First-round readiness is visible before interviews begin.', 'Trial decisions use completion and advancement signals, not anecdotes.'],
    pilotFocus: 'Track candidate readiness, handoff completion, and first-round movement against the day-0 baseline.',
    governance: 'Role-scoped visibility and candidate-controlled sharing should be confirmed before any partner view is granted.',
  },
}

type Params = { slug: string }

export function generateStaticParams() {
  return SEARCH_FIRM_PERSONAS.map((persona) => ({ slug: persona.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const persona = SEARCH_FIRM_PERSONAS.find((item) => item.slug === slug)
  if (!persona) return {}
  return {
    title: `${persona.label} | Search-Firm Persona`,
    description: persona.summary,
    alternates: { canonical: `https://startingmonday.app/search-firms/personas/${persona.slug}` },
  }
}

export default async function SearchFirmPersonaDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const persona = SEARCH_FIRM_PERSONAS.find((item) => item.slug === slug)
  if (!persona) notFound()
  const details = personaRoleDetails[persona.slug]

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 py-14 sm:py-20">
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-400 mb-4">Search-firm persona</p>
        <h1 className="text-[34px] sm:text-[42px] font-bold leading-[1.1] tracking-tight mb-4">{persona.label}</h1>
        <p className="text-[16px] text-slate-300 leading-relaxed mb-8">{persona.summary}</p>
        <p className="text-[13px] text-slate-400 leading-relaxed mb-8">
          Confidential route for partner evaluation and candidate-readiness planning before outreach begins.
        </p>

        <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-300">Pilot path for this role</p>
          <p className="mt-2 text-[14px] leading-relaxed text-slate-300">{details?.pilotFocus}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{details?.governance}</p>
          <ul className="mt-4 space-y-2 text-[13px] leading-relaxed text-slate-300">
            {details?.outcomes.map((outcome) => (
              <li key={outcome} className="flex gap-2">
                <span className="font-bold text-orange-300">+</span>
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-3">
          <TrackLink
            href={persona.destination}
            event={EVENT_NAMES.channelEntryClicked}
            logToUserEvents
            properties={{ channel: 'search_firms', cta_label: `Open ${persona.slug} destination`, source_page: `/search-firms/personas/${persona.slug}` }}
            className="inline-block bg-orange-500 text-slate-900 text-[14px] font-semibold px-5 py-3 rounded hover:bg-orange-600 transition-colors"
          >
            Continue to search firm journey
          </TrackLink>
          <TrackLink
            href="/search-firms/procurement"
            event={EVENT_NAMES.channelEntryClicked}
            logToUserEvents
            properties={{ channel: 'search_firms', cta_label: `Review procurement path ${persona.slug}`, source_page: `/search-firms/personas/${persona.slug}` }}
            className="inline-block border border-emerald-500 text-emerald-100 text-[14px] font-semibold px-5 py-3 rounded hover:border-emerald-300 transition-colors"
          >
            Review procurement path
          </TrackLink>
          <TrackLink
            href="/search-firms/trust"
            event={EVENT_NAMES.channelEntryClicked}
            logToUserEvents
            properties={{ channel: 'search_firms', cta_label: `Review trust summary ${persona.slug}`, source_page: `/search-firms/personas/${persona.slug}` }}
            className="inline-block border border-slate-600 text-slate-100 text-[14px] font-semibold px-5 py-3 rounded hover:border-slate-300 transition-colors"
          >
            Review trust summary
          </TrackLink>
          <TrackLink
            href="/partners?channel=search-firms#apply"
            event={EVENT_NAMES.channelEntryClicked}
            logToUserEvents
            properties={{ channel: 'search_firms', cta_label: `Apply to partner program ${persona.slug}`, source_page: `/search-firms/personas/${persona.slug}` }}
            className="inline-block border border-amber-400 text-amber-100 text-[14px] font-semibold px-5 py-3 rounded hover:border-amber-200 transition-colors"
          >
            Apply to partner program
          </TrackLink>
          <TrackLink
            href="/search-firms/personas"
            event={EVENT_NAMES.personaRouteSelected}
            logToUserEvents
            properties={{ channel: 'search_firms', persona: 'persona_back_nav', source_route: `/search-firms/personas/${persona.slug}`, target_route: '/search-firms/personas' }}
            className="inline-block border border-slate-600 text-slate-100 text-[14px] font-semibold px-5 py-3 rounded hover:border-slate-300 transition-colors"
          >
            Back to persona list
          </TrackLink>
        </div>
      </div>
    </main>
  )
}
