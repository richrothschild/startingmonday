import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateCompany, archiveCompany, addFollowUp, markFollowUpDone, addContact, archiveContact, addDocument, removeDocument } from './actions'
import { todayInTz } from '@/lib/date'
import { PREVIEW_CHARS } from '@/lib/ai-limits'

type RawHit = {
  title: string
  score: number
  is_match: boolean
  summary: string
  is_new: boolean
}

type ScanResult = {
  id: string
  scanned_at: string
  status: string
  ai_score: number
  ai_summary: string | null
  raw_hits: RawHit[] | null
  error_message: string | null
}

const DOC_LABELS: Record<string, { label: string; cls: string }> = {
  job_description: { label: 'Job Description', cls: 'bg-purple-50 text-purple-700' },
  news:            { label: 'News & Press',     cls: 'bg-blue-50 text-blue-700' },
  annual_report:   { label: 'Annual Report',    cls: 'bg-amber-50 text-amber-700' },
  org_notes:       { label: 'Org Notes',        cls: 'bg-green-50 text-green-700' },
  other:           { label: 'Other',            cls: 'bg-slate-100 text-slate-500' },
}

const CHANNEL: Record<string, { label: string; cls: string }> = {
  linkedin: { label: 'LinkedIn',  cls: 'bg-blue-50 text-blue-700' },
  referral: { label: 'Referral',  cls: 'bg-green-50 text-green-700' },
  cold:     { label: 'Cold',      cls: 'bg-slate-100 text-slate-500' },
  inbound:  { label: 'Inbound',   cls: 'bg-indigo-50 text-indigo-700' },
  event:    { label: 'Event',     cls: 'bg-amber-50 text-amber-700' },
}

const STAGES = [
  { value: 'watching',     label: 'Watching' },
  { value: 'researching',  label: 'Researching' },
  { value: 'applied',      label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer',        label: 'Offer' },
]

export default async function CompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; saved?: string }>
}) {
  const { id } = await params
  const { error, saved } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: company }, { data: followUps }, { data: contacts }, { data: profile }, { data: rawScans }, { data: documents }] = await Promise.all([
    supabase
      .from('companies')
      .select('id, name, sector, stage, fit_score, notes, career_page_url')
      .eq('id', id)
      .eq('user_id', user.id)
      .is('archived_at', null)
      .single(),
    supabase
      .from('follow_ups')
      .select('id, action, due_date')
      .eq('company_id', id)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('due_date', { ascending: true }),
    supabase
      .from('contacts')
      .select('id, name, title, firm, channel, notes')
      .eq('company_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true }),
    supabase
      .from('user_profiles')
      .select('briefing_timezone')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('scan_results')
      .select('id, scanned_at, status, ai_score, ai_summary, raw_hits, error_message')
      .eq('company_id', id)
      .eq('user_id', user.id)
      .order('scanned_at', { ascending: false })
      .limit(6),
    supabase
      .from('company_documents')
      .select('id, label, content, created_at')
      .eq('company_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
  ])

  const scans = (rawScans ?? []) as unknown as ScanResult[]
  const latestScan = scans[0] ?? null
  const scanHistory = scans.slice(1)

  if (!company) notFound()

  const todayISO = todayInTz(profile?.briefing_timezone ?? 'UTC')

  const errorMsg =
    error === 'duplicate' ? 'A company with that name is already in your pipeline.' :
    error === 'required'  ? 'Company name is required.' :
    null

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
          <Link
            href="/dashboard"
            className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[26px] font-bold text-slate-900 leading-tight">{company.name}</h1>
            {company.sector && (
              <p className="text-[13px] text-slate-500 mt-1.5">{company.sector}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {(documents ?? []).some(d => d.label === 'job_description') && (
              <Link
                href={`/dashboard/profile/tailor?companyId=${id}`}
                className="text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 hover:border-slate-400 px-4 py-2 rounded transition-colors"
              >
                Tailor resume
              </Link>
            )}
            <Link
              href={`/dashboard/companies/${id}/prep`}
              className="text-[13px] font-semibold text-slate-900 bg-white border border-slate-200 hover:border-slate-400 px-4 py-2 rounded transition-colors"
            >
              Interview prep
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* Edit form */}
          <div className="bg-white border border-slate-200 rounded p-8">
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-5">
              Company details
            </div>

            {errorMsg && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded text-[13px] text-red-700">
                {errorMsg}
              </div>
            )}
            {saved && (
              <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded text-[13px] text-green-700">
                Changes saved.
              </div>
            )}

            <form action={updateCompany.bind(null, id)} className="flex flex-col gap-5">

              <div>
                <label htmlFor="company-name" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                  Company name <span className="text-red-500">*</span>
                </label>
                <input
                  id="company-name"
                  name="name"
                  type="text"
                  required
                  defaultValue={company.name}
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stage" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                    Stage
                  </label>
                  <select
                    id="stage"
                    name="stage"
                    defaultValue={company.stage}
                    className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400 bg-white"
                  >
                    {STAGES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                    Fit score <span className="text-slate-300 font-normal">(1–10)</span>
                  </label>
                  <input
                    name="fit_score"
                    type="number"
                    min="1"
                    max="10"
                    defaultValue={company.fit_score ?? ''}
                    placeholder="—"
                    className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                  Sector
                </label>
                <input
                  name="sector"
                  type="text"
                  defaultValue={company.sector ?? ''}
                  placeholder="e.g. Healthcare, Fintech"
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                  Career page URL
                </label>
                <input
                  name="career_page_url"
                  type="url"
                  defaultValue={company.career_page_url ?? ''}
                  placeholder="https://acme.com/careers"
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  defaultValue={company.notes ?? ''}
                  placeholder="Warm intro through Sarah, strong culture fit…"
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="bg-slate-900 text-white text-[14px] font-semibold px-6 py-2.5 rounded cursor-pointer border-0"
                >
                  Save changes
                </button>
              </div>

            </form>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <form action={archiveCompany.bind(null, id)}>
                <button
                  type="submit"
                  className="text-[13px] text-slate-400 hover:text-red-600 cursor-pointer bg-transparent border-0 p-0"
                >
                  Archive company
                </button>
              </form>
            </div>
          </div>

          {/* Follow-ups sidebar */}
          <div className="flex flex-col gap-4">

            <div className="bg-white border border-slate-200 rounded overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
                  Open Actions
                </span>
              </div>
              {followUps && followUps.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {followUps.map(fu => {
                    const isOverdue = fu.due_date < todayISO
                    const isToday = fu.due_date === todayISO
                    const dateLabel = isToday
                      ? 'Today'
                      : new Date(fu.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    return (
                      <div key={fu.id} className="px-5 py-3.5">
                        <div className="text-[13px] font-semibold text-slate-900 mb-1.5">{fu.action}</div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[12px] font-semibold ${isOverdue || isToday ? 'text-red-600' : 'text-slate-400'}`}>
                            {dateLabel}
                          </span>
                          <form action={markFollowUpDone.bind(null, fu.id, id)}>
                            <button
                              type="submit"
                              className="text-[11px] text-slate-400 border border-slate-200 rounded px-2.5 py-0.5 hover:border-slate-400 hover:text-slate-700 cursor-pointer bg-transparent"
                            >
                              Done
                            </button>
                          </form>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="px-5 py-6 text-[13px] text-slate-400">
                  No open actions.
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded p-5">
              <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
                Add action
              </div>
              <form action={addFollowUp.bind(null, id)} className="flex flex-col gap-3">
                <input
                  name="action"
                  type="text"
                  required
                  placeholder="Send follow-up email…"
                  className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
                <input
                  name="due_date"
                  type="date"
                  required
                  aria-label="Due date"
                  defaultValue={todayISO}
                  className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-slate-400"
                />
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white text-[13px] font-semibold py-2 rounded cursor-pointer border-0"
                >
                  Add
                </button>
              </form>
            </div>

          </div>
        </div>
        {/* Contacts */}
        <div className="mt-6 bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
              People
            </span>
            <span className="text-[12px] text-slate-400">
              {(contacts ?? []).length} {(contacts ?? []).length === 1 ? 'contact' : 'contacts'}
            </span>
          </div>

          {contacts && contacts.length > 0 && (
            <div className="divide-y divide-slate-50">
              {contacts.map(ct => {
                const ch = ct.channel ? (CHANNEL[ct.channel] ?? { label: ct.channel, cls: 'bg-slate-100 text-slate-500' }) : null
                return (
                  <div key={ct.id} className="px-6 py-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-semibold text-slate-900">{ct.name}</span>
                        {ct.title && (
                          <span className="text-[13px] text-slate-400">{ct.title}{ct.firm ? ` · ${ct.firm}` : ''}</span>
                        )}
                        {ch && (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.04em] ${ch.cls}`}>
                            {ch.label}
                          </span>
                        )}
                      </div>
                      {ct.notes && (
                        <p className="text-[12px] text-slate-400 mt-1 truncate max-w-xl">{ct.notes}</p>
                      )}
                    </div>
                    <form action={archiveContact.bind(null, ct.id, id)}>
                      <button
                        type="submit"
                        className="text-[11px] text-slate-300 hover:text-red-500 cursor-pointer bg-transparent border-0 p-0 shrink-0"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add contact form */}
          <div className="px-6 py-5 border-t border-slate-100 bg-slate-50">
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
              Add person
            </div>
            <form id="add-contact-form" action={addContact.bind(null, id)} className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Jane Smith"
                    className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
                    Title
                  </label>
                  <input
                    name="title"
                    type="text"
                    placeholder="VP Engineering"
                    className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="channel" className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
                    Channel
                  </label>
                  <select
                    id="channel"
                    name="channel"
                    className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-slate-400 bg-white"
                  >
                    <option value="">—</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="referral">Referral</option>
                    <option value="cold">Cold</option>
                    <option value="inbound">Inbound</option>
                    <option value="event">Event</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
                  Notes
                </label>
                <input
                  name="notes"
                  type="text"
                  placeholder="Met at SaaStr, warm connection…"
                  className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 bg-white"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="bg-slate-900 text-white text-[13px] font-semibold px-5 py-2 rounded cursor-pointer border-0"
                >
                  Add person
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Documents */}
        <div className="mt-6 bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
              Documents
            </span>
            <span className="text-[12px] text-slate-400">
              {(documents ?? []).length} {(documents ?? []).length === 1 ? 'document' : 'documents'} · used in interview prep
            </span>
          </div>

          {(documents ?? []).length > 0 && (
            <div className="divide-y divide-slate-50">
              {(documents ?? []).map(doc => {
                const dl = DOC_LABELS[doc.label] ?? { label: doc.label, cls: 'bg-slate-100 text-slate-500' }
                return (
                  <div key={doc.id} className="px-6 py-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.04em] ${dl.cls}`}>
                          {dl.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-400 leading-relaxed line-clamp-2">
                        {doc.content.slice(0, PREVIEW_CHARS)}{doc.content.length > PREVIEW_CHARS ? '…' : ''}
                      </p>
                    </div>
                    <form action={removeDocument.bind(null, doc.id, id)}>
                      <button
                        type="submit"
                        className="text-[11px] text-slate-300 hover:text-red-500 cursor-pointer bg-transparent border-0 p-0 shrink-0"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                )
              })}
            </div>
          )}

          <div className="px-6 py-5 border-t border-slate-100 bg-slate-50">
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
              Add document
            </div>
            <form action={addDocument.bind(null, id)} className="flex flex-col gap-3">
              <div>
                <label htmlFor="doc-label" className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
                  Type
                </label>
                <select
                  id="doc-label"
                  name="label"
                  className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-slate-400 bg-white"
                >
                  <option value="job_description">Job Description</option>
                  <option value="news">News & Press</option>
                  <option value="annual_report">Annual Report</option>
                  <option value="org_notes">Org Notes</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="doc-content" className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="doc-content"
                  name="content"
                  required
                  rows={7}
                  placeholder="Paste a job description, news article, annual report excerpt, or org notes…"
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none bg-white leading-relaxed"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="bg-slate-900 text-white text-[13px] font-semibold px-5 py-2 rounded cursor-pointer border-0"
                >
                  Save document
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Scan results */}
        <div className="mt-6 bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
              Job Scan
            </span>
            {latestScan ? (
              <span className="text-[12px] text-slate-400">
                Last scanned {new Date(latestScan.scanned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ) : (
              <span className="text-[12px] text-slate-400">Scans run Mon / Wed / Fri</span>
            )}
          </div>

          {!latestScan ? (
            <div className="px-6 py-10 text-center text-[14px] text-slate-400">
              No scans yet.{company.career_page_url ? ' Results will appear after the next scheduled scan.' : ' Add a career page URL above to enable scanning.'}
            </div>
          ) : latestScan.status === 'blocked' ? (
            <div className="px-6 py-6">
              <p className="text-[13px] font-semibold text-slate-600 mb-1">Career page blocks automated scanning</p>
              <p className="text-[13px] text-slate-400">This site actively blocks bots (common with government and Cloudflare-protected sites). Paste job listings manually via the Documents section above — they'll be used in your interview prep brief.</p>
            </div>
          ) : latestScan.status === 'error' ? (
            <div className="px-6 py-6 text-[13px] text-red-600">
              Last scan failed: {latestScan.error_message ?? 'Unknown error'}
            </div>
          ) : (
            <div>
              {/* Latest scan summary */}
              <div className="px-6 py-5 border-b border-slate-50">
                <div className="flex items-center gap-3 mb-3">
                  {latestScan.ai_score >= 60 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      {latestScan.ai_score} match score
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                      No matches
                    </span>
                  )}
                </div>
                {latestScan.ai_summary && (
                  <p className="text-[13px] text-slate-500">{latestScan.ai_summary}</p>
                )}
              </div>

              {/* Matched roles */}
              {(latestScan.raw_hits ?? []).filter(h => h.is_match).length > 0 && (
                <div className="divide-y divide-slate-50">
                  {(latestScan.raw_hits ?? []).filter(h => h.is_match).map((hit, i) => (
                    <div key={i} className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[14px] font-semibold text-slate-900">{hit.title}</span>
                        <span className="text-[11px] font-bold text-slate-400">{hit.score}</span>
                        {hit.is_new && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                            New
                          </span>
                        )}
                      </div>
                      {hit.summary && (
                        <p className="text-[12px] text-slate-400">{hit.summary}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Scan history */}
              {scanHistory.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-50 flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mr-1">
                    History
                  </span>
                  {scanHistory.map(s => (
                    <span
                      key={s.id}
                      title={new Date(s.scanned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      className={`w-2 h-2 rounded-full inline-block ${s.ai_score >= 60 ? 'bg-emerald-400' : s.status === 'error' ? 'bg-red-300' : 'bg-slate-200'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
