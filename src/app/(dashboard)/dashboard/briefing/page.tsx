import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { classifyGraphStalls } from '@/lib/action-scores'
import { createClient } from '@/lib/supabase/server'
import { anthropic, MODELS } from '@/lib/anthropic'
import { logEvent } from '@/lib/events'
import { logBriefingAction } from './actions'
import { LogoutButton } from '../logout-button'
import { HelpQuickButton } from '@/components/HelpQuickButton'

export const metadata = {
  title: 'Daily Briefing - Starting Monday',
}

const SIGNAL_LABELS: Record<string, string> = {
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

type BriefingJson = {
  subject?: string
  intro?: string
  signalAlerts?: { company: string; signalType: string; summary: string; angle?: string }[]
  matchInsights?: { company: string; roles: string[]; insight: string }[]
  followUpSuggestions?: { person: string; action: string; suggestion: string }[]
  closing?: string
}

type StallLaneSnapshot = {
  lane: 'signals' | 'pipeline' | 'preparation'
  state: 'healthy' | 'watch' | 'stalled'
  reason: string
}

type GeneratedBriefing = {
  briefing: BriefingJson
  usedFallback: boolean
}

const BRIEFING_SIGNAL_LIMIT = 5
const BRIEFING_MATCH_LIMIT = 3
const BRIEFING_FOLLOW_UP_LIMIT = 3
const BRIEFING_SUMMARY_CHAR_LIMIT = 280

function trimBriefingText(value: string | null | undefined, maxLength = BRIEFING_SUMMARY_CHAR_LIMIT) {
  const text = value?.trim()
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trimEnd()}...`
}

async function assembleBriefing(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, tz: string) {
  const now = new Date()
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const since7d   = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const since30d  = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const todayStr  = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now)

  const [profileResult, companiesResult, recentScansResult, followUpsResult, signalsResult, signalHealthResult, briefsResult, pipelineEventsResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('full_name, target_titles')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('companies')
      .select('id, name, stage')
      .eq('user_id', userId)
      .is('archived_at', null),
    supabase
      .from('scan_results')
      .select('company_id, scanned_at, ai_score, ai_summary, raw_hits')
      .eq('user_id', userId)
      .eq('status', 'success')
      .gte('scanned_at', since24h.toISOString())
      .gt('ai_score', 0)
      .order('ai_score', { ascending: false }),
    supabase
      .from('follow_ups')
      .select('id, due_date, action, contact_id, contacts(id, name, title)')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .lte('due_date', todayStr)
      .order('due_date', { ascending: true }),
    supabase
      .from('company_signals')
      .select('id, company_id, signal_type, signal_summary, outreach_angle, signal_date')
      .eq('user_id', userId)
      .is('notified_at', null)
      .gte('signal_date', since7d.toISOString().split('T')[0])
      .order('signal_date', { ascending: false })
      .limit(BRIEFING_SIGNAL_LIMIT),
    supabase
      .from('company_signals')
      .select('signal_date')
      .eq('user_id', userId)
      .gte('signal_date', since30d.toISOString().split('T')[0])
      .order('signal_date', { ascending: false })
      .limit(30),
    supabase
      .from('briefs')
      .select('created_at, reviewed_at, used_at, lifecycle_state')
      .eq('user_id', userId)
      .in('type', ['prep', 'prep_section'])
      .gte('created_at', since30d.toISOString())
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('user_events')
      .select('event_name, created_at')
      .eq('user_id', userId)
      .gte('created_at', since7d.toISOString())
      .in('event_name', ['company_added', 'pipeline_stage_changed']),
  ])

  const profile     = profileResult.data
  const companies   = companiesResult.data ?? []
  const recentScans = recentScansResult.data ?? []
  const rawFollowUps = followUpsResult.data ?? []
  const rawSignals  = signalsResult.data ?? []
  const signalHealthRows = (signalHealthResult.data ?? []) as Array<{ signal_date: string }>
  const briefs = (briefsResult.data ?? []) as Array<{ created_at: string; reviewed_at: string | null; used_at: string | null; lifecycle_state: string | null }>
  const pipelineEvents = (pipelineEventsResult.data ?? []) as Array<{ event_name: string; created_at: string }>

  const companyById = Object.fromEntries(companies.map(c => [c.id, c]))

  const newMatches = recentScans
    .map(scan => {
      const hits = (scan.raw_hits ?? []) as { title: string; score: number; is_match: boolean; is_new?: boolean; summary: string }[]
      return {
        companyName: companyById[scan.company_id]?.name ?? 'Unknown Company',
        aiScore: scan.ai_score,
        aiSummary: scan.ai_summary as string | null,
        matchingRoles: hits.filter(h => h.is_match).map(h => ({ title: h.title, score: h.score, isNew: h.is_new, summary: h.summary })),
      }
    })
    .filter(m => m.matchingRoles.length > 0)
    .slice(0, BRIEFING_MATCH_LIMIT)

  const followUps = rawFollowUps.map(f => ({
    id: f.id,
    dueDate: f.due_date,
    action: f.action as string | null,
    contact: (f.contacts as unknown as { id: string; name: string; title: string | null } | null) ?? null,
  })).slice(0, BRIEFING_FOLLOW_UP_LIMIT)

  const signals = rawSignals.map(s => ({
    id: s.id,
    companyName: companyById[s.company_id]?.name ?? 'Unknown Company',
    signalType: s.signal_type,
    summary: s.signal_summary as string,
    outreachAngle: s.outreach_angle as string | null,
    signalDate: s.signal_date,
  }))

  const activePipelineCount = companies.filter(
    (company) => company.stage === 'applied' || company.stage === 'interviewing' || company.stage === 'offer',
  ).length
  const lastSignalDays = signalHealthRows.length > 0
    ? Math.ceil((Date.now() - new Date(signalHealthRows[0].signal_date).getTime()) / (1000 * 60 * 60 * 24))
    : 999
  const lastBriefProgressAt = briefs.reduce<string | null>((latest, brief) => {
    const candidate = brief.used_at ?? brief.reviewed_at ?? brief.created_at
    if (!latest) return candidate
    return new Date(candidate).getTime() > new Date(latest).getTime() ? candidate : latest
  }, null)
  const lastBriefDays = lastBriefProgressAt
    ? Math.ceil((Date.now() - new Date(lastBriefProgressAt).getTime()) / (1000 * 60 * 60 * 24))
    : 999
  const briefReviewsSinceLastWeek = briefs.filter((brief) => brief.reviewed_at && new Date(brief.reviewed_at).getTime() >= since7d.getTime()).length
  const stalledLanes = classifyGraphStalls({
    activePipelineCount,
    overdueActions: followUps.length,
    lastSignalDays,
    lastBriefDays,
    signalsSinceBaseline: signalHealthRows.filter((signal) => new Date(signal.signal_date).getTime() >= since7d.getTime()).length,
    pipelineChangesSinceBaseline: pipelineEvents.length,
    briefReviewsSinceBaseline: briefReviewsSinceLastWeek,
  }) as StallLaneSnapshot[]

  return {
    userName: profile?.full_name ?? 'there',
    targetTitles: (profile?.target_titles as string[] | null) ?? [],
    totalCompanies: companies.length,
    newMatches,
    followUps,
    signals,
    todayStr,
    stalledLanes,
    hasContent: newMatches.length > 0 || followUps.length > 0 || signals.length > 0 || stalledLanes.length > 0,
  }
}

async function generateBriefing(context: Awaited<ReturnType<typeof assembleBriefing>>): Promise<GeneratedBriefing> {
  const { userName, targetTitles, totalCompanies, newMatches, followUps, signals, todayStr } = context

  const matchesText = newMatches.length
    ? newMatches.map(m =>
        `Company: ${m.companyName}\nMatching roles: ${m.matchingRoles.slice(0, 3).map(r => `${r.title} (score ${r.score}/100${r.isNew ? ', NEW' : ''})`).join('; ')}\nSummary: ${trimBriefingText(m.aiSummary)}`
      ).join('\n\n')
    : 'No new matches.'

  const followUpsText = followUps.length
    ? followUps.map(f => {
        const who = f.contact ? `${f.contact.name}${f.contact.title ? ` (${f.contact.title})` : ''}` : null
        return `Due: ${f.dueDate}${who ? `\nContact: ${who}` : ''}\nAction: ${f.action ?? 'Follow up'}`
      }).join('\n\n')
    : 'No overdue follow-ups.'

  const signalsText = signals.length
    ? signals.map(s => `Company: ${s.companyName}\nType: ${s.signalType}\nWhat happened: ${trimBriefingText(s.summary)}${s.outreachAngle ? `\nOpening: ${trimBriefingText(s.outreachAngle, 180)}` : ''}`).join('\n\n')
    : 'No new signals.'

  const prompt = `You are writing a morning intelligence briefing for ${userName}, a senior technology executive in active job search.
Target titles: ${targetTitles.join(', ') || 'CIO and senior technology leadership roles'}
Companies tracked: ${totalCompanies}

TODAY'S DATA (${todayStr}):

COMPANY SIGNALS (news events that create hiring openings):
${signalsText}

NEW JOB MATCHES (last 24 hours):
${matchesText}

OVERDUE FOLLOW-UPS:
${followUpsText}

Write a morning briefing as JSON with exactly these keys:
- "subject": email subject line (max 75 chars). Specific and factual - name the company or action. No generic phrases. If there are signals, lead with that.
- "intro": 1-2 sentences. State what changed overnight and what matters today. No preamble.
- "signalAlerts": array of at most ${BRIEFING_SIGNAL_LIMIT} items, each { company, signalType, summary, angle (one sentence on why this matters for the candidate's search) }.
- "matchInsights": array of at most ${BRIEFING_MATCH_LIMIT} items, each { company, roles (string[] up to 3), insight (1-2 sentences, specific to this role and this person's background) }.
- "followUpSuggestions": array of at most ${BRIEFING_FOLLOW_UP_LIMIT} items, each { person, action, suggestion (one concrete sentence - what to do and how) }.
- "closing": 1 sentence. Calm, confident observation about pipeline state. No motivational clichés.

Tone: direct, precise, senior-to-senior. Short sentences. No em dashes. No filler phrases. Write as a trusted advisor, not a coach.
Keep the full JSON under 1600 characters.
Output valid JSON only, no markdown fences.`

  const message = await anthropic.messages.create({
    model: MODELS.haiku,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  if (message.stop_reason === 'max_tokens') {
    Sentry.captureMessage('Briefing generation truncated by max_tokens', { level: 'warning', extra: { model: MODELS.haiku } })
  }

  const raw = (message.content[0] as { type: string; text?: string })?.text?.trim() ?? '{}'
  const cleaned = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()
  try {
    return {
      briefing: JSON.parse(cleaned) as BriefingJson,
      usedFallback: false,
    }
  } catch (err) {
    Sentry.captureException(err, { extra: { model: MODELS.haiku, rawLength: raw.length } })
    return {
      briefing: {
        intro: `Here is your search update for ${todayStr}.`,
        signalAlerts: signals.map(s => ({ company: s.companyName, signalType: s.signalType, summary: s.summary, angle: s.outreachAngle ?? undefined })),
        matchInsights: newMatches.map(m => ({ company: m.companyName, roles: m.matchingRoles.map(r => r.title), insight: m.aiSummary ?? '' })),
        followUpSuggestions: followUps.map(f => ({ person: f.contact?.name ?? 'Contact', action: f.action ?? 'Follow up', suggestion: 'Reach out today.' })),
        closing: `${totalCompanies} companies in your pipeline.`,
      },
      usedFallback: true,
    }
  }
}

// --- Suspense skeleton shown while Claude generates the briefing --------------

function BriefingBodySkeleton() {
  return (
    <div className="bg-white border border-slate-200 border-t-0 rounded-b px-5 sm:px-8 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
        <p className="text-[13px] text-slate-400">Assembling your briefing...</p>
      </div>
      <div className="mb-8 space-y-2">
        <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
        <div className="h-4 w-4/5 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="mb-8">
        <div className="h-2 w-28 bg-slate-100 rounded animate-pulse mb-4" />
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-r space-y-2">
          <div className="h-4 w-32 bg-amber-100 rounded animate-pulse" />
          <div className="h-3.5 w-full bg-amber-100 rounded animate-pulse" />
          <div className="h-3.5 w-3/4 bg-amber-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="mb-8">
        <div className="h-2 w-24 bg-slate-100 rounded animate-pulse mb-4" />
        <div className="p-4 bg-white border border-slate-200 rounded-r space-y-2">
          <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
          <div className="h-3.5 w-full bg-slate-100 rounded animate-pulse" />
          <div className="h-3.5 w-2/3 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// --- Async component - triggers the Claude call -------------------------------

type BriefingContext = Awaited<ReturnType<typeof assembleBriefing>>

async function BriefingBody({
  context,
  mode,
}: {
  context: BriefingContext
  mode: 'focused' | 'full'
}) {
  const generated = context.hasContent ? await generateBriefing(context) : null
  const briefing = generated?.briefing ?? null
  const usedFallback = generated?.usedFallback ?? false
  const maxItems = mode === 'focused' ? 1 : 3
  const signalAlerts  = (briefing?.signalAlerts ?? []).slice(0, maxItems)
  const matchInsights = (briefing?.matchInsights ?? []).slice(0, maxItems)
  const followUpItems = (briefing?.followUpSuggestions ?? []).slice(0, maxItems)
  const stalledLanes = context.stalledLanes ?? []

  return (
    <div className="bg-white border border-slate-200 border-t-0 rounded-b px-5 sm:px-8 py-6 sm:py-8">
      {!context.hasContent ? (
        <div className="text-center py-8">
          <p className="text-[15px] font-semibold text-slate-900 mb-2">Nothing to brief today.</p>
          <p className="text-[14px] text-slate-500 leading-relaxed mb-6">
            No new job matches, overdue follow-ups, or company signals in the last 7 days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/companies/new" className="inline-block bg-slate-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded hover:bg-slate-700 transition-colors">
              Add a company
            </Link>
            <Link href="/dashboard" className="inline-block border border-slate-200 text-slate-700 text-[13px] font-semibold px-5 py-2.5 rounded hover:border-slate-400 transition-colors">
              Back to dashboard
            </Link>
          </div>
        </div>
      ) : (
        <>
          {usedFallback && (
            <div className="mb-6 rounded border border-amber-200 bg-amber-50 p-4">
              <p className="text-[12px] font-semibold text-amber-900 mb-1">Briefing generated in safe mode</p>
              <p className="text-[13px] text-amber-800 leading-relaxed">
                We had a temporary formatting issue while building your AI summary. The actions below are still valid from your live data.
              </p>
            </div>
          )}

          <section id="briefing-accountability" className="mb-6 rounded border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-1">Accountability</h2>
            <p className="text-[14px] text-slate-700 leading-relaxed">
              Overnight changes show you what shifted. Today's actions show you who to contact first and what to do before the day gets away from you.
            </p>
          </section>

          {briefing?.intro && (
            <p className="text-[15px] text-slate-700 leading-relaxed mb-8">{briefing.intro}</p>
          )}

          {stalledLanes.length > 0 && (
            <section id="recovery-flags" className="mb-8">
              <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 pb-3 border-b border-slate-100 mb-4">
                Recovery Flags
              </h2>
              <div className="flex flex-col gap-3">
                {stalledLanes.map((lane, index) => (
                  <div
                    key={`${lane.lane}-${index}`}
                    className={`p-4 border rounded-r border-l-[3px] ${lane.state === 'stalled' ? 'bg-red-50 border-red-200 border-l-red-500' : 'bg-amber-50 border-amber-200 border-l-amber-500'}`}
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-bold text-[15px] text-slate-900 capitalize">{lane.lane}</span>
                      <span className={`text-[10px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded-full ${lane.state === 'stalled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {lane.state}
                      </span>
                    </div>
                    <p className="text-[14px] text-slate-700 leading-relaxed">{lane.reason}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {signalAlerts.length > 0 && (
            <section id="overnight-changes" className="mb-8">
              <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 pb-3 border-b border-slate-100 mb-4">
                Overnight Changes
              </h2>
              <div className="flex flex-col gap-3">
                {signalAlerts.map((s, i) => (
                  <div key={i} className="p-4 bg-amber-50 border border-amber-200 border-l-[3px] border-l-amber-500 rounded-r">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-bold text-[15px] text-slate-900">{s.company}</span>
                      <span className="text-[10px] font-bold tracking-[0.08em] uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {SIGNAL_LABELS[s.signalType] ?? s.signalType}
                      </span>
                    </div>
                    <p className="text-[14px] text-slate-700 leading-relaxed mb-1.5">{s.summary}</p>
                    {s.angle && (
                      <p className="text-[13px] text-slate-500 italic leading-relaxed">{s.angle}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <form action={logBriefingAction}>
                  <input type="hidden" name="section" value="overnight_changes" />
                  <input type="hidden" name="target" value="/dashboard/signals" />
                  <button
                    type="submit"
                    className="inline-block text-[12px] font-semibold text-slate-700 border border-slate-200 rounded px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
                  >
                    Open signals and choose a follow-up &rarr;
                  </button>
                </form>
              </div>
            </section>
          )}

          {matchInsights.length > 0 && (
            <section id="people-to-reach" className="mb-8">
              <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 pb-3 border-b border-slate-100 mb-4">
                People To Reach
              </h2>
              <div className="flex flex-col gap-3">
                {matchInsights.map((m, i) => (
                  <div key={i} className="p-4 bg-white border border-slate-200 border-l-[3px] border-l-slate-900 rounded-r">
                    <div className="font-bold text-[15px] text-slate-900 mb-1">{m.company}</div>
                    <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-400 mb-2">
                      {(m.roles ?? []).join(' · ')}
                    </div>
                    <p className="text-[14px] text-slate-700 leading-relaxed">{m.insight}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <form action={logBriefingAction}>
                  <input type="hidden" name="section" value="people_to_reach" />
                  <input type="hidden" name="target" value="/dashboard" />
                  <button
                    type="submit"
                    className="inline-block text-[12px] font-semibold text-slate-700 border border-slate-200 rounded px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
                  >
                    Open companies and run next outreach step &rarr;
                  </button>
                </form>
              </div>
            </section>
          )}

          {followUpItems.length > 0 && (
            <section id="today-actions" className="mb-8">
              <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 pb-3 border-b border-slate-100 mb-4">
                Today, Do This
              </h2>
              <div className="flex flex-col gap-2">
                {followUpItems.map((f, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-200 border-l-[3px] border-l-slate-400 rounded-r">
                    <div className="font-semibold text-[14px] text-slate-900 mb-1">
                      {f.person} &mdash; {f.action}
                    </div>
                    <p className="text-[13px] text-slate-500 leading-relaxed">{f.suggestion}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <form action={logBriefingAction}>
                  <input type="hidden" name="section" value="today_do_this" />
                  <input type="hidden" name="target" value="/dashboard/calendar" />
                  <button
                    type="submit"
                    className="inline-block text-[12px] font-semibold text-slate-700 border border-slate-200 rounded px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
                  >
                    Open calendar and complete today&apos;s actions &rarr;
                  </button>
                </form>
              </div>
            </section>
          )}

          {briefing?.closing && (
            <p className="text-[14px] text-slate-500 leading-relaxed border-t border-slate-100 pt-6 mb-6">
              {briefing.closing}
            </p>
          )}

          <div className="text-center">
            <Link
              href="/dashboard"
              className="inline-block bg-slate-900 text-white text-[13px] font-semibold px-8 py-3 rounded hover:bg-slate-700 transition-colors"
            >
              Back to dashboard
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

// --- Page - shell renders immediately, body streams in ------------------------

export default async function BriefingPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  const { mode: rawMode } = await searchParams
  const mode: 'focused' | 'full' = rawMode === 'focused' ? 'focused' : 'full'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, briefing_timezone, onboarding_completed_at')
    .eq('user_id', user.id)
    .single()

  if (!profile?.onboarding_completed_at) redirect('/onboarding')

  const tz = profile?.briefing_timezone ?? 'UTC'
  const context = await assembleBriefing(supabase, user.id, tz)

  await logEvent(user.id, 'briefing_viewed', {
    signals: context.signals.length,
    matches: context.newMatches.length,
    due_today: context.followUps.length,
    total_companies: context.totalCompanies,
  })

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const todayLabel = new Date(context.todayStr + 'T12:00:00Z').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="hidden sm:flex items-center gap-5">
            <Link href="/dashboard" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/dashboard/chat" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors">Chat</Link>
            <Link href="/dashboard/contacts" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors">Contacts</Link>
            <Link href="/dashboard/profile" className="text-[13px] text-slate-300 hover:text-white transition-colors">{profile?.full_name ?? user.email}</Link>
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-10">
<section className="mb-4 bg-slate-50 border border-slate-200 rounded p-4">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-2">Jump to section</h2>
          <div className="flex flex-wrap gap-2 text-[12px]">
            <a href="#briefing-header" className="inline-flex min-h-[44px] items-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Briefing header</a>
            <a href="#briefing-metrics" className="inline-flex min-h-[44px] items-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Metrics</a>
            <a href="#briefing-mode" className="inline-flex min-h-[44px] items-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">View mode</a>
            <a href="#briefing-accountability" className="inline-flex min-h-[44px] items-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Accountability</a>
            <a href="#recovery-flags" className="inline-flex min-h-[44px] items-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Recovery flags</a>
            <a href="#today-actions" className="inline-flex min-h-[44px] items-center rounded-full border border-slate-300 px-3.5 font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-400">Today actions</a>
          </div>
        </section>

        {/* Header - streams immediately after DB queries */}
        <section id="briefing-header" className="bg-slate-900 rounded-t px-5 sm:px-8 py-7">
          <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-4">
            Starting Monday
          </div>
          <h1 className="text-[24px] font-bold text-white leading-tight mb-2">
            Good morning, {firstName}.
          </h1>
          <p className="text-[13px] text-slate-500">{todayLabel}</p>
          <p className="text-[13px] text-slate-300 mt-3 leading-relaxed">
            Here is what changed overnight and what to act on first today.
          </p>
        </section>

        {/* Stats bar - streams immediately after DB queries */}
        <section id="briefing-metrics" className="bg-slate-50 border-x border-slate-200 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-200 border-b border-slate-200">
          {[
            { value: context.totalCompanies, label: 'Companies', amber: false, red: false },
            { value: context.signals.length, label: 'Signals', amber: context.signals.length > 0, red: false },
            { value: context.newMatches.length, label: 'Matches', amber: false, red: false },
            { value: context.followUps.length, label: 'Due Today', amber: false, red: context.followUps.length > 0 },
          ].map(({ value, label, amber, red }) => (
            <div key={label} className="py-4 px-3 text-center">
              <div className={`text-[22px] font-bold leading-none ${red ? 'text-red-700' : amber ? 'text-amber-600' : 'text-slate-900'}`}>
                {value}
              </div>
              <div className="text-[9px] text-slate-400 mt-1.5 tracking-[0.07em] uppercase">{label}</div>
            </div>
          ))}
        </section>

        <section id="briefing-mode" className="bg-white border-x border-b border-slate-200 px-5 sm:px-8 py-3 flex items-center gap-2">
          <h2 className="text-[11px] font-semibold text-slate-500">View:</h2>
          <Link
            href="/dashboard/briefing?mode=focused"
            className={`text-[11px] font-semibold border rounded px-2 py-1 transition-colors ${mode === 'focused' ? 'text-white bg-slate-900 border-slate-900' : 'text-slate-600 border-slate-200 hover:border-slate-400'}`}
          >
            Focused
          </Link>
          <Link
            href="/dashboard/briefing?mode=full"
            className={`text-[11px] font-semibold border rounded px-2 py-1 transition-colors ${mode === 'full' ? 'text-white bg-slate-900 border-slate-900' : 'text-slate-600 border-slate-200 hover:border-slate-400'}`}
          >
            Full
          </Link>
        </section>

        {/* Briefing body - streams in after Claude call completes */}
        <Suspense fallback={<BriefingBodySkeleton />}>
          <BriefingBody context={context} mode={mode} />
        </Suspense>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          Starting Monday &middot; Daily Intelligence Briefing
        </p>

      </main>
      <HelpQuickButton source="briefing" />
    </div>
  )
}
