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
      <section className="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <h2 className="text-[12px] font-semibold text-slate-700 mb-2">Jump to section</h2>
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[12px] font-semibold text-slate-600 marker:content-none">
            <span>Show sections</span>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-[11px] text-slate-500 transition group-open:rotate-180">
              v
            </span>
          </summary>
          <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
            <a href="#quick-access" className="rounded-full border border-slate-300 px-3 py-1.5 text-slate-600 hover:border-slate-400 hover:text-slate-800">
              What matters now
            </a>
            <a href="/dashboard/briefing#tenet-find-roles" className="rounded-full border border-slate-300 px-3 py-1.5 text-slate-600 hover:border-slate-400 hover:text-slate-800">
              Signals to review
            </a>
            <a href="/dashboard/briefing#tenet-talk-to-people" className="rounded-full border border-slate-300 px-3 py-1.5 text-slate-600 hover:border-slate-400 hover:text-slate-800">
              People to reach
            </a>
            <a href="#daily-momentum-plan" className="rounded-full border border-slate-300 px-3 py-1.5 text-slate-600 hover:border-slate-400 hover:text-slate-800">
              Keep momentum
            </a>
            {!isExecutiveMode && (
              <>
                <a href="?focus=profile#profile-modules" className="rounded-full border border-slate-300 px-3 py-1.5 text-slate-600 hover:border-slate-400 hover:text-slate-800">
                  Profile modules
                </a>
                <a href="?focus=advanced#advanced-modules" className="rounded-full border border-slate-300 px-3 py-1.5 text-slate-600 hover:border-slate-400 hover:text-slate-800">
                  Advanced modules
                </a>
              </>
            )}
          </div>
        </details>
      </section>

      <section id="quick-access" className="mb-6 rounded-2xl border border-slate-900 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_32%),linear-gradient(180deg,_rgba(15,23,42,0.98)_0%,_rgba(15,23,42,0.94)_100%)] px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-[0_20px_48px_rgba(15,23,42,0.14)]">
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-1">{isExecutiveMode ? 'What matters now' : 'Quick access'}</h2>
          <p className="text-[13px] text-slate-200">
            {isExecutiveMode
              ? 'Use one high-leverage move to keep position and timing on your side.'
              : `${signalCount} signals and ${overdueCount} follow-through moves are ready for review.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/briefing" className="inline-flex min-h-[44px] items-center text-[12px] font-semibold text-orange-100 hover:text-white border border-orange-300/40 bg-orange-500/20 px-3.5 py-2 rounded-full shadow-sm">
            {isExecutiveMode ? 'Open briefing' : 'Briefing'}
          </Link>
          <Link href="/dashboard/executive-brief" className="inline-flex min-h-[44px] items-center text-[12px] font-semibold text-orange-100 hover:text-white border border-orange-300/40 bg-orange-500/20 px-3.5 py-2 rounded-full shadow-sm">
            {isExecutiveMode ? 'Executive brief' : 'Brief hub'}
          </Link>
          {isExecutiveMode ? (
            <>
              <Link href="/dashboard/calendar" className="inline-flex min-h-[44px] items-center text-[12px] font-semibold text-orange-100 hover:text-white border border-orange-300/40 bg-orange-500/20 px-3.5 py-2 rounded-full shadow-sm">
                View due today
              </Link>
              <Link href="/dashboard/contacts" className="inline-flex min-h-[44px] items-center text-[12px] font-semibold text-orange-100 hover:text-white border border-orange-300/40 bg-orange-500/20 px-3.5 py-2 rounded-full shadow-sm">
                Sponsor map
              </Link>
            </>
          ) : canUseOutreachHub ? (
            <Link href="/dashboard/outreach" className="inline-flex min-h-[44px] items-center text-[12px] font-semibold text-orange-100 hover:text-white border border-orange-300/40 bg-orange-500/20 px-3.5 py-2 rounded-full shadow-sm">
              Outreach
            </Link>
          ) : null}
          {isRothschildAdmin && (
            <Link href="/dashboard/admin" className="inline-flex min-h-[44px] items-center text-[12px] font-semibold text-orange-100 hover:text-white border border-orange-300/40 bg-orange-500/20 px-3.5 py-2 rounded-full shadow-sm">
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
            href="/dashboard/executive-brief"
            className="inline-flex min-h-[44px] items-center justify-center border border-slate-300 text-slate-700 text-[13px] font-semibold px-4 py-2 rounded hover:border-slate-400 transition-colors"
          >
            Executive brief
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
