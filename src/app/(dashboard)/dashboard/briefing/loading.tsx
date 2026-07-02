export default function BriefingLoading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(193,127,59,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_26%),linear-gradient(180deg,_#0b1220_0%,_#0a1020_46%,_#0b1324_100%)] font-sans text-slate-100">

      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Header skeleton */}
        <div className="rounded-t-2xl border border-white/15 bg-white/5 px-5 sm:px-8 py-7 shadow-[0_22px_66px_rgba(15,23,42,0.18)] backdrop-blur-md">
          <div className="h-2 w-24 bg-white/10 rounded animate-pulse mb-4" />
          <div className="h-7 w-52 bg-white/10 rounded animate-pulse mb-3" />
          <div className="h-3 w-36 bg-white/10 rounded animate-pulse" />
        </div>

        {/* Stats bar skeleton */}
        <div className="bg-white/5 border-x border-white/15 grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10 border-b border-white/15 backdrop-blur-md">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="py-4 px-3 text-center">
              <div className="h-6 w-8 bg-white/10 rounded animate-pulse mx-auto mb-2" />
              <div className="h-2 w-14 bg-white/10 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>

        {/* Body skeleton */}
        <div className="rounded-b-2xl border border-white/15 border-t-0 bg-white/5 px-5 sm:px-8 py-6 sm:py-8 shadow-[0_22px_66px_rgba(15,23,42,0.18)] backdrop-blur-md">

          {/* Generating message */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-orange-300 animate-pulse" />
            <p className="text-[13px] text-slate-300">Assembling your briefing...</p>
          </div>

          {/* Intro skeleton */}
          <div className="mb-8 space-y-2">
            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-white/10 rounded animate-pulse" />
          </div>

          {/* Section skeleton */}
          <div className="mb-8">
            <div className="h-2 w-28 bg-white/10 rounded animate-pulse mb-4 pb-3 border-b border-white/10" />
            <div className="p-4 bg-amber-500/10 border border-amber-300/20 rounded-r space-y-2 backdrop-blur-md">
              <div className="h-4 w-32 bg-amber-200/20 rounded animate-pulse" />
              <div className="h-3.5 w-full bg-amber-200/20 rounded animate-pulse" />
              <div className="h-3.5 w-3/4 bg-amber-200/20 rounded animate-pulse" />
            </div>
          </div>

          {/* Section skeleton 2 */}
          <div className="mb-8">
            <div className="h-2 w-24 bg-white/10 rounded animate-pulse mb-4" />
            <div className="p-4 bg-white/5 border border-white/10 rounded-r space-y-2 backdrop-blur-md">
              <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
              <div className="h-3.5 w-full bg-white/10 rounded animate-pulse" />
              <div className="h-3.5 w-2/3 bg-white/10 rounded animate-pulse" />
            </div>
          </div>

        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          Starting Monday &middot; Daily Intelligence Briefing
        </p>

      </main>
    </div>
  )
}

