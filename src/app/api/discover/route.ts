import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/api-usage'
import { getUserSubscription, canAccessFeature } from '@/lib/subscription'
import { anthropic, MODELS } from '@/lib/anthropic'
import { recordTrace } from '@/lib/trace'
const __councilObservabilitySignal = (...args: unknown[]) => console.error(...args)

export type DiscoveryCompany = {
  name: string
  sector: string
  why: string
  fit: number
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { userId } = auth
  const supabase = await createClient()

  const sub = await getUserSubscription(userId, supabase)
  if (!canAccessFeature(sub, 'scan')) {
    return NextResponse.json({ error: 'upgrade_required' }, { status: 403 })
  }

  if (await isRateLimited(supabase, userId)) {
    return NextResponse.json({ error: 'Monthly limit reached.' }, { status: 429 })
  }

  let seeds: string[] = []
  let inlineContext: { currentTitle?: string; persona?: string; targetTitles?: string[] } = {}
  try {
    const body = await request.json()
    if (Array.isArray(body.seeds)) {
      seeds = body.seeds
        .filter((s: unknown): s is string => typeof s === 'string' && s.trim().length > 0)
        .slice(0, 5)
    }
    if (body.context && typeof body.context === 'object') {
      inlineContext = body.context
    }
  } catch { /* no body */ }

  const [{ data: profile }, { data: existing }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('current_title, target_titles, target_sectors, positioning_summary, search_persona')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('companies')
      .select('name')
      .eq('user_id', userId)
      .is('archived_at', null),
  ])

  const existingNames = (existing ?? []).map(c => c.name.toLowerCase())

  // Prefer inline context (from onboarding wizard) over DB profile
  const targetTitles =
    inlineContext.targetTitles?.join(', ') ||
    inlineContext.currentTitle ||
    (Array.isArray(profile?.target_titles) && profile.target_titles.length > 0
      ? profile.target_titles.join(', ')
      : profile?.current_title ?? 'senior technology executive')

  const persona = inlineContext.persona || profile?.search_persona || ''
  const sectors = Array.isArray(profile?.target_sectors) && profile.target_sectors.length > 0
    ? `\nTarget sectors: ${profile.target_sectors.join(', ')}`
    : ''
  const positioning = profile?.positioning_summary
    ? `\nBackground: ${profile.positioning_summary.slice(0, 250)}`
    : ''

  const exclusionNote = existingNames.length > 0
    ? `\n\nExclude these (already in their pipeline): ${existingNames.join(', ')}.`
    : ''

  const seedNote = seeds.length > 0
    ? `\n\nFind companies similar to: ${seeds.join(', ')}. Weight toward organizations similar in type, size, stage, or sector.`
    : ''

  const personaNote = persona === 'csuite'
    ? 'They are targeting C-suite roles (CIO, CTO, COO, CHRO).'
    : persona === 'vp'
    ? 'They are targeting VP/SVP roles, potentially moving to C-suite.'
    : persona === 'board'
    ? 'They are targeting board seats or advisory roles.'
    : ''

  const prompt = `You are helping a senior executive build their job search target list. Suggest 12 companies they should watch.

CANDIDATE
Titles/targets: ${targetTitles}${personaNote ? `\n${personaNote}` : ''}${sectors}${positioning}${seedNote}${exclusionNote}

Return a JSON array of exactly 12 objects:
[
  {
    "name": "Company Name",
    "sector": "Short sector label (e.g. Enterprise Software, Healthcare, Financial Services)",
    "why": "One specific sentence: why this company is a strong fit for this candidate at this level right now. Reference something real and current about the company.",
    "fit": 8
  }
]

Rules:
- fit: integer 1-10, 10 = perfect match for this candidate
- why: be specific. Name what the company is navigating, what makes it a fit, what the role might be. Not generic ("great culture", "growing company").
- Mix sizes: well-known companies and under-the-radar organizations
- Include companies plausibly hiring at this level in the next 12-18 months
- Sort by fit descending
- Return only the JSON array, no explanation, no markdown fences`

  try {
    const model = MODELS.sonnet
    const startMs = Date.now()
    const message = await anthropic.messages.create({
      model,
      max_tokens: 1800,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed: DiscoveryCompany[] = JSON.parse(cleaned)

    recordTrace({
      supabase, userId,
      feature: 'discovery',
      model,
      promptTokens: message.usage.input_tokens ?? 0,
      completionTokens: message.usage.output_tokens ?? 0,
      latencyMs: Date.now() - startMs,
      inputSnapshot: { seeds, target: targetTitles.slice(0, 80) },
      outputSnapshot: raw.slice(0, 500),
    })

    return NextResponse.json(Array.isArray(parsed) ? parsed.slice(0, 12) : [])
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
