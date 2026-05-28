import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember } from '@/lib/staff'

const OPS_ALERT_SOURCES = [
  'ci_check_runs',
  'lint_typecheck_runs',
  'test_execution_runs',
  'deployment_validation_runs',
  'runtime_health_check_runs',
  'scheduled_job_observability_runs',
  'error_monitoring_runs',
]

function roleBadge(role: string): string {
  if (role === 'owner') return 'bg-amber-50 text-amber-700'
  if (role === 'admin') return 'bg-blue-50 text-blue-700'
  return 'bg-slate-100 text-slate-500'
}

export default async function AdminOperationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const admin = createAdminClient()

  const [
    { count: openOpsAlerts },
    { data: recentAlerts },
    { data: latestDeploy },
    { data: latestRuntime },
    { data: latestJobObs },
  ] = await Promise.all([
    admin.from('automation_alerts').select('id', { count: 'exact', head: true }).in('source_table', OPS_ALERT_SOURCES).eq('status', 'open'),
    admin.from('automation_alerts').select('id, source_table, severity, message, created_at').in('source_table', OPS_ALERT_SOURCES).eq('status', 'open').order('created_at', { ascending: false }).limit(8),
    admin.from('deployment_validation_runs').select('status, created_at').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('runtime_health_check_runs').select('status, created_at, details').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('scheduled_job_observability_runs').select('job_name, status, created_at').order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  const quickActions = staff.role === 'viewer'
    ? [
        { href: '/dashboard/admin/traces', label: 'Inspect trace quality', description: 'Validate AI behavior and output consistency.' },
        { href: '/guide', label: 'Use operations runbook', description: 'Follow incident and response procedures.' },
      ]
    : [
        { href: '/dashboard/admin/traces', label: 'Audit reliability traces', description: 'Inspect quality and anomaly signatures.' },
        { href: '/guide', label: 'Execute SRE runbooks', description: 'Apply monitoring and incident playbooks.' },
        { href: '/dashboard/admin/team', label: 'Manage operational access', description: 'Ensure least-privilege admin coverage.' },
      ]

  const latestDeployStatus = (latestDeploy as { status?: string } | null)?.status ?? '--'
  const latestRuntimeStatus = (latestRuntime as { status?: string } | null)?.status ?? '--'
  const latestJobStatus = (latestJobObs as { status?: string } | null)?.status ?? '--'

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400"><span className="text-white">Starting </span><span className="text-orange-500">Monday</span></span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/revenue" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Revenue</Link>
            <Link href="/dashboard/admin/product" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Product</Link>
            <Link href="/dashboard/admin" className="text-[13px] text-slate-300 hover:text-white transition-colors">← Admin</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <section className="mb-6 border border-slate-200 rounded-lg bg-slate-50 px-4 py-3">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-1">Quick navigation</h2>
          <p className="text-[12px] text-slate-600 leading-relaxed">Use the section headers on this page to scan fast and jump to what matters first.</p>
        </section>
        <details className="mb-6 border border-slate-200 rounded-lg bg-white px-4 py-3">
          <summary className="cursor-pointer text-[12px] font-semibold text-slate-800">TL;DR</summary>
          <p className="mt-2 text-[12px] text-slate-600 leading-relaxed">This page is organized for quick scanning. Start with the first major section, then use headings to move directly to the next action.</p>
        </details>
<div className="mb-8">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Operations Hub</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">Reliability, release quality, and monitoring operations.</p>
          <p className="text-[13px] text-slate-500 mt-1">
            Signed in as <span className="font-semibold text-slate-700">{user.email}</span>
            <span className={`ml-2 text-[11px] font-bold px-2 py-0.5 rounded ${roleBadge(staff.role)}`}>{staff.role}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Open ops alerts', value: openOpsAlerts ?? 0 },
            { label: 'Latest deploy status', value: latestDeployStatus },
            { label: 'Runtime health', value: latestRuntimeStatus },
            { label: 'Last job status', value: latestJobStatus },
          ].map((card) => (
            <div key={card.label} className="bg-white border border-slate-200 rounded p-4">
              <div className="text-[24px] font-bold text-slate-900 leading-none capitalize">{card.value}</div>
              <div className="text-[10px] text-slate-400 mt-1.5 tracking-[0.07em] uppercase">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded p-5 mb-6">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-3">Role-based quick actions</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="block border border-slate-200 rounded p-4 hover:border-slate-400 transition-colors">
                <p className="text-[13px] font-semibold text-slate-900">{action.label}</p>
                <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Operations alert panel</p>
            <Link href="/guide" className="text-[12px] text-slate-500 hover:text-slate-700">Runbook →</Link>
          </div>
          {(recentAlerts ?? []).length === 0 ? (
            <p className="px-5 py-4 text-[13px] text-slate-500">No open operations alerts.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {(recentAlerts ?? []).map((alert: { id: string; source_table: string; severity: string; message: string; created_at: string }) => (
                <div key={alert.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold text-slate-900">{alert.message}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      alert.severity === 'high' ? 'bg-red-50 text-red-700' : alert.severity === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'
                    }`}>{alert.severity}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">{alert.source_table} • {new Date(alert.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
