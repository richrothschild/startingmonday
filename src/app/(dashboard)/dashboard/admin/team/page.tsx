import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember, getAllStaff } from '@/lib/staff'
import { TeamClient } from './team-client'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const members = await getAllStaff()

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">Starting Monday</span>
          <Link href="/dashboard/admin" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">
            ← Admin
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Team Management</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">
            Signed in as <span className="font-semibold">{user.email}</span>
            <span className={`ml-2 text-[11px] font-bold px-2 py-0.5 rounded ${
              staff.role === 'owner' ? 'bg-amber-50 text-amber-700' :
              staff.role === 'admin' ? 'bg-blue-50 text-blue-700' :
              'bg-slate-100 text-slate-500'
            }`}>{staff.role}</span>
          </p>
        </div>

        {staff.role === 'viewer' && (
          <div className="bg-slate-50 border border-slate-200 rounded px-5 py-4 mb-6">
            <p className="text-[13px] text-slate-500">You have view-only access. Contact the owner to make changes.</p>
          </div>
        )}

        <TeamClient members={members} currentRole={staff.role} />
      </main>
    </div>
  )
}
