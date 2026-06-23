import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember } from '@/lib/staff'
import { SalesEnablementWorkspace } from './SalesEnablementWorkspace'

export const metadata = { title: 'Sales Enablement - Admin' }

function roleBadge(role: string): string {
  if (role === 'owner') return 'bg-amber-500/15 text-amber-100 border border-amber-300/25'
  if (role === 'admin') return 'bg-sky-500/15 text-sky-100 border border-sky-300/25'
  return 'bg-white/10 text-slate-300 border border-white/10'
}

export default async function AdminSalesEnablementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_10%_-10%,rgba(249,115,22,0.16),transparent_45%),radial-gradient(1000px_circle_at_90%_-20%,rgba(59,130,246,0.14),transparent_42%),linear-gradient(180deg,#020617_0%,#0b1120_55%,#111827_100%)] font-sans text-slate-100">
      <header className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/revenue" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Revenue</Link>
            <Link href="/dashboard/admin" className="text-[13px] text-slate-300 hover:text-white transition-colors">← Admin</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-white leading-tight">Sales Enablement Control Room</h1>
          <p className="text-[13px] text-slate-300 mt-1.5">Evaluate proposals, set checkpoint targets, and track the best path to more qualified meetings.</p>
          <p className="text-[13px] text-slate-300 mt-1">
            Signed in as <span className="font-semibold text-slate-200">{user.email}</span>
            <span className={`ml-2 text-[11px] font-bold px-2 py-0.5 rounded ${roleBadge(staff.role)}`}>{staff.role}</span>
          </p>
        </div>

        <SalesEnablementWorkspace />
      </main>
    </div>
  )
}

