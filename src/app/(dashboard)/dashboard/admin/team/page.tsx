import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember, getAllStaff } from '@/lib/staff'
import { TeamClient } from './team-client'
import { ADMIN_DARK_PAGE_BG } from '../admin-dark-theme'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const members = await getAllStaff()

  return (
    <div className={ADMIN_DARK_PAGE_BG}>
      <header className="bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400"><span className="text-white">Starting </span><span className="text-orange-500">Monday</span></span>
          <Link href="/dashboard/admin" className="text-[13px] text-slate-300 hover:text-white transition-colors">
            ← Admin
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-white leading-tight">Team Management</h1>
          <p className="text-[13px] text-slate-300 mt-1.5">
            Signed in as <span className="font-semibold text-slate-100">{user.email}</span>
            <span className={`ml-2 text-[11px] font-bold px-2 py-0.5 rounded ${
              staff.role === 'owner' ? 'bg-amber-500/15 text-amber-100 border border-amber-300/25' :
              staff.role === 'admin' ? 'bg-sky-500/15 text-sky-100 border border-sky-300/25' :
              'bg-white/10 text-slate-300 border border-white/10'
            }`}>{staff.role}</span>
          </p>
        </div>

        {staff.role === 'viewer' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 mb-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
            <p className="text-[13px] text-slate-300">You have view-only access. Contact the owner to make changes.</p>
          </div>
        )}

        <TeamClient members={members} currentRole={staff.role} />
      </main>
    </div>
  )
}
