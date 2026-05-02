import Anthropic from '@anthropic-ai/sdk'
import { type NextRequest } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited, trackApiUsage } from '@/lib/api-usage'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = 'You are a senior executive coach preparing a C-suite leader for a high-stakes interview. Be ruthlessly specific. Use every piece of data provided. No generic advice, no filler, no motivational language. Every sentence earns its place. No em dashes.'

function makeStream(messages: Anthropic.MessageParam[], maxTokens: number, supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: process.env.ANTHROPIC_PREP_MODEL ?? 'claude-sonnet-4-6',
          max_tokens: maxTokens,
          system: SYSTEM,
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
  const [{ data: company }, { data: profile }, { data: scanResults }, { data: contacts }, { data: documents }] = await Promise.all([
    supabase
      .from('companies')
      .select('name, sector, stage, notes')
      .eq('id', companyId)
      .eq('user_id', userId)
      .single(),
    supabase
      .from('user_profiles')
      .select('full_name, current_title, current_company, target_titles, target_sectors, positioning_summary, resume_text, beyond_resume')
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
  ])
  return { company, profile, scanResults, contacts, documents }
}

const DOC_LABEL_NAMES: Record<string, string> = {
  job_description: 'Job Description',
  news:            'News & Press',
  annual_report:   'Annual Report',
  org_notes:       'Org Notes',
  other:           'Other',
}

function buildContext(company: { name: string; sector?: string | null; stage: string; notes?: string | null }, profile: { full_name?: string | null; current_title?: string | null; current_company?: string | null; target_titles?: string[] | null; target_sectors?: string[] | null; positioning_summary?: string | null; resume_text?: string | null; beyond_resume?: string | null } | null, scanResults: { scanned_at: string; ai_score?: number | null; ai_summary?: string | null; raw_hits?: unknown }[] | null, contacts: { name: string; title?: string | null; firm?: string | null; channel?: string | null; notes?: string | null }[] | null, documents: { label: string; content: string }[] | null) {
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
      ? `Career page scanned ${date}:\n` + matches.map(h => `- ${h.title} (fit score: ${h.score}) — ${h.summary}`).join('\n')
      : `Career page scanned ${date} — no matching roles detected.`
  }

  const contactSection = (contacts ?? []).length > 0
    ? (contacts ?? []).map(c => {
        const parts = [c.title, c.firm].filter(Boolean).join(' at ')
        return `- ${c.name}${parts ? `, ${parts}` : ''}${c.channel ? ` (via ${c.channel})` : ''}${c.notes ? ` — ${c.notes}` : ''}`
      }).join('\n')
    : 'No contacts on file.'

  const hasContacts = (contacts ?? []).length > 0

  const docsSection = (documents ?? []).length > 0
    ? (documents ?? []).map(d => {
        const labelName = DOC_LABEL_NAMES[d.label] ?? d.label
        const content = d.content.length > 4000 ? d.content.slice(0, 4000) + '\n[truncated]' : d.content
        return `[${labelName}]\n${content}`
      }).join('\n\n')
    : null

  const prompt = `Prepare an elite pre-interview brief for the following situation. This is the level of preparation a top executive coach produces — specific, direct, and grounded in the actual data below.

CANDIDATE
Name: ${name}${profile?.current_title ? `\nCurrent/recent title: ${profile.current_title}` : ''}${profile?.current_company ? `\nCurrent/recent company: ${profile.current_company}` : ''}
Target roles: ${targetTitles}
Target sectors: ${targetSectors}${profile?.positioning_summary ? `\nPositioning: ${profile.positioning_summary}` : ''}${profile?.resume_text ? `\nResume / career history:\n${profile.resume_text.slice(0, 6000)}` : ''}${profile?.beyond_resume ? `\nBeyond the resume: ${profile.beyond_resume}` : ''}

COMPANY
Name: ${company.name}${company.sector ? `\nSector: ${company.sector}` : ''}
Pipeline stage: ${company.stage}${company.notes ? `\nIntel and notes: ${company.notes}` : ''}

JOB SCAN DATA
${scanSection}

KNOWN CONTACTS
${contactSection}${docsSection ? `\n\nDOCUMENTS\n${docsSection}` : ''}

---

Write the brief with these exact sections, using ## for each header:

## The Situation
What is actually driving this hire? What problem does this organization need solved, and why now? Infer from the sector, pipeline stage, notes, and scan data. Be direct. This sets the frame for everything else.

## Win Thesis
One paragraph. Written as a conviction, not a summary. Not why the candidate is qualified — why they win this specific role over everyone else being considered. What is the decisive advantage. Make the candidate feel it.

## The Narrative
How to tell their story for THIS room. Which chapters of their background to lead with, which to compress, which to leave out entirely. Close with one specific through-line sentence they can use as their opening positioning statement — ready to say verbatim.

## Anticipated Pushback
The 3–4 most likely objections or challenges this candidate will face. For each, state the objection directly and give the exact counter. Format each as:
**They push:** [the objection]
**You say:** [specific counter — not defensive, not vague]

## Talking Points
5 specific, story-anchored points to make in the interview. Each must connect an element of the candidate's actual background to this company's specific situation. Not generic strengths — points that land in this room. Format:
**[Point title]** [2–3 sentences: what to say and exactly why it resonates here]

## Questions to Ask
5 questions that signal the candidate is a strategic peer, not an applicant. Each should demonstrate a specific kind of executive intelligence. After each question, one sentence on what it signals to the interviewers.

## First 90 Days Signal
2–3 specific observations or priorities to surface naturally in conversation — not as a formal plan, but as proof the candidate has already started thinking like an insider. Phrase each as something they'd actually say in the room, then note why it lands.

## What to Leave Out
3–4 explicit topics, framings, or stories to avoid in this specific conversation, and why each would hurt them here. Be direct.${hasContacts ? '\n\n## People\nFor each known contact: when to surface the name, how to frame the relationship, and what it signals to the room.' : ''}

Tone: direct, senior-to-senior. Short paragraphs. No em dashes. No hedging. No motivational language.`

  return prompt
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { userId } = auth
  const supabase = await createClient()

  if (await isRateLimited(supabase, userId)) {
    return new Response(JSON.stringify({ error: 'Monthly token limit reached.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { id: companyId } = await params
  const { company, profile, scanResults, contacts, documents } = await loadContext(supabase, companyId, userId)

  if (!company) return new Response('Not found', { status: 404 })

  const userPrompt = buildContext(company, profile, scanResults, contacts, documents)

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
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { userId } = auth
  const supabase = await createClient()

  if (await isRateLimited(supabase, userId)) {
    return new Response(JSON.stringify({ error: 'Monthly token limit reached.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.json().catch(() => null)
  if (!body?.brief || !body?.request) {
    return new Response('Missing brief or request', { status: 400 })
  }

  const { brief, request: refinementRequest } = body as { brief: string; request: string }

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
