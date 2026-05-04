export default function BriefingLoading() {
  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
          <div className="h-3 w-28 bg-slate-700 rounded animate-pulse" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Header skeleton */}
        <div className="bg-slate-900 rounded-t px-8 py-7">
          <div className="h-2 w-24 bg-slate-700 rounded animate-pulse mb-4" />
          <div className="h-7 w-52 bg-slate-700 rounded animate-pulse mb-3" />
          <div className="h-3 w-36 bg-slate-700 rounded animate-pulse" />
        </div>

        {/* Stats bar skeleton */}
        <div className="bg-slate-50 border-x border-slate-200 grid grid-cols-4 divide-x divide-slate-200 border-b border-slate-200">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="py-4 px-3 text-center">
              <div className="h-6 w-8 bg-slate-200 rounded animate-pulse mx-auto mb-2" />
              <div className="h-2 w-14 bg-slate-200 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>

        {/* Body skeleton */}
        <div className="bg-white border border-slate-200 border-t-0 rounded-b px-8 py-8">

          {/* Generating message */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
            <p className="text-[13px] text-slate-400">Assembling your briefing...</p>
          </div>

          {/* Intro skeleton */}
          <div className="mb-8 space-y-2">
            <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-slate-100 rounded animate-pulse" />
          </div>

          {/* Section skeleton */}
          <div className="mb-8">
            <div className="h-2 w-28 bg-slate-100 rounded animate-pulse mb-4 pb-3 border-b border-slate-100" />
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-r space-y-2">
              <div className="h-4 w-32 bg-amber-100 rounded animate-pulse" />
              <div className="h-3.5 w-full bg-amber-100 rounded animate-pulse" />
              <div className="h-3.5 w-3/4 bg-amber-100 rounded animate-pulse" />
            </div>
          </div>

          {/* Section skeleton 2 */}
          <div className="mb-8">
            <div className="h-2 w-24 bg-slate-100 rounded animate-pulse mb-4" />
            <div className="p-4 bg-white border border-slate-200 rounded-r space-y-2">
              <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
              <div className="h-3.5 w-full bg-slate-100 rounded animate-pulse" />
              <div className="h-3.5 w-2/3 bg-slate-100 rounded animate-pulse" />
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
