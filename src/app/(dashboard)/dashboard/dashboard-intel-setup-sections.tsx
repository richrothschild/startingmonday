import Link from 'next/link'
import { FollowUpItem } from '@/components/FollowUpItem'
import { signalLabel, SIGNAL_COLORS } from '@/lib/intelligence'
import { addSignalFollowUp } from './signals/actions'

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

type Activation = {
  isComplete: boolean
}

type SetupStep = {
  done: boolean
  label: string
  href: string
  cta: string
}

type Props = {
  todayISO: string
  followUps: FollowUpRow[]
  warmPaths: WarmPath[]
  patternAlerts: SignalRow[]
  signals: SignalRow[]
  activation: Activation
  hasFilters: boolean
  setupSteps: SetupStep[]
}

export function DashboardIntelSetupSections(props: Props) {
  const { todayISO, followUps, warmPaths, patternAlerts, signals, activation, hasFilters, setupSteps } = props

  return (
    <>
      {/* Today */}
      <section id="today" className="bg-white border border-slate-200 rounded overflow-hidden mb-8">
        <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
            Today
          </h2>
          {followUps.length > 0 && (
            <span className="text-[12px] font-semibold text-red-600">
              {followUps.length} {followUps.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
        {followUps.length === 0 ? (
          <div className="px-6 py-5">
            <p className="text-[13px] text-slate-400">No actions due. Your pipeline is current.</p>
            <p className="text-[12px] text-slate-300 mt-1">
              Follow-ups you set on companies and contacts appear here when they come due.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {followUps.map((fu) => {
              const isToday = fu.due_date === todayISO
              const dateLabel = isToday
                ? 'Today'
                : new Date(fu.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              return (
                <FollowUpItem
                  key={fu.id}
                  id={fu.id}
                  action={fu.action}
                  dueDate={fu.due_date}
                  dateLabel={dateLabel}
                  isToday={isToday}
                  companyName={fu.companies?.name}
                />
              )
            })}
          </div>
        )}
      </section>

      {/* Warm Paths */}
      {warmPaths.length > 0 && (
        <section id="warm-paths" className="bg-white border border-green-200 rounded overflow-hidden mb-8">
          <div className="px-6 py-[18px] border-b border-green-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-green-700">
                Warm Paths
              </h2>
              <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold">
                {warmPaths.length} {warmPaths.length === 1 ? 'opportunity' : 'opportunities'}
              </span>
            </div>
            <Link href="/dashboard/contacts" className="text-[12px] text-slate-400 hover:text-slate-600">
              All contacts
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {warmPaths.map((wp) => {
              const dateLabel = new Date(wp.signal.signal_date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              return (
                <div key={`${wp.contactId}-${wp.signal.id}`} className="px-6 py-4 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-700 text-[12px] font-bold shrink-0 mt-0.5">
                    {wp.contactName[0].toUpperCase()}
                  </div>
                  <Link
                    href={`/dashboard/companies/${wp.companyId}`}
                    className="flex-1 min-w-0 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300/80"
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[14px] font-semibold text-slate-900">{wp.contactName}</span>
                      {wp.contactTitle && (
                        <span className="text-[12px] text-slate-400">{wp.contactTitle}</span>
                      )}
                      <span className="text-[12px] text-slate-400">at</span>
                      <span className="text-[12px] font-semibold text-slate-600">{wp.companyName}</span>
                      <span
                        className={[
                          'text-[10px] font-bold tracking-[0.06em] uppercase px-2 py-0.5 rounded-full',
                          SIGNAL_COLORS[wp.signal.signal_type] ?? 'bg-slate-100 text-slate-600',
                        ].join(' ')}
                      >
                        {signalLabel(wp.signal.signal_type)}
                      </span>
                      <span className="text-[11px] text-slate-400">{dateLabel}</span>
                    </div>
                    <p className="text-[13px] text-slate-500 leading-relaxed truncate">{wp.signal.signal_summary}</p>
                  </Link>
                  <Link
                    href={`/dashboard/contacts/${wp.contactId}/outreach`}
                    className="shrink-0 text-[12px] font-semibold text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded transition-colors"
                  >
                    Draft
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Pattern Alerts */}
      {patternAlerts.length > 0 && (
        <section id="pattern-alerts" className="bg-white border border-orange-200 rounded overflow-hidden mb-8">
          <div className="px-6 py-[18px] border-b border-orange-100 flex items-center justify-between">
            <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500">
              Pattern Alerts
            </h2>
            <Link href="/dashboard/signals" className="text-[12px] text-slate-400 hover:text-slate-600">
              See all &rarr;
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {patternAlerts.map((sig) => {
              const co = sig.companies
              const colonIdx = sig.signal_summary.indexOf(': ')
              const patternName = colonIdx > -1 ? sig.signal_summary.slice(0, colonIdx) : 'Pattern Alert'
              const patternBody = colonIdx > -1 ? sig.signal_summary.slice(colonIdx + 2) : sig.signal_summary
              const dateLabel = new Date(sig.signal_date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              const detailsHref = co ? `/dashboard/companies/${co.id}` : '/dashboard/signals'
              return (
                <div key={sig.id} className="px-6 py-5">
                  <Link href={detailsHref} className="block rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/80">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {co && (
                          <span className="text-[14px] font-semibold text-slate-900 hover:text-slate-600 transition-colors">
                            {co.name}
                          </span>
                        )}
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600">
                          {patternName}
                        </span>
                      </div>
                      <span className="text-[12px] text-slate-400 shrink-0">{dateLabel}</span>
                    </div>
                    <p className="text-[13px] text-slate-700 leading-relaxed mb-1.5">{patternBody}</p>
                    {sig.outreach_angle && (
                      <p className="text-[12px] text-slate-500 italic leading-relaxed">{sig.outreach_angle}</p>
                    )}
                  </Link>
                  <form action={addSignalFollowUp} className="mt-2">
                    <input type="hidden" name="company_name" value={co?.name ?? ''} />
                    <input type="hidden" name="signal_summary" value={patternBody} />
                    <button type="submit" className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0">
                      + Follow up in 5 days
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Signals */}
      {signals.length > 0 && (
        <section id="company-signals" className="bg-white border border-amber-200 rounded overflow-hidden mb-8">
          <div className="px-6 py-[18px] border-b border-amber-100 flex items-center justify-between">
            <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-amber-600">
              Company Signals
            </h2>
            <Link href="/dashboard/signals" className="text-[12px] text-slate-400 hover:text-slate-600">
              See all &rarr;
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {signals.map((sig) => {
              const co = sig.companies
              const dateLabel = new Date(sig.signal_date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              const typeLabel = sig.signal_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
              const detailsHref = co ? `/dashboard/companies/${co.id}` : '/dashboard/signals'
              return (
                <div key={sig.id} className="px-6 py-4">
                  <Link href={detailsHref} className="block rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      {co && (
                        <span className="text-[14px] font-semibold text-slate-900 hover:text-slate-600 transition-colors">
                          {co.name}
                        </span>
                      )}
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                        {typeLabel}
                      </span>
                      <span className="text-[12px] text-slate-400 ml-auto">{dateLabel}</span>
                    </div>
                    <p className="text-[13px] text-slate-700 leading-relaxed">{sig.signal_summary}</p>
                    {sig.outreach_angle && (
                      <p className="text-[12px] text-slate-400 italic mt-1 leading-relaxed">{sig.outreach_angle}</p>
                    )}
                  </Link>
                  <form action={addSignalFollowUp} className="mt-2">
                    <input type="hidden" name="company_name" value={co?.name ?? ''} />
                    <input type="hidden" name="signal_summary" value={sig.signal_summary} />
                    <button type="submit" className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0">
                      + Follow up in 5 days
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Setup checklist - visible until all 6 steps are complete */}
      {!activation.isComplete && !hasFilters && (
        <section id="search-setup" className="bg-white border border-slate-200 rounded overflow-hidden mb-8">
          <div className="px-6 py-[18px] border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
                Search setup
              </h2>
              <Link href="/dashboard/start" className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors">
                View details &rarr;
              </Link>
            </div>
            {(() => {
              const completed = setupSteps.filter((s) => s.done).length
              const barCls = ['w-0', 'w-[16.67%]', 'w-1/3', 'w-1/2', 'w-2/3', 'w-5/6', 'w-full'][completed] ?? 'w-0'
              return (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-orange-500 rounded-full transition-all duration-500 ${barCls}`} />
                  </div>
                  <span className="text-[12px] font-semibold text-slate-500 shrink-0">
                    {completed} of {setupSteps.length} complete
                  </span>
                </div>
              )
            })()}
          </div>
          <div className="divide-y divide-slate-50">
            {setupSteps.map((step, i) => (
              <div
                key={i}
                className={`px-6 py-3.5 flex items-center gap-4 ${step.done ? 'opacity-50' : ''}`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    step.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {step.done ? '✓' : i + 1}
                </div>
                <span
                  className={`text-[13px] flex-1 min-w-0 ${
                    step.done ? 'line-through text-slate-400 decoration-slate-300' : 'text-slate-900'
                  }`}
                >
                  {step.label}
                </span>
                {!step.done && (
                  <Link
                    href={step.href}
                    className="text-[12px] font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded transition-colors shrink-0"
                  >
                    {step.cta} &rarr;
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
