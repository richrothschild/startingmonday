import Anthropic from '@anthropic-ai/sdk'
import { type NextRequest } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited, trackApiUsage } from '@/lib/api-usage'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = 'You are a senior executive search consultant — the kind who only takes clients at VP, SVP, and C-suite level. You have placed hundreds of executives. You are blunt, specific, and you do not waste words. Your job is to give the candidate an honest strategic read on their search and a clear action framework. No hedging. No motivational language. No generic advice. No em dashes.'

function makeStream(prompt: string, supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: process.env.ANTHROPIC_PREP_MODEL ?? 'claude-sonnet-4-6',
          max_tokens: 2000,
          system: SYSTEM,
          messages: [{ role: 'user', content: prompt }],
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

export async function GET(request: NextRequest) {
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

  const [{ data: profile }, { data: companies }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('full_name, current_title, current_company, target_titles, target_sectors, target_locations, positioning_summary, resume_text, beyond_resume, search_status')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('companies')
      .select('name, sector, stage')
      .eq('user_id', userId)
      .is('archived_at', null)
      .order('fit_score', { ascending: false, nullsFirst: false })
      .limit(20),
  ])

  const name = profile?.full_name ?? 'the candidate'
  const targetTitles = (profile?.target_titles ?? []).join(', ') || 'Not specified'
  const targetSectors = (profile?.target_sectors ?? []).join(', ') || 'Not specified'
  const targetLocations = (profile?.target_locations ?? []).join(', ') || 'Not specified'

  const pipelineSection = (companies ?? []).length > 0
    ? (companies ?? []).map(c => `- ${c.name}${c.sector ? ` (${c.sector})` : ''} — ${c.stage}`).join('\n')
    : 'No target companies added yet.'

  const prompt = `Produce a Search Strategy Brief for this executive. This is what you say in the first real meeting — honest, specific, direct.

CANDIDATE
Name: ${name}${profile?.current_title ? `\nCurrent/recent title: ${profile.current_title}` : ''}${profile?.current_company ? `\nCurrent/recent company: ${profile.current_company}` : ''}
Target roles: ${targetTitles}
Target sectors: ${targetSectors}
Target locations: ${targetLocations}${profile?.search_status ? `\nSearch status: ${profile.search_status}` : ''}${profile?.positioning_summary ? `\nSelf-positioning: ${profile.positioning_summary}` : ''}${profile?.resume_text ? `\nResume / career history:\n${profile.resume_text.slice(0, 5000)}` : ''}${profile?.beyond_resume ? `\nBeyond the resume: ${profile.beyond_resume}` : ''}

CURRENT PIPELINE (${(companies ?? []).length} companies)
${pipelineSection}

---

Write the brief with these exact sections, using ## for each header:

## Your Position
An honest read on where this person actually stands in the market. What's working in their favor, what's working against them, and what the market looks like for their profile right now. Not encouragement — a real assessment. Include whether the stated target roles are realistic, stretchy, or off-base.

## Target Role Profile
Primary target titles to pursue. 2–3 adjacent alternatives worth considering that they may not have thought of — explain why each is a legitimate fit and where the opportunity surface is. Flag any titles they listed that are likely to be low-yield and why.

## Target Company Profile
What kinds of organizations are most likely to hire them. Size, stage, ownership structure, sector priorities. Where the realistic opportunity surface actually is at their level versus where candidates at this level typically waste time.

## Your Narrative
The core story they need to tell. One clear through-line that explains the arc of their career and why this search makes sense. What to lead with in every conversation, what to compress, what to leave out. Close with one sentence they can open every conversation with — something they can say verbatim.

## Outreach Framework
How to actually work this search. Specific breakdown of where to focus across: warm network, cold outreach, executive recruiters/search firms, and direct approach. What works at this level and what doesn't. One specific tactic for each channel.

## Gaps to Get Ahead Of
2–3 objections or gaps they will face repeatedly. For each, state what it is directly and give the specific framing or counter. These are the things that will kill their candidacy if not addressed proactively.

## First 30 Days
8–10 concrete actions in priority order. Not strategy — specific moves. Each should be completable in the next month. Format each as an action, not a principle.

Tone: direct, senior-to-senior, no hedging. Short paragraphs. No em dashes. No motivational language. No generic advice.`

  const readable = makeStream(prompt, supabase, userId)

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
