import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { canUserSeeAdminHeader } from '@/lib/staff'
import { TeamSettings } from './team-settings'
import { ClientCoachAccessManager } from '@/components/client/coach-access-manager'

export const metadata = { title: 'Team - Starting Monday' }

type SeatStatus = {
  profileDone: boolean
  companyAdded: boolean
  briefGenerated: boolean
}

export default async function TeamSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const isRothschildAdmin = await canUserSeeAdminHeader(user.email ?? '')

  const { data: rawSeats } = await supabase
    .from('team_seats')
    .select('id, member_email, member_user_id, status, invited_at, accepted_at')
    .eq('owner_id', user.id)
    .order('invited_at', { ascending: false })

  const seats = rawSeats ?? []

  // Compute activation status for accepted seats
  const admin = createAdminClient()
  const seatStatuses: Record<string, SeatStatus> = {}

  await Promise.all(
    seats
      .filter(s => s.status === 'accepted' && s.member_user_id)
      .map(async (s) => {
        const [{ data: profile }, { count: companyCount }, { count: briefCount }] = await Promise.all([
          admin.from('user_profiles').select('role_type, full_name').eq('user_id', s.member_user_id!).single(),
          admin.from('companies').select('id', { count: 'exact', head: true }).eq('user_id', s.member_user_id!).is('archived_at', null),
          admin.from('briefs').select('id', { count: 'exact', head: true }).eq('user_id', s.member_user_id!),
        ])
        seatStatuses[s.id] = {
          profileDone: !!(profile?.role_type && profile?.full_name),
          companyAdded: (companyCount ?? 0) > 0,
          briefGenerated: (briefCount ?? 0) > 0,
        }
      })
  )

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[13px] text-slate-300 hover:text-white transition-colors">
              &larr; Dashboard
            </Link>
            {isRothschildAdmin && (
              <Link href="/dashboard/admin" className="text-[12px] font-semibold text-orange-400 hover:text-orange-300 transition-colors">
                Admin
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-slate-900">Team</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Invite members and track their search activation.
          </p>
        </div>

        <TeamSettings
          seats={seats.map(s => ({
            id: s.id,
            member_email: s.member_email,
            member_user_id: s.member_user_id ?? null,
            status: s.status as 'pending' | 'accepted',
            invited_at: s.invited_at,
            accepted_at: s.accepted_at ?? null,
            seatStatus: seatStatuses[s.id] ?? null,
          }))}
        />

        <div className="mt-8">
          <ClientCoachAccessManager />
        </div>
      </main>
    </div>
  )
}
