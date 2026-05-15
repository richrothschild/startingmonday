'use client'

import { TrackLink } from '@/components/TrackLink'

export function HelpQuickButton({
  source,
  href = '/dashboard/help',
}: {
  source: 'dashboard' | 'briefing' | 'onboarding'
  href?: string
}) {
  return (
    <TrackLink
      href={href}
      event="help_quick_button_clicked"
      properties={{ source }}
      className="fixed bottom-4 right-4 z-40 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 shadow-sm hover:border-slate-400 hover:text-slate-900 transition-colors"
    >
      Need help?
    </TrackLink>
  )
}