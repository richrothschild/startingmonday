import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OutreachHubClient } from './outreach-hub-client'
import { getStaffMember } from '@/lib/staff'
import {
  buildExecutiveCompanySizeLookup,
  buildExecutiveFitLookup,
  buildStandardizedDraft,
  ClientRow,
  ContactStatusRow,
  combineExecutiveSources,
  executivePersonaFit,
  inferEmailConfidence,
  mergeFirstTouch,
  normalizeFitTier,
  normalizeStatus,
  dedupeOutreachRows,
  followUpSentByEmail,
  prioritizeCuratedRows,
  readOutreachCsv,
  statusByEmail,
} from './outreach-data'

export const metadata = {
  title: 'Outreach Hub - Starting Monday',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

function normalizeEmail(value: unknown): string {
  return (value ?? '').toString().trim().toLowerCase()
}

export default async function OutreachHubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const buildVersion = (process.env.RAILWAY_GIT_COMMIT_SHA
    ?? process.env.VERCEL_GIT_COMMIT_SHA
    ?? process.env.GITHUB_SHA
    ?? process.env.NEXT_PUBLIC_BUILD_SHA
    ?? 'local').slice(0, 8)
  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const [executiveRaw, executiveStrict100, executiveStrict50, executiveStrict31, executiveStrict21, executiveBatch1, executiveBatch1Strict, executiveBatch2Strict, executiveBatch3Personalized, executiveBatch4Personalized, apolloSendReady, apolloFollowups, executiveTargetSlate, firstTouch, searchFirmRaw, coachRaw, outplacementRaw, searchFirmCurated, coachCurated, day1CoachTargetList, rawContactStatuses, rawCoachSentLogs] = await Promise.all([
    readOutreachCsv('executives_prospecting_midmarket_strong_medium.csv'),
    readOutreachCsv('prospecting_combined_strict_100.csv'),
    readOutreachCsv('prospecting_combined_strict_50_personalized.csv'),
    readOutreachCsv('prospecting_combined_strict_31_personalized.csv'),
    readOutreachCsv('prospecting_combined_strict_21_personalized.csv'),
    readOutreachCsv('prospecting_batch_001.csv'),
    readOutreachCsv('prospecting_batch_001_strict_roles.csv'),
    readOutreachCsv('prospecting_batch_002_strict_roles.csv'),
    readOutreachCsv('prospecting_batch_003_personalized_real_10.csv'),
    readOutreachCsv('prospecting_batch_004_personalized_real_19.csv'),
    readOutreachCsv('apollo_priority_send_ready.csv'),
    readOutreachCsv('apollo_priority_followups.csv'),
    readOutreachCsv('us-senior-executive-target-slate.csv'),
    readOutreachCsv('send_ready_emails_first_10.csv'),
    readOutreachCsv('search_firms_prospecting_100.csv'),
    readOutreachCsv('coaches_prospecting_100.csv'),
    readOutreachCsv('outplacement_firms_prospecting_100.csv'),
    readOutreachCsv('search_firms_prospecting_curated_top25.csv'),
    readOutreachCsv('coaches_prospecting_curated_top25.csv'),
    readOutreachCsv('day1_coach_target_list_60.csv'),
    supabase
      .from('contacts')
      .select('email, outreach_status')
      .eq('user_id', user.id)
      .eq('status', 'active'),
    (supabase as any)
      .from('outreach_logs')
      .select('recipient_email, delivery_status, sent_at')
      .eq('user_id', user.id)
      .eq('outreach_channel', 'coaches')
      .eq('send_mode', 'live')
      .not('recipient_email', 'is', null)
      .not('sent_at', 'is', null),
  ])
  const executiveUniverse = combineExecutiveSources([
    executiveRaw,
    executiveStrict100,
    executiveStrict50,
    executiveStrict31,
    executiveStrict21,
    executiveBatch1,
    executiveBatch1Strict,
    executiveBatch2Strict,
    executiveBatch3Personalized,
    executiveBatch4Personalized,
    apolloSendReady,
    apolloFollowups,
  ])
  const executives = mergeFirstTouch(executiveUniverse, firstTouch)
  const executiveFitLookup = buildExecutiveFitLookup(executiveTargetSlate.rows)
  const executiveCompanySizeLookup = buildExecutiveCompanySizeLookup(executiveTargetSlate.rows)
  const prioritizedSearchFirms = prioritizeCuratedRows(searchFirmRaw, searchFirmCurated)
  const prioritizedCoaches = prioritizeCuratedRows(coachRaw, coachCurated)
  const sentCoachRows = (rawCoachSentLogs?.data ?? []) as Array<{ recipient_email: string | null; delivery_status: string | null; sent_at: string | null }>
  const sentCoachEmails = new Set(
    sentCoachRows
      .filter((row) => row.delivery_status !== 'send_failed' && !!row.sent_at)
      .map((row) => normalizeEmail(row.recipient_email)),
  )

  const day1CoachRows: ClientRow[] = day1CoachTargetList.rows.reduce<ClientRow[]>((acc, row) => {
    const fullName = (row.full_name ?? '').trim()
    const email = (row.email ?? '').trim().toLowerCase()
    if (!fullName || !email) return acc

    const coachRole = (row.title ?? '').trim() || 'Executive Coach'
    const coachFocus = (row.persona ?? '').trim() || 'Executive transitions'
    const draft = buildStandardizedDraft(
      {
        ...row,
        role_bucket: coachRole,
        persona_focus: coachFocus,
      },
      'coaches',
      { forceTemplate: true },
    )

    acc.push({
      fullName,
      roleBucket: row.title ?? 'Executive Coach',
      company: row.company ?? '',
      email,
      emailConfidence: inferEmailConfidence(row),
      status: normalizeStatus(row.status),
      followUpSent: false,
      emailOpening: row.email_opening ?? '',
      emailBodyCore: draft.body,
      defaultSubject: draft.subject,
      defaultBody: draft.body,
      outreachChannel: 'coaches' as const,
      fitTier: 'strong',
      personaFocus: 'Executive transition coaches in the Day 1 sprint target batch',
      campaignTag: 'coach_day1_60' as const,
    })

    return acc
  }, [])

  const mappedStatuses = statusByEmail((rawContactStatuses.data ?? []) as ContactStatusRow[])
  const mappedFollowUpSent = followUpSentByEmail((rawContactStatuses.data ?? []) as ContactStatusRow[])
  const executivePersonaRows: ClientRow[] = executives.rows
    .map((row): ClientRow | null => {
      const personaFit = executivePersonaFit(row, executiveFitLookup, executiveCompanySizeLookup)
      if (!personaFit) return null
      const standardizedDraft = buildStandardizedDraft(row, 'executives', { forceTemplate: true })

      return {
        fullName: row.full_name ?? '',
        roleBucket: row.role_bucket ?? 'Executive',
        company: row.company ?? '',
        email: (row.email_guess ?? row.email ?? '').trim().toLowerCase(),
        emailConfidence: inferEmailConfidence(row),
        status: normalizeStatus(row.status),
        followUpSent: false,
        emailOpening: row.email_opening ?? '',
        emailBodyCore: row.email_body_core ?? '',
        defaultSubject: standardizedDraft.subject,
        defaultBody: standardizedDraft.body,
        outreachChannel: 'executives' as const,
        fitTier: personaFit,
        personaFocus: row.persona_focus ?? row.role_bucket ?? 'C-suite transitions',
      }
    })
    .filter((row): row is ClientRow => row !== null)

  const allRows: ClientRow[] = [
    ...executivePersonaRows,
    ...prioritizedSearchFirms.rows.map((row) => ({
      ...(() => {
        const draft = buildStandardizedDraft(row, 'search_firms', { forceTemplate: true })
        return {
          defaultSubject: draft.subject,
          defaultBody: draft.body,
        }
      })(),
      fullName: row.full_name ?? '',
      roleBucket: row.role_bucket ?? 'Partner',
      company: row.company ?? '',
      email: (row.email_guess ?? row.email ?? '').trim().toLowerCase(),
      emailConfidence: inferEmailConfidence(row),
      status: normalizeStatus(row.status),
      followUpSent: false,
      emailOpening: row.email_opening ?? '',
      emailBodyCore: row.email_body_core ?? '',
      outreachChannel: 'search_firms' as const,
      fitTier: normalizeFitTier(row.fit_tier),
      personaFocus: row.persona_focus ?? 'CFO, COO, CIO, CHRO, CRO searches',
    })),
    ...day1CoachRows,
    ...prioritizedCoaches.rows.map((row) => ({
      ...(() => {
        const draft = buildStandardizedDraft(row, 'coaches', { forceTemplate: true })
        return {
          defaultSubject: draft.subject,
          defaultBody: draft.body,
        }
      })(),
      fullName: row.full_name ?? '',
      roleBucket: row.role_bucket ?? 'Executive Coach',
      company: row.company ?? '',
      email: (row.email_guess ?? row.email ?? '').trim().toLowerCase(),
      emailConfidence: inferEmailConfidence(row),
      status: normalizeStatus(row.status),
      followUpSent: false,
      emailOpening: row.email_opening ?? '',
      emailBodyCore: row.email_body_core ?? '',
      outreachChannel: 'coaches' as const,
      fitTier: normalizeFitTier(row.fit_tier),
      personaFocus: row.persona_focus ?? 'CIO, CTO, CISO, COO, CFO transitions',
      campaignTag: undefined,
    })),
    ...outplacementRaw.rows.map((row) => ({
      ...(() => {
        const draft = buildStandardizedDraft(row, 'outplacement_firms', { forceTemplate: true })
        return {
          defaultSubject: draft.subject,
          defaultBody: draft.body,
        }
      })(),
      fullName: row.full_name ?? '',
      roleBucket: row.role_bucket ?? 'Outplacement Partner',
      company: row.company ?? '',
      email: (row.email_guess ?? row.email ?? '').trim().toLowerCase(),
      emailConfidence: inferEmailConfidence(row),
      status: normalizeStatus(row.status),
      followUpSent: false,
      emailOpening: row.email_opening ?? '',
      emailBodyCore: row.email_body_core ?? '',
      outreachChannel: 'outplacement_firms' as const,
      fitTier: normalizeFitTier(row.fit_tier),
      personaFocus: row.persona_focus ?? 'Executive transition and career mobility programs',
      campaignTag: undefined,
    })),
  ].filter(row => !!row.fullName && !!row.email)

  const normalizedRows = allRows.map((row) => {
    const dbStatus = mappedStatuses.get(row.email)
    const status = sentCoachEmails.has(row.email) && (dbStatus ?? row.status) === 'prospect'
      ? 'reached_out'
      : (dbStatus ?? row.status)

    return {
      ...row,
      status,
      followUpSent: mappedFollowUpSent.has(row.email),
    }
  })

  const clientRows = dedupeOutreachRows(normalizedRows)
  const executiveCount = clientRows.filter(r => r.outreachChannel === 'executives').length
  const searchFirmCount = clientRows.filter(r => r.outreachChannel === 'search_firms').length
  const coachCount = clientRows.filter(r => r.outreachChannel === 'coaches').length
  const day1CoachCount = clientRows.filter(r => r.campaignTag === 'coach_day1_60').length
  const outplacementCount = clientRows.filter(r => r.outreachChannel === 'outplacement_firms').length
  const strongCount = clientRows.filter(r => r.fitTier === 'strong').length
  const mediumCount = clientRows.filter(r => r.fitTier === 'medium').length

  const fromAddressLabel = 'Richard Rothschild <richard@startingmonday.app>'

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link href="/dashboard" className="inline-flex min-h-[44px] items-center rounded-md border border-slate-700 px-3 text-[12px] font-semibold text-slate-200 hover:text-white hover:border-slate-500 transition-colors">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-10 space-y-6">
<div>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Outreach Hub</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Internal outbound operating center: executives, search firms, and coaches with one-click send and auto follow-up reminders.
          </p>
          <div className="mt-3">
            <Link
              href="/dashboard/admin/social#content-checker"
              className="inline-flex items-center text-[12px] font-semibold text-slate-700 border border-slate-300 rounded px-3 py-1.5 hover:border-slate-500 hover:text-slate-900 transition-colors"
            >
              Content Checker
            </Link>
          </div>
        </div>

        <section className="bg-slate-50 border border-slate-200 rounded p-4">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-2">Jump to section</h2>
          <div className="flex flex-wrap gap-2 text-[12px]">
            <a href="#outreach-snapshot" className="inline-flex min-h-[44px] items-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Snapshot</a>
            <a href="#outreach-workbench" className="inline-flex min-h-[44px] items-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Outreach workbench</a>
            <a href="#outreach-cadence" className="inline-flex min-h-[44px] items-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Cadence</a>
            <a href="#outreach-links" className="inline-flex min-h-[44px] items-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Linked tools</a>
          </div>
        </section>

        <section id="outreach-snapshot" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded p-5">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">Total Prospects</p>
            <p className="text-[24px] font-bold text-slate-900">{clientRows.length}</p>
            <p className="text-[12px] text-slate-500 mt-1">Deduped across all channels</p>
          </div>
          <div className="bg-white border border-slate-200 rounded p-5">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">By Channel</p>
            <p className="text-[13px] font-semibold text-slate-900 mt-1">Executives: {executiveCount}</p>
            <p className="text-[13px] font-semibold text-slate-900">Search Firms: {searchFirmCount}</p>
            <p className="text-[13px] font-semibold text-slate-900">Coaches: {coachCount}</p>
            <p className="text-[13px] font-semibold text-slate-900">Outplacement Firms: {outplacementCount}</p>
            <p className="text-[12px] text-orange-600 font-semibold mt-2">Day 1 Coach Sprint List: {day1CoachCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded p-5">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">Fit Priority</p>
            <p className="text-[13px] font-semibold text-slate-900 mt-1">Strong fit: {strongCount}</p>
            <p className="text-[13px] font-semibold text-slate-900">Medium fit: {mediumCount}</p>
            <p className="text-[12px] text-slate-500 mt-1">Strong-fit rows should be worked first</p>
          </div>
        </section>

        <section className="bg-white border border-orange-200 rounded p-5">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-orange-600 mb-2">New Section: Day 1 Coach Sprint</p>
          <h2 className="text-[18px] font-bold text-slate-900 leading-tight">Run the 60-target coach list with prefilled outreach drafts</h2>
          <p className="text-[13px] text-slate-600 mt-2 max-w-3xl">
            Use the <span className="font-semibold text-slate-900">Day 1 Coach List (60)</span> button in the outreach workbench channel bar.
            It filters to the Day 1 targets and preloads each contact with the Day 1 sprint email copy from the coach traction plan.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="#outreach-workbench" className="inline-flex items-center bg-slate-900 text-white text-[12px] font-semibold px-3 py-2 rounded hover:bg-slate-700 transition-colors">
              Open Outreach Workbench
            </a>
            <a href="#outreach-cadence" className="inline-flex items-center border border-slate-300 text-slate-700 text-[12px] font-semibold px-3 py-2 rounded hover:border-slate-500 transition-colors">
              View Cadence Checklist
            </a>
          </div>
        </section>

        <section id="outreach-workbench">
          <h2 className="sr-only">Outreach workbench</h2>
          <OutreachHubClient rows={clientRows} fromAddressLabel={fromAddressLabel} buildVersion={buildVersion} />
        </section>

        <section id="outreach-cadence" className="bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-[16px] font-bold text-slate-900">Operating Cadence</h2>
              <p className="text-[12px] text-slate-500">Run this every week to keep outbound moving.</p>
            </div>
            <a
              href="/calendar/starting-monday-outreach-reminders.ics"
              download
              className="text-[12px] font-semibold text-white bg-slate-900 rounded px-3 py-2 hover:bg-slate-700 transition-colors"
            >
              Download Reminder Calendar
            </a>
          </div>
          <ol className="px-5 py-4 text-[13px] text-slate-700 list-decimal ml-5 space-y-2">
            <li>Monday: send first-touch notes to your active batch.</li>
            <li>Wednesday: send follow-up 1 for non-responders (day 3).</li>
            <li>Friday: send follow-up 2 for non-responders (day 7).</li>
            <li>Friday: review replies, meetings booked, and next-week list.</li>
          </ol>
        </section>

        <section id="outreach-links" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard/calendar" className="bg-white border border-slate-200 rounded p-5 hover:border-slate-300 transition-colors">
            <p className="text-[13px] font-semibold text-slate-900 mb-1">In-App Calendar</p>
            <p className="text-[12px] text-slate-500">Manage date-based follow-ups alongside the outreach routine.</p>
          </Link>
          <Link href="/dashboard/contacts" className="bg-white border border-slate-200 rounded p-5 hover:border-slate-300 transition-colors">
            <p className="text-[13px] font-semibold text-slate-900 mb-1">Contacts</p>
            <p className="text-[12px] text-slate-500">Update statuses: first sent, follow-up sent, replied, meeting booked.</p>
          </Link>
        </section>
      </main>
    </div>
  )
}
