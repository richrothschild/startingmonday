export default function StartLoading() {
  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Title skeleton */}
        <div className="mb-8">
          <div className="h-8 w-56 bg-slate-200 rounded animate-pulse mb-3" />
          <div className="h-4 w-80 bg-slate-200 rounded animate-pulse" />
        </div>

        {/* Progress skeleton */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-1 shrink-0">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-1.5 w-7 rounded-full bg-slate-200 animate-pulse" />
            ))}
          </div>
          <div className="h-3.5 w-24 bg-slate-200 rounded animate-pulse" />
        </div>

        {/* Task list skeleton */}
        <div className="flex flex-col gap-3 mb-8">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded overflow-hidden">
              <div className="px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-slate-100 shrink-0 mt-0.5 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3.5 w-full bg-slate-100 rounded animate-pulse" />
                    <div className="h-3.5 w-2/3 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
