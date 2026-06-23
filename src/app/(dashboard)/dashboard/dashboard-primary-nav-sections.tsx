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
      <section className="mb-5 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 shadow-[0_22px_66px_rgba(15,23,42,0.18)] backdrop-blur-md">
        <h2 className="text-[12px] font-semibold text-slate-200 mb-2">Jump to section</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
          <a href="#start-here" className="rounded-full border border-white/20 px-3 py-2 text-center text-slate-200 hover:border-white/35 hover:text-white">
            What matters now
          </a>
          <a href="#daily-momentum-plan" className="rounded-full border border-white/20 px-3 py-2 text-center text-slate-200 hover:border-white/35 hover:text-white">
            Keep momentum
          </a>
          <a href="#profile-modules" className="rounded-full border border-white/20 px-3 py-2 text-center text-slate-200 hover:border-white/35 hover:text-white">
            Profile modules
          </a>
          <a href="#advanced-modules" className="rounded-full border border-white/20 px-3 py-2 text-center text-slate-200 hover:border-white/35 hover:text-white">
            Advanced modules
          </a>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Compact by default. Expand for advanced navigation.</p>
      </section>

      {!isExecutiveMode && (
        <section id="start-here" className="mb-6 rounded-2xl border border-white/15 bg-white/5 p-5 shadow-[0_22px_66px_rgba(15,23,42,0.18)] backdrop-blur-md">
        <div className="mb-4">
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-1">Start Here</h2>
          <p className="text-[16px] font-semibold text-white">Pick one move in each tenet.</p>
          <p className="text-[13px] text-slate-200 leading-relaxed mt-1">
            Keep the day focused: role timing, one relationship step, and one plan action.
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-orange-200">Find roles first</p>
            <p className="mt-1 text-[14px] font-semibold text-white">{signalCount} signals to review</p>
            <p className="mt-1 text-[12px] text-slate-300">Start with the clearest timing window.</p>
            <Link href="/dashboard/briefing#tenet-find-roles" className="mt-3 inline-flex h-[44px] items-center justify-center rounded border border-orange-300/40 bg-orange-500/20 px-3 text-[12px] font-semibold text-orange-100 hover:text-white">
              Open briefing
            </Link>
          </article>
          <article className="rounded-xl border border-white/15 bg-white/5 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-orange-200">Talk to the right people</p>
            <p className="mt-1 text-[14px] font-semibold text-white">{overdueCount} relationship moves ready</p>
            <p className="mt-1 text-[12px] text-slate-300">Advance one warm path before noon.</p>
            <Link href={canUseOutreachHub ? '/dashboard/outreach' : '/dashboard/contacts'} className="mt-3 inline-flex h-[44px] items-center justify-center rounded border border-white/20 px-3 text-[12px] font-semibold text-slate-100 hover:border-white/35">
              Open relationships
            </Link>
          </article>
          <article className="rounded-xl border border-white/15 bg-white/5 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-orange-200">Follow a clear plan</p>
            <p className="mt-1 text-[14px] font-semibold text-white">Protect weekly momentum</p>
            <p className="mt-1 text-[12px] text-slate-300">Close one follow-through and keep cadence steady.</p>
            <Link href="/dashboard/plan" className="mt-3 inline-flex h-[44px] items-center justify-center rounded border border-white/20 px-3 text-[12px] font-semibold text-slate-100 hover:border-white/35">
              Open plan
            </Link>
          </article>
        </div>
        </section>
      )}
    </>
  )
}
