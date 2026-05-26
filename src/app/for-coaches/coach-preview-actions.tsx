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
    <div className="flex flex-col sm:flex-row gap-3">
      <TrackLink
        href="/partners#apply"
        data-emi-cta="coaches_request_preview"
        data-emi-to="/partners#apply"
        event={EVENT_NAME}
        properties={EVENT_PROPERTIES}
        className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[14px] font-semibold px-6 py-3 rounded transition-colors text-center"
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
        className="inline-block border border-slate-500 hover:border-slate-300 text-slate-100 text-[14px] px-6 py-3 rounded transition-colors text-center"
      >
        Watch the walkthrough
      </TrackLink>
    </div>
  )
}
