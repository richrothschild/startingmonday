import Link from 'next/link'
import { signalLabel, SIGNAL_COLORS } from '@/lib/intelligence'

type CompanyRef = {
  id: string
  name: string
}

type FollowUpRow = {
  id: string
  due_date: string
  action: string
  companies: { name: string } | null
}

type SignalRow = {
  id: string
  signal_type: string
  signal_summary: string
  outreach_angle?: string | null
  signal_date: string
  company_id: string
  companies: CompanyRef | null
}

type WarmPath = {
  contactId: string
  contactName: string
  contactTitle: string | null
  companyId: string
  companyName: string
  signal: SignalRow
}

type Props = {
  todayISO: string
  followUps: FollowUpRow[]
  warmPaths: WarmPath[]
  patternAlerts: SignalRow[]
  signals: SignalRow[]
}

type FeedItem = {
  id: string
  badge: string
  badgeClassName: string
  title: string
  body: string
  meta: string
  href: string
  cta: string
}

function formatDateLabel(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function buildFeedItems(props: Props): FeedItem[] {
  const dueItems = props.followUps.slice(0, 3).map((followUp) => ({
    id: `follow-up-${followUp.id}`,
    badge: followUp.due_date === props.todayISO ? 'Due Today' : 'Follow-up',
    badgeClassName: followUp.due_date === props.todayISO
      ? 'bg-red-50 text-red-700'
      : 'bg-slate-100 text-slate-600',
    title: followUp.action,
    body: followUp.companies?.name
      ? `At ${followUp.companies.name}. Close the loop before newer work crowds it out.`
      : 'Close the next promised action before newer work crowds it out.',
    meta: followUp.due_date === props.todayISO ? 'Today' : formatDateLabel(followUp.due_date),
    href: '/dashboard/calendar',
    cta: 'Open calendar',
  }))

  const warmPathItems = props.warmPaths.slice(0, 2).map((warmPath) => ({
    id: `warm-path-${warmPath.contactId}-${warmPath.signal.id}`,
    badge: 'Warm Path',
    badgeClassName: 'bg-green-50 text-green-700',
    title: `${warmPath.contactName} at ${warmPath.companyName}`,
    body: warmPath.signal.signal_summary,
    meta: formatDateLabel(warmPath.signal.signal_date),
    href: `/dashboard/contacts/${warmPath.contactId}/outreach`,
    cta: 'Draft outreach',
  }))

  const patternItems = props.patternAlerts.slice(0, 2).map((signal) => {
    const colonIndex = signal.signal_summary.indexOf(': ')
    const patternName = colonIndex > -1 ? signal.signal_summary.slice(0, colonIndex) : 'Pattern Alert'
    const patternBody = colonIndex > -1 ? signal.signal_summary.slice(colonIndex + 2) : signal.signal_summary
    return {
      id: `pattern-${signal.id}`,
      badge: patternName,
      badgeClassName: 'bg-orange-50 text-orange-700',
      title: signal.companies?.name ?? 'Market pattern detected',
      body: patternBody,
      meta: formatDateLabel(signal.signal_date),
      href: '/dashboard/signals',
      cta: 'Review signal',
    }
  })

  const signalItems = props.signals.slice(0, 3).map((signal) => ({
    id: `signal-${signal.id}`,
    badge: signalLabel(signal.signal_type),
    badgeClassName: SIGNAL_COLORS[signal.signal_type] ?? 'bg-amber-50 text-amber-700',
    title: signal.companies?.name ?? 'Company signal',
    body: signal.signal_summary,
    meta: formatDateLabel(signal.signal_date),
    href: '/dashboard/signals',
    cta: 'Open signals',
  }))

  return [...dueItems, ...warmPathItems, ...patternItems, ...signalItems].slice(0, 6)
}

export function DashboardProgressFeedSection(props: Props) {
  const items = buildFeedItems(props)

  if (items.length === 0) {
    return null
  }

  return (
    <section id="progress-feed" className="bg-white border border-slate-200 rounded overflow-hidden mb-8">
      <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
            Progress Feed
          </h2>
          <p className="text-[12px] text-slate-500 mt-1">
            The shortest path to momentum across due actions, warm openings, and new market movement.
          </p>
        </div>
        <Link href="/dashboard/briefing" className="text-[12px] text-slate-400 hover:text-slate-600 shrink-0">
          Briefing &rarr;
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.id} className="px-6 py-4 flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.04em] ${item.badgeClassName}`}>
                  {item.badge}
                </span>
                <span className="text-[12px] text-slate-400">{item.meta}</span>
              </div>
              <p className="text-[14px] font-semibold text-slate-900">{item.title}</p>
              <p className="text-[13px] text-slate-500 leading-relaxed mt-1">{item.body}</p>
            </div>
            <Link
              href={item.href}
              className="shrink-0 text-[12px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded transition-colors"
            >
              {item.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}