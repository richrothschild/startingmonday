import Link from 'next/link'

type DashboardPrimaryNavSectionsProps = {
  signalCount: number
  overdueCount: number
  canUseOutreachHub: boolean
  isRothschildAdmin: boolean
  isExecutiveMode: boolean
}

export function DashboardPrimaryNavSections({
  signalCount,
  overdueCount,
  canUseOutreachHub,
  isRothschildAdmin,
  isExecutiveMode,
}: DashboardPrimaryNavSectionsProps) {
  return (
    <>
      {!isExecutiveMode && (
        <section className="mb-6 bg-slate-50 border border-slate-200 rounded p-4">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-2">Jump to section</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
            <a href="#quick-access" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Quick access</a>
            <a href="#start-here" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Start here</a>
            <a href="#momentum-overview" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Momentum</a>
            <a href="?focus=advanced#pipeline-pulse" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Pipeline</a>
            <a href="?focus=profile#profile-modules" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Profile modules</a>
            <a href="?focus=advanced#advanced-modules" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Advanced modules</a>
          </div>
        </section>
      )}

      <section id="quick-access" className="mb-6 bg-slate-900 rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-400 mb-1">{isExecutiveMode ? 'Today' : 'Quick access'}</h2>
          <p className="text-[13px] text-slate-300">
            {isExecutiveMode
              ? `${signalCount} new signals, ${overdueCount} due today. Choose the next move without opening more tabs.`
              : 'Jump to the places you use most.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/briefing" className="inline-flex min-h-[44px] items-center text-[12px] font-semibold text-orange-200 hover:text-white border border-orange-500/40 bg-orange-500/15 px-3.5 py-2 rounded-full shadow-sm">
            {isExecutiveMode ? 'Open briefing' : 'Briefing'}
          </Link>
          {isExecutiveMode ? (
            <>
              <Link href="/dashboard/calendar" className="inline-flex min-h-[44px] items-center text-[12px] font-semibold text-orange-200 hover:text-white border border-orange-500/40 bg-orange-500/15 px-3.5 py-2 rounded-full shadow-sm">
                View due today
              </Link>
              <Link href="/dashboard/contacts" className="inline-flex min-h-[44px] items-center text-[12px] font-semibold text-orange-200 hover:text-white border border-orange-500/40 bg-orange-500/15 px-3.5 py-2 rounded-full shadow-sm">
                Sponsor map
              </Link>
            </>
          ) : canUseOutreachHub ? (
            <Link href="/dashboard/outreach" className="inline-flex min-h-[44px] items-center text-[12px] font-semibold text-orange-200 hover:text-white border border-orange-500/40 bg-orange-500/15 px-3.5 py-2 rounded-full shadow-sm">
              Outreach
            </Link>
          ) : null}
          {isRothschildAdmin && (
            <Link href="/dashboard/admin" className="inline-flex min-h-[44px] items-center text-[12px] font-semibold text-orange-200 hover:text-white border border-orange-500/40 bg-orange-500/15 px-3.5 py-2 rounded-full shadow-sm">
              Admin
            </Link>
          )}
        </div>
      </section>

      {!isExecutiveMode && (
        <section id="start-here" className="mb-6 bg-white border border-slate-200 rounded p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-1">Start Here</h2>
          <p className="text-[14px] font-semibold text-slate-900">Open your daily briefing first.</p>
          <p className="text-[12px] text-slate-600 leading-relaxed mt-1">
            {signalCount} new signals, {overdueCount} due today. Use the briefing to pick your top three actions.
          </p>
        </div>
        <div className="flex flex-col w-full sm:w-auto sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Link
            href="/dashboard/briefing"
            className="inline-flex min-h-[44px] items-center justify-center bg-slate-900 text-white text-[13px] font-semibold px-4 py-2 rounded hover:bg-slate-700 transition-colors"
          >
            Open briefing
          </Link>
          <Link
            href="/dashboard/calendar"
            className="inline-flex min-h-[44px] items-center justify-center border border-slate-300 text-slate-700 text-[13px] font-semibold px-4 py-2 rounded hover:border-slate-400 transition-colors"
          >
            View due today
          </Link>
          <Link
            href="/guide"
            className="inline-flex min-h-[44px] items-center justify-center border border-slate-300 text-slate-700 text-[13px] font-semibold px-4 py-2 rounded hover:border-slate-400 transition-colors"
          >
            Open guide
          </Link>
        </div>
        </section>
      )}
    </>
  )
}
