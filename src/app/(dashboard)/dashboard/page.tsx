import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { markFollowUpDone } from './actions'
import { todayInTz, greetingInTz, fullDateInTz } from '@/lib/date'
import { LogoutButton } from './logout-button'

// Full class strings — must not be constructed dynamically (Tailwind scanner needs to see them)
const STAGE: Record<string, { label: string; cls: string }> = {
  watching:     { label: 'Watching',     cls: 'bg-slate-100 text-slate-500' },
  researching:  { label: 'Researching',  cls: 'bg-blue-50 text-blue-700' },
  applied:      { label: 'Applied',      cls: 'bg-indigo-50 text-indigo-700' },
  interviewing: { label: 'Interviewing', cls: 'bg-amber-50 text-amber-700' },
  offer:        { label: 'Offer',        cls: 'bg-green-50 text-green-700' },
}

const PAGE_SIZE = 50

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stage?: string; page?: string }>
}) {
  const { q, stage, page: pageParam } = await searchParams
  const page = Math.max(0, parseInt(pageParam ?? '0', 10) || 0)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, search_started_at, briefing_timezone, onboarding_completed_at')
    .eq('user_id', user.id)
    .single()

  if (!profile?.onboarding_completed_at) redirect('/onboarding')

  const tz = profile?.briefing_timezone ?? 'UTC'
  const todayISO = todayInTz(tz)

  // Build filtered company query (server-side) with pagination
  let companyQuery = supabase
    .from('companies')
    .select('id, name, sector, stage, fit_score, notes, updated_at', { count: 'planned' })
    .eq('user_id', user.id)
    .is('archived_at', null)
    .order('fit_score', { ascending: false, nullsFirst: false })

  if (q) companyQuery = companyQuery.ilike('name', `%${q}%`)
  if (stage) companyQuery = companyQuery.eq('stage', stage)

  const start = page * PAGE_SIZE
  companyQuery = companyQuery.range(start, start + PAGE_SIZE - 1)

  // Stats query: total + active count (unfiltered)
  const statsQuery = supabase
    .from('companies')
    .select('stage')
    .eq('user_id', user.id)
    .is('archived_at', null)

  const [{ data: companies, count: filteredCount }, { data: allCompanies }, { data: followUps }] = await Promise.all([
    companyQuery,
    statsQuery,
    supabase
      .from('follow_ups')
      .select('id, due_date, action, companies(name)')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .lte('due_date', todayISO)
      .order('due_date', { ascending: true })
      .limit(20),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const allList = allCompanies ?? []
  const totalCount = allList.length
  const activeCount = allList.filter(c =>
    ['interviewing', 'applied', 'offer'].includes(c.stage)
  ).length
  const overdueCount = (followUps ?? []).length

  const filtered = companies ?? []
  const totalFiltered = filteredCount ?? 0
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE)
  const hasFilters = !!(q || stage)

  const greeting = greetingInTz(tz)
  const today = fullDateInTz(tz)

  const stats = [
    { value: totalCount,  label: 'Companies',   alert: false },
    { value: activeCount, label: 'Active',       alert: false },
    { value: overdueCount, label: 'Actions Due', alert: overdueCount > 0 },
  ]

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      {/* Nav */}
      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
          <div className="flex items-center gap-5">
            <Link
              href="/dashboard/chat"
              className="text-[12px] font-semibold text-slate-500 hover:text-slate-300 transition-colors"
            >
              Chat
            </Link>
            <Link
              href="/dashboard/contacts"
              className="text-[12px] font-semibold text-slate-500 hover:text-slate-300 transition-colors"
            >
              Contacts
            </Link>
            <Link
              href="/dashboard/profile"
              className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              {profile?.full_name ?? user.email}
            </Link>
            <Link
              href="/settings/billing"
              className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              Billing
            </Link>
            <LogoutButton label="Sign out" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">
            {greeting}, {firstName}.
          </h1>
          <p className="text-[13px] text-slate-500 mt-1.5">{today}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map(({ value, label, alert }) => (
            <div key={label} className="bg-white border border-slate-200 rounded p-5">
              <div className={`text-[28px] font-bold leading-none ${alert ? 'text-red-700' : 'text-slate-900'}`}>
                {value}
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 tracking-[0.07em] uppercase">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Actions Due */}
        {followUps && followUps.length > 0 && (
          <div className="bg-white border border-slate-200 rounded overflow-hidden mb-8">
            <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
                Actions Due
              </span>
              <span className="text-[12px] font-semibold text-red-600">
                {followUps.length} {followUps.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {followUps.map(fu => {
                const isToday = fu.due_date === todayISO

                const co = fu.companies as unknown as { name: string } | null
                const dateLabel = isToday
                  ? 'Today'
                  : new Date(fu.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                return (
                  <div key={fu.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-slate-900 truncate">{fu.action}</div>
                      {co && (
                        <div className="text-[12px] text-slate-400 mt-0.5">{co.name}</div>
                      )}
                    </div>
                    <span className={`text-[12px] font-semibold shrink-0 ${isToday ? 'text-slate-400' : 'text-red-600'}`}>
                      {dateLabel}
                    </span>
                    <form action={markFollowUpDone.bind(null, fu.id)}>
                      <button
                        type="submit"
                        className="text-[12px] text-slate-400 border border-slate-200 rounded px-3 py-1 hover:border-slate-400 hover:text-slate-700 cursor-pointer bg-transparent"
                      >
                        Done
                      </button>
                    </form>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Day 1 action plan — only shown until first company is added */}
        {totalCount === 0 && !hasFilters && (
          <div className="bg-white border border-slate-200 rounded overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-slate-100">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">
                Day 1
              </p>
              <h2 className="text-[18px] font-bold text-slate-900">
                Four moves to start strong.
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                {
                  href: '/dashboard/companies/new',
                  label: 'Add your first target company',
                  sub: 'Include the career page URL — we\'ll scan for openings immediately.',
                },
                {
                  href: '/dashboard/profile',
                  label: 'Sharpen your positioning',
                  sub: 'Upload your LinkedIn PDF and set your target titles. Drives every brief and briefing.',
                },
                {
                  href: '/dashboard/contacts',
                  label: 'Map your key contacts',
                  sub: 'Who do you know at target companies? Who can warm-connect you?',
                },
                {
                  href: '/dashboard/strategy',
                  label: 'Get your Search Strategy Brief',
                  sub: 'Your sector, your narrative, your outreach framework. Takes 60 seconds.',
                },
              ].map((action, i) => (
                <a
                  key={action.href}
                  href={action.href}
                  className="group px-6 py-5 flex items-start gap-4 hover:bg-slate-50 transition-colors block"
                >
                  <span className="text-[13px] font-bold text-slate-300 w-5 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-slate-900 group-hover:text-slate-700">
                      {action.label}
                    </p>
                    <p className="text-[13px] text-slate-400 mt-0.5 leading-relaxed">
                      {action.sub}
                    </p>
                  </div>
                  <span className="text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5">→</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Pipeline */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden">

          <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
              Company Pipeline
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[12px] text-slate-400">
                {hasFilters && totalFiltered === 0
                  ? `0 of ${totalCount}`
                  : totalPages > 1 || hasFilters
                    ? `${start + 1}–${Math.min(start + PAGE_SIZE, totalFiltered)} of ${totalFiltered}`
                    : totalCount} {totalCount === 1 ? 'company' : 'companies'}
              </span>
              <Link
                href="/dashboard/companies/new"
                className="text-[12px] font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded transition-colors"
              >
                + Add
              </Link>
            </div>
          </div>

          <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2">
            <form method="get" action="/dashboard" className="flex items-center gap-2 flex-1">
              <input type="hidden" name="page" value="0" />
              <input
                type="text"
                name="q"
                defaultValue={q ?? ''}
                placeholder="Search companies…"
                className="flex-1 border border-slate-200 rounded px-3 py-1.5 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
              />
              <select
                name="stage"
                defaultValue={stage ?? ''}
                aria-label="Filter by stage"
                className="border border-slate-200 rounded px-2.5 py-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-slate-400 bg-white"
              >
                <option value="">All stages</option>
                {Object.entries(STAGE).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <button
                type="submit"
                className="text-[12px] font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:border-slate-400 bg-transparent cursor-pointer"
              >
                Filter
              </button>
              {(q || stage) && (
                <a href="/dashboard" className="text-[12px] text-slate-400 hover:text-slate-700">
                  Clear
                </a>
              )}
            </form>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-2.5 pl-6 pr-4 text-left text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400">
                  Company
                </th>
                <th className="py-2.5 px-4 text-left text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400">
                  Sector
                </th>
                <th className="py-2.5 px-4 text-left text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400">
                  Stage
                </th>
                <th className="py-2.5 pl-4 pr-6 text-right text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400">
                  Fit
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[14px] text-slate-400">
                    {totalCount === 0 ? 'Add your first company above to get started.' : 'No companies match your filter.'}
                  </td>
                </tr>
              ) : filtered.map((co, i) => {
                const s = STAGE[co.stage] ?? { label: co.stage, cls: 'bg-slate-100 text-slate-500' }
                return (
                  <tr
                    key={co.id}
                    className={i < filtered.length - 1 ? 'border-b border-slate-50' : ''}
                  >
                    <td className="py-3.5 pl-6 pr-4">
                      <Link href={`/dashboard/companies/${co.id}`} className="text-[14px] font-semibold text-slate-900 hover:text-slate-600">{co.name}</Link>
                      {co.notes && (
                        <div className="text-[12px] text-slate-400 mt-0.5 truncate max-w-[340px]">
                          {co.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[13px] text-slate-500">
                      {co.sector ?? '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.04em] ${s.cls}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 pr-6 text-right text-[14px] font-bold text-slate-900">
                      {co.fit_score ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[12px] text-slate-400">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                {page > 0 && (
                  <a
                    href={`/dashboard?${new URLSearchParams({ ...(q ? { q } : {}), ...(stage ? { stage } : {}), page: String(page - 1) }).toString()}`}
                    className="text-[12px] font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:border-slate-400"
                  >
                    ← Previous
                  </a>
                )}
                {page < totalPages - 1 && (
                  <a
                    href={`/dashboard?${new URLSearchParams({ ...(q ? { q } : {}), ...(stage ? { stage } : {}), page: String(page + 1) }).toString()}`}
                    className="text-[12px] font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:border-slate-400"
                  >
                    Next →
                  </a>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
