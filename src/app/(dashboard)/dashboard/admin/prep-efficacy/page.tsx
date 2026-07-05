import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember } from '@/lib/staff'
import { PrepEfficacyClient } from './prep-efficacy-client'

export const metadata = { title: 'Prep Efficacy - Admin' }

export default async function AdminPrepEfficacyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link href="/dashboard/admin" className="text-[13px] font-semibold text-slate-300 hover:text-white transition-colors">
            Back to admin
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Prep Efficacy Rollup</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">
            Monthly outcomes from prep briefs: advanced, offer, rejected, and conversion rates.
          </p>
        </div>

        <PrepEfficacyClient />
      </main>
    </div>
  )
}
