import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function mondayOf(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  const day = d.getUTCDay() // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day
  d.setUTCDate(d.getUTCDate() + diff)
  return d.toISOString().slice(0, 10)
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function formatHeader(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', timeZone: 'UTC',
  })
}

function formatMonthYear(mondayStr: string, sundayStr: string): string {
  const m = new Date(mondayStr + 'T00:00:00Z')
  const s = new Date(sundayStr + 'T00:00:00Z')
  const mLabel = m.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  const sLabel = s.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  return mLabel === sLabel ? mLabel : `${m.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })} – ${sLabel}`
}

type FollowUp = {
  id: string
  action: string
  due_date: string
  company_id: string | null
  contact_id: string | null
  companies: { id: string; name: string } | null
  contacts: { id: string; name: string } | null
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('briefing_timezone')
    .eq('user_id', user.id)
    .single()

  const tz = profile?.briefing_timezone ?? 'UTC'
  const nowInTz = new Date().toLocaleDateString('en-CA', { timeZone: tz }) // YYYY-MM-DD
  const todayISO = nowInTz

  const monday = mondayOf(week ?? todayISO)
  const sunday = addDays(monday, 6)
  const prevMonday = addDays(monday, -7)
  const nextMonday = addDays(monday, 7)

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  const [{ data: rawFollowUps }, { data: overdueRaw }] = await Promise.all([
    supabase
      .from('follow_ups')
      .select('id, action, due_date, company_id, contact_id, companies(id, name), contacts(id, name)')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gte('due_date', monday)
      .lte('due_date', sunday)
      .order('due_date', { ascending: true }),
    supabase
      .from('follow_ups')
      .select('id, action, due_date, company_id, contact_id, companies(id, name), contacts(id, name)')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .lt('due_date', monday)
      .order('due_date', { ascending: true })
      .limit(20),
  ])

  const followUps = (rawFollowUps ?? []) as unknown as FollowUp[]
  const overdue   = (overdueRaw   ?? []) as unknown as FollowUp[]

  const byDate: Record<string, FollowUp[]> = {}
  for (const fu of followUps) {
    if (!byDate[fu.due_date]) byDate[fu.due_date] = []
    byDate[fu.due_date].push(fu)
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
          <Link href="/dashboard" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Header + week nav */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Calendar</h1>
            <p className="text-[13px] text-slate-500 mt-1">{formatMonthYear(monday, sunday)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/calendar?week=${prevMonday}`}
              className="text-[12px] font-semibold text-slate-600 border border-slate-200 bg-white rounded px-3 py-1.5 hover:border-slate-400 transition-colors"
            >
              ← Prev
            </Link>
            <Link
              href={`/dashboard/calendar?week=${mondayOf(todayISO)}`}
              className="text-[12px] font-semibold text-slate-600 border border-slate-200 bg-white rounded px-3 py-1.5 hover:border-slate-400 transition-colors"
            >
              Today
            </Link>
            <Link
              href={`/dashboard/calendar?week=${nextMonday}`}
              className="text-[12px] font-semibold text-slate-600 border border-slate-200 bg-white rounded px-3 py-1.5 hover:border-slate-400 transition-colors"
            >
              Next →
            </Link>
          </div>
        </div>

        {/* Overdue section */}
        {overdue.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded overflow-hidden">
            <div className="px-5 py-3 border-b border-red-200 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-red-600">
                Overdue
              </span>
              <span className="text-[12px] font-semibold text-red-600">
                {overdue.length} {overdue.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="divide-y divide-red-100">
              {overdue.map(fu => (
                <CalendarItem key={fu.id} fu={fu} today={todayISO} overdue />
              ))}
            </div>
          </div>
        )}

        {/* Week grid — desktop */}
        <div className="hidden sm:grid sm:grid-cols-7 gap-3">
          {weekDates.map((date, i) => {
            const items = byDate[date] ?? []
            const isToday = date === todayISO
            const isPast  = date < todayISO
            return (
              <div key={date} className={`rounded border overflow-hidden ${isToday ? 'border-slate-900' : 'border-slate-200'} bg-white`}>
                <div className={`px-3 py-2 border-b ${isToday ? 'border-slate-900 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
                  <div className={`text-[10px] font-bold tracking-[0.1em] uppercase ${isToday ? 'text-slate-400' : isPast ? 'text-slate-300' : 'text-slate-400'}`}>
                    {DAYS[i]}
                  </div>
                  <div className={`text-[15px] font-bold ${isToday ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-900'}`}>
                    {formatHeader(date).split(' ')[1]}
                  </div>
                </div>
                <div className="p-2 min-h-[120px]">
                  {items.length === 0 ? null : (
                    <div className="flex flex-col gap-1.5">
                      {items.map(fu => (
                        <CalendarChip key={fu.id} fu={fu} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Week list — mobile */}
        <div className="sm:hidden flex flex-col gap-4">
          {weekDates.map((date, i) => {
            const items = byDate[date] ?? []
            const isToday = date === todayISO
            const isPast  = date < todayISO
            if (items.length === 0 && isPast) return null
            return (
              <div key={date} className="bg-white border border-slate-200 rounded overflow-hidden">
                <div className={`px-5 py-3 border-b flex items-center gap-2 ${isToday ? 'border-slate-900 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
                  <span className={`text-[10px] font-bold tracking-[0.12em] uppercase ${isToday ? 'text-slate-400' : 'text-slate-400'}`}>{DAYS[i]}</span>
                  <span className={`text-[13px] font-semibold ${isToday ? 'text-white' : isPast ? 'text-slate-400' : 'text-slate-700'}`}>{formatHeader(date)}</span>
                  {items.length > 0 && (
                    <span className="ml-auto text-[11px] font-semibold text-slate-400">{items.length}</span>
                  )}
                </div>
                {items.length > 0 && (
                  <div className="divide-y divide-slate-50">
                    {items.map(fu => (
                      <CalendarItem key={fu.id} fu={fu} today={todayISO} overdue={false} />
                    ))}
                  </div>
                )}
                {items.length === 0 && (
                  <div className="px-5 py-4 text-[13px] text-slate-300">Nothing due.</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Empty state */}
        {followUps.length === 0 && overdue.length === 0 && (
          <div className="mt-8 text-center py-16 bg-white border border-slate-200 rounded">
            <p className="text-[14px] text-slate-400">No actions scheduled this week.</p>
            <p className="text-[13px] text-slate-300 mt-2">Add follow-ups from a company or contact to see them here.</p>
          </div>
        )}

      </main>
    </div>
  )
}

function CalendarChip({ fu }: { fu: FollowUp }) {
  const href = fu.companies?.id
    ? `/dashboard/companies/${fu.companies.id}`
    : fu.contacts?.id
      ? `/dashboard/contacts`
      : '#'

  const label = fu.companies?.name ?? fu.contacts?.name ?? ''

  return (
    <Link
      href={href}
      className="block bg-slate-900 text-white rounded px-2 py-1.5 hover:bg-slate-700 transition-colors"
    >
      <p className="text-[11px] font-semibold leading-tight truncate">{fu.action}</p>
      {label && (
        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{label}</p>
      )}
    </Link>
  )
}

function CalendarItem({ fu, today, overdue }: { fu: FollowUp; today: string; overdue: boolean }) {
  const href = fu.companies?.id
    ? `/dashboard/companies/${fu.companies.id}`
    : `/dashboard/contacts`
  const label = fu.companies?.name ?? fu.contacts?.name ?? ''
  const isToday = fu.due_date === today
  const dateLabel = isToday
    ? 'Today'
    : new Date(fu.due_date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

  return (
    <Link href={href} className="group px-5 py-3.5 flex items-start gap-4 hover:bg-slate-50 transition-colors block">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-slate-900 group-hover:text-slate-700 leading-tight">{fu.action}</p>
        {label && (
          <p className="text-[12px] text-slate-400 mt-0.5">{label}</p>
        )}
      </div>
      <span className={`shrink-0 text-[11px] font-semibold mt-0.5 ${overdue || isToday ? 'text-red-600' : 'text-slate-400'}`}>
        {dateLabel}
      </span>
    </Link>
  )
}
