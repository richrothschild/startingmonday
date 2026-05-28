import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

import { SeatPurchase } from './seat-purchase'
import { ExportCsvButton } from './ExportCsvButton'


const TIER_MRR: Record<string, number> = {
  passive:   49,
  active:   199,
  executive: 499,
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
    .select('id, name, referral_code, commission_pct, created_at, seats_purchased, user_id, is_active, email')
    .eq('email', user.email ?? '')
    .eq('is_active', true)
    .maybeSingle()

  if (!partner) notFound()

  // Self-register user_id on partner record if not yet set
  if (!partner.user_id) {
    await admin.from('partners').update({ user_id: user.id }).eq('id', partner.id)
  }

  const referralLink = `${APP_URL}/signup?ref=${partner.referral_code}`

  // Fetch seat count for coach seat section
  const { count: seatsUsed } = await admin
    .from('team_seats')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id)

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

  // Build display rows (anonymous - no emails)
  const attrByUserId = Object.fromEntries(
    (attributions ?? []).map(a => [a.signup_user_id, a.attributed_at])
  )
  const displayRows = subscriberRows.map(u => ({
    joinedDate: attrByUserId[u.id] ?? u.created_at,
    tier: u.subscription_tier ?? 'free',
    status: u.subscription_status,
  })).sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime())

  const tierLabel: Record<string, string> = {
    passive: 'Intelligence', active: 'Active', executive: 'Executive', free: 'Free',
  }
  const statusColor: Record<string, string> = {
    active: 'bg-green-50 text-green-700',
    trialing: 'bg-amber-50 text-amber-700',
    inactive: 'bg-slate-100 text-slate-400',
    free: 'bg-slate-100 text-slate-400',
  }

  // CSV export rows
  const csvRows = displayRows.map(row => ({
    joinedDate: row.joinedDate,
    tier: row.tier,
    status: row.status,
    mrr: row.status === 'active' ? (TIER_MRR[row.tier] ?? 0) : 0,
    commission: row.status === 'active' ? Math.round((TIER_MRR[row.tier] ?? 0) * partner.commission_pct / 100) : 0,
  }))

  // Use a client component for the export button
  // ...existing code...
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

                <section className="mb-6 border border-slate-200 rounded-lg bg-slate-50 px-4 py-3">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-1">Quick navigation</h2>
          <p className="text-[12px] text-slate-600 leading-relaxed">Use the section headers on this page to scan fast and jump to what matters first.</p>
        </section>
        <details className="mb-6 border border-slate-200 rounded-lg bg-white px-4 py-3">
          <summary className="cursor-pointer text-[12px] font-semibold text-slate-800">TL;DR</summary>
          <p className="mt-2 text-[12px] text-slate-600 leading-relaxed">This page is organized for quick scanning. Start with the first major section, then use headings to move directly to the next action.</p>
        </details>
<div className="mb-8">
          <h2 className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-2">Partner Dashboard</h2>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Welcome, {partner.name.split(' ')[0]}.</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">
            Partner since {new Date(partner.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
            Commission rate: {partner.commission_pct}%.
          </p>
        </div>

        <section className="bg-slate-50 border border-slate-200 rounded p-4 mb-6">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-2">Jump to section</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px]">
            <a href="#partner-stats" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Stats</a>
            <a href="#partner-referral-link" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Referral link</a>
            <a href="#partner-subscribers" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Subscribers</a>
            <a href="#partner-commission" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Commission model</a>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <h2 className="sr-only">Quick actions</h2>
          <Link href="/partners#apply" className="bg-white border border-slate-200 rounded p-4 hover:border-slate-400 transition-colors">
            <p className="text-[13px] font-semibold text-slate-900">Partnership terms</p>
            <p className="text-[12px] text-slate-500 mt-1">Review partner program details and commission rules.</p>
          </Link>
          <Link href="/dashboard/admin/customers" className="bg-white border border-slate-200 rounded p-4 hover:border-slate-400 transition-colors">
            <p className="text-[13px] font-semibold text-slate-900">Open customers</p>
            <p className="text-[12px] text-slate-500 mt-1">Inspect converted subscribers and plan mix.</p>
          </Link>
          <Link href="/dashboard" className="bg-white border border-slate-200 rounded p-4 hover:border-slate-400 transition-colors">
            <p className="text-[13px] font-semibold text-slate-900">Back to dashboard</p>
            <p className="text-[12px] text-slate-500 mt-1">Return to your main campaign workspace.</p>
          </Link>
        </section>

        {/* Stats */}
        <section id="partner-stats" className="grid grid-cols-3 gap-4 mb-8">
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
        </section>

        {/* Coach seats */}
        <SeatPurchase
          seatsPurchased={partner.seats_purchased ?? 0}
          seatsUsed={seatsUsed ?? 0}
        />

        {/* Referral link */}
        <section id="partner-referral-link" className="bg-white border border-slate-200 rounded p-6 mb-6">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Your referral link</h2>
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
        </section>

        {/* Export CSV button */}
        <ExportCsvButton rows={csvRows} />

        {/* Subscriber table */}
        <section id="partner-subscribers" className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
          <div className="px-6 py-[18px] border-b border-slate-200">
            <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
              Referred Subscribers ({totalReferred})
            </h2>
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
                        {commission > 0 ? `$${commission}/mo` : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>

        {/* Commission explanation */}
        <section id="partner-commission" className="bg-white border border-slate-200 rounded p-6">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">How commissions work</h2>
          <div className="flex flex-col gap-2">
            {[
              'Share your referral link with executives you work with.',
              `When they sign up and start a paid subscription, you earn ${partner.commission_pct}% of their monthly fee.`,
              'Commissions are calculated on the 1st of each month and paid via Stripe.',
              'Intelligence tier: $49/mo subscriber = $' + Math.round(49 * partner.commission_pct / 100) + '/mo for you.',
              'Active tier: $199/mo subscriber = $' + Math.round(199 * partner.commission_pct / 100) + '/mo for you.',
            ].map((line, i) => (
              <div key={i} className="flex gap-3 text-[13px] text-slate-600">
                <span className="shrink-0 w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                {line}
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}
