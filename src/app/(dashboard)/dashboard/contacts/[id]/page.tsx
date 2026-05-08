import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signalLabel, SIGNAL_COLORS } from '@/lib/intelligence'
import { markContactSentForm } from '../actions'

const CHANNEL: Record<string, { label: string; cls: string }> = {
  linkedin:  { label: 'LinkedIn',  cls: 'bg-blue-50 text-blue-700' },
  referral:  { label: 'Referral',  cls: 'bg-green-50 text-green-700' },
  cold:      { label: 'Cold',      cls: 'bg-slate-100 text-slate-500' },
  inbound:   { label: 'Inbound',   cls: 'bg-indigo-50 text-indigo-700' },
  event:     { label: 'Event',     cls: 'bg-amber-50 text-amber-700' },
  recruiter: { label: 'Recruiter', cls: 'bg-purple-50 text-purple-700' },
}

function fmtDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400_000)
}

export default async function ContactDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ sent?: string }>
}) {
  const { id } = await params
  const { sent } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const since30d = new Date(Date.now() - 30 * 86400_000).toISOString().split('T')[0]

  const [{ data: rawContact }, { data: followUps }, { data: recentBriefs }] = await Promise.all([
    supabase
      .from('contacts')
      .select('id, name, title, firm, channel, notes, email, linkedin_url, contacted_at, company_id, companies(id, name)')
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single(),
    supabase
      .from('follow_ups')
      .select('id, due_date, action, status')
      .eq('user_id', user.id)
      .eq('contact_id', id)
      .order('due_date', { ascending: false })
      .limit(10),
    supabase
      .from('briefs')
      .select('id, output_text, created_at')
      .eq('user_id', user.id)
      .eq('contact_id', id)
      .eq('type', 'outreach')
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  if (!rawContact) notFound()

  type ContactRow = typeof rawContact & {
    email?: string | null
    linkedin_url?: string | null
    companies: { id: string; name: string } | null
  }
  const contact = rawContact as unknown as ContactRow

  // Fetch company signals if linked
  let companySignals: { id: string; signal_type: string; signal_summary: string; signal_date: string }[] = []
  if (contact.company_id) {
    const { data: sigs } = await supabase
      .from('company_signals')
      .select('id, signal_type, signal_summary, signal_date')
      .eq('company_id', contact.company_id)
      .eq('user_id', user.id)
      .neq('signal_type', 'pattern_alert')
      .gte('signal_date', since30d)
      .order('signal_date', { ascending: false })
      .limit(5)
    companySignals = sigs ?? []
  }

  const ch = contact.channel
    ? (CHANNEL[contact.channel] ?? { label: contact.channel, cls: 'bg-slate-100 text-slate-500' })
    : null
  const companyName = (contact.companies as { name: string } | null)?.name ?? contact.firm ?? null
  const daysSinceContacted = daysSince(contact.contacted_at)
  const mostRecentSignal = companySignals[0] ?? null
  const pendingFollowUps = (followUps ?? []).filter(f => f.status === 'pending')

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link href="/dashboard/contacts" className="text-[13px] text-slate-300 hover:text-white transition-colors">
            Contacts
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Contact header */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white text-[16px] font-bold shrink-0">
                {contact.name[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-[22px] font-bold text-slate-900 leading-tight">{contact.name}</h1>
                {(contact.title || companyName) && (
                  <p className="text-[14px] text-slate-500 mt-0.5">
                    {[contact.title, companyName].filter(Boolean).join(' at ')}
                  </p>
                )}
              </div>
            </div>
            {ch && (
              <span className={`shrink-0 text-[10px] font-bold tracking-[0.06em] uppercase px-2.5 py-1 rounded-full ${ch.cls}`}>
                {ch.label}
              </span>
            )}
          </div>

          {/* Contact details row */}
          <div className="flex flex-wrap gap-4 text-[13px] text-slate-500 mb-4">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.3"/><path d="M1 4l6 4 6-4" stroke="currentColor" strokeWidth="1.3"/></svg>
                {contact.email}
              </a>
            )}
            {contact.linkedin_url && (
              <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4 6v4M4 4.5v.5M6.5 10V7.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                LinkedIn
              </a>
            )}
            {contact.contacted_at && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4v3l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                Last contacted {daysSinceContacted === 0 ? 'today' : `${daysSinceContacted}d ago`}
              </span>
            )}
            {!contact.contacted_at && (
              <span className="text-slate-400">Never contacted</span>
            )}
          </div>

          {contact.notes && (
            <p className="text-[13px] text-slate-500 bg-slate-50 rounded px-4 py-3 mb-4 leading-relaxed">
              {contact.notes}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={`/dashboard/contacts/${id}/outreach`}
              className="bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors"
            >
              Draft outreach
            </Link>
            <form action={markContactSentForm.bind(null, id, contact.name)}>
              <button
                type="submit"
                className="border border-slate-200 hover:border-slate-400 text-slate-700 text-[13px] font-semibold px-5 py-2.5 rounded transition-colors cursor-pointer bg-white"
              >
                Mark contacted
              </button>
            </form>
            {contact.linkedin_url && (
              <a
                href={contact.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-slate-200 hover:border-slate-400 text-slate-700 text-[13px] font-semibold px-5 py-2.5 rounded transition-colors"
              >
                View LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Mark contacted confirmation */}
        {sent === '1' && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-5 py-3 mb-5 text-[13px] text-green-700 font-medium">
            Marked as contacted. Follow-up scheduled for next week.
          </div>
        )}

        {/* Warm path alert */}
        {mostRecentSignal && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 mb-5">
            <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-amber-700 mb-2">
              Timing signal at {companyName}
            </div>
            <div className="flex items-start gap-3">
              <span className={[
                'shrink-0 text-[10px] font-bold tracking-[0.06em] uppercase px-2.5 py-1 rounded-full mt-0.5',
                SIGNAL_COLORS[mostRecentSignal.signal_type] ?? 'bg-slate-100 text-slate-600',
              ].join(' ')}>
                {signalLabel(mostRecentSignal.signal_type)}
              </span>
              <div>
                <p className="text-[14px] text-slate-700 leading-relaxed">{mostRecentSignal.signal_summary}</p>
                <p className="text-[12px] text-amber-600 mt-1 font-medium">
                  {fmtDate(mostRecentSignal.signal_date)} &mdash; strong moment to reach out
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/contacts/${id}/outreach`}
              className="mt-3 inline-block text-[12px] font-semibold text-amber-800 hover:text-amber-900 underline transition-colors"
            >
              Draft a message using this signal
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Pending follow-ups */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Follow-ups</span>
              {pendingFollowUps.length > 0 && (
                <span className="text-[11px] font-semibold text-red-600">{pendingFollowUps.length} pending</span>
              )}
            </div>
            {followUps && followUps.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {followUps.slice(0, 5).map(fu => (
                  <div key={fu.id} className="px-5 py-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={[
                        'text-[10px] font-bold tracking-[0.06em] uppercase px-2 py-0.5 rounded-full',
                        fu.status === 'done' ? 'bg-green-50 text-green-600' :
                        new Date(fu.due_date) < new Date() ? 'bg-red-50 text-red-600' :
                        'bg-slate-100 text-slate-500',
                      ].join(' ')}>
                        {fu.status === 'done' ? 'Done' : fmtDate(fu.due_date)}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-700">{fu.action}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-[13px] text-slate-400">
                No follow-ups yet. Draft an outreach to create one.
              </div>
            )}
          </div>

          {/* Company signals */}
          {contact.company_id && (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
                  {companyName} signals
                </span>
                {contact.company_id && (
                  <Link
                    href={`/dashboard/companies/${contact.company_id}`}
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    View company
                  </Link>
                )}
              </div>
              {companySignals.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {companySignals.map(sig => (
                    <div key={sig.id} className="px-5 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={[
                          'text-[10px] font-bold tracking-[0.06em] uppercase px-2 py-0.5 rounded-full',
                          SIGNAL_COLORS[sig.signal_type] ?? 'bg-slate-100 text-slate-600',
                        ].join(' ')}>
                          {signalLabel(sig.signal_type)}
                        </span>
                        <span className="text-[11px] text-slate-400">{fmtDate(sig.signal_date)}</span>
                      </div>
                      <p className="text-[13px] text-slate-700 leading-relaxed">{sig.signal_summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-8 text-center text-[13px] text-slate-400">
                  No signals in the last 30 days.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Recent outreach drafts */}
        {recentBriefs && recentBriefs.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mt-5">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Recent drafts</span>
              <Link href={`/dashboard/contacts/${id}/outreach`} className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors">
                Draft new
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {recentBriefs.map(b => (
                <div key={b.id} className="px-5 py-4">
                  <div className="text-[11px] text-slate-400 mb-1.5">{fmtDate(b.created_at)}</div>
                  <p className="text-[13px] text-slate-700 leading-relaxed line-clamp-3">{b.output_text.slice(0, 280)}{b.output_text.length > 280 ? '...' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
