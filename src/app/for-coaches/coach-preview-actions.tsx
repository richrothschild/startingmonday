'use client'

import { TrackLink } from '@/components/TrackLink'

const EVENT_NAME = 'coach_preview_requested'
const EVENT_PROPERTIES = {
  page: 'for-coaches',
  audience: 'executive_coaches',
  motion: 'warm_intro_preview',
} as const

export function CoachPreviewActions() {
  return (
    <div className="space-y-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">Choose your next step</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
      <TrackLink
        href="/partners#apply"
        data-emi-cta="coaches_request_preview"
        data-emi-to="/partners#apply"
        event={EVENT_NAME}
        properties={EVENT_PROPERTIES}
        className="inline-flex items-center justify-center rounded bg-orange-500 px-6 py-3 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-orange-400"
      >
        Request the coach preview
      </TrackLink>
      <TrackLink
        href="/demo?full=1"
        data-emi-cta="coaches_watch_walkthrough"
        data-emi-to="/demo?full=1"
        event="coach_preview_walkthrough_clicked"
        properties={{
          page: 'for-coaches',
          audience: 'executive_coaches',
          destination: 'demo',
        }}
        className="inline-flex items-center justify-center rounded border border-slate-400 px-6 py-3 text-[13px] font-medium text-slate-100 transition-colors hover:border-slate-200 hover:text-white"
      >
        See the live walkthrough
      </TrackLink>
      <TrackLink
        href="/for-coaches/trust-pack"
        data-emi-cta="coaches_review_trust_pack"
        data-emi-to="/for-coaches/trust-pack"
        event="coach_preview_trust_pack_clicked"
        properties={{
          page: 'for-coaches',
          audience: 'executive_coaches',
          destination: 'trust_pack',
        }}
        className="inline-flex items-center justify-center rounded border border-slate-700 px-6 py-3 text-[13px] font-medium text-slate-100 transition-colors hover:border-slate-500 hover:text-white"
      >
        Review trust pack first
      </TrackLink>
      </div>
    </div>
  )
}
