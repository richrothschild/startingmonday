'use client'

import Link from 'next/link'
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
        event={EVENT_NAME}
        properties={EVENT_PROPERTIES}
        className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[14px] font-semibold px-6 py-3 rounded transition-colors text-center"
      >
        Request the coach preview
      </TrackLink>
      <Link
        href="/demo"
        className="inline-block border border-slate-500 hover:border-slate-300 text-slate-100 text-[14px] px-6 py-3 rounded transition-colors text-center"
      >
        Watch the walkthrough
      </Link>
    </div>
  )
}
