import Link from 'next/link'
import { redirect } from 'next/navigation'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '../logout-button'

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

async function assembleBriefing(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, tz: string) {
  const now = new Date()
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const since7d   = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const todayStr  = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now)

  const [profileResult, companiesResult, recentScansResult, followUpsResult, signalsResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('full_name, target_titles')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('companies')
      .select('id, name')
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
      .select('id, due_date, action, contact_id')
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
      .limit(5),
  ])

  const profile     = profileResult.data
  const companies   = companiesResult.data ?? []
  const recentScans = recentScansResult.data ?? []
  const rawFollowUps = followUpsResult.data ?? []
  const rawSignals  = signalsResult.data ?? []

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

  const contactIds = rawFollowUps.filter(f => f.contact_id).map(f => f.contact_id as string)
  let contactById: Record<string, { id: string; name: string; title?: string | null }> = {}
  if (contactIds.length) {
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, name, title')
      .in('id', contactIds)
    if (contacts) contactById = Object.fromEntries(contacts.map(c => [c.id, c]))
  }

  const followUps = rawFollowUps.map(f => ({
    id: f.id,
    dueDate: f.due_date,
    action: f.action as string | null,
    contact: f.contact_id ? (contactById[f.contact_id] ?? null) : null,
  }))

  const signals = rawSignals.map(s => ({
    id: s.id,
    companyName: companyById[s.company_id]?.name ?? 'Unknown Company',
    signalType: s.signal_type,
    summary: s.signal_summary as string,
    outreachAngle: s.outreach_angle as string | null,
    signalDate: s.signal_date,
  }))

  return {
    userName: profile?.full_name ?? 'there',
    targetTitles: (profile?.target_titles as string[] | null) ?? [],
    totalCompanies: companies.length,
    newMatches,
    followUps,
    signals,
    todayStr,
    hasContent: newMatches.length > 0 || followUps.length > 0 || signals.length > 0,
  }
}

async function generateBriefing(context: Awaited<ReturnType<typeof assembleBriefing>>): Promise<BriefingJson> {
  const { userName, targetTitles, totalCompanies, newMatches, followUps, signals, todayStr } = context

  const matchesText = newMatches.length
    ? newMatches.map(m =>
        `Company: ${m.companyName}\nMatching roles: ${m.matchingRoles.map(r => `${r.title} (score ${r.score}/100${r.isNew ? ', NEW' : ''})`).join('; ')}\nSummary: ${m.aiSummary}`
      ).join('\n\n')
    : 'No new matches.'

  const followUpsText = followUps.length
    ? followUps.map(f => {
        const who = f.contact ? `${f.contact.name}${f.contact.title ? ` (${f.contact.title})` : ''}` : null
        return `Due: ${f.dueDate}${who ? `\nContact: ${who}` : ''}\nAction: ${f.action ?? 'Follow up'}`
      }).join('\n\n')
    : 'No overdue follow-ups.'

  const signalsText = signals.length
    ? signals.map(s => `Company: ${s.companyName}\nType: ${s.signalType}\nWhat happened: ${s.summary}${s.outreachAngle ? `\nOpening: ${s.outreachAngle}` : ''}`).join('\n\n')
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
- "intro": 1-2 sentences. State what's on the board today and why it matters. No preamble.
- "signalAlerts": array of { company, signalType, summary, angle (one sentence on why this matters for the candidate's search) } - only if there are signals.
- "matchInsights": array of { company, roles (string[]), insight (1-2 sentences, specific to this role and this person's background) } - only for companies with matches.
- "followUpSuggestions": array of { person, action, suggestion (one concrete sentence - what to do and how) } - only if there are follow-ups.
- "closing": 1 sentence. Calm, confident observation about pipeline state. No motivational clichés.

Tone: direct, precise, senior-to-senior. Short sentences. No em dashes. No filler phrases. Write as a trusted advisor, not a coach.
Output valid JSON only, no markdown fences.`

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model: process.env.ANTHROPIC_BRIEFING_MODEL ?? 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (message.content[0] as { type: string; text?: string })?.text?.trim() ?? '{}'
  const cleaned = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()
  try {
    return JSON.parse(cleaned) as BriefingJson
  } catch {
    return {
      intro: `Here is your search update for ${todayStr}.`,
      signalAlerts: signals.map(s => ({ company: s.companyName, signalType: s.signalType, summary: s.summary, angle: s.outreachAngle ?? undefined })),
      matchInsights: newMatches.map(m => ({ company: m.companyName, roles: m.matchingRoles.map(r => r.title), insight: m.aiSummary ?? '' })),
      followUpSuggestions: followUps.map(f => ({ person: f.contact?.name ?? 'Contact', action: f.action ?? 'Follow up', suggestion: 'Reach out today.' })),
      closing: `${totalCompanies} companies in your pipeline.`,
    }
  }
}

export default async function BriefingPage() {
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
  const briefing = context.hasContent ? await generateBriefing(context) : null

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const todayLabel = new Date(context.todayStr + 'T12:00:00Z').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  const signalAlerts     = briefing?.signalAlerts ?? []
  const matchInsights    = briefing?.matchInsights ?? []
  const followUpItems    = briefing?.followUpSuggestions ?? []

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      {/* Nav */}
      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
          <div className="hidden sm:flex items-center gap-5">
            <Link href="/dashboard" className="text-[12px] font-semibold text-slate-500 hover:text-slate-300 transition-colors">Dashboard</Link>
            <Link href="/dashboard/chat" className="text-[12px] font-semibold text-slate-500 hover:text-slate-300 transition-colors">Chat</Link>
            <Link href="/dashboard/contacts" className="text-[12px] font-semibold text-slate-500 hover:text-slate-300 transition-colors">Contacts</Link>
            <Link href="/dashboard/profile" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">{profile?.full_name ?? user.email}</Link>
            <LogoutButton label="Sign out" />
          </div>
          <div className="flex sm:hidden items-center gap-4">
            <Link href="/dashboard" className="text-[12px] font-semibold text-slate-500 hover:text-slate-300">Dashboard</Link>
            <LogoutButton label="Out" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Header */}
        <div className="bg-slate-900 rounded-t px-8 py-7">
          <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600 mb-4">
            Starting Monday
          </div>
          <h1 className="text-[24px] font-bold text-white leading-tight mb-2">
            Good morning, {firstName}.
          </h1>
          <p className="text-[13px] text-slate-500">{todayLabel}</p>
        </div>

        {/* Stats bar */}
        <div className="bg-slate-50 border-x border-slate-200 grid grid-cols-4 divide-x divide-slate-200 border-b border-slate-200">
          {[
            { value: context.totalCompanies, label: 'Companies', amber: false, red: false },
            { value: context.signals.length, label: 'Signals', amber: context.signals.length > 0, red: false },
            { value: context.newMatches.length, label: 'Matches', amber: false, red: false },
            { value: context.followUps.length, label: 'Actions Due', amber: false, red: context.followUps.length > 0 },
          ].map(({ value, label, amber, red }) => (
            <div key={label} className="py-4 px-3 text-center">
              <div className={`text-[22px] font-bold leading-none ${red ? 'text-red-700' : amber ? 'text-amber-600' : 'text-slate-900'}`}>
                {value}
              </div>
              <div className="text-[9px] text-slate-400 mt-1.5 tracking-[0.07em] uppercase">{label}</div>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="bg-white border border-slate-200 border-t-0 rounded-b px-8 py-8">

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
              {/* Intro */}
              {briefing?.intro && (
                <p className="text-[15px] text-slate-700 leading-relaxed mb-8">{briefing.intro}</p>
              )}

              {/* Signal Alerts */}
              {signalAlerts.length > 0 && (
                <div className="mb-8">
                  <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 pb-3 border-b border-slate-100 mb-4">
                    Company Signals
                  </div>
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
                </div>
              )}

              {/* Match Insights */}
              {matchInsights.length > 0 && (
                <div className="mb-8">
                  <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 pb-3 border-b border-slate-100 mb-4">
                    New Matches
                  </div>
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
                </div>
              )}

              {/* Follow-up Suggestions */}
              {followUpItems.length > 0 && (
                <div className="mb-8">
                  <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 pb-3 border-b border-slate-100 mb-4">
                    Open Actions
                  </div>
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
                </div>
              )}

              {/* Closing */}
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
                  Open Dashboard
                </Link>
              </div>
            </>
          )}

        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          Starting Monday &middot; Daily Intelligence Briefing
        </p>

      </main>
    </div>
  )
}
