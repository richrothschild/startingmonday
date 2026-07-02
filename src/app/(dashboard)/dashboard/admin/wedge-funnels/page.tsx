import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember } from '@/lib/staff'
import { ADMIN_DARK_PAGE_BG } from '../admin-dark-theme'
import WedgeFunnelsClient from './wedge-funnels-client'

export default async function AdminWedgeFunnelsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  return (
    <div className={ADMIN_DARK_PAGE_BG}>
      <header className="bg-slate-900">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="text-[13px] sm:text-[14px] font-bold uppercase tracking-[0.14em] text-slate-400"><span className="text-white">Starting </span><span className="text-orange-500">Monday</span></span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="text-[13px] text-slate-300 transition-colors hover:text-white">Admin</Link>
            <Link href="/dashboard/admin/operations" className="text-[13px] text-slate-300 transition-colors hover:text-white">Operations</Link>
            <Link href="/dashboard/admin/product" className="text-[13px] text-slate-300 transition-colors hover:text-white">Product</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-7">
          <h1 className="text-[26px] font-bold leading-tight text-white">Wedge Funnel Monitor</h1>
          <p className="mt-1.5 text-[13px] text-slate-300">
            Internal dashboard for shortlist sprint, partner pilot, and alumni distribution conversion health.
          </p>
          <p className="mt-1 text-[13px] text-slate-400">Signed in as {user.email}</p>
        </div>

        <WedgeFunnelsClient />
      </main>
    </div>
  )
}

