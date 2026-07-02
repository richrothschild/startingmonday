import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember } from '@/lib/staff'
import {
  ADMIN_DARK_PAGE_BG,
  ADMIN_DARK_SECTION_CARD,
  ADMIN_DARK_STAT_CARD,
  ADMIN_DARK_TABLE_PANEL,
} from '../../admin-dark-theme'

type WedgeCronRunsPageProps = {
  searchParams: Promise<{
    status?: string
    from?: string
    to?: string
    errorCode?: string
    lookbackDays?: string
  }>
}

type WedgeCronRunRow = {
  id: string
  triggered_at: string
  finished_at: string | null
  duration_ms: number | null
  lookback_days: number
  schedule_utc: string
  success: boolean
  error_code: string | null
  decision_summary: string | null
  snapshot_history_count: number | null
  http_status: number | null
  error_message: string | null
}

const KNOWN_ERROR_CODES = [
  'missing_automation_service_token',
  'persist_snapshot_failed',
  'scorecard_readback_failed',
] as const

function parseDateStart(value: string | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  return `${value}T00:00:00.000Z`
}

function parseDateEndExclusive(value: string | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const end = new Date(`${value}T00:00:00.000Z`)
  end.setUTCDate(end.getUTCDate() + 1)
  return end.toISOString()
}

function parseLookbackDays(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '30', 10)
  if (!Number.isFinite(parsed)) return 30
  return Math.max(7, Math.min(parsed, 120))
}

function statusBadge(success: boolean): string {
  return success
    ? 'rounded-full border border-emerald-300/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-100'
    : 'rounded-full border border-rose-300/30 bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-100'
}

export default async function WedgeCronRunsPage({ searchParams }: WedgeCronRunsPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const params = await searchParams
  const selectedStatus = params.status === 'success' || params.status === 'failed' ? params.status : 'all'
  const selectedErrorCode = (params.errorCode ?? 'all').trim() || 'all'
  const selectedFrom = params.from ?? ''
  const selectedTo = params.to ?? ''
  const lookbackDays = parseLookbackDays(params.lookbackDays)

  const fromIso = parseDateStart(selectedFrom)
  const toIsoExclusive = parseDateEndExclusive(selectedTo)

  const admin = createAdminClient()

  let query = admin
    .from('wedge_funnel_scorecard_cron_runs')
    .select('id, triggered_at, finished_at, duration_ms, lookback_days, schedule_utc, success, error_code, decision_summary, snapshot_history_count, http_status, error_message')
    .order('triggered_at', { ascending: false })
    .limit(250)

  if (selectedStatus === 'success') {
    query = query.eq('success', true)
  } else if (selectedStatus === 'failed') {
    query = query.eq('success', false)
  }

  if (fromIso) query = query.gte('triggered_at', fromIso)
  if (toIsoExclusive) query = query.lt('triggered_at', toIsoExclusive)

  if (selectedErrorCode !== 'all') {
    query = query.eq('error_code', selectedErrorCode)
  }

  const { data, error } = await query

  const rows = (data ?? []) as WedgeCronRunRow[]
  const sourceErrorCodes = rows.map((row) => row.error_code).filter((value): value is string => Boolean(value))
  const errorCodes = Array.from(new Set<string>([...KNOWN_ERROR_CODES, ...sourceErrorCodes])).sort()

  const summary = {
    total: rows.length,
    success: rows.filter((row) => row.success).length,
    failed: rows.filter((row) => !row.success).length,
    avgDurationMs: rows.length > 0
      ? Math.round(rows.reduce((sum, row) => sum + (row.duration_ms ?? 0), 0) / rows.length)
      : 0,
  }

  const controlHref = `/dashboard/admin/wedge-funnels`

  return (
    <div className={ADMIN_DARK_PAGE_BG}>
      <header className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/operations" className="text-[13px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Operations</Link>
            <Link href="/dashboard/admin/wedge-funnels" className="text-[13px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Wedge Monitor</Link>
            <Link href="/dashboard/admin" className="text-[13px] text-slate-300 hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-bold text-white leading-tight">Wedge Cron Run History</h1>
            <p className="text-[13px] text-slate-300 mt-1.5">Drill-down view for weekly wedge scorecard cron reliability and trend signals.</p>
          </div>
          <Link href={controlHref} className="rounded-full border border-white/20 px-3 py-1.5 text-[12px] font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5">
            Re-run control: open Wedge Monitor
          </Link>
        </div>

        <section className={ADMIN_DARK_SECTION_CARD}>
          <form method="get" className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <label className="text-[12px] text-slate-300">
              <span className="block mb-1">Status</span>
              <select name="status" defaultValue={selectedStatus} className="w-full rounded border border-white/15 bg-slate-950/50 px-2 py-2 text-[13px] text-slate-100">
                <option value="all">All</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </label>

            <label className="text-[12px] text-slate-300">
              <span className="block mb-1">From date (UTC)</span>
              <input type="date" name="from" defaultValue={selectedFrom} className="w-full rounded border border-white/15 bg-slate-950/50 px-2 py-2 text-[13px] text-slate-100" />
            </label>

            <label className="text-[12px] text-slate-300">
              <span className="block mb-1">To date (UTC)</span>
              <input type="date" name="to" defaultValue={selectedTo} className="w-full rounded border border-white/15 bg-slate-950/50 px-2 py-2 text-[13px] text-slate-100" />
            </label>

            <label className="text-[12px] text-slate-300">
              <span className="block mb-1">Error code</span>
              <select name="errorCode" defaultValue={selectedErrorCode} className="w-full rounded border border-white/15 bg-slate-950/50 px-2 py-2 text-[13px] text-slate-100">
                <option value="all">All</option>
                {errorCodes.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-2">
              <input type="hidden" name="lookbackDays" value={String(lookbackDays)} />
              <button type="submit" className="rounded border border-white/20 px-3 py-2 text-[13px] font-semibold text-slate-100 hover:border-orange-300/70 hover:bg-white/5">Apply filters</button>
              <Link href="/dashboard/admin/operations/wedge-cron" className="rounded border border-white/15 px-3 py-2 text-[13px] text-slate-300 hover:text-white">Reset</Link>
            </div>
          </form>
          {error ? <p className="mt-3 text-[13px] text-rose-300">Failed to load run history: {error.message}</p> : null}
        </section>

        <section className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={ADMIN_DARK_STAT_CARD}><div className="text-[24px] font-bold text-white leading-none">{summary.total}</div><div className="text-[13px] text-slate-300 mt-1.5 tracking-[0.07em] uppercase">Filtered Runs</div></div>
          <div className={ADMIN_DARK_STAT_CARD}><div className="text-[24px] font-bold text-emerald-200 leading-none">{summary.success}</div><div className="text-[13px] text-slate-300 mt-1.5 tracking-[0.07em] uppercase">Success</div></div>
          <div className={ADMIN_DARK_STAT_CARD}><div className="text-[24px] font-bold text-rose-200 leading-none">{summary.failed}</div><div className="text-[13px] text-slate-300 mt-1.5 tracking-[0.07em] uppercase">Failed</div></div>
          <div className={ADMIN_DARK_STAT_CARD}><div className="text-[24px] font-bold text-white leading-none">{summary.avgDurationMs}ms</div><div className="text-[13px] text-slate-300 mt-1.5 tracking-[0.07em] uppercase">Avg Duration</div></div>
        </section>

        <section className={`${ADMIN_DARK_TABLE_PANEL} mt-5`}>
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <p className="text-[13px] font-bold tracking-[0.14em] uppercase text-slate-400">Cron run ledger</p>
            <span className="text-[13px] text-slate-400">Showing up to 250 rows</span>
          </div>

          {rows.length === 0 ? (
            <p className="px-5 py-4 text-[13px] text-slate-300">No runs match the current filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-[12px] text-slate-200">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="px-5 py-2 pr-4">Triggered</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">HTTP</th>
                    <th className="py-2 pr-4">Duration</th>
                    <th className="py-2 pr-4">Error code</th>
                    <th className="py-2 pr-4">Error message</th>
                    <th className="py-2 pr-4">Decision</th>
                    <th className="py-2 pr-4">History</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-white/5">
                      <td className="px-5 py-2 pr-4 font-mono text-[11px] text-slate-300">{new Date(row.triggered_at).toISOString()}</td>
                      <td className="py-2 pr-4"><span className={statusBadge(row.success)}>{row.success ? 'success' : 'failed'}</span></td>
                      <td className="py-2 pr-4">{row.http_status ?? '--'}</td>
                      <td className="py-2 pr-4">{row.duration_ms ?? 0}ms</td>
                      <td className="py-2 pr-4 font-mono text-[11px] text-slate-300">{row.error_code ?? '--'}</td>
                      <td className="py-2 pr-4 max-w-[280px] truncate" title={row.error_message ?? '--'}>{row.error_message ?? '--'}</td>
                      <td className="py-2 pr-4">{row.decision_summary ?? '--'}</td>
                      <td className="py-2 pr-4">{row.snapshot_history_count ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

