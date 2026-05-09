import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember } from '@/lib/staff'
import { sendWelcomeEmail } from './actions'

type Filter = 'all' | 'trialing' | 'intelligence' | 'search' | 'executive'

const FILTER_LABELS: Record<Filter, string> = {
  all:         'All customers',
  trialing:    'Trialing',
  intelligence:'Intelligence',
  search:      'Search',
  executive:   'Executive',
}

const TIER_NAMES: Record<string, string> = {
  passive:   'Intelligence',
  active:    'Search',
  executive: 'Executive',
  free:      'Free',
}

type UserRow = {
  id: string
  email: string
  subscription_status: string
  subscription_tier: string | null
  created_at: string
  signup_source: string | null
}

function matchesFilter(u: UserRow, filter: Filter): boolean {
  if (filter === 'all') return true
  if (filter === 'trialing') return u.subscription_status === 'trialing'
  if (filter === 'intelligence') return u.subscription_status === 'active' && u.subscription_tier === 'passive'
  if (filter === 'search')       return u.subscription_status === 'active' && u.subscription_tier === 'active'
  if (filter === 'executive')    return u.subscription_status === 'active' && u.subscription_tier === 'executive'
  return true
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; sent?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const { filter: rawFilter = 'all', sent } = await searchParams
  const filter: Filter = ['all', 'trialing', 'intelligence', 'search', 'executive'].includes(rawFilter)
    ? (rawFilter as Filter)
    : 'all'

  const admin = createAdminClient()
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: allUsers }, { data: outreachRows }] = await Promise.all([
    admin
      .from('users')
      .select('id, email, subscription_status, subscription_tier, created_at, signup_source')
      .in('subscription_status', ['trialing', 'active', 'past_due'])
      .order('created_at', { ascending: false }),
    admin
      .from('outreach_logs')
      .select('user_id')
      .gte('sent_at', since7d),
  ])

  const outreachByUser: Record<string, number> = {}
  for (const row of outreachRows ?? []) {
    outreachByUser[row.user_id] = (outreachByUser[row.user_id] ?? 0) + 1
  }

  const users = (allUsers ?? []) as UserRow[]

  const counts = {
    all:          users.length,
    trialing:     users.filter(u => u.subscription_status === 'trialing').length,
    intelligence: users.filter(u => u.subscription_status === 'active' && u.subscription_tier === 'passive').length,
    search:       users.filter(u => u.subscription_status === 'active' && u.subscription_tier === 'active').length,
    executive:    users.filter(u => u.subscription_status === 'active' && u.subscription_tier === 'executive').length,
  }

  const filteredUsers = users.filter(u => matchesFilter(u, filter))

  const statusBadge: Record<string, string> = {
    trialing:  'bg-amber-50 text-amber-700',
    active:    'bg-green-50 text-green-700',
    past_due:  'bg-red-50 text-red-700',
    canceled:  'bg-slate-100 text-slate-400',
    inactive:  'bg-slate-100 text-slate-400',
  }

  const cards: { filter: Filter; label: string; sublabel: string; accent: boolean }[] = [
    { filter: 'all',          label: String(counts.all),          sublabel: 'Total',         accent: false },
    { filter: 'trialing',     label: String(counts.trialing),     sublabel: 'Trialing',      accent: false },
    { filter: 'intelligence', label: String(counts.intelligence), sublabel: 'Intelligence',  accent: false },
    { filter: 'search',       label: String(counts.search),       sublabel: 'Search',        accent: true  },
    { filter: 'executive',    label: String(counts.executive),    sublabel: 'Executive',     accent: false },
  ]

  const sendEmailAction = sendWelcomeEmail.bind(null)

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link href="/dashboard/admin" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">
            Admin
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Customers</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">Active trials and paid subscribers.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {cards.map(card => (
            <Link
              key={card.filter}
              href={`/dashboard/admin/customers?filter=${card.filter}`}
              className={`rounded p-5 border transition-colors ${
                filter === card.filter
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className={`text-[30px] font-bold leading-none ${
                filter === card.filter ? 'text-white' : card.accent ? 'text-orange-500' : 'text-slate-900'
              }`}>
                {card.label}
              </div>
              <div className={`text-[11px] mt-2 font-semibold tracking-wide ${
                filter === card.filter ? 'text-slate-400' : 'text-slate-400'
              }`}>
                {card.sublabel}
              </div>
            </Link>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
              {FILTER_LABELS[filter]} ({filteredUsers.length})
            </span>
          </div>

          {filteredUsers.length === 0 ? (
            <p className="px-6 py-8 text-[13px] text-slate-400">No customers in this segment yet.</p>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-6 py-2.5 font-semibold text-slate-400">Email</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400">Plan</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400">Status</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400">Joined</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400 hidden sm:table-cell">Source</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400 text-right hidden sm:table-cell">7d outreach</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-400 text-right">Welcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map(u => {
                  const wasSent = sent === u.id
                  return (
                    <tr key={u.id} className={wasSent ? 'bg-green-50' : undefined}>
                      <td className="px-6 py-3 font-semibold text-slate-900 max-w-[200px] truncate">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {TIER_NAMES[u.subscription_tier ?? 'free'] ?? 'Free'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${statusBadge[u.subscription_status] ?? 'bg-slate-100 text-slate-400'}`}>
                          {u.subscription_status.charAt(0).toUpperCase() + u.subscription_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px] hidden sm:table-cell">
                        {u.signup_source ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700 tabular-nums font-semibold hidden sm:table-cell">
                        {outreachByUser[u.id] ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {wasSent ? (
                          <span className="text-[11px] font-bold text-green-700">Sent</span>
                        ) : (
                          <form action={sendEmailAction.bind(null, u.id, filter)}>
                            <button
                              type="submit"
                              className="text-[11px] font-semibold text-slate-500 border border-slate-200 rounded px-2.5 py-1 hover:border-slate-400 hover:text-slate-700 bg-transparent cursor-pointer transition-colors whitespace-nowrap"
                            >
                              Send welcome
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </div>
  )
}
