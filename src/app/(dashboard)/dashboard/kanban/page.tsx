import Link from 'next/link'

export const metadata = {
  title: 'Kanban Redirect - Starting Monday',
}

export default function KanbanPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h1 className="text-[24px] font-bold text-slate-900 mb-3">Kanban moved to the main dashboard</h1>
        <p className="text-[14px] text-slate-600 leading-relaxed mb-6">
          The board experience now lives inside the dashboard so pipeline actions, company updates, and next steps stay in one operating surface.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white hover:bg-slate-700 transition-colors">
            Open dashboard
          </Link>
          <Link href="/dashboard/companies" className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700 hover:border-slate-500 transition-colors">
            Review companies
          </Link>
          <Link href="/dashboard/briefing" className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700 hover:border-slate-500 transition-colors">
            Open briefing
          </Link>
        </div>
      </div>
    </main>
  )
}
