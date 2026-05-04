import Anthropic from '@anthropic-ai/sdk'
import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SIGNAL_TYPES = ['funding', 'exec_departure', 'exec_hire', 'acquisition', 'expansion', 'layoffs', 'ipo', 'new_product', 'award']

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { userId } = auth
  const body = await request.json().catch(() => null)
  if (!body?.companyId || !body?.text) {
    return NextResponse.json({ error: 'Missing companyId or text' }, { status: 400 })
  }

  const { companyId, text, sourceUrl } = body as { companyId: string; text: string; sourceUrl?: string }

  const supabase = await createClient()
  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .eq('id', companyId)
    .eq('user_id', userId)
    .single()

  if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const today = new Date().toISOString().split('T')[0]

  const prompt = `You are classifying a piece of news about ${company.name} for an executive job seeker tracking this company.

NEWS TEXT:
${text.slice(0, 3000)}

Extract the following as valid JSON with no markdown fences:
{
  "signal_type": one of: funding | exec_departure | exec_hire | acquisition | expansion | layoffs | ipo | new_product | award,
  "signal_summary": "1-2 sentence factual summary of what happened. Be specific and concrete.",
  "outreach_angle": "1 sentence on how this is a conversation-opener for someone who wants to work there, or null if the signal is not relevant to job seeking.",
  "signal_date": "YYYY-MM-DD (use ${today} if the date is unclear)"
}`

  let parsed: {
    signal_type: string
    signal_summary: string
    outreach_angle: string | null
    signal_date: string
  }

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = msg.content[0].type === 'text' ? msg.content[0].text : ''
    parsed = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Classification failed. Try rephrasing the news.' }, { status: 500 })
  }

  if (!SIGNAL_TYPES.includes(parsed.signal_type)) {
    parsed.signal_type = 'other' in SIGNAL_TYPES ? 'other' : 'new_product'
  }

  const { error } = await supabase.from('company_signals').insert({
    company_id: companyId,
    user_id: userId,
    signal_type: parsed.signal_type,
    signal_summary: parsed.signal_summary,
    outreach_angle: parsed.outreach_angle ?? null,
    signal_date: parsed.signal_date,
    source_url: sourceUrl ?? null,
  })

  if (error) return NextResponse.json({ error: 'Failed to save signal.' }, { status: 500 })

  return NextResponse.json({ ok: true, signal: parsed })
}
