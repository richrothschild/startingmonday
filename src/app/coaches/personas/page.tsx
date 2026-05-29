import type { Metadata } from 'next'
import { TrackLink } from '@/components/TrackLink'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'
import { COACH_PERSONAS } from '@/lib/persona-routes'

export const metadata: Metadata = {
  title: 'Coach Personas | Starting Monday',
  description: 'Choose the coach persona route that matches your operating model and client cohort.',
  alternates: {
    canonical: 'https://startingmonday.app/coaches/personas',
  },
}

export default function CoachPersonasPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 py-14 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-400 mb-4">Coach persona routes</p>
        <h1 className="text-[34px] sm:text-[42px] font-bold leading-[1.1] tracking-tight mb-4">Choose your coaching model.</h1>
        <p className="text-[16px] text-slate-300 leading-relaxed mb-8">Select the persona route that matches how you operate your practice.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COACH_PERSONAS.map((persona) => (
            <TrackLink
              key={persona.slug}
              href={`/coaches/personas/${persona.slug}`}
              event={EVENT_NAMES.personaRouteSelected}
              logToUserEvents
              properties={{ channel: 'coaches', persona: persona.slug, source_route: '/coaches/personas', target_route: `/coaches/personas/${persona.slug}` }}
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
