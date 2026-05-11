import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata = { title: 'Accept Invite - Starting Monday' }

export default async function TeamJoinPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: seat } = await admin
    .from('team_seats')
    .select('id, status, member_email, owner_id')
    .eq('token', token)
    .single()

  if (!seat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans">
        <div className="text-center px-6">
          <p className="text-[15px] font-semibold text-slate-700 mb-3">This invite link is invalid or expired.</p>
          <Link href="/" className="text-[13px] text-slate-500 underline underline-offset-2">Go to startingmonday.app</Link>
        </div>
      </div>
    )
  }

  if (seat.status === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans">
        <div className="text-center px-6">
          <p className="text-[15px] font-semibold text-slate-700 mb-3">This invite has already been accepted.</p>
          <Link href="/dashboard" className="text-[13px] font-semibold text-orange-500">Go to dashboard &rarr;</Link>
        </div>
      </div>
    )
  }

  const { data: ownerProfile } = await admin
    .from('user_profiles')
    .select('full_name')
    .eq('user_id', seat.owner_id)
    .single()
  const inviterName = ownerProfile?.full_name ?? 'Someone'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  async function acceptInvite() {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/login?next=/team/join/${token}`)

    const admin = createAdminClient()

    // Accept the seat
    await admin
      .from('team_seats')
      .update({
        member_user_id: user.id,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('token', token)
      .eq('status', 'pending')

    // Inherit the owner's subscription tier so the member gets full access
    if (!seat) redirect('/')
    const { data: owner } = await admin
      .from('users')
      .select('subscription_tier, subscription_status')
      .eq('id', seat.owner_id)
      .single()

    if (owner?.subscription_tier && owner.subscription_tier !== 'free' && owner.subscription_status === 'active') {
      await admin
        .from('users')
        .update({
          subscription_tier: owner.subscription_tier,
          subscription_status: 'active',
          trial_ends_at: null,
        })
        .eq('id', user.id)
    }

    redirect('/dashboard?team_joined=1')
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
      <header className="px-6 h-14 flex items-center">
        <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
          <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full">
          <p className="text-[13px] text-slate-500 mb-4">Team invitation</p>
          <h1 className="text-[32px] font-bold text-white leading-tight mb-4">
            {inviterName} invited you to join their account
          </h1>
          <p className="text-[14px] text-slate-400 leading-relaxed mb-2">
            Starting Monday is an AI-powered platform for senior executive searches: pipeline tracking,
            company intelligence, and interview prep briefs.
          </p>
          <p className="text-[13px] text-slate-500 mb-8">
            This seat is reserved for <span className="text-slate-300">{seat.member_email}</span>.
          </p>

          {user ? (
            <form action={acceptInvite}>
              <button
                type="submit"
                className="w-full bg-white text-slate-900 text-[14px] font-bold px-7 py-3.5 rounded hover:bg-slate-100 transition-colors cursor-pointer border-0"
              >
                Accept invite and join
              </button>
              <p className="text-[12px] text-slate-500 mt-3">Joining as {user.email}</p>
            </form>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href={`/signup?seat_token=${token}`}
                className="block text-center bg-white text-slate-900 text-[14px] font-bold px-7 py-3.5 rounded hover:bg-slate-100 transition-colors"
              >
                Create account and join
              </Link>
              <Link
                href={`/login?next=/team/join/${token}`}
                className="block text-center border border-slate-600 text-slate-300 text-[14px] font-semibold px-7 py-3.5 rounded hover:border-slate-400 transition-colors"
              >
                Log in and join
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
