import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const TIER_MRR: Record<string, number> = {
  passive:   49,
  active:   129,
  executive: 249,
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'

export default async function PartnerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Check if this user is a registered partner
  const { data: partner } = await admin
    .from('partners')
    .select('id, name, referral_code, commission_pct, created_at')
    .eq('email', user.email ?? '')
    .eq('is_active', true)
    .maybeSingle()

  if (!partner) notFound()

  const referralLink = `${APP_URL}/signup?ref=${partner.referral_code}`

  // Fetch attributions with subscription info
  const { data: attributions } = await admin
    .from('referral_attributions')
    .select('signup_user_id, attributed_at')
    .eq('partner_id', partner.id)
    .order('attributed_at', { ascending: false })

  const attributedUserIds = (attributions ?? []).map(a => a.signup_user_id)

  let subscriberRows: { id: string; subscription_status: string; subscription_tier: string | null; created_at: string }[] = []
  if (attributedUserIds.length > 0) {
    const { data: users } = await admin
      .from('users')
      .select('id, subscription_status, subscription_tier, created_at')
      .in('id', attributedUserIds)
    subscriberRows = (users ?? []) as typeof subscriberRows
  }

  const totalReferred = subscriberRows.length
  const activeSubscribers = subscriberRows.filter(u => u.subscription_status === 'active')
  const attributedMRR = activeSubscribers.reduce((sum, u) => {
    return sum + (TIER_MRR[u.subscription_tier ?? ''] ?? 0)
  }, 0)
  const estimatedCommission = Math.round(attributedMRR * partner.commission_pct / 100)

  // Build display rows (anonymous — no emails)
  const attrByUserId = Object.fromEntries(
    (attributions ?? []).map(a => [a.signup_user_id, a.attributed_at])
  )
  const displayRows = subscriberRows.map(u => ({
    joinedDate: attrByUserId[u.id] ?? u.created_at,
    tier: u.subscription_tier ?? 'free',
    status: u.subscription_status,
  })).sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime())

  const tierLabel: Record<string, string> = {
    passive: 'Intelligence', active: 'Search', executive: 'Executive', free: 'Free',
  }
  const statusColor: Record<string, string> = {
    active: 'bg-green-50 text-green-700',
    trialing: 'bg-amber-50 text-amber-700',
    inactive: 'bg-slate-100 text-slate-400',
    free: 'bg-slate-100 text-slate-400',
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400 hover:text-slate-300 transition-colors">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-2">Partner Dashboard</p>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Welcome, {partner.name.split(' ')[0]}.</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">
            Partner since {new Date(partner.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
            Commission rate: {partner.commission_pct}%.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total referred',       value: String(totalReferred) },
            { label: 'Active subscribers',   value: String(activeSubscribers.length) },
            { label: 'Est. commission / mo', value: estimatedCommission > 0 ? `$${estimatedCommission}` : '$0' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-slate-200 rounded p-5">
              <div className="text-[28px] font-bold text-slate-900">{value}</div>
              <div className="text-[12px] text-slate-400 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Referral link */}
        <div className="bg-white border border-slate-200 rounded p-6 mb-6">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Your referral link</p>
          <div className="flex items-center gap-3 flex-wrap">
            <code className="flex-1 text-[13px] bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-slate-700 font-mono min-w-0 truncate">
              {referralLink}
            </code>
            <span className="text-[11px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded font-mono">
              {partner.referral_code}
            </span>
          </div>
          <p className="mt-3 text-[12px] text-slate-400 leading-relaxed">
            Share this link with your clients. When they sign up and convert to a paid plan, you earn {partner.commission_pct}% of their monthly subscription for as long as they remain active.
          </p>
        </div>

        {/* Subscriber table */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
          <div className="px-6 py-[18px] border-b border-slate-200">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
              Referred Subscribers ({totalReferred})
            </span>
          </div>
          {displayRows.length === 0 ? (
            <p className="px-6 py-8 text-[13px] text-slate-400">
              No subscribers yet. Share your referral link to get started.
            </p>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-6 py-2.5 font-semibold text-slate-400">Joined</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400">Plan</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400 text-right">MRR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayRows.map((row, i) => {
                  const mrr = row.status === 'active' ? (TIER_MRR[row.tier] ?? 0) : 0
                  const commission = Math.round(mrr * partner.commission_pct / 100)
                  return (
                    <tr key={i}>
                      <td className="px-6 py-3 text-slate-700">
                        {new Date(row.joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{tierLabel[row.tier] ?? row.tier}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${statusColor[row.status] ?? 'bg-slate-100 text-slate-400'}`}>
                          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {commission > 0 ? `$${commission}/mo` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Commission explanation */}
        <div className="bg-white border border-slate-200 rounded p-6">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">How commissions work</p>
          <div className="flex flex-col gap-2">
            {[
              'Share your referral link with executives you work with.',
              `When they sign up and start a paid subscription, you earn ${partner.commission_pct}% of their monthly fee.`,
              'Commissions are calculated on the 1st of each month and paid via Stripe.',
              'Intelligence tier: $49/mo subscriber = $' + Math.round(49 * partner.commission_pct / 100) + '/mo for you.',
              'Search tier: $129/mo subscriber = $' + Math.round(129 * partner.commission_pct / 100) + '/mo for you.',
            ].map((line, i) => (
              <div key={i} className="flex gap-3 text-[13px] text-slate-600">
                <span className="shrink-0 w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                {line}
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
