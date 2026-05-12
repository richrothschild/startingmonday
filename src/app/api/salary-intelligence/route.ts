import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscription, canAccessFeature } from '@/lib/subscription'
import { checkBurstLimit } from '@/lib/burst-limit'
import { isRateLimited } from '@/lib/api-usage'
import { anthropic, MODELS } from '@/lib/anthropic'
import { recordTrace } from '@/lib/trace'

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { userId } = auth
  const supabase = await createClient()

  const sub = await getUserSubscription(userId, supabase)
  if (!canAccessFeature(sub, 'salary_intelligence')) {
    return NextResponse.json({ error: 'upgrade_required' }, { status: 403 })
  }

  if (!checkBurstLimit(userId)) {
    return NextResponse.json({ error: 'Too many requests. Wait a moment.' }, { status: 429 })
  }
  if (await isRateLimited(supabase, userId)) {
    return NextResponse.json({ error: 'Monthly token limit reached.' }, { status: 429 })
  }

  let role: string, company: string, location: string
  try {
    const body = await request.json()
    role     = typeof body.role     === 'string' ? body.role.trim()     : ''
    company  = typeof body.company  === 'string' ? body.company.trim()  : ''
    location = typeof body.location === 'string' ? body.location.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!role || !company) {
    return NextResponse.json({ error: 'role and company are required' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('current_title, positioning_summary, resume_text')
    .eq('user_id', userId)
    .single()

  const locationStr = location || 'United States'
  const backgroundStr = profile?.positioning_summary
    ? `\nCandidate background: ${profile.positioning_summary.slice(0, 400)}`
    : profile?.current_title
    ? `\nCandidate current title: ${profile.current_title}`
    : ''

  const prompt = `You are a compensation expert advising a senior executive entering salary negotiations. Provide a specific, defensible compensation analysis.

Role: ${role}
Company: ${company}
Location: ${locationStr}${backgroundStr}

Return a JSON object with exactly this structure:
{
  "low": number (floor in USD, total cash comp),
  "target": number (realistic target, total cash comp),
  "ceiling": number (stretch ceiling with leverage, total cash comp),
  "currency": "USD",
  "notes": "2-3 sentences on what drives the range at this company specifically - size, stage, sector, comp philosophy",
  "negotiation_script": "4-6 sentences. Exact language to use when they present the offer. Start with acknowledgment, move to anchor at ceiling, reference market data, ask for time.",
  "pushback_responses": [
    { "objection": "That is our standard band for this role", "response": "2-3 sentence counter" },
    { "objection": "We cannot go higher on base", "response": "2-3 sentence counter focused on total comp" },
    { "objection": "We need a decision by end of week", "response": "2-3 sentence counter on timeline" }
  ]
}

Use real market knowledge. Numbers should be specific, not rounded. Return only the JSON object.`

  const model = MODELS.sonnet
  const startMs = Date.now()

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const result = JSON.parse(raw)

    recordTrace({
      supabase, userId,
      feature: 'salary_intelligence',
      model,
      promptTokens: message.usage.input_tokens ?? 0,
      completionTokens: message.usage.output_tokens ?? 0,
      latencyMs: Date.now() - startMs,
      inputSnapshot: { role, company, location: locationStr },
      outputSnapshot: raw,
    })

    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ ts: new Date().toISOString(), event: 'salary_intelligence_error', error: msg, userId }))
    return NextResponse.json({ error: 'Failed to generate salary analysis' }, { status: 500 })
  }
}
