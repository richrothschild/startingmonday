import type { Metadata } from 'next'
import { TrackLink } from '@/components/TrackLink'
import { ChannelMicroProductRail } from '@/components/micro-products/ChannelMicroProductRail'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'

export const metadata: Metadata = {
  title: 'Executive Channel | Starting Monday',
  description:
    'For executives running a private, signal-first search campaign. Move earlier, prepare deeper, and execute with disciplined cadence.',
  alternates: {
    canonical: 'https://startingmonday.app/executives',
  },
  openGraph: {
    title: 'Executive Channel | Starting Monday',
    description:
      'Signal-first campaign infrastructure for executives in transition or preparing the next move.',
    url: 'https://startingmonday.app/executives',
  },
}

export default function ExecutivesChannelPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 py-14 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-400 mb-4">Executive channel</p>
        <h1 className="text-[34px] sm:text-[44px] font-bold leading-[1.1] tracking-tight mb-4">
          Run a private, signal-first campaign.
        </h1>
        <p className="text-[16px] text-slate-200 leading-relaxed max-w-3xl mb-6">
          Starting Monday gives senior executives early market signals, relationship operating cadence, and role-level prep rigor so you can move before the role is posted and show up at peer depth.
        </p>

        <div className="rounded-lg border border-emerald-500/50 bg-emerald-950/20 p-4 mb-8">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-emerald-300 mb-1">Trust and confidentiality</p>
          <p className="text-[13px] text-emerald-100 leading-relaxed">
            Confidential by default. We do not sell leads, we do not share your activity with employers, and you can permanently delete your data.
          </p>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <TrackLink
            href="/executives/active"
            event={EVENT_NAMES.personaRouteSelected}
            logToUserEvents
            properties={{ channel: 'executives', persona: 'active_mode', source_route: '/executives', target_route: '/executives/active' }}
            className="block rounded border border-slate-800 bg-slate-950 p-4 hover:border-orange-500 transition-colors"
          >
            <p className="text-[13px] font-semibold text-white mb-2">Active search mode</p>
            <p className="text-[13px] text-slate-200 leading-relaxed">For executives in immediate transition who need daily execution cadence.</p>
          </TrackLink>
          <TrackLink
            href="/executives/passive"
            event={EVENT_NAMES.personaRouteSelected}
            logToUserEvents
            properties={{ channel: 'executives', persona: 'passive_mode', source_route: '/executives', target_route: '/executives/passive' }}
            className="block rounded border border-slate-800 bg-slate-950 p-4 hover:border-orange-500 transition-colors"
          >
            <p className="text-[13px] font-semibold text-white mb-2">Optionality mode</p>
            <p className="text-[13px] text-slate-200 leading-relaxed">For executives not actively searching yet who want strategic readiness.</p>
          </TrackLink>
        </section>

        <div className="flex flex-wrap gap-3 mb-8">
          <TrackLink
            href="/executives/personas"
            event={EVENT_NAMES.personaRouteSelected}
            logToUserEvents
            properties={{ channel: 'executives', persona: 'persona_hub', source_route: '/executives', target_route: '/executives/personas' }}
            className="inline-block bg-slate-100 text-slate-900 text-[14px] font-semibold px-5 py-3 rounded hover:bg-white transition-colors"
          >
            Explore executive personas
          </TrackLink>
          <TrackLink
            href="/for-cio"
            event={EVENT_NAMES.channelEntryClicked}
            logToUserEvents
            properties={{ channel: 'executives', cta_label: 'start_executive_campaign', source_page: '/executives' }}
            className="inline-block bg-orange-500 text-slate-900 text-[14px] font-semibold px-5 py-3 rounded hover:bg-orange-600 transition-colors"
          >
            Start your campaign
          </TrackLink>
          <TrackLink
            href="/signup"
            event={EVENT_NAMES.channelEntryClicked}
            logToUserEvents
            properties={{ channel: 'executives', cta_label: 'Start free trial', source_page: '/executives' }}
            className="inline-block border border-slate-600 text-slate-100 text-[14px] font-semibold px-5 py-3 rounded hover:border-slate-300 transition-colors"
          >
            Start free trial
          </TrackLink>
        </div>

        <ChannelMicroProductRail channel="executives" sourceRoute="/executives" />

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded border border-slate-800 bg-slate-950 p-4">
            <p className="text-[12px] font-semibold text-white mb-2">Built for active transitions</p>
            <p className="text-[13px] text-slate-200 leading-relaxed">CIO, CTO, CISO, CDO, CPO, COO, and VP-to-C-suite paths with role-level preparation.</p>
          </div>
          <div className="rounded border border-slate-800 bg-slate-950 p-4">
            <p className="text-[12px] font-semibold text-white mb-2">Built for optionality mode</p>
            <p className="text-[13px] text-slate-200 leading-relaxed">Monitor transition windows and relationship momentum even before you formally announce a move.</p>
          </div>
        </section>
      </div>
    
        <p className="sr-only">Private by default. We do not share your data with recruiters, employers, or third parties.</p>
      </main>
  )
}
