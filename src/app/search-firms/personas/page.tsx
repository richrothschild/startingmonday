import type { Metadata } from 'next'
import { TrackLink } from '@/components/TrackLink'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'
import { SEARCH_FIRM_PERSONAS } from '@/lib/persona-routes'

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
            </TrackLink>
          ))}
        </div>
      </div>
    </main>
  )
}
