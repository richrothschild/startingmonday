import type { Metadata } from 'next'
import { TrackLink } from '@/components/TrackLink'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'
import { SEARCH_FIRM_PERSONAS } from '@/lib/persona-routes'

const personaOutcomeChips: Record<string, string[]> = {
  'partner-firm-lead': ['Mandate economics', 'Bid differentiation', 'Partner time protection'],
  'principal-delivery-lead': ['Kickoff consistency', 'Prep quality', 'Fewer resets'],
  'candidate-success-owner': ['First-round readiness', 'Handoff confidence', 'Interview conversion'],
}

export const metadata: Metadata = {
  title: 'Search Firm Personas | Starting Monday',
  description: 'Choose a search-firm persona route for partner, delivery, or candidate-readiness ownership.',
  alternates: {
    canonical: 'https://startingmonday.app/search-firms/personas',
  },
}

export default function SearchFirmPersonasPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 py-14 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-400 mb-4">Search-firm persona routes</p>
        <h1 className="text-[34px] sm:text-[42px] font-bold leading-[1.1] tracking-tight mb-4">Choose your search-firm role.</h1>
        <p className="text-[16px] text-slate-300 leading-relaxed mb-8">Select the role path that matches your mandate ownership and delivery responsibility.</p>

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-300">Pilot structure</p>
          <p className="mt-2 text-[14px] leading-relaxed text-slate-300">
            Every path uses the same Sprint 1 operating frame: one mandate, named sponsor, role-scoped access, and a day-30 go, revise, or stop decision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SEARCH_FIRM_PERSONAS.map((persona) => (
            <TrackLink
              key={persona.slug}
              href={`/search-firms/personas/${persona.slug}`}
              event={EVENT_NAMES.personaRouteSelected}
              logToUserEvents
              properties={{ channel: 'search_firms', persona: persona.slug, source_route: '/search-firms/personas', target_route: `/search-firms/personas/${persona.slug}` }}
              className="block rounded border border-slate-800 bg-slate-900 p-4 hover:border-orange-500 transition-colors"
            >
              <p className="text-[14px] font-semibold text-white mb-2">{persona.label}</p>
              <p className="text-[13px] text-slate-300 leading-relaxed">{persona.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(personaOutcomeChips[persona.slug] ?? []).map((chip) => (
                  <span key={chip} className="rounded-full border border-white/12 px-2.5 py-1 text-[11px] font-semibold text-orange-200">
                    {chip}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-slate-400">
                Includes trust, procurement, and trial-governance guidance for this role.
              </p>
            </TrackLink>
          ))}
        </div>
      </div>
    </main>
  )
}
