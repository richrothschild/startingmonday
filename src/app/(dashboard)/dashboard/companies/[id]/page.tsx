import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateCompany, archiveCompany, addFollowUp, markFollowUpDone, addContact, archiveContact, addDocument, removeDocument } from './actions'
import { todayInTz } from '@/lib/date'
import { PREVIEW_CHARS } from '@/lib/ai-limits'
import { LogSignalForm } from '@/components/LogSignalForm'
import { ScanPoller } from '@/components/ScanPoller'
import {
  DOC_LABELS,
  CHANNEL,
  OUTREACH_STATUS,
  STAGES,
  NOTES_PLACEHOLDERS,
  type ScanResult,
  type InterviewLog,
  type SignalDetailRow,
} from './company-detail-constants'
import { JobScanPanel } from './job-scan-panel'
import { SignalsPanel } from './signals-panel'
import { InterviewSessionsPanel } from './interview-sessions-panel'
import { CompanyNextActionBanner } from './company-next-action-banner'
import { ContactsPanel } from './contacts-panel'
import { DocumentsPanel } from './documents-panel'

type CompanyDetailRow = {
  id: string
  name: string
  sector: string | null
  stage: string
  company_size: string | null
  fit_score: number | null
  notes: string | null
  competitive_context: string | null
  interview_notes: string | null
  company_url: string | null
  career_page_url: string | null
  linkedin_url: string | null
  crunchbase_id: string | null
  role_watch_description: string | null
  offer_role_title: string | null
  offer_base: number | null
  offer_bonus_pct: number | null
  offer_signing: number | null
  offer_equity: string | null
  offer_notes: string | null
  offer_decision_factors: string | null
}

function isMissingCompetitiveContextColumn(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false
  const msg = error.message?.toLowerCase() ?? ''
  return error.code === '42703' || (msg.includes('competitive_context') && msg.includes('does not exist'))
}

export default async function CompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; saved?: string; scanning?: string; stage_up?: string }>
}) {
  const { id } = await params
  const { error, saved, scanning, stage_up: stageUp } = await searchParams
  const isScanning = scanning === '1' && true

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const since90d = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: rawCompany, error: companyError } = await supabase
    .from('companies')
    .select('id, name, sector, stage, company_size, fit_score, notes, competitive_context, interview_notes, company_url, career_page_url, linkedin_url, crunchbase_id, role_watch_description, offer_role_title, offer_base, offer_bonus_pct, offer_signing, offer_equity, offer_notes, offer_decision_factors')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('archived_at', null)
    .single()

  const [{ data: followUps }, { data: contacts }, { data: profile }, { data: rawScans }, { data: documents }, { data: rawSignals }, { count: prepBriefCount }, { data: rawInterviewLogs }] = await Promise.all([
    supabase
      .from('follow_ups')
      .select('id, action, due_date, contact_id')
      .eq('company_id', id)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('due_date', { ascending: true }),
    supabase
      .from('contacts')
      .select('id, name, title, firm, channel, notes, outreach_status')
      .eq('company_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true }),
    supabase
      .from('user_profiles')
      .select('briefing_timezone, search_persona, target_titles, role_type')
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
    supabase
      .from('company_signals')
      .select('id, signal_type, signal_summary, outreach_angle, outreach_draft, signal_date, source_url')
      .eq('company_id', id)
      .eq('user_id', user.id)
      .gte('signal_date', since90d)
      .order('signal_date', { ascending: false })
      .limit(10),
    supabase
      .from('briefs')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', id)
      .eq('user_id', user.id)
      .eq('type', 'prep'),
    supabase
      .from('company_interview_logs')
      .select('id, interview_date, interview_stage, questions_asked, what_landed, what_surprised, follow_up_needed')
      .eq('company_id', id)
      .eq('user_id', user.id)
      .order('interview_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const company = rawCompany
    ? {
        ...(rawCompany as Omit<CompanyDetailRow, 'competitive_context'> & { competitive_context?: string | null }),
        competitive_context: companyHasCompetitiveContext
          ? ((rawCompany as { competitive_context?: string | null }).competitive_context ?? null)
          : null,
      } as CompanyDetailRow
    : null
  const signals = (rawSignals ?? []) as unknown as SignalDetailRow[]
  const scans = (rawScans ?? []) as unknown as ScanResult[]
  const latestScan = scans[0] ?? null
  const scanHistory = scans.slice(1)
  const interviewLogs = (rawInterviewLogs ?? []) as unknown as InterviewLog[]

  if (companyError && companyError.code !== 'PGRST116') {
    // PGRST116 = "no rows returned" - that's a real 404; anything else is a schema/query error
    console.error('[company page] query error:', companyError)
    throw new Error(`Failed to load company: ${companyError.message}`)
  }
  if (!company) notFound()

  const todayISO = todayInTz(profile?.briefing_timezone ?? 'UTC')
  const nextFollowUpByContact = new Map<string, { due_date: string; action: string }>()
  for (const fu of (followUps ?? [])) {
    if (fu.contact_id && !nextFollowUpByContact.has(fu.contact_id)) {
      nextFollowUpByContact.set(fu.contact_id, { due_date: fu.due_date, action: fu.action })
    }
  }

  const notesPlaceholder = (profile?.role_type ? NOTES_PLACEHOLDERS[profile.role_type] : null)
    ?? 'Warm intro through Sarah, strong culture fit...'

  const isVpUser = profile?.search_persona === 'vp'

  const errorMsg =
    error === 'duplicate' ? 'A company with that name is already in your pipeline.' :
    error === 'required'  ? 'Company name is required.' :
    null

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link
            href="/dashboard"
            className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <ScanPoller active={isScanning && !latestScan} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
          <div>
            <h1 className="text-[26px] font-bold text-slate-900 leading-tight">{company.name}</h1>
            {company.sector && (
              <p className="text-[13px] text-slate-500 mt-1.5">{company.sector}</p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={`/dashboard/profile/tailor?companyId=${id}`}
              className="text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 hover:border-slate-400 px-4 py-2 rounded transition-colors"
            >
              Tailor resume
            </Link>
            <Link
              href={`/dashboard/companies/${id}/prep?stage=informal_meeting`}
              className="text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 hover:border-slate-400 px-4 py-2 rounded transition-colors"
            >
              Conversation prep
            </Link>
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
          <section id="company-details" className="bg-white border border-slate-200 rounded p-5 sm:p-8">
            <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-5">
              Company details
            </h2>

            {errorMsg && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded text-[13px] text-red-700">
                {errorMsg}
              </div>
            )}
            {stageUp ? (
              <div className="mb-5 px-5 py-4 bg-green-50 border border-green-200 rounded flex items-center gap-4">
                <span className="text-[22px] leading-none">&#10003;</span>
                <div>
                  <p className="text-[14px] font-semibold text-green-900">
                    {company.name} moved to {
                      stageUp === 'researching'  ? 'Researching' :
                      stageUp === 'applied'       ? 'In Process' :
                      stageUp === 'interviewing'  ? 'Interviewing' :
                      stageUp === 'offer'         ? 'Offer' : stageUp
                    }.
                  </p>
                  <p className="text-[12px] text-green-700 mt-0.5">That is real progress.</p>
                </div>
              </div>
            ) : saved ? (
              <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded text-[13px] text-green-700">
                Changes saved.
              </div>
            ) : null}

            <div className="mb-5 bg-slate-50 border border-slate-200 rounded p-4">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-2">Current snapshot</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] text-slate-600">
                <p><span className="font-semibold text-slate-700">Stage:</span> {(STAGES.find((s) => s.value === company.stage)?.label) ?? company.stage}</p>
                <p><span className="font-semibold text-slate-700">Fit score:</span> {company.fit_score ?? 'Not set'}</p>
                <p><span className="font-semibold text-slate-700">Sector:</span> {company.sector ?? 'Not set'}</p>
                <p><span className="font-semibold text-slate-700">Size:</span> {company.company_size ?? 'Not set'}</p>
              </div>
            </div>

            <details className="border border-slate-200 rounded">
              <summary className="cursor-pointer list-none px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-slate-700">Edit company profile</span>
                <span className="text-[11px] text-slate-400">Open fields</span>
              </summary>

              <form action={updateCompany.bind(null, id)} className="flex flex-col gap-5 p-4 sm:p-5">

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    placeholder="-"
                    className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                  />
                  <p className="mt-1.5 text-[12px] text-slate-400">1 = weak fit &middot; 10 = dream company</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label htmlFor="edit_company_size" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                    Company size
                  </label>
                  <select
                    id="edit_company_size"
                    name="company_size"
                    defaultValue={company.company_size ?? ''}
                    className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400 bg-white"
                  >
                    <option value="">Unknown</option>
                    <option value="startup">Startup (under 200)</option>
                    <option value="midmarket">Mid-Market (200-2,000)</option>
                    <option value="enterprise">Enterprise (2,000+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                  Company website
                </label>
                <input
                  name="company_url"
                  type="text"
                  defaultValue={company.company_url ?? ''}
                  placeholder="acme.com or https://acme.com"
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
                <p className="mt-1.5 text-[12px] text-slate-400">Main URL &mdash; used to discover press room and leadership page</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                  Career page URL
                </label>
                <input
                  name="career_page_url"
                  type="text"
                  defaultValue={company.career_page_url ?? ''}
                  placeholder="acme.com/careers or https://acme.com/careers"
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
                <p className="mt-1.5 text-[12px] text-slate-400">Used in job scans &mdash; runs Mon / Wed / Fri</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                  LinkedIn company URL
                </label>
                <input
                  name="linkedin_url"
                  type="text"
                  defaultValue={company.linkedin_url ?? ''}
                  placeholder="linkedin.com/company/acme"
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
                <p className="mt-1.5 text-[12px] text-slate-400">Used to detect executive hires and departures</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                  Crunchbase permalink
                </label>
                <input
                  name="crunchbase_id"
                  type="text"
                  defaultValue={company.crunchbase_id ?? ''}
                  placeholder="e.g. acme-corp"
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
                <p className="mt-1.5 text-[12px] text-slate-400">Last segment of the Crunchbase URL &mdash; crunchbase.com/organization/<span className="font-medium text-slate-500">acme-corp</span>. Enables funding round signals.</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  defaultValue={company.notes ?? ''}
                  placeholder={notesPlaceholder}
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none"
                />
                <p className="mt-1.5 text-[11px] text-slate-400">Your notes are private. Only you can read them.</p>
              </div>

              {companyHasCompetitiveContext ? (
                <div className="pt-1 border-t border-slate-100">
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-orange-500 mb-2">Competitive Field</p>
                  <textarea
                    name="competitive_context"
                    rows={3}
                    defaultValue={company.competitive_context ?? ''}
                    placeholder="Known candidates, internal shortlist, search firm intel, who else they're considering..."
                    className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-400">Private. Used to sharpen your Win Thesis and pushback prep.</p>
                </div>
              ) : (
                <div className="pt-1 border-t border-slate-100">
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-orange-500 mb-2">Competitive Field</p>
                  <p className="text-[12px] text-slate-500 bg-slate-50 border border-slate-200 rounded px-3 py-2.5">
                    Competitive field is temporarily unavailable while schema updates finish.
                  </p>
                </div>
              )}

              <div className="pt-1 border-t border-slate-100">
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-orange-500 mb-2">Interview Notes</p>
                <textarea
                  name="interview_notes"
                  rows={5}
                  defaultValue={company.interview_notes ?? ''}
                  placeholder={'Add notes after each conversation. What was asked, what landed, what surprised you, who was in the room, what you want to prep differently next time.\n\nSeparate entries by stage or date - e.g. "Recruiter screen 5/7:" then "Hiring manager 5/14:"'}
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-y"
                />
                <p className="mt-1.5 text-[11px] text-slate-400">Private. Each entry sharpens your next prep brief based on what actually happened.</p>
              </div>

              {company.stage === 'offer' && (() => {
                const co = company as {
                  offer_role_title?: string | null
                  offer_base?: number | null
                  offer_bonus_pct?: number | null
                  offer_signing?: number | null
                  offer_equity?: string | null
                  offer_notes?: string | null
                  offer_decision_factors?: string | null
                }
                const base   = co.offer_base ?? 0
                const bonusPct = co.offer_bonus_pct ?? 0
                const bonusEst = base > 0 && bonusPct > 0 ? Math.round(base * bonusPct / 100) : null
                const totalCash = base > 0 ? base + (bonusEst ?? 0) : null
                const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
                return (
                  <div className="pt-1 border-t-2 border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-green-700">Offer in Hand</p>
                      {co.offer_role_title && (
                        <a
                          href={`/dashboard/salary?company=${encodeURIComponent(company.name)}&role=${encodeURIComponent(co.offer_role_title)}`}
                          className="text-[11px] font-semibold text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded transition-colors"
                        >
                          Get negotiation script &rarr;
                        </a>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-500 mb-1.5">Role title offered</label>
                        <input
                          name="offer_role_title"
                          type="text"
                          defaultValue={co.offer_role_title ?? ''}
                          placeholder="Chief Information Officer"
                          className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-500 mb-1.5">Base salary</label>
                        <input
                          name="offer_base"
                          type="number"
                          defaultValue={co.offer_base ?? ''}
                          placeholder="380000"
                          className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-500 mb-1.5">Target bonus %</label>
                        <input
                          name="offer_bonus_pct"
                          type="number"
                          min="0"
                          max="200"
                          defaultValue={co.offer_bonus_pct ?? ''}
                          placeholder="20"
                          className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                        />
                        {bonusEst !== null && (
                          <p className="mt-1 text-[11px] text-slate-400">{fmt(bonusEst)} at target</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-500 mb-1.5">Signing bonus</label>
                        <input
                          name="offer_signing"
                          type="number"
                          defaultValue={co.offer_signing ?? ''}
                          placeholder="50000"
                          className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-500 mb-1.5">Equity</label>
                      <input
                        name="offer_equity"
                        type="text"
                        defaultValue={co.offer_equity ?? ''}
                        placeholder="0.5% over 4 years, 1-year cliff; or RSUs $800K vesting over 4 years"
                        className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-500 mb-1.5">Offer notes</label>
                      <textarea
                        name="offer_notes"
                        rows={3}
                        defaultValue={co.offer_notes ?? ''}
                        placeholder="Deadline, conditions, what they said about flexibility, PTO, remote policy..."
                        className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-500 mb-1.5">Decision factors</label>
                      <textarea
                        name="offer_decision_factors"
                        rows={4}
                        defaultValue={co.offer_decision_factors ?? ''}
                        placeholder="Relocation required - moving family from Chicago. Partner career impact. Long-term ceiling vs current trajectory. Culture from the interviews. Manager quality. Commute. Industry pivot risk."
                        className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-y"
                      />
                      <div className="mt-1 text-[11px] text-slate-400">Everything the numbers do not capture. Private.</div>
                    </div>
                    {totalCash !== null && (
                      <div className="mt-3 px-4 py-3 bg-green-50 border border-green-200 rounded flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-green-800">Total cash (base + bonus at target)</span>
                        <span className="text-[16px] font-bold text-green-800">{fmt(totalCash)}</span>
                      </div>
                    )}
                    <div className="mt-2 text-[11px] text-slate-400">Private. Not shared or used in AI outputs.</div>
                  </div>
                )
              })()}

              <div className="pt-1 border-t border-slate-100">
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-orange-500 mb-2">What I&rsquo;m Looking For Here</p>
                <textarea
                  name="role_watch_description"
                  rows={3}
                  defaultValue={company.role_watch_description ?? ''}
                  placeholder="e.g. A CTO or VP Engineering role overseeing platform, specifically where they need someone to scale the team post-Series B and modernize the data stack..."
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none"
                />
                <p className="mt-1.5 text-[11px] text-slate-400">Used by the job scanner to match roles semantically, not just by keyword. More specific beats generic.</p>
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
            </details>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <form action={archiveCompany.bind(null, id)}>
                <button
                  type="submit"
                  className="text-[13px] font-semibold text-slate-500 hover:text-red-600 hover:border-red-200 border border-slate-200 rounded px-4 py-2 cursor-pointer bg-white transition-colors"
                >
                  Archive company
                </button>
              </form>
            </div>
          </section>

          {/* Follow-ups sidebar */}
          <div className="flex flex-col gap-4">

            <details className="bg-white border border-slate-200 rounded overflow-hidden">
              <summary className="cursor-pointer list-none px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Open Actions</span>
                <span className="text-[11px] text-slate-400">{(followUps ?? []).length}</span>
              </summary>
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
            </details>

          </div>
        </div>
        <CompanyNextActionBanner
          contacts={contacts ?? []}
          prepBriefCount={prepBriefCount ?? 0}
          stage={company.stage}
          interviewLogsLength={interviewLogs.length}
          companyName={company.name}
          companyId={id}
        />

        {/* Contacts */}
        <section id="people" className="mt-6 bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
              People
            </h2>
            <span className="text-[12px] text-slate-400">
              {(contacts ?? []).length} {(contacts ?? []).length === 1 ? 'contact' : 'contacts'}
            </span>
          </div>

          <ContactsPanel
            companyId={id}
            contacts={contacts ?? []}
            nextFollowUpByContact={nextFollowUpByContact}
            todayISO={todayISO}
          />
        </section>

        {/* Documents */}
        <details id="documents" className="mt-6 bg-white border border-slate-200 rounded overflow-hidden">
          <summary className="cursor-pointer list-none px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
                Documents
              </span>
              <div className="text-[12px] text-slate-400 mt-0.5">Job descriptions improve prep-brief quality.</div>
            </div>
            <span className="text-[12px] text-slate-400 shrink-0">
              {(documents ?? []).length} {(documents ?? []).length === 1 ? 'document' : 'documents'}
            </span>
          </summary>

          <DocumentsPanel companyId={id} documents={documents ?? []} previewChars={PREVIEW_CHARS} />
        </details>

        {/* Scan results */}
        <details id="job-scan" className="mt-6 bg-white border border-slate-200 rounded overflow-hidden">
          <summary className="cursor-pointer list-none px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
              Job Scan
            </h2>
            {latestScan ? (
              <span className="text-[12px] text-slate-400">
                Last scanned {new Date(latestScan.scanned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ) : (
              <span className="text-[12px] text-slate-400">Scans run Mon / Wed / Fri</span>
            )}
          </summary>

          <JobScanPanel
            latestScan={latestScan}
            isScanning={isScanning}
            careerPageUrl={company.career_page_url}
            isVpUser={isVpUser}
            scanHistory={scanHistory}
          />
        </details>

        {/* Signals */}
        <details id="signals" className="mt-6 bg-white border border-slate-200 rounded overflow-hidden">
          <summary className="cursor-pointer list-none px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
              Company Signals
            </h2>
            <LogSignalForm companyId={company.id} />
          </summary>

          <SignalsPanel signals={signals} />
        </details>

        {/* Interview Logs */}
        <details id="interview-sessions" className="mt-6 bg-white border border-slate-200 rounded overflow-hidden">
          <summary className="cursor-pointer list-none px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
                Interview Sessions
              </h2>
              <p className="text-[12px] text-slate-400 mt-0.5">Each session sharpens the next prep brief.</p>
            </div>
            <span className="text-[12px] text-slate-400 shrink-0">
              {interviewLogs.length} {interviewLogs.length === 1 ? 'session' : 'sessions'}
            </span>
          </summary>

          <InterviewSessionsPanel companyId={id} interviewLogs={interviewLogs} todayISO={todayISO} />
        </details>

      </main>
    </div>
  )
}
