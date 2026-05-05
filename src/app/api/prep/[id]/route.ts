import { type NextRequest } from 'next/server'
import { requirePrepAccess } from '@/lib/require-prep-access'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited, trackApiUsage } from '@/lib/api-usage'
import { PREP_SYSTEM, personaContext } from '@/lib/prompts'
import { RESUME_CHARS, DOC_CHARS } from '@/lib/ai-limits'
import { isDemoUser, streamDemoText, DEMO_PREP_BRIEFS } from '@/lib/demo'
import Anthropic from '@anthropic-ai/sdk'
import { anthropic, MODELS } from '@/lib/anthropic'

function makeStream(messages: Anthropic.MessageParam[], maxTokens: number, supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: MODELS.sonnet,
          max_tokens: maxTokens,

          system: PREP_SYSTEM,
          messages,
        })
        stream.on('text', text => controller.enqueue(encoder.encode(text)))
        const final = await stream.finalMessage()
        controller.close()
        const tokens = (final.usage.input_tokens ?? 0) + (final.usage.output_tokens ?? 0)
        trackApiUsage(supabase, userId, tokens).catch(() => {})
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        controller.enqueue(encoder.encode(`__ERROR__${msg}`))
        controller.close()
      }
    },
  })
}

async function loadContext(supabase: Awaited<ReturnType<typeof createClient>>, companyId: string, userId: string) {
  const since90d = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const [{ data: company }, { data: profile }, { data: scanResults }, { data: contacts }, { data: documents }, { data: signals }] = await Promise.all([
    supabase
      .from('companies')
      .select('name, sector, stage, notes')
      .eq('id', companyId)
      .eq('user_id', userId)
      .single(),
    supabase
      .from('user_profiles')
      .select('full_name, current_title, current_company, target_titles, target_sectors, positioning_summary, resume_text, beyond_resume, search_persona')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('scan_results')
      .select('scanned_at, ai_score, ai_summary, raw_hits')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .eq('status', 'success')
      .order('scanned_at', { ascending: false })
      .limit(1),
    supabase
      .from('contacts')
      .select('name, title, firm, channel, notes')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .eq('status', 'active'),
    supabase
      .from('company_documents')
      .select('label, content')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),
    supabase
      .from('company_signals')
      .select('signal_type, signal_summary, outreach_angle, signal_date')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .gte('signal_date', since90d)
      .order('signal_date', { ascending: false })
      .limit(5),
  ])
  return { company, profile, scanResults, contacts, documents, signals }
}

const DOC_LABEL_NAMES: Record<string, string> = {
  job_description: 'Job Description',
  news:            'News & Press',
  annual_report:   'Annual Report',
  org_notes:       'Org Notes',
  other:           'Other',
}

type Signal = { signal_type: string; signal_summary: string; outreach_angle?: string | null; signal_date: string }

function buildContext(company: { name: string; sector?: string | null; stage: string; notes?: string | null }, profile: { full_name?: string | null; current_title?: string | null; current_company?: string | null; target_titles?: string[] | null; target_sectors?: string[] | null; positioning_summary?: string | null; resume_text?: string | null; beyond_resume?: string | null; search_persona?: string | null } | null, scanResults: { scanned_at: string; ai_score?: number | null; ai_summary?: string | null; raw_hits?: unknown }[] | null, contacts: { name: string; title?: string | null; firm?: string | null; channel?: string | null; notes?: string | null }[] | null, documents: { label: string; content: string }[] | null, signals: Signal[] | null) {
  const name = profile?.full_name ?? 'the candidate'
  const targetTitles = (profile?.target_titles ?? []).join(', ') || 'Not specified'
  const targetSectors = (profile?.target_sectors ?? []).join(', ') || 'Not specified'

  let scanSection = 'No career page scans on file.'
  if (scanResults?.[0]) {
    const scan = scanResults[0]
    const matches = ((scan.raw_hits ?? []) as { title: string; score: number; is_match: boolean; summary: string }[])
      .filter(h => h.is_match)
    const date = new Date(scan.scanned_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    scanSection = matches.length > 0
      ? `Career page scanned ${date}:\n` + matches.map(h => `- ${h.title} (fit score: ${h.score}): ${h.summary}`).join('\n')
      : `Career page scanned ${date}, no matching roles detected.`
  }

  const signalSection = (signals ?? []).length > 0
    ? (signals ?? []).map(s => {
        const date = new Date(s.signal_date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        return `- [${s.signal_type.toUpperCase()}] ${date}: ${s.signal_summary}${s.outreach_angle ? `\n  Angle: ${s.outreach_angle}` : ''}`
      }).join('\n')
    : null

  const contactSection = (contacts ?? []).length > 0
    ? (contacts ?? []).map(c => {
        const parts = [c.title, c.firm].filter(Boolean).join(' at ')
        return `- ${c.name}${parts ? `, ${parts}` : ''}${c.channel ? ` (via ${c.channel})` : ''}${c.notes ? `: ${c.notes}` : ''}`
      }).join('\n')
    : 'No contacts on file.'

  const hasContacts = (contacts ?? []).length > 0

  const docsSection = (documents ?? []).length > 0
    ? (documents ?? []).map(d => {
        const labelName = DOC_LABEL_NAMES[d.label] ?? d.label
        const content = d.content.length > DOC_CHARS ? d.content.slice(0, DOC_CHARS) + '\n[truncated]' : d.content
        return `[${labelName}]\n${content}`
      }).join('\n\n')
    : null

  const prompt = `Prepare an elite pre-interview brief for the following situation. This is the level of preparation a top executive coach produces: specific, direct, and grounded in the actual data below.

CANDIDATE
Name: ${name}${profile?.current_title ? `\nCurrent/recent title: ${profile.current_title}` : ''}${profile?.current_company ? `\nCurrent/recent company: ${profile.current_company}` : ''}${personaContext(profile?.search_persona)}
Target roles: ${targetTitles}
Target sectors: ${targetSectors}${profile?.positioning_summary ? `\nPositioning: ${profile.positioning_summary}` : ''}${profile?.resume_text ? `\nResume / career history:\n${profile.resume_text.slice(0, RESUME_CHARS)}` : ''}${profile?.beyond_resume ? `\nBeyond the resume: ${profile.beyond_resume}` : ''}

COMPANY
Name: ${company.name}${company.sector ? `\nSector: ${company.sector}` : ''}
Pipeline stage: ${company.stage}${company.notes ? `\nIntel and notes: ${company.notes}` : ''}

JOB SCAN DATA
${scanSection}
${signalSection ? `\nCOMPANY SIGNALS (recent news events)\n${signalSection}` : ''}

KNOWN CONTACTS
${contactSection}${docsSection ? `\n\nDOCUMENTS\n${docsSection}` : ''}

---

Write the brief with these exact sections, using ## for each header:

## Bottom Line
Three sentences. The first states the candidate's decisive advantage for this specific role over everyone else being considered. The second names the single most likely objection or risk they will face in the room. The third states the one thing they must do or say in this interview to win the opportunity. No hedging. Commit.

## The Situation
What is actually driving this hire? What problem does this organization need solved, and why now? Infer from the sector, pipeline stage, notes, and scan data. Be direct. This sets the frame for everything else.

## Win Thesis
One paragraph. Written as a conviction, not a summary. Not why the candidate is qualified, but why they win this specific role over everyone else being considered. What is the decisive advantage. Make the candidate feel it.

## The Narrative
How to tell their story for THIS room. Which chapters of their background to lead with, which to compress, which to leave out entirely. Close with one specific through-line sentence they can use as their opening positioning statement, ready to say verbatim.

## Anticipated Pushback
The 3–4 most likely objections or challenges this candidate will face. For each, state the objection directly and give the exact counter. Format each as:
**They push:** [the objection]
**You say:** [specific counter, not defensive, not vague]

## Talking Points
5 specific, story-anchored points to make in the interview. Each must connect an element of the candidate's actual background to this company's specific situation. Not generic strengths. Points that land in this room. Format:
**[Point title]** [2–3 sentences: what to say and exactly why it resonates here]

## Questions to Ask
5 questions that signal the candidate is a strategic peer, not an applicant. Each should demonstrate a specific kind of executive intelligence. After each question, one sentence on what it signals to the interviewers.

## First 90 Days Signal
2–3 specific observations or priorities to surface naturally in conversation, not as a formal plan, but as proof the candidate has already started thinking like an insider. Phrase each as something they'd actually say in the room, then note why it lands.

## What to Leave Out
3–4 explicit topics, framings, or stories to avoid in this specific conversation, and why each would hurt them here. Be direct.${hasContacts ? '\n\n## People\nFor each known contact: when to surface the name, how to frame the relationship, and what it signals to the room.' : ''}

If the candidate's background is thin (no resume, no positioning), name what you cannot assess rather than generating generic advice. Tell them exactly what to provide for a sharper brief. Do not invent specifics or use vague generalities to cover missing data.

Tone: direct, senior-to-senior. Short paragraphs. No em dashes. No hedging. No motivational language.`

  return prompt
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requirePrepAccess(request)
  if (!access.ok) return access.response
  const { userId, supabase } = access

  const { id: companyId } = await params
  const { company, profile, scanResults, contacts, documents, signals } = await loadContext(supabase, companyId, userId)

  if (!company) return new Response('Not found', { status: 404 })

  if (isDemoUser(userId)) {
    const key = company.name.toLowerCase()
    const demoContent = DEMO_PREP_BRIEFS[key]
    if (demoContent) {
      return new Response(streamDemoText(demoContent), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }
  }

  const userPrompt = buildContext(company, profile, scanResults, contacts, documents, signals)

  const readable = makeStream(
    [{ role: 'user', content: userPrompt }],
    2500,
    supabase,
    userId
  )

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requirePrepAccess(request)
  if (!access.ok) return access.response
  const { userId, supabase } = access

  const body = await request.json().catch(() => null)
  if (!body?.brief || !body?.request) {
    return new Response('Missing brief or request', { status: 400 })
  }

  const { brief, request: refinementRequest } = body as { brief: string; request: string }

  if (isDemoUser(userId)) {
    return new Response(streamDemoText(brief), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const readable = makeStream(
    [
      {
        role: 'user',
        content: `Here is the current interview prep brief:\n\n${brief}\n\n---\n\nModification request: ${refinementRequest}\n\nReturn the complete updated brief incorporating this change precisely. Keep all ## section headers. Maintain the same direct, senior-to-senior tone. No em dashes. No motivational language.`,
      },
    ],
    2500,
    supabase,
    userId
  )

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
