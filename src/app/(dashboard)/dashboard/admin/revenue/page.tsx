import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember } from '@/lib/staff'
import {
  ADMIN_DARK_ACTION_CARD,
  ADMIN_DARK_PAGE_BG,
  ADMIN_DARK_SECTION_CARD,
  ADMIN_DARK_STAT_CARD,
  ADMIN_DARK_TABLE_PANEL,
} from '../admin-dark-theme'

const REVENUE_ALERT_SOURCES = [
  'plan_change_requests',
  'failed_payment_retry_runs',
  'payment_reconciliation_checks',
  'revenue_sync_runs',
  'revenue_mismatch_flags',
]

function daysAgoIso(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function roleBadge(role: string): string {
  if (role === 'owner') return 'bg-amber-500/15 text-amber-100 border border-amber-300/25'
  if (role === 'admin') return 'bg-sky-500/15 text-sky-100 border border-sky-300/25'
  return 'bg-white/10 text-slate-300 border border-white/10'
}

export default async function AdminRevenuePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const admin = createAdminClient()
  const since30d = daysAgoIso(30)

  const [
    { count: openRevenueAlerts },
    { data: recentAlerts },
    { count: openPlanChanges },
    { count: mismatches30d },
    { count: pendingRefunds },
  ] = await Promise.all([
    admin.from('automation_alerts').select('id', { count: 'exact', head: true }).in('source_table', REVENUE_ALERT_SOURCES).eq('status', 'open'),
    admin.from('automation_alerts').select('id, source_table, severity, message, created_at').in('source_table', REVENUE_ALERT_SOURCES).eq('status', 'open').order('created_at', { ascending: false }).limit(8),
    admin.from('plan_change_requests').select('id', { count: 'exact', head: true }).eq('status', 'requested'),
    admin.from('revenue_mismatch_flags').select('id', { count: 'exact', head: true }).eq('status', 'open').gte('created_at', since30d),
    admin.from('refund_workflow_triggers').select('id', { count: 'exact', head: true }).eq('status', 'queued').gte('created_at', since30d),
  ])

  const quickActions = staff.role === 'viewer'
    ? [
        { href: '/dashboard/admin/customers', label: 'Review customer status', description: 'Monitor trialing, active, and churn risk.' },
        { href: '/dashboard/admin/outreach-analytics', label: 'Review revenue pipeline signals', description: 'Track outreach to conversion trendlines.' },
      ]
    : [
        { href: '/dashboard/admin/crm', label: 'Run CRM routing checks', description: 'Validate lead scoring and route quality.' },
        { href: '/dashboard/admin/customers', label: 'Manage customer lifecycle', description: 'Intervene on trial-to-paid and churn risk.' },
        { href: '/dashboard/admin/outreach-analytics', label: 'Tune outreach revenue funnel', description: 'Optimize channel and sequencing outputs.' },
      ]

  return (
    <div className={ADMIN_DARK_PAGE_BG}>
      <header className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-400"><span className="text-white">Starting </span><span className="text-orange-500">Monday</span></span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/product" className="text-[13px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Product</Link>
            <Link href="/dashboard/admin/operations" className="text-[13px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Operations</Link>
            <Link href="/dashboard/admin" className="text-[13px] text-slate-300 hover:text-white transition-colors">â† Admin</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
<div className="mb-8">
          <h1 className="text-[26px] font-bold text-white leading-tight">Revenue Hub</h1>
          <p className="text-[13px] text-slate-300 mt-1.5">Revenue operations, customer conversion, and billing risk control.</p>
          <p className="text-[13px] text-slate-300 mt-1">
            Signed in as <span className="font-semibold text-slate-100">{user.email}</span>
            <span className={`ml-2 text-[13px] font-bold px-2 py-0.5 rounded ${roleBadge(staff.role)}`}>{staff.role}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Open revenue alerts', value: openRevenueAlerts ?? 0 },
            { label: 'Pending plan changes', value: openPlanChanges ?? 0 },
            { label: 'Revenue mismatches (30d)', value: mismatches30d ?? 0 },
            { label: 'Queued refunds (30d)', value: pendingRefunds ?? 0 },
          ].map((card) => (
            <div key={card.label} className={ADMIN_DARK_STAT_CARD}>
              <div className="text-[24px] font-bold text-white leading-none">{card.value}</div>
              <div className="text-[13px] text-slate-300 mt-1.5 tracking-[0.07em] uppercase">{card.label}</div>
            </div>
          ))}
        </div>

        <div className={ADMIN_DARK_SECTION_CARD}>
          <p className="text-[13px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-3">Role-based quick actions</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className={ADMIN_DARK_ACTION_CARD}>
                <p className="text-[13px] font-semibold text-white">{action.label}</p>
                <p className="text-[13px] text-slate-300 mt-1.5 leading-relaxed">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className={ADMIN_DARK_TABLE_PANEL}>
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <p className="text-[13px] font-bold tracking-[0.14em] uppercase text-slate-400">Revenue alert panel</p>
            <Link href="/guide" className="text-[13px] text-slate-300 hover:text-white">Runbook â†’</Link>
          </div>
          {(recentAlerts ?? []).length === 0 ? (
            <p className="px-5 py-4 text-[13px] text-slate-300">No open revenue alerts.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {(recentAlerts ?? []).map((alert: { id: string; source_table: string; severity: string; message: string; created_at: string }) => (
                <div key={alert.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold text-white">{alert.message}</p>
                    <span className={`text-[13px] font-bold px-2 py-0.5 rounded ${
                      alert.severity === 'high' ? 'bg-red-500/15 text-red-100 border border-red-300/25' : alert.severity === 'medium' ? 'bg-amber-500/15 text-amber-100 border border-amber-300/25' : 'bg-white/10 text-slate-300 border border-white/10'
                    }`}>{alert.severity}</span>
                  </div>
                  <p className="text-[13px] text-slate-400 mt-1 font-mono">{alert.source_table} â€¢ {new Date(alert.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

