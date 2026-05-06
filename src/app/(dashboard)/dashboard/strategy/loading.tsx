export default function StrategyLoading() {
  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            Starting Monday
          </span>
          <div className="h-3 w-20 bg-slate-700 rounded animate-pulse" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8">
          <div className="h-7 w-56 bg-slate-200 rounded animate-pulse mb-2" />
          <div className="h-3.5 w-80 bg-slate-200 rounded animate-pulse" />
        </div>

        <div className="bg-white border border-slate-200 rounded p-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
          <div className="pt-2">
            <div className="h-10 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>

      </main>
    </div>
  )
}
