import Link from 'next/link'
import { TrackLink } from '@/components/TrackLink'

type DashboardQuickAccessSectionProps = {
  isExecutiveMode: boolean
  executiveStageLabel: string
  isCoach: boolean
}

export function DashboardQuickAccessSection({
  isExecutiveMode,
  executiveStageLabel,
  isCoach,
}: DashboardQuickAccessSectionProps) {
  const quickActions = isExecutiveMode
    ? (
      executiveStageLabel === 'Offer and Decision'
        ? [
            { href: '/dashboard/offers', label: 'Offer Tradeoffs' },
            { href: '/dashboard/strategy', label: 'No-go Criteria' },
            { href: '/dashboard/contacts', label: 'Reference Push' },
            { href: '/dashboard/calendar', label: 'Decision Timeline' },
            { href: '/dashboard/briefing', label: 'Risk Review' },
            { href: '/dashboard/wrap-up', label: 'Transition Plan' },
          ]
        : executiveStageLabel === 'Interviewing and Conversion'
          ? [
              { href: '/dashboard/strategy', label: 'Prep Brief' },
              { href: '/dashboard/signals', label: 'Signal Angle' },
              { href: '/dashboard/contacts', label: 'Warm Intros' },
              { href: '/dashboard/calendar', label: 'Follow-up SLA' },
              { href: '/dashboard/briefing', label: 'Daily Priorities' },
              { href: '/dashboard/positioning', label: 'Narrative Tighten' },
            ]
          : [
              { href: '/dashboard/briefing', label: 'Daily Briefing' },
              { href: '/dashboard/companies/new', label: 'Add Target' },
              { href: '/dashboard/contacts', label: 'Build Sponsor Map' },
              { href: '/dashboard/signals', label: 'Signals' },
              { href: '/dashboard/strategy', label: 'Strategy Brief' },
              { href: '/dashboard/profile', label: 'Profile Inputs' },
            ]
    )
    : [
        { href: '/dashboard/briefing', label: 'Daily Briefing' },
        { href: '/dashboard/strategy', label: 'Strategy Brief' },
        { href: '/dashboard/discover', label: 'Discover' },
        { href: '/dashboard/calendar', label: 'Calendar' },
        { href: '/optimize', label: 'LinkedIn' },
        { href: '/dashboard/positioning', label: 'Positioning' },
        { href: '/dashboard/profile', label: 'Configure Search' },
        ...(isCoach ? [{ href: '/dashboard/coach', label: 'My Clients' }] : []),
      ]

  const powerViews = [
    { href: '/dashboard?stage=interviewing#pipeline', label: 'Interviewing pipeline', target: 'interviewing' },
    { href: '/dashboard?stage=applied#pipeline', label: 'In-process pipeline', target: 'applied' },
    { href: '/dashboard?stage=offer#pipeline', label: 'Offer stage', target: 'offer' },
    { href: '/dashboard?timelineSort=stalled_desc&focus=health#health-modules', label: 'Stalled companies', target: 'stalled' },
    { href: '/dashboard/signals', label: 'Fresh signals', target: 'signals' },
    { href: '/dashboard/calendar', label: 'Due follow-ups', target: 'calendar_due' },
    { href: '/dashboard/briefing?mode=focused', label: 'Focused briefing', target: 'briefing_focused' },
  ]

  return (
    <section id="quick-access" className="rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5 shadow-[0_22px_66px_rgba(15,23,42,0.18)] backdrop-blur-md">
      <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">
        {isExecutiveMode ? 'Stage actions' : 'Quick actions'}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {quickActions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group bg-white/5 border border-white/15 rounded p-3 hover:border-white/35 hover:shadow-sm transition-all"
          >
            <p className="text-[13px] font-semibold text-slate-100 group-hover:text-white">{a.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mt-4 mb-2">Power views</h2>
      <div className="flex flex-wrap gap-2">
        {powerViews.map((v) => (
          <TrackLink
            key={v.target}
            href={v.href}
            event="power_view_clicked"
            properties={{ target: v.target }}
            className="text-[12px] text-slate-200 border border-white/20 rounded px-2.5 py-1.5 hover:border-white/40 transition-colors"
          >
            {v.label}
          </TrackLink>
        ))}
      </div>
    </section>
  )
}
