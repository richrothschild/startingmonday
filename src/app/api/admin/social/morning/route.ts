import { type NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { anthropic, MODELS } from '@/lib/anthropic'

type Pillar = 'search_craft' | 'market_intel' | 'behind_build' | 'user_story' | 'engagement'

const PILLAR_LABELS: Record<Pillar, string> = {
  search_craft:  'Search Craft',
  market_intel:  'Market Intelligence',
  behind_build:  'Behind the Build',
  user_story:    'User Story',
  engagement:    'Engagement',
}

const ROTATION: [Pillar, Pillar, Pillar][] = [
  ['search_craft',  'behind_build', 'engagement'],
  ['market_intel',  'search_craft', 'user_story'],
  ['behind_build',  'market_intel', 'engagement'],
  ['search_craft',  'user_story',   'market_intel'],
]

const PILLAR_PROMPTS: Record<Pillar, string> = {
  search_craft:
    'Write a Search Craft post: tactical, specific advice for the executive C-suite search process. Focus on what works at this level that does not work lower down, or what conventional wisdom is wrong at the VP+ level.',
  market_intel:
    'Write a Market Intelligence post: what is happening in the executive hiring market right now. Pick one specific sector, role, or timing pattern. Make a concrete, specific claim. If there are recent signals in the context below, use the most interesting one as the hook.',
  behind_build:
    'Write a Behind the Build post: transparent product development. Choose one specific Starting Monday feature, explain what problem it solves, and why the team built it in that sequence. Founder voice, not marketing voice.',
  user_story:
    'Write a User Story post: an anonymized pattern from executive search behavior. One specific, surprising insight that generalizes. Do not name anyone. Frame it as a pattern, not a testimonial.',
  engagement:
    'Write an Engagement post: a question, contrarian take, or implicit poll. The goal is replies and comments. End with a direct question or a take that invites disagreement. Keep it short.',
}

function getPillarForDate(date: Date): Pillar | null {
  const dow = date.getUTCDay()
  const slotIndex = dow === 1 ? 0 : dow === 3 ? 1 : dow === 5 ? 2 : null
  if (slotIndex === null) return null

  const jan4 = new Date(Date.UTC(date.getUTCFullYear(), 0, 4))
  const dayOfYear = Math.floor((date.getTime() - jan4.getTime()) / 86400000) + jan4.getUTCDay() + 1
  const isoWeek = Math.floor((dayOfYear - date.getUTCDay() + 10) / 7)
  const weekMod4 = (isoWeek - 1) % 4

  return ROTATION[weekMod4][slotIndex]
}

async function generateDraft(pillar: Pillar, recentSignals: string[]): Promise<string> {
  const signalContext = recentSignals.length
    ? `Recent signals from Starting Monday this week:\n${recentSignals.slice(0, 5).map(s => `- ${s}`).join('\n')}`
    : ''

  const message = await anthropic.messages.create({
    model: MODELS.haiku,
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `You are writing a LinkedIn post for Starting Monday, a daily intelligence platform for senior technology executives in active job search.

${PILLAR_PROMPTS[pillar]}${signalContext ? `\n\n${signalContext}` : ''}

Format rules:
- First line: a specific, counterintuitive statement or question. Never a throat-clear or "I wanted to share."
- Lines 2-10: 3-4 short sentences developing the point. One idea per sentence. No paragraphs longer than 2-3 sentences.
- Final payoff: specific, actionable, or a reframe of the opening.
- Last line only: 3-5 hashtags. Use #executivesearch and 2-4 situational ones.
- No external links in the post body.
- Do not use em dashes.
- Do not use "I" as the subject of the first sentence.
- Write for CIOs, CTOs, CISOs, CDOs and other senior tech executives. Not generic job seekers.
- Sound like a founder who has worked with hundreds of executives. Direct, no filler.

Write only the post text. Nothing else.`,
    }],
  })

  return (message.content[0] as { type: string; text: string })?.text?.trim() ?? ''
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const today = new Date()
  const dow = today.getUTCDay()
  if (dow !== 1 && dow !== 3 && dow !== 5) {
    return NextResponse.json({ ok: true, sent: false, reason: 'Not a post day' })
  }

  const pillar = getPillarForDate(today)
  if (!pillar) return NextResponse.json({ ok: true, sent: false, reason: 'No pillar' })

  const dateStr = today.toISOString().split('T')[0]
  const admin = createAdminClient()

  // Fetch or generate draft
  let { data: post } = await admin
    .from('social_posts')
    .select('*')
    .eq('post_date', dateStr)
    .maybeSingle()

  if (!post) {
    const since7d = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const { data: signalRows } = await admin
      .from('company_signals')
      .select('signal_summary, signal_type')
      .gte('signal_date', since7d)
      .neq('signal_type', 'pattern_alert')
      .order('signal_date', { ascending: false })
      .limit(10)

    const recentSignals = (signalRows ?? []).map(
      (s: { signal_summary: string; signal_type: string }) => `[${s.signal_type}] ${s.signal_summary}`
    )

    const draftText = await generateDraft(pillar, recentSignals)
    const { data: created } = await admin
      .from('social_posts')
      .insert({ post_date: dateStr, pillar, draft_text: draftText })
      .select()
      .single()
    post = created
  }

  if (!post) return NextResponse.json({ error: 'Failed to prepare post' }, { status: 500 })

  // Skip if already posted
  if (post.is_posted) {
    return NextResponse.json({ ok: true, sent: false, reason: 'Already posted', pillar, dateStr })
  }

  const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL
  if (!makeWebhookUrl) {
    return NextResponse.json({ error: 'MAKE_WEBHOOK_URL not configured' }, { status: 500 })
  }

  const makeRes = await fetch(makeWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: post.draft_text, post_date: dateStr, pillar }),
  })

  if (!makeRes.ok) {
    const errText = await makeRes.text().catch(() => '')
    console.error('[social/morning] Make.com webhook error', { status: makeRes.status, body: errText })
    return NextResponse.json({ error: 'Make.com webhook error', detail: errText }, { status: 502 })
  }

  await admin
    .from('social_posts')
    .update({ is_posted: true, posted_at: new Date().toISOString() })
    .eq('id', post.id)

  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    event: 'social_auto_posted',
    pillar,
    pillarLabel: PILLAR_LABELS[pillar],
    dateStr,
    postId: post.id,
  }))

  return NextResponse.json({ ok: true, sent: true, pillar, pillarLabel: PILLAR_LABELS[pillar], dateStr })
}
