import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember } from '@/lib/staff'
import { TraceViewer } from './trace-client'
import { CopyCommandButton } from './copy-command-button'

export const metadata = { title: 'LLM Traces - Starting Monday Admin' }

const PAGE_SIZE = 25
const GOLDEN_SET_TARGET_PER_CLASS = 25

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
  const [{ data: allForStats }, { data: prepBriefStats }] = await Promise.all([
    statsQuery,
    adminClient
      .from('llm_traces')
      .select('eval_pass')
      .eq('feature', 'prep_brief'),
  ])

  const totalRated = (allForStats ?? []).filter(t => t.eval_pass !== null).length
  const totalPass  = (allForStats ?? []).filter(t => t.eval_pass === true).length
  const passRate   = totalRated > 0 ? Math.round((totalPass / totalRated) * 100) : null
  const prepPass = (prepBriefStats ?? []).filter(t => t.eval_pass === true).length
  const prepFail = (prepBriefStats ?? []).filter(t => t.eval_pass === false).length
  const prepUnrated = (prepBriefStats ?? []).filter(t => t.eval_pass === null).length
  const prepPassPct = Math.min(100, Math.round((prepPass / GOLDEN_SET_TARGET_PER_CLASS) * 100))
  const prepFailPct = Math.min(100, Math.round((prepFail / GOLDEN_SET_TARGET_PER_CLASS) * 100))
  const goldenSetReady = prepPass >= GOLDEN_SET_TARGET_PER_CLASS && prepFail >= GOLDEN_SET_TARGET_PER_CLASS
  const prepPassRemaining = Math.max(0, GOLDEN_SET_TARGET_PER_CLASS - prepPass)
  const prepFailRemaining = Math.max(0, GOLDEN_SET_TARGET_PER_CLASS - prepFail)

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
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/admin/traces?feature=prep_brief&unrated=1"
              className="text-[12px] font-semibold text-white bg-slate-900 hover:bg-slate-700 px-3 py-1.5 rounded transition-colors"
            >
              Start labeling
            </Link>
            <Link
              href="/dashboard/admin/traces/rubric"
              className="text-[12px] font-semibold text-slate-500 border border-slate-200 hover:border-slate-400 bg-white px-3 py-1.5 rounded transition-colors"
            >
              Rubric
            </Link>
          </div>
        </div>

        <div className="mb-6 bg-white border border-slate-200 rounded p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Prep Brief Labeling Progress</p>
              <p className="text-[12px] text-slate-500 mt-1">Target for golden set: 25 pass + 25 fail labeled traces.</p>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded border ${goldenSetReady ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
              {goldenSetReady ? 'Ready to export' : 'In progress'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="border border-slate-200 rounded p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-slate-500">Pass labels</span>
                <span className="text-[11px] font-semibold text-slate-700">{prepPass}/{GOLDEN_SET_TARGET_PER_CLASS}</span>
              </div>
              <progress
                max={100}
                value={prepPassPct}
                className="w-full h-2 [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-emerald-500 [&::-moz-progress-bar]:bg-emerald-500"
              />
            </div>
            <div className="border border-slate-200 rounded p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-slate-500">Fail labels</span>
                <span className="text-[11px] font-semibold text-slate-700">{prepFail}/{GOLDEN_SET_TARGET_PER_CLASS}</span>
              </div>
              <progress
                max={100}
                value={prepFailPct}
                className="w-full h-2 [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-red-500 [&::-moz-progress-bar]:bg-red-500"
              />
            </div>
            <div className="border border-slate-200 rounded p-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] text-slate-500">Unrated prep_brief traces</p>
                <p className="text-[18px] font-bold text-slate-900 mt-0.5">{prepUnrated}</p>
              </div>
              <Link
                href="/dashboard/admin/traces?feature=prep_brief&unrated=1"
                className="text-[12px] font-semibold text-slate-700 border border-slate-200 hover:border-slate-400 bg-white px-3 py-1.5 rounded transition-colors"
              >
                Label now
              </Link>
            </div>
          </div>
          <div className={`mt-3 rounded border px-3 py-2 ${goldenSetReady ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            {goldenSetReady ? (
              <>
                <p className="text-[11px] font-semibold text-emerald-800">Golden set is ready to export.</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-[11px] text-emerald-700">Run: <span className="font-mono">npm run evals:export-golden-set</span></p>
                  <CopyCommandButton command="npm run evals:export-golden-set" />
                </div>
              </>
            ) : (
              <>
                <p className="text-[11px] font-semibold text-amber-800">Keep labeling to unlock export.</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Remaining: {prepPassRemaining} pass, {prepFailRemaining} fail.
                </p>
              </>
            )}
          </div>
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
