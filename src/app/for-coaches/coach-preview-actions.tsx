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
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">Start with one action</p>
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
      </div>
    </div>
  )
}
