export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      <div className="h-14 border-b border-white/10 bg-slate-950/80" />
      <section aria-busy="true" aria-live="polite" className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="h-8 w-32 bg-white/10 rounded animate-pulse mb-2" />
            <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-8 w-40 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <div className="h-4 w-28 bg-white/10 rounded animate-pulse mb-3" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

