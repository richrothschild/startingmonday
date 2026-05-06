export default function ContactsLoading() {
  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
          <div className="h-3 w-20 bg-slate-700 rounded animate-pulse" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8">
          <div className="h-7 w-28 bg-slate-200 rounded animate-pulse mb-2" />
          <div className="h-3.5 w-64 bg-slate-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* Contact list skeleton */}
          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
              <div className="h-2.5 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="divide-y divide-slate-50">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="px-6 py-4 flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                    <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-10 bg-slate-100 rounded animate-pulse mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Add contact form skeleton */}
          <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
            <div className="h-2.5 w-20 bg-slate-100 rounded animate-pulse" />
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-1.5">
                <div className="h-2 w-14 bg-slate-100 rounded animate-pulse" />
                <div className="h-9 bg-slate-50 border border-slate-200 rounded" />
              </div>
            ))}
            <div className="h-9 bg-slate-200 rounded animate-pulse mt-2" />
          </div>

        </div>
      </main>
    </div>
  )
}
