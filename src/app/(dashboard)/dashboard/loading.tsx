export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
          <div className="h-3 w-28 bg-slate-700 rounded animate-pulse" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* Welcome skeleton */}
        <div className="mb-8">
          <div className="h-7 w-56 bg-slate-200 rounded animate-pulse mb-2" />
          <div className="h-3.5 w-32 bg-slate-200 rounded animate-pulse" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded p-5">
              <div className="h-8 w-10 bg-slate-100 rounded animate-pulse mb-2" />
              <div className="h-2.5 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <div className="h-2.5 w-32 bg-slate-100 rounded animate-pulse" />
            <div className="h-2.5 w-16 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="divide-y divide-slate-50">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="px-6 py-4 flex items-center gap-6">
                <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
                <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse" />
                <div className="ml-auto h-4 w-6 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
