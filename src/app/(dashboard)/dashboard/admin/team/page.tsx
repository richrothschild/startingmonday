import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember, getAllStaff } from '@/lib/staff'
import { TeamClient } from './team-client'
import { ADMIN_DARK_PAGE_BG, ADMIN_DARK_SECTION_CARD, adminRoleBadgeClass } from '../admin-dark-theme'

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
          <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-400"><span className="text-white">Starting </span><span className="text-orange-500">Monday</span></span>
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
            <span className={`ml-2 text-[11px] font-bold px-2 py-0.5 rounded ${adminRoleBadgeClass(staff.role)}`}>{staff.role}</span>
          </p>
        </div>

        {staff.role === 'viewer' && (
          <div className={`${ADMIN_DARK_SECTION_CARD} px-5 py-4`}>
            <p className="text-[13px] text-slate-300">You have view-only access. Contact the owner to make changes.</p>
          </div>
        )}

        <TeamClient members={members} currentRole={staff.role} />
      </main>
    </div>
  )
}

