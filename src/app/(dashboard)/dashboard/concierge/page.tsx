import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface AgendaItem {
  topic: string
  detail: string
  priority?: string
}

interface ConciergeCall {
  id: string
  scheduled_at: string
  status: string
  agenda: AgendaItem[]
  call_notes: string | null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

export default async function ConciergeDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_concierge, full_name')
    .eq('user_id', user.id)
    .single()

  if (!profile?.is_concierge) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
        <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">
          Executive Concierge
        </p>
        <h1 className="text-[26px] font-bold text-slate-900 mb-4 leading-tight">
          One-to-one strategy. Every month.
        </h1>
        <p className="text-[15px] text-slate-500 leading-relaxed mb-8 max-w-lg">
          Monthly 45-minute sessions with Rich Rothschild. Starting Monday prepares the agenda from your live pipeline before every call. Notes carry forward. Limited to 10 seats.
        </p>
        <a
          href="mailto:concierge@startingmonday.app?subject=Executive%20Concierge%20%E2%80%94%20Access%20Request"
          className="inline-block bg-orange-500 text-white text-[14px] font-bold px-7 py-3.5 rounded hover:bg-orange-600 transition-colors"
        >
          Apply for access &rarr;
        </a>
        <p className="text-[12px] text-slate-400 mt-3">$1,299/mo or $13,999/yr. Currently accepting applications.</p>
        <p className="mt-6">
          <Link href="/concierge" className="text-[13px] text-slate-500 hover:text-slate-700 underline transition-colors">
            Learn more about Executive Concierge &rarr;
          </Link>
        </p>
      </div>
    )
  }

  const now = new Date().toISOString()
  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from('concierge_calls')
      .select('id, scheduled_at, status, agenda, call_notes')
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .gte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(3),
    supabase
      .from('concierge_calls')
      .select('id, scheduled_at, status, agenda, call_notes')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('scheduled_at', { ascending: false })
      .limit(5),
  ])

  const nextCall = upcoming?.[0] as ConciergeCall | undefined
  const pastCalls = (past ?? []) as ConciergeCall[]

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-1">
            Executive Concierge
          </p>
          <h1 className="text-[24px] font-bold text-slate-900 leading-tight">
            {profile.full_name ? `${profile.full_name.split(' ')[0]}&rsquo;s strategy hub` : 'Strategy hub'}
          </h1>
        </div>
        <a
          href="mailto:concierge@startingmonday.app?subject=Schedule%20next%20call"
          className="text-[13px] font-semibold text-orange-600 hover:text-orange-700 transition-colors"
        >
          Schedule next call &rarr;
        </a>
      </div>

      {/* Next call */}
      {nextCall ? (
        <section className="mb-10">
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-3">Upcoming call</p>
          <div className="border border-orange-200 bg-orange-50 rounded-lg p-5 sm:p-6">
            <p className="text-[13px] font-semibold text-slate-900 mb-1">{formatDate(nextCall.scheduled_at)}</p>
            <p className="text-[12px] text-slate-500 mb-5">45 minutes with Rich Rothschild</p>

            {nextCall.agenda && nextCall.agenda.length > 0 ? (
              <>
                <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-3">
                  AI-prepared agenda
                </p>
                <ol className="space-y-3">
                  {nextCall.agenda.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[11px] font-bold text-orange-500 shrink-0 mt-0.5 w-4">{i + 1}</span>
                      <div>
                        <p className="text-[13px] font-semibold text-slate-800">{item.topic}</p>
                        <p className="text-[12px] text-slate-500 leading-relaxed">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="text-[13px] text-slate-500">
                Agenda will be prepared the day before your call from your live pipeline.
              </p>
            )}
          </div>
        </section>
      ) : (
        <section className="mb-10">
          <div className="border border-slate-200 rounded-lg p-5 text-center">
            <p className="text-[14px] text-slate-500 mb-3">No call scheduled yet.</p>
            <a
              href="mailto:concierge@startingmonday.app?subject=Schedule%20next%20call"
              className="text-[13px] font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Schedule your next session &rarr;
            </a>
          </div>
        </section>
      )}

      {/* Past calls */}
      {pastCalls.length > 0 && (
        <section>
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-3">Past calls</p>
          <div className="space-y-4">
            {pastCalls.map(call => (
              <div key={call.id} className="border border-slate-200 rounded-lg p-5">
                <p className="text-[13px] font-semibold text-slate-900 mb-3">{formatDate(call.scheduled_at)}</p>
                {call.call_notes ? (
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-2">Notes</p>
                    <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line">{call.call_notes}</p>
                  </div>
                ) : (
                  <p className="text-[12px] text-slate-400">No notes recorded for this session.</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
