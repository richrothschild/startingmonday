import type { Metadata } from 'next'
import { TrackLink } from '@/components/TrackLink'
import { TrackedAccordionItem } from '@/components/TrackedAccordionItem'
import { ChannelMicroProductRail } from '@/components/micro-products/ChannelMicroProductRail'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'

export const metadata: Metadata = {
  title: 'Coaches Channel | Starting Monday',
  description:
    'For executive coaches who want stronger between-session execution and better prep quality without replacing coaching strategy.',
  alternates: {
    canonical: 'https://startingmonday.app/coaches',
  },
  openGraph: {
    title: 'Coaches Channel | Starting Monday',
    description:
      'Coach-first execution layer for pipeline accountability, signal monitoring, and prep-readiness.',
    url: 'https://startingmonday.app/coaches',
  },
}

export default function CoachesChannelPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 py-14 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-400 mb-4">Coach channel</p>
        <h1 className="text-[34px] sm:text-[44px] font-bold leading-[1.1] tracking-tight mb-4">
          Keep coaching sessions strategic.
        </h1>
        <p className="text-[16px] text-slate-300 leading-relaxed max-w-3xl mb-6">
          Starting Monday gives coaches an execution layer between sessions so clients arrive prepared, signal response is visible, and accountability does not rely on manual follow-up.
        </p>

        <div className="rounded-lg border border-emerald-500/50 bg-emerald-950/20 p-4 mb-8">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-emerald-300 mb-1">Trust and role boundary</p>
          <p className="text-[13px] text-emerald-100 leading-relaxed">
            Coach-first by design. The platform handles cadence and prep infrastructure; strategic judgment and client transformation stay with the coach.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <TrackLink
            href="/coaches/personas"
            event={EVENT_NAMES.personaRouteSelected}
            logToUserEvents
            properties={{ channel: 'coaches', persona: 'persona_hub', source_route: '/coaches', target_route: '/coaches/personas' }}
            className="inline-block bg-slate-100 text-slate-900 text-[14px] font-semibold px-5 py-3 rounded hover:bg-white transition-colors"
          >
            Explore coach personas
          </TrackLink>
          <TrackLink
            href="/for-coaches"
            event={EVENT_NAMES.channelEntryClicked}
            logToUserEvents
            properties={{ channel: 'coaches', cta_label: 'Open coach journey', source_page: '/coaches' }}
            className="inline-block bg-orange-500 text-slate-900 text-[14px] font-semibold px-5 py-3 rounded hover:bg-orange-600 transition-colors"
          >
            Open coach journey
          </TrackLink>
          <TrackLink
            href="/partners#apply"
            event={EVENT_NAMES.channelEntryClicked}
            logToUserEvents
            properties={{ channel: 'coaches', cta_label: 'Start coach preview', source_page: '/coaches' }}
            className="inline-block border border-slate-600 text-slate-100 text-[14px] font-semibold px-5 py-3 rounded hover:border-slate-300 transition-colors"
          >
            Start coach preview
          </TrackLink>
        </div>

        <section className="mb-8">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-3">At a glance</p>
          <div className="grid grid-cols-1 gap-3">
            <TrackedAccordionItem
              title="Where coaches get leverage"
              summary="One shared execution view keeps client momentum visible between sessions."
              detail="Signals, follow-ups, and prep readiness stay in one place so weekly coaching time remains strategic."
              href="/for-coaches"
              channel="coaches"
              route="/coaches"
              blockId="coach_leverage"
            />
            <TrackedAccordionItem
              title="How risk is lowered"
              summary="Start with a short pass/fail preview, not a full rollout decision."
              detail="Run with 2-3 live clients for 30 days and keep only what improves prep depth and execution consistency."
              href="/for-coaches/faq"
              channel="coaches"
              route="/coaches"
              blockId="coach_risk_model"
            />
            <TrackedAccordionItem
              title="What success looks like"
              summary="Better-prepared sessions and less context rebuild overhead."
              detail="The goal is not more tooling. It is clearer accountability and stronger outcomes in the same coaching time."
              href="/for-coaches/coach-prep-worksheet"
              channel="coaches"
              route="/coaches"
              blockId="coach_success_definition"
            />
          </div>
        </section>

        <ChannelMicroProductRail channel="coaches" sourceRoute="/coaches" />

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded border border-slate-800 bg-slate-900 p-4">
            <p className="text-[12px] font-semibold text-white mb-2">Primary outcome</p>
            <p className="text-[13px] text-slate-300 leading-relaxed">Higher prep quality and stronger between-session execution without adding admin burden.</p>
          </div>
          <div className="rounded border border-slate-800 bg-slate-900 p-4">
            <p className="text-[12px] font-semibold text-white mb-2">Pilot structure</p>
            <p className="text-[13px] text-slate-300 leading-relaxed">30-day pass/fail preview with practical scorecards coaches can use in real workflows.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
