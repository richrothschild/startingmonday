import { type NextRequest } from 'next/server'
import { requirePrepAccess } from '@/lib/require-prep-access'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited, trackApiUsage } from '@/lib/api-usage'
import { PREP_SYSTEM, personaContext } from '@/lib/prompts'
import { RESUME_CHARS } from '@/lib/ai-limits'
import { isDemoUser, streamDemoText, DEMO_PREP_BRIEFS } from '@/lib/demo'
import { streamErrorMessage } from '@/lib/stream-error'
import {
  buildScanSection, buildSignalSection, buildContactSection, buildDocSection,
  type Signal, type ScanRow, type ContactRow, type DocRow,
} from '@/lib/prep-context'
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
        controller.enqueue(encoder.encode(streamErrorMessage(err)))
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

type ProfileRow = { full_name?: string | null; current_title?: string | null; current_company?: string | null; target_titles?: string[] | null; target_sectors?: string[] | null; positioning_summary?: string | null; resume_text?: string | null; beyond_resume?: string | null; search_persona?: string | null }
type CompanyRow = { name: string; sector?: string | null; stage: string; notes?: string | null }

function buildContext(company: CompanyRow, profile: ProfileRow | null, scanResults: ScanRow[] | null, contacts: ContactRow[] | null, documents: DocRow[] | null, signals: Signal[] | null) {
  const name = profile?.full_name ?? 'the candidate'
  const targetTitles = (profile?.target_titles ?? []).join(', ') || 'Not specified'
  const targetSectors = (profile?.target_sectors ?? []).join(', ') || 'Not specified'

  const scanSection = buildScanSection(scanResults)
  const signalSection = buildSignalSection(signals)
  const contactSection = buildContactSection(contacts)
  const hasContacts = (contacts ?? []).length > 0
  const docsSection = buildDocSection(documents)

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
Three sentences only. No preamble, no company context, no hedging. The first states the candidate's single decisive advantage for this role: what specifically makes them the hire over everyone else being considered. The second names the most dangerous objection they will face: the one that, if not addressed, loses them the offer. The third states the single thing they must do or say in this conversation to close it. If they read nothing else, these three sentences are everything they need to walk in. Commit fully.

## The Situation
What is actually driving this hire? What problem does this organization need solved, and why now? Infer from the sector, pipeline stage, notes, and scan data. Be direct. This sets the frame for everything else.

## Win Thesis
One paragraph. Written as a conviction, not a summary. Not why the candidate is qualified, but why they win this specific role over everyone else being considered. What is the decisive advantage. Make the candidate feel it.

## The Narrative
How to tell their story for THIS room. Which chapters of their background to lead with, which to compress, which to leave out entirely. Close with one specific through-line sentence they can use as their opening positioning statement, ready to say verbatim.

## Anticipated Pushback
The 3–4 most likely objections or challenges this candidate will face. Order by lethality: the objection most likely to kill the candidacy goes first. For each, state the objection directly and give the exact counter. Format each as:
**They push:** [the objection]
**You say:** [specific counter, not defensive, not vague]

## Likely Questions
The 4–5 questions this interviewer will almost certainly ask, derived from the intersection of this specific role, this company's situation, and this candidate's background. Not generic behavioral questions: questions that arise because of who this person is and what this company needs right now. For each:
**They ask:** [the question, phrased as they would actually say it]
**What they're probing:** [what is actually being tested underneath the question, one sentence]
**Strong answer frame:** [how to approach it: what to lead with, what to include, what to avoid, 2–3 sentences. The structure of a strong answer, not the answer itself]

## Talking Points
5 specific, story-anchored points to make in the interview. Order by impact: the strongest, most differentiating point goes first. Each must connect an element of the candidate's actual background to this company's specific situation. Not generic strengths. Points that land in this room. Format:
**[Point title]** [2–3 sentences: what to say and exactly why it resonates here]

## Questions to Ask
5 questions that signal the candidate is a strategic peer, not an applicant. Lead with the single question most likely to distinguish this candidate from everyone else in the room. Each should demonstrate a specific kind of executive intelligence. After each question, one sentence on what it signals to the interviewers.

## First 90 Days Signal
2–3 specific observations or priorities to surface naturally in conversation, not as a formal plan, but as proof the candidate has already started thinking like an insider. Phrase each as something they'd actually say in the room, then note why it lands.

## What to Leave Out
3–4 explicit topics, framings, or stories to avoid in this specific conversation, and why each would hurt them here. Be direct.

## How to Close
What to do and say in the final 3–5 minutes of this specific conversation. Three elements, each ready to use verbatim or near-verbatim:

**Express interest:** One or two sentences that state genuine interest in this role without hedging or desperation. Calibrate to who is in the room: the language a CEO uses closing with a board chair is different from what a VP uses closing with a recruiter.

**Ask about process:** One sentence that asks about next steps as a peer, not an applicant. No anxiety. No "so what are my chances." Phrase it as someone who assumes they are a serious candidate.

**Final impression:** The one thought to leave them with in the last 30 seconds. What to say, reference, or do so they are still thinking about this candidate after the call ends.

## Reading the Room
How to interpret the signals at the end of this specific conversation. Cover the 3–4 most likely signal patterns given this company, this role, and this candidate's situation. For each:
**Signal:** [what they observe: specific language, behavior, or energy shift]
**What it means:** [the real interpretation, one sentence, no hedging]
**Your move:** [what to do within the next 24 hours in response]

Include at least one strong positive signal and one soft negative signal. Be specific to this type of organization and seniority level, not generic interview advice.${hasContacts ? '\n\n## People\nFor each known contact: when to surface the name, how to frame the relationship, and what it signals to the room.' : ''}

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
    4000,
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
