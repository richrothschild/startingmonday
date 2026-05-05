import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KanbanBoard } from './kanban-board'

export default async function KanbanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, sector, fit_score, stage')
    .eq('user_id', user.id)
    .is('archived_at', null)
    .order('fit_score', { ascending: false, nullsFirst: false })

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
          <div className="flex items-center gap-5">
            <Link
              href="/dashboard"
              className="text-[12px] font-semibold text-slate-400 border border-slate-700 rounded px-3 py-1 hover:border-slate-500 transition-colors"
            >
              List view
            </Link>
            <Link href="/dashboard" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Pipeline</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Drag cards between stages to update your pipeline.
            </p>
          </div>
          <Link
            href="/dashboard/companies/new"
            className="text-[13px] font-semibold text-slate-900 bg-white border border-slate-200 hover:border-slate-400 px-4 py-2 rounded transition-colors shrink-0"
          >
            + Add company
          </Link>
        </div>

        {(!companies || companies.length === 0) ? (
          <div className="bg-white border border-slate-200 rounded p-16 text-center">
            <p className="text-[14px] text-slate-400">No companies in your pipeline yet.</p>
            <Link href="/dashboard/companies/new" className="mt-4 inline-block text-[13px] font-semibold text-slate-900 underline">
              Add your first company
            </Link>
          </div>
        ) : (
          <KanbanBoard initialCompanies={companies} />
        )}

      </main>
    </div>
  )
}
