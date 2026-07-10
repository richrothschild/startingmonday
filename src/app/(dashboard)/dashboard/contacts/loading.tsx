export default function ContactsLoading() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">

      <header className="border-b border-white/10 bg-slate-950/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="h-3 w-20 bg-slate-700 rounded animate-pulse" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8">
          <div className="h-7 w-28 bg-white/10 rounded animate-pulse mb-2" />
          <div className="h-3.5 w-64 bg-white/10 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* Contact list skeleton */}
          <div className="bg-white/5 border border-white/15 rounded overflow-hidden">
            <div className="px-6 py-[18px] border-b border-white/15 flex items-center justify-between">
              <div className="h-2.5 w-24 bg-white/10 rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="divide-y divide-white/5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="px-6 py-4 flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-36 bg-white/10 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-white/10 rounded-full animate-pulse" />
                    </div>
                    <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-10 bg-white/10 rounded animate-pulse mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Add contact form skeleton */}
          <div className="bg-white/5 border border-white/15 rounded p-5 space-y-4">
            <div className="h-2.5 w-20 bg-white/10 rounded animate-pulse" />
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-1.5">
                <div className="h-2 w-14 bg-white/10 rounded animate-pulse" />
                <div className="h-9 bg-white/5 border border-white/15 rounded" />
              </div>
            ))}
            <div className="h-9 bg-white/10 rounded animate-pulse mt-2" />
          </div>

        </div>
      </main>
    </div>
  )
}

