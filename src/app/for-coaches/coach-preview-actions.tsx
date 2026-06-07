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
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
      <TrackLink
        href="/partners#apply"
        data-emi-cta="coaches_request_preview"
        data-emi-to="/partners#apply"
        event={EVENT_NAME}
        properties={EVENT_PROPERTIES}
        className="inline-flex items-center justify-center rounded bg-orange-500 px-6 py-3 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-orange-600"
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
        className="inline-flex items-center justify-center rounded border border-slate-600 px-6 py-3 text-[13px] font-medium text-slate-300 transition-colors hover:border-slate-400 hover:text-white"
      >
        Watch the walkthrough
      </TrackLink>
    </div>
  )
}
