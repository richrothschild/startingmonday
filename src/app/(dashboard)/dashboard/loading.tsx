export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
        </div>
      </header>

      <section aria-busy="true" aria-live="polite" className="max-w-4xl mx-auto px-6 py-10">
        <div className="h-7 w-48 bg-slate-200 rounded mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded p-5">
              <div className="h-8 w-10 bg-slate-100 rounded mb-2" />
              <div className="h-2.5 w-20 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-slate-200 rounded p-6">
          <div className="h-2.5 w-32 bg-slate-100 rounded mb-4" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-4 w-full bg-slate-50 rounded mb-3" />
          ))}
        </div>
      </section>
    </div>
  )
}

