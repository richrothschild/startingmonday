import { type NextRequest } from 'next/server'
import { requirePrepAccess } from '@/lib/require-prep-access'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited, trackApiUsage } from '@/lib/api-usage'
import { PREP_SYSTEM, personaContext, roleTypeContext, transitionModeContext, interviewStageContext, type InterviewStage } from '@/lib/prompts'
import type { CareerEntry } from '@/components/CareerVerificationPanel'
import { RESUME_CHARS } from '@/lib/ai-limits'
import { isDemoUser, streamDemoText, DEMO_PREP_BRIEFS } from '@/lib/demo'
import { encodeUserId } from '@/lib/watermark'
import { streamErrorMessage } from '@/lib/stream-error'
import {
  buildScanSection, buildSignalSection, buildContactSection, buildDocSection,
  type Signal, type ScanRow, type ContactRow, type DocRow,
} from '@/lib/prep-context'
import Anthropic from '@anthropic-ai/sdk'
import { anthropic, MODELS } from '@/lib/anthropic'
import { PrepRefineBodySchema, firstZodError } from '@/lib/schemas'

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
        controller.enqueue(encoder.encode(encodeUserId(userId)))
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
      .select('name, sector, stage, company_size, notes, competitive_context, interview_notes')
      .eq('id', companyId)
      .eq('user_id', userId)
      .single(),
    supabase
      .from('user_profiles')
      .select('full_name, current_title, current_company, target_titles, target_sectors, positioning_summary, resume_text, beyond_resume, search_persona, role_type, career_history_json, role_context')
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

type ProfileRow = {
  full_name?: string | null; current_title?: string | null; current_company?: string | null
  target_titles?: string[] | null; target_sectors?: string[] | null
  positioning_summary?: string | null; resume_text?: string | null; beyond_resume?: string | null
  search_persona?: string | null; role_type?: string | null; career_history_json?: unknown | null
  role_context?: Record<string, unknown> | null
}
type CompanyRow = { name: string; sector?: string | null; stage: string; company_size?: string | null; notes?: string | null; competitive_context?: string | null; interview_notes?: string | null }

function buildRoleSpecificContext(profile: ProfileRow | null): string {
  if (!profile?.role_context) return ''
  const ctx = profile.role_context
  const lines: string[] = []

  if (profile.role_type === 'ciso') {
    const sf = ctx.security_frameworks as string[] | undefined
    if (sf?.length) lines.push(`Security frameworks implemented: ${sf.join(', ')}`)
    if (ctx.board_security_maturity) lines.push(`Board security maturity context: ${ctx.board_security_maturity}`)
  }

  if (profile.role_type === 'cpo') {
    if (ctx.product_type_exp) lines.push(`Product experience type: ${ctx.product_type_exp}`)
    if (ctx.product_achievement) lines.push(`Key product achievement: ${ctx.product_achievement}`)
    if (ctx.product_metric) lines.push(`Primary metric moved: ${ctx.product_metric}`)
  }

  if (profile.role_type === 'coo') {
    const mt = ctx.coo_mandate_types as string[] | undefined
    if (mt?.length) lines.push(`Mandate types targeted: ${mt.join(', ')}`)
    if (ctx.coo_ceo_partnership) lines.push(`CEO partnership model: ${ctx.coo_ceo_partnership}`)
  }

  if (profile.role_type === 'cto') {
    const tf = ctx.cto_technical_flavor as string[] | undefined
    if (tf?.length) lines.push(`Technical flavor: ${tf.join(', ')}`)
    if (ctx.cto_architecture_decision) lines.push(`Key architectural decision: ${ctx.cto_architecture_decision}`)
  }

  if (profile.role_type === 'cdo_data') {
    if (ctx.data_maturity_orientation) lines.push(`Data mandate orientation: ${ctx.data_maturity_orientation}`)
    if (ctx.data_platform_built) lines.push(`Data platform built: ${ctx.data_platform_built}`)
  }

  if (profile.role_type === 'cdo_digital') {
    if (ctx.digital_background_type) lines.push(`Professional background: ${ctx.digital_background_type}`)
    if (ctx.digital_transformation_delivered) lines.push(`Business transformation delivered: ${ctx.digital_transformation_delivered}`)
  }

  return lines.length > 0 ? '\n' + lines.join('\n') : ''
}

function buildContext(company: CompanyRow, profile: ProfileRow | null, scanResults: ScanRow[] | null, contacts: ContactRow[] | null, documents: DocRow[] | null, signals: Signal[] | null, interviewStage: InterviewStage | null = null) {
  const name = profile?.full_name ?? 'the candidate'
  const targetTitles = (profile?.target_titles ?? []).join(', ') || 'Not specified'
  const targetSectors = (profile?.target_sectors ?? []).join(', ') || 'Not specified'

  const scanSection = buildScanSection(scanResults, profile?.role_type)
  const signalSection = buildSignalSection(signals)
  const contactSection = buildContactSection(contacts)
  const hasContacts = (contacts ?? []).length > 0
  const docsSection = buildDocSection(documents)

  function careerSection(p: ProfileRow | null): string {
    if (!p) return ''
    const entries = Array.isArray(p.career_history_json) ? (p.career_history_json as CareerEntry[]) : null
    if (entries && entries.length > 0) {
      const lines = entries.map(e => {
        const dates = `${e.start_year || '?'} to ${e.end_year || 'present'}`
        const company = e.parent_company ? `${e.company} (${e.parent_company})` : e.company
        const note = e.acquisition_note ? `\n  Context: ${e.acquisition_note}` : ''
        return `${company} | ${e.title} | ${dates}\n  ${e.key_outcome}${note}`
      }).join('\n\n')
      return `\n[Verified career history, confirmed by the executive. Treat as authoritative. Do not infer or contradict these entries.]\n${lines}`
    }
    return p.resume_text ? `\nResume / career history:\n${p.resume_text.slice(0, RESUME_CHARS)}` : ''
  }

  const companySizeLabel: Record<string, string> = {
    startup: 'Startup (under 200 employees)',
    midmarket: 'Mid-Market (200-2,000 employees)',
    enterprise: 'Enterprise (2,000+ employees)',
  }

  const stageCtx = interviewStageContext(interviewStage, profile?.role_type)

  const prompt = `Prepare an elite pre-interview brief for the following situation. This is the level of preparation a top executive coach produces: specific, direct, and grounded in the actual data below.${stageCtx}

CANDIDATE
Name: ${name}${profile?.current_title ? `\nCurrent/recent title: ${profile.current_title}` : ''}${profile?.current_company ? `\nCurrent/recent company: ${profile.current_company}` : ''}${personaContext(profile?.search_persona)}${roleTypeContext(profile?.role_type)}${transitionModeContext(profile?.search_persona, profile?.target_titles, profile?.role_type)}
Target roles: ${targetTitles}
Target sectors: ${targetSectors}${profile?.positioning_summary ? `\nPositioning: ${profile.positioning_summary}` : ''}${careerSection(profile)}${buildRoleSpecificContext(profile)}${profile?.beyond_resume ? `\nBeyond the resume: ${profile.beyond_resume}` : ''}

COMPANY
Name: ${company.name}${company.sector ? `\nSector: ${company.sector}` : ''}${company.company_size ? `\nCompany size: ${companySizeLabel[company.company_size] ?? company.company_size}` : ''}
Pipeline stage: ${company.stage}${company.notes ? `\nIntel and notes: ${company.notes}` : ''}${company.competitive_context ? `\nCompetitive field: ${company.competitive_context}` : ''}${company.competitive_context ? `

COMPETITIVE POSITIONING INSTRUCTION
The candidate is competing against the field described above. Every section of this brief must reflect this.
Win Thesis: name the decisive advantage over the specific alternatives described. If internal candidates are mentioned, the Win Thesis must explicitly frame what an external perspective provides that an insider cannot. If specific firms or backgrounds are named, the Win Thesis must address why this candidate wins that comparison.
Anticipated Pushback: the first or second objection must be the competitive comparison most likely to be raised in the room. State it directly and give the exact counter.
Do not soften or genericize the competitive framing. Write as if the interviewer already has the other candidate's resume in front of them.` : ''}

${company.interview_notes ? `PRIOR INTERVIEW NOTES
These are the candidate's own notes from prior conversations at this company. Treat as authoritative first-person reporting.
${company.interview_notes}

PRIOR INTERVIEW NOTES INSTRUCTION
These notes change the brief in specific ways:
- Any objection raised in a prior conversation becomes the first item in Anticipated Pushback, with a stronger and more specific counter than whatever they used before.
- Likely Questions must reflect what was actually asked, weighted ahead of what might be asked.
- Win Thesis must directly address anything that caused hesitation or uncertainty in a prior conversation.
- Amplify what landed well. Build more of the brief around it.
- If the notes mention something the interviewer emphasized or cared about, surface it prominently.

` : ''}JOB SCAN DATA
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

function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
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

  const postingUrl = request.nextUrl.searchParams.get('posting_url')
  const interviewStage = (request.nextUrl.searchParams.get('interview_stage') ?? null) as InterviewStage | null
  let allDocuments = documents
  if (postingUrl) {
    try {
      const html = await fetch(postingUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      }).then(r => r.text())
      const text = extractTextFromHtml(html).slice(0, 6000)
      if (text.length > 100) {
        allDocuments = [{ label: 'job_description', content: text }, ...(documents ?? [])]
      }
    } catch { /* ignore fetch errors, fall back to existing docs */ }
  }

  const userPrompt = buildContext(company, profile, scanResults, contacts, allDocuments, signals, interviewStage)

  const readable = makeStream(
    [{ role: 'user', content: userPrompt }],
    8000,
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

  let raw: unknown
  try { raw = await request.json() } catch {
    return new Response('Invalid JSON', { status: 400 })
  }
  const parsed = PrepRefineBodySchema.safeParse(raw)
  if (!parsed.success) {
    return new Response(firstZodError(parsed.error), { status: 400 })
  }
  const { brief, request: refinementRequest } = parsed.data

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
    6000,
    supabase,
    userId
  )

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
