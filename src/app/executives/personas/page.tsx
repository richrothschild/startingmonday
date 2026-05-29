import type { Metadata } from 'next'
import { TrackLink } from '@/components/TrackLink'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'
import { EXECUTIVE_PERSONAS } from '@/lib/persona-routes'

export const metadata: Metadata = {
  title: 'Executive Personas | Starting Monday',
  description: 'Choose your executive persona route for role-specific campaign messaging and telemetry-aware journey entry.',
  alternates: {
    canonical: 'https://startingmonday.app/executives/personas',
  },
}

export default function ExecutivePersonasPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 py-14 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-400 mb-4">Executive persona routes</p>
        <h1 className="text-[34px] sm:text-[42px] font-bold leading-[1.1] tracking-tight mb-4">Choose your route.</h1>
        <p className="text-[16px] text-slate-300 leading-relaxed mb-8">Select the persona that best matches your target seat and transition context.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EXECUTIVE_PERSONAS.map((persona) => (
            <TrackLink
              key={persona.slug}
              href={`/executives/personas/${persona.slug}`}
              event={EVENT_NAMES.personaRouteSelected}
              logToUserEvents
              properties={{
                channel: 'executives',
                persona: persona.slug,
                source_route: '/executives/personas',
                target_route: `/executives/personas/${persona.slug}`,
              }}
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
