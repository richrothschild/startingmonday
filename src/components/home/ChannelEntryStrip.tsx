'use client'

import { useSearchParams } from 'next/navigation'
import { TrackLink } from '@/components/TrackLink'
import { CHANNEL_ROUTE_SPECS } from '@/lib/channel-ia'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'
import { isEnabledFlag } from '@/lib/feature-flags'

export function ChannelEntryStrip() {
  const experimentEnabled = isEnabledFlag(process.env.NEXT_PUBLIC_CHANNEL_ENTRY_AB_TEST)
  const params = useSearchParams()
  const paramVariant = params.get('ce_variant')
  const variant: 'control' | 'emphasis' = paramVariant === 'emphasis' ? 'emphasis' : 'control'

  const title = variant === 'emphasis' ? 'Pick your channel and move fast' : 'Choose your channel'

  return (
    <section className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-5">
      <div className="max-w-5xl mx-auto">
        <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-3">
          {title}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CHANNEL_ROUTE_SPECS.map((spec) => (
            <TrackLink
              key={spec.channel}
              href={spec.route}
              event={EVENT_NAMES.channelEntryClicked}
              logToUserEvents
              properties={{
                channel: spec.channel,
                cta_label: spec.primaryCtaLabel,
                source_page: '/',
                experiment_variant: experimentEnabled ? variant : 'disabled',
              }}
              className="block rounded border border-slate-700 bg-slate-800 px-4 py-3 hover:border-orange-500 transition-colors"
            >
              <p className="text-[13px] font-semibold text-white">{spec.label}</p>
              <p className="text-[12px] text-slate-300 mt-1 leading-relaxed">{spec.hero}</p>
              <p className="text-[11px] text-orange-300 mt-2">{spec.trust}</p>
              <p className="text-[12px] text-slate-400 mt-2">{spec.primaryCtaLabel}</p>
            </TrackLink>
          ))}
        </div>
      </div>
    </section>
  )
}
