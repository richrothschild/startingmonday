import Link from 'next/link'

type DashboardPipelinePulseProps = {
  isExecutive: boolean
  signalCount: number
  draftReadyCount: number
  overdueCount: number
  activeCount: number
}

export function DashboardPipelinePulse({
  isExecutive,
  signalCount,
  draftReadyCount,
  overdueCount,
  activeCount,
}: DashboardPipelinePulseProps) {
  if (!isExecutive) return null

  return (
    <section id="pipeline-pulse" className="bg-white border border-orange-200 rounded overflow-hidden mb-8">
      <div className="px-6 py-[18px] border-b border-orange-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500">Pipeline Pulse</h2>
          <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Executive</span>
        </div>
        <Link href="/dashboard/signals" className="text-[12px] text-slate-400 hover:text-slate-600">
          All signals &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        <div className="px-6 py-5 text-center">
          <div className={`text-[28px] font-bold leading-none ${signalCount > 0 ? 'text-orange-500' : 'text-slate-300'}`}>{signalCount}</div>
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mt-1.5">New Signals</div>
          <div className="text-[11px] text-slate-400 mt-0.5">last 7 days</div>
        </div>
        <div className="px-6 py-5 text-center">
          <div className={`text-[28px] font-bold leading-none ${draftReadyCount > 0 ? 'text-orange-500' : 'text-slate-300'}`}>{draftReadyCount}</div>
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mt-1.5">Drafts Ready</div>
          <div className="text-[11px] text-slate-400 mt-0.5">last 14 days</div>
        </div>
        <div className="px-6 py-5 text-center">
          <div className={`text-[28px] font-bold leading-none ${overdueCount > 0 ? 'text-red-600' : 'text-slate-300'}`}>{overdueCount}</div>
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mt-1.5">Today</div>
          <div className="text-[11px] text-slate-400 mt-0.5">overdue</div>
        </div>
        <div className="px-6 py-5 text-center">
          <div className={`text-[28px] font-bold leading-none ${activeCount > 0 ? 'text-slate-900' : 'text-slate-300'}`}>{activeCount}</div>
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mt-1.5">In Process</div>
          <div className="text-[11px] text-slate-400 mt-0.5">active companies</div>
        </div>
      </div>
    </section>
  )
}
