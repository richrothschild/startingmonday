export default function CompanyDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-600">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="h-3 w-20 bg-slate-700 rounded animate-pulse" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Company header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mb-2" />
          <div className="flex items-center gap-3">
            <div className="h-5 w-24 bg-slate-200 rounded-full animate-pulse" />
            <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Sub-nav */}
        <div className="flex gap-1 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>

        {/* Content sections */}
        <div className="space-y-4">

          <div className="bg-white border border-slate-200 rounded p-6 space-y-3">
            <div className="h-2.5 w-28 bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
          </div>

          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
              <div className="h-2.5 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="divide-y divide-slate-50">
              {[1, 2, 3].map(i => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse" />
                  <div className="ml-auto h-4 w-16 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded p-6 space-y-3">
            <div className="h-2.5 w-20 bg-slate-100 rounded animate-pulse" />
            <div className="h-20 bg-slate-50 rounded animate-pulse" />
          </div>

        </div>
      </main>
    </div>
  )
}

