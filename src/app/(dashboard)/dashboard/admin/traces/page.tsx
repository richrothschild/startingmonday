import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember } from '@/lib/staff'
import { TraceViewer } from './trace-client'

export const metadata = { title: 'LLM Traces - Starting Monday Admin' }

const PAGE_SIZE = 25

export default async function TracesPage({
  searchParams,
}: {
  searchParams: Promise<{ feature?: string; unrated?: string; page?: string }>
}) {
  const { feature, unrated, page: pageParam } = await searchParams
  const page = Math.max(0, parseInt(pageParam ?? '0', 10) || 0)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const adminClient = createAdminClient()

  let query = adminClient
    .from('llm_traces')
    .select(
      'id, created_at, user_id, feature, model, prompt_tokens, completion_tokens, latency_ms, input_snapshot, output_snapshot, eval_pass, eval_notes',
      { count: 'planned' }
    )
    .order('created_at', { ascending: false })

  if (feature) query = query.eq('feature', feature)
  if (unrated === '1') query = query.is('eval_pass', null)

  const start = page * PAGE_SIZE
  query = query.range(start, start + PAGE_SIZE - 1)

  const { data: traces, count } = await query

  // Stats: total rated + pass rate across ALL traces for this feature filter
  let statsQuery = adminClient
    .from('llm_traces')
    .select('eval_pass')
  if (feature) statsQuery = statsQuery.eq('feature', feature)
  const { data: allForStats } = await statsQuery

  const totalRated = (allForStats ?? []).filter(t => t.eval_pass !== null).length
  const totalPass  = (allForStats ?? []).filter(t => t.eval_pass === true).length
  const passRate   = totalRated > 0 ? Math.round((totalPass / totalRated) * 100) : null

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">
              Admin
            </Link>
            <Link href="/dashboard" className="text-[13px] text-slate-300 hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold text-slate-900">LLM Traces</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {count ?? 0} traces
              {totalRated > 0 && (
                <> &middot; {totalRated} rated &middot; {passRate}% pass rate</>
              )}
            </p>
          </div>
          <Link
            href="/dashboard/admin/traces/rubric"
            className="text-[12px] font-semibold text-slate-500 border border-slate-200 hover:border-slate-400 bg-white px-3 py-1.5 rounded transition-colors shrink-0"
          >
            Rubric
          </Link>
        </div>

        <TraceViewer
          traces={(traces ?? []) as Parameters<typeof TraceViewer>[0]['traces']}
          currentFeature={feature ?? ''}
          unratedOnly={unrated === '1'}
          page={page}
          totalPages={totalPages}
          totalCount={count ?? 0}
        />
      </main>
    </div>
  )
}
