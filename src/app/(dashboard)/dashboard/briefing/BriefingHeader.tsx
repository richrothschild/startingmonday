/**
 * BriefingHeader - Phase 1a: Redesigned hero section with primary stat card
 * 
 * NEW DESIGN (Phase 1a):
 * - Greeting + date header
 * - Primary stat card: "Find Roles First" with largest number + qualifier
 * - Supporting stat pills: Companies | Signals | Matches | Moves Ready
 * - Increased padding/spacing to match home page luxury standards
 * - Orange accent border on primary card
 */

type BriefingHeaderProps = {
  firstName: string
  todayLabel: string
  totalCompanies: number
  signalCount: number
  matchCount: number
  movesReadyCount: number
}

export function BriefingHeader({
  firstName,
  todayLabel,
  totalCompanies,
  signalCount,
  matchCount,
  movesReadyCount,
}: BriefingHeaderProps) {
  return (
    <section id="briefing-header" className="bg-gradient-to-b from-slate-950 to-slate-950/95 rounded-t-xl px-6 sm:px-8 py-10 sm:py-14">
      {/* Greeting + Date */}
      <div className="mb-10">
        <p className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.22em] text-slate-300/90 mb-3">
          This week&apos;s operating rhythm
        </p>
        <h1 className="text-[32px] sm:text-[42px] font-bold text-white leading-tight mb-2">
          Good morning, {firstName}.
        </h1>
        <p className="text-[13px] sm:text-[14px] font-medium text-slate-400">{todayLabel}</p>
      </div>

      {/* Primary Stat Card - "Find Roles First" */}
      <div className="mb-8 rounded-lg border border-white/12 bg-gradient-to-br from-slate-900/80 to-slate-950 p-6 sm:p-8 shadow-[0_22px_66px_rgba(15,23,42,0.18)]">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-orange-200/90 mb-5">
          Position Watch
        </p>
        <div className="flex items-baseline gap-4 mb-5">
          <span className="text-[60px] sm:text-[72px] font-bold text-white leading-none">
            {signalCount}
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-[16px] sm:text-[18px] font-semibold text-slate-300 leading-snug">
              market move{signalCount !== 1 ? 's' : ''} this week
            </span>
            <span className="text-[12px] text-slate-400">
              across {totalCompanies} companies
            </span>
          </div>
        </div>
        <p className="text-[14px] sm:text-[15px] text-slate-300/90 leading-relaxed max-w-md">
          {matchCount} aligned role {matchCount === 1 ? 'opportunity' : 'opportunities'} ready to move. Position improving.
        </p>
      </div>

      {/* Supporting Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border border-white/12 bg-white/[0.07] p-4 sm:p-5 backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300/80 mb-2">
            Under Watch
          </p>
          <p className="text-[28px] sm:text-[34px] font-bold text-white leading-tight">{totalCompanies}</p>
          <p className="text-[11px] text-slate-400 mt-2">companies</p>
        </div>

        <div className="rounded-lg border border-white/12 bg-white/[0.07] p-4 sm:p-5 backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/80 mb-2">
            Aligned Roles
          </p>
          <p className="text-[28px] sm:text-[34px] font-bold text-white leading-tight">{matchCount}</p>
          <p className="text-[11px] text-slate-400 mt-2">this quarter</p>
        </div>

        <div className="rounded-lg border border-white/12 bg-white/[0.07] p-4 sm:p-5 backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100/80 mb-2">
            Next Moves
          </p>
          <p className="text-[28px] sm:text-[34px] font-bold text-white leading-tight">{movesReadyCount}</p>
          <p className="text-[11px] text-slate-400 mt-2">ready today</p>
        </div>

        <div className="rounded-lg border border-white/12 bg-white/[0.07] p-4 sm:p-5 backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300/80 mb-2">
            Position
          </p>
          <p className="text-[28px] sm:text-[34px] font-bold text-white leading-tight">
            {signalCount > 0 ? '↗' : '→'}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            {signalCount > 0 ? 'improving' : 'stable'}
          </p>
        </div>
      </div>
    </section>
  )
}
