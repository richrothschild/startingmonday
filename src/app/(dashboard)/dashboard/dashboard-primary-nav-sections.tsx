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
        <section id="start-here" className="mb-6 rounded-2xl border border-white/15 bg-white/5 p-5 shadow-[0_22px_66px_rgba(15,23,42,0.18)] backdrop-blur-md">
        <div className="mb-4">
          <h2 className="text-[13px] font-semibold text-orange-200 mb-1">Start here</h2>
          <p className="text-[16px] font-semibold text-white">Run today in three moves: signals, relationships, and plan.</p>
          <p className="text-[13px] text-slate-200 leading-relaxed mt-1">
            This is your executive operating console. Make one high-quality move in each lane, then stop.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] text-slate-200 sm:grid-cols-3">
            <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="font-semibold text-white">Find roles first:</span> identify the highest-value opportunity window now.
            </p>
            <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="font-semibold text-white">Talk to the right people:</span> move one warm relationship that can change your odds.
            </p>
            <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="font-semibold text-white">Follow a clear plan:</span> close one next step to keep weekly momentum steady.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <article className="rounded-xl border border-white/15 bg-white/5 p-5">
            <p className="text-[13px] font-medium text-orange-200">Find roles first</p>
            <p className="mt-1 text-[14px] font-semibold text-white">{signalCount} signals ready</p>
            <p className="mt-1 text-[13px] text-slate-300">Start with the clearest timing window.</p>
            <Link href="/dashboard/briefing#tenet-find-roles" className="mt-3 inline-flex h-[44px] items-center justify-center rounded border border-orange-300/40 bg-orange-500/20 px-3 text-[13px] font-semibold text-orange-100 hover:text-white">
              Briefing
            </Link>
          </article>
          <article className="rounded-xl border border-white/15 bg-white/5 p-5">
            <p className="text-[13px] font-medium text-orange-200">Talk to the right people</p>
            <p className="mt-1 text-[14px] font-semibold text-white">{overdueCount} relationship moves ready</p>
            <p className="mt-1 text-[13px] text-slate-300">Advance one warm path before noon.</p>
            <Link href="/dashboard/contacts" className="mt-3 inline-flex h-[44px] items-center justify-center rounded border border-white/20 px-3 text-[13px] font-semibold text-slate-100 hover:border-white/35">
              Relationships
            </Link>
          </article>
          <article className="rounded-xl border border-white/15 bg-white/5 p-5">
            <p className="text-[13px] font-medium text-orange-200">Follow a clear plan</p>
            <p className="mt-1 text-[14px] font-semibold text-white">Protect weekly momentum</p>
            <p className="mt-1 text-[13px] text-slate-300">Close one follow-through and keep cadence steady.</p>
            <Link href="/dashboard/plan" className="mt-3 inline-flex h-[44px] items-center justify-center rounded border border-white/20 px-3 text-[13px] font-semibold text-slate-100 hover:border-white/35">
              Plan
            </Link>
          </article>
        </div>
        </section>
      )}
    </>
  )
}
