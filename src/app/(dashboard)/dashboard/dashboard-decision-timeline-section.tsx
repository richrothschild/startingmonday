import Link from 'next/link'

type DecisionTimelineItem = {
  id: string
  name: string
  stageLabel: string
  nextDecisionMarker: string
  decisionWindowLabel: string
  daysSinceUpdate: number | null
  stalled: boolean
  ownerLabel: string
  href: string
}

type DashboardDecisionTimelineSectionProps = {
  roleLensLabel: string
  items: DecisionTimelineItem[]
  stalledCount: number
}

export function DashboardDecisionTimelineSection({
  roleLensLabel,
  items,
  stalledCount,
}: DashboardDecisionTimelineSectionProps) {
  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500">Decision timeline engine</p>
          <h2 className="text-[19px] font-bold text-slate-900 mt-1">Required next-decision markers</h2>
          <p className="text-[13px] text-slate-600 mt-1">Every campaign carries a next irreversible decision marker with owner and timing.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">Role lens: {roleLensLabel}</span>
          <span className={`rounded px-2.5 py-1 text-[11px] font-semibold ${stalledCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'}`}>
            {stalledCount > 0 ? `${stalledCount} stalled 14d+` : 'No stalled campaigns'}
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3">
          <p className="text-[13px] text-slate-600">No campaigns yet. Add your first target to initialize timeline markers.</p>
          <Link href="/dashboard/companies/new" className="inline-block mt-2 text-[13px] font-semibold text-slate-900 underline underline-offset-2 hover:text-orange-600">
            Add first campaign
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {items.map((item) => (
            <article
              key={item.id}
              className={`rounded-lg border p-3 ${item.stalled ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">{item.name}</p>
                  <p className="text-[12px] text-slate-600">Stage: {item.stageLabel}</p>
                </div>
                <div className="text-[12px] text-slate-600">
                  <span className="font-semibold text-slate-700">Owner:</span> {item.ownerLabel}
                </div>
              </div>

              <div className="mt-2 rounded border border-slate-200 bg-white px-2.5 py-2">
                <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500 font-bold mb-1">Next irreversible decision marker</p>
                <p className="text-[13px] text-slate-800 leading-relaxed">{item.nextDecisionMarker}</p>
              </div>

              <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12px] text-slate-600">Decision window: {item.decisionWindowLabel}</p>
                <p className={`text-[12px] ${item.stalled ? 'text-amber-900 font-semibold' : 'text-slate-600'}`}>
                  Last moved: {item.daysSinceUpdate === null ? 'Unknown' : `${item.daysSinceUpdate} day${item.daysSinceUpdate === 1 ? '' : 's'} ago`}
                </p>
              </div>

              <Link href={item.href} className="inline-block mt-2 text-[12px] font-semibold text-slate-900 underline underline-offset-2 hover:text-orange-600">
                Open campaign
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
