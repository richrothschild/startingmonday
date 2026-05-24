import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '../logout-button'
import { addSignalFollowUp, generateSignalOutreach } from './actions'
import { DraftPanel } from '@/components/DraftPanel'
import { SignalOutreachGate } from '@/components/SignalOutreachGate'
import { captureServerEvent } from '@/lib/posthog-server'
import { logEvent } from '@/lib/events'

const PAGE_SIZE = 25

const SIGNAL_TYPE_LABELS: Record<string, string> = {
  funding:        'Funding',
  exec_departure: 'Exec Departure',
  exec_hire:      'Exec Hire',
  acquisition:    'Acquisition',
  expansion:      'Expansion',
  layoffs:        'Layoffs',
  ipo:            'IPO',
  new_product:    'New Product',
  award:          'Award',
}

export const metadata = { title: 'Signals - Starting Monday' }

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string; type?: string; page?: string }>
}) {
  const { company: companyFilter, type: typeFilter, page: pageParam } = await searchParams
  const page = Math.max(0, parseInt(pageParam ?? '0', 10) || 0)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .single()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .eq('user_id', user.id)
    .is('archived_at', null)
    .order('name', { ascending: true })

  let query = supabase
    .from('company_signals')
    .select('id, signal_type, signal_summary, outreach_angle, outreach_draft, signal_date, source_url, company_id, companies(id, name)', { count: 'planned' })
    .eq('user_id', user.id)
    .order('signal_date', { ascending: false })

  if (companyFilter) query = query.eq('company_id', companyFilter)
  if (typeFilter) query = query.eq('signal_type', typeFilter)

  const start = page * PAGE_SIZE
  query = query.range(start, start + PAGE_SIZE - 1)

  const { data: signals, count } = await query

  if ((count ?? 0) > 0) {
    captureServerEvent(user.id, 'signals_page_viewed', { signal_count: count ?? 0, page })
    await logEvent(user.id, 'signals_page_viewed', { signal_count: count ?? 0, page })
  }

  // Fetch first active contact per company for "Draft outreach" links
  const signalCompanyIds = [...new Set((signals ?? []).map(s => s.company_id).filter(Boolean))]
  const contactByCompany = new Map<string, { id: string; name: string }>()
  if (signalCompanyIds.length > 0) {
    const { data: contactRows } = await supabase
      .from('contacts')
      .select('id, name, company_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .in('company_id', signalCompanyIds)
      .order('name')
    for (const c of (contactRows ?? [])) {
      if (c.company_id && !contactByCompany.has(c.company_id)) {
        contactByCompany.set(c.company_id, { id: c.id, name: c.name })
      }
    }
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
  const hasFilters = !!(companyFilter || typeFilter)

  type Signal = {
    id: string
    signal_type: string
    signal_summary: string
    outreach_angle: string | null
    outreach_draft: { subject: string; body: string } | null
    signal_date: string
    source_url: string | null
    company_id: string
    companies: { id: string; name: string } | null
  }

  // Warm signals (companies with a known contact) float to the top; date order preserved within each group
  const signalList = ((signals ?? []) as unknown as Signal[]).sort(
    (a, b) => (contactByCompany.has(a.company_id) ? 0 : 1) - (contactByCompany.has(b.company_id) ? 0 : 1)
  )

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams()
    if (params.company) sp.set('company', params.company)
    if (params.type) sp.set('type', params.type)
    if (params.page && params.page !== '0') sp.set('page', params.page)
    const qs = sp.toString()
    return `/dashboard/signals${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400"><span className="text-white">Starting </span><span className="text-orange-500">Monday</span></span>
          <div className="hidden sm:flex items-center gap-5">
            <Link href="/dashboard/chat" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors">Chat</Link>
            <Link href="/dashboard/contacts" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors">Contacts</Link>
            <Link href="/dashboard/help" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors">Help</Link>
            <Link href="/dashboard/profile" className="text-[13px] text-slate-300 hover:text-white transition-colors">{profile?.full_name ?? user.email}</Link>
            <Link href="/settings/billing" className="text-[13px] text-slate-300 hover:text-white transition-colors">Billing</Link>
            <LogoutButton label="Sign out" />
          </div>
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex min-h-[44px] items-center rounded-md border border-slate-700 px-3 text-[12px] font-semibold text-slate-200 hover:text-white hover:border-slate-500"
            >
              Dashboard
            </Link>
            <LogoutButton label="Sign out" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-10">
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-slate-900">Company Signals</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              {count ?? 0} signal{(count ?? 0) !== 1 ? 's' : ''} detected
            </p>
          </div>
          <Link href="/dashboard" className="ml-auto text-[13px] text-slate-500 hover:text-slate-700">
            ← Dashboard
          </Link>
        </div>

        {/* Filters */}
        <form method="GET" className="flex flex-wrap gap-3 mb-6">
          <label className="sr-only">Filter by company</label>
          <select
            name="company"
            aria-label="Filter by company"
            defaultValue={companyFilter ?? ''}
            className="text-[13px] border border-slate-200 rounded px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="">All companies</option>
            {(companies ?? []).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <label className="sr-only">Filter by type</label>
          <select
            name="type"
            aria-label="Filter by type"
            defaultValue={typeFilter ?? ''}
            className="text-[13px] border border-slate-200 rounded px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="">All types</option>
            {Object.entries(SIGNAL_TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          <button
            type="submit"
            className="text-[13px] font-semibold text-slate-700 border border-slate-200 bg-white rounded px-3 py-1.5 hover:bg-slate-50 cursor-pointer"
          >
            Filter
          </button>

          {hasFilters && (
            <Link
              href="/dashboard/signals"
              className="text-[13px] text-slate-400 hover:text-slate-600 py-1.5"
            >
              Clear
            </Link>
          )}
        </form>

        {/* Signal list */}
        {signalList.length > 0 && (
          <p className="text-[12px] text-slate-400 italic mb-4 leading-relaxed">
            Use signals as a reason to reconnect with someone who already knows you. Cold outreach on a signal rarely lands at the executive level.
          </p>
        )}
        {signalList.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded p-10 text-center">
            <p className="text-[14px] text-slate-500">
              {hasFilters ? 'No signals match your filters.' : 'No signals yet. Signals are detected when the scanner runs (Mon, Wed, Fri).'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-amber-200 rounded overflow-hidden mb-6">
            <div className="divide-y divide-slate-100">
              {signalList.map(sig => {
                const co = sig.companies
                const dateLabel = new Date(sig.signal_date + 'T12:00:00Z').toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })
                const typeLabel = SIGNAL_TYPE_LABELS[sig.signal_type] ?? sig.signal_type.replace(/_/g, ' ')

                const contact = contactByCompany.get(sig.company_id)

                return (
                  <div key={sig.id} className="px-6 py-5">
                    <div className="flex items-start gap-2 flex-wrap mb-2">
                      {co && (
                        <Link
                          href={`/dashboard/companies/${co.id}`}
                          className="text-[14px] font-semibold text-slate-900 hover:text-slate-600"
                        >
                          {co.name}
                        </Link>
                      )}
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                        {typeLabel}
                      </span>
                      <span className="text-[12px] text-slate-400 ml-auto">{dateLabel}</span>
                    </div>
                    <p className="text-[13px] text-slate-700 leading-relaxed mb-2">{sig.signal_summary}</p>
                    {sig.outreach_angle && (
                      <details className="group">
                        <summary className="text-[12px] text-amber-700 font-semibold cursor-pointer list-none hover:text-amber-900">
                          Outreach angle ↓
                        </summary>
                        <p className="text-[12px] text-slate-500 italic mt-1.5 leading-relaxed">{sig.outreach_angle}</p>
                      </details>
                    )}
                    {sig.outreach_draft && (
                      <DraftPanel draft={sig.outreach_draft} />
                    )}
                    {sig.source_url && (
                      <a
                        href={sig.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-[11px] text-slate-400 hover:text-slate-600 underline"
                      >
                        Source →
                      </a>
                    )}
                    <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-50">
                      <div className="flex items-center gap-3 flex-wrap">
                        {contact ? (
                          <Link
                            href={`/dashboard/contacts/${contact.id}/outreach`}
                            className="text-[12px] font-semibold text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded transition-colors"
                          >
                            Draft outreach → {contact.name}
                          </Link>
                        ) : co ? (
                          <>
                            <Link
                              href={`/dashboard/contacts/new?company_id=${co.id}`}
                              className="text-[12px] font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded transition-colors"
                            >
                              + Add contact at {co.name}
                            </Link>
                            <Link
                              href={`/dashboard/companies/${co.id}/prep?stage=informal_meeting`}
                              className="text-[12px] font-semibold text-slate-400 hover:text-slate-600 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded transition-colors"
                            >
                              Prep a conversation
                            </Link>
                          </>
                        ) : null}
                        <form action={addSignalFollowUp}>
                          <input type="hidden" name="company_name" value={co?.name ?? ''} />
                          <input type="hidden" name="signal_summary" value={sig.signal_summary} />
                          <button
                            type="submit"
                            className="text-[12px] font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded transition-colors bg-white cursor-pointer"
                          >
                            + Follow up in 5 days
                          </button>
                        </form>
                      </div>
                      {!sig.outreach_draft && (
                        <SignalOutreachGate
                          signalId={sig.id}
                          companyName={co?.name ?? null}
                          action={generateSignalOutreach}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Link
              href={page > 0 ? buildUrl({ company: companyFilter, type: typeFilter, page: String(page - 1) }) : '#'}
              className={`text-[13px] font-semibold px-4 py-2 rounded border border-slate-200 bg-white hover:bg-slate-50 ${page === 0 ? 'opacity-40 pointer-events-none' : ''}`}
            >
              ← Previous
            </Link>
            <span className="text-[12px] text-slate-400">
              Page {page + 1} of {totalPages}
            </span>
            <Link
              href={page < totalPages - 1 ? buildUrl({ company: companyFilter, type: typeFilter, page: String(page + 1) }) : '#'}
              className={`text-[13px] font-semibold px-4 py-2 rounded border border-slate-200 bg-white hover:bg-slate-50 ${page >= totalPages - 1 ? 'opacity-40 pointer-events-none' : ''}`}
            >
              Next →
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
