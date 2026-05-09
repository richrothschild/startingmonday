import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember } from '@/lib/staff'
import { anthropic, MODELS } from '@/lib/anthropic'

type Pillar = 'search_craft' | 'market_intel' | 'behind_build' | 'user_story' | 'engagement'

const PILLAR_LABELS: Record<Pillar, string> = {
  search_craft:  'Search Craft',
  market_intel:  'Market Intelligence',
  behind_build:  'Behind the Build',
  user_story:    'User Story',
  engagement:    'Engagement',
}

// 4-week Mon/Wed/Fri pillar rotation matching the LinkedIn content strategy.
// week index = (ISO week number - 1) % 4
const ROTATION: [Pillar, Pillar, Pillar][] = [
  ['search_craft',  'behind_build', 'engagement'],   // week 1
  ['market_intel',  'search_craft', 'user_story'],   // week 2
  ['behind_build',  'market_intel', 'engagement'],   // week 3
  ['search_craft',  'user_story',   'market_intel'], // week 4
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
  const dow = date.getUTCDay() // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  if (dow === 0 || dow === 6) return null // weekend, not a post day

  // Determine Mon/Wed/Fri slot index (0, 1, 2)
  const slotIndex = dow === 1 ? 0 : dow === 3 ? 1 : dow === 5 ? 2 : null
  if (slotIndex === null) return null // Tue or Thu

  // ISO week number (1-based)
  const jan4 = new Date(Date.UTC(date.getUTCFullYear(), 0, 4))
  const dayOfYear = Math.floor((date.getTime() - jan4.getTime()) / 86400000) + jan4.getUTCDay() + 1
  const isoWeek = Math.floor((dayOfYear - date.getUTCDay() + 10) / 7)
  const weekMod4 = (isoWeek - 1) % 4

  return ROTATION[weekMod4][slotIndex]
}

function isPostDay(date: Date): boolean {
  const dow = date.getUTCDay()
  return dow === 1 || dow === 3 || dow === 5
}

async function generateDraft(pillar: Pillar, recentSignals: string[]): Promise<string> {
  const signalContext = recentSignals.length
    ? `Recent signals from Starting Monday this week:\n${recentSignals.slice(0, 5).map(s => `- ${s}`).join('\n')}`
    : ''

  const prompt = `You are writing a LinkedIn post for Starting Monday, a daily intelligence platform for senior technology executives in active job search.

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

Write only the post text. Nothing else.`

  const message = await anthropic.messages.create({
    model: MODELS.haiku,
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  return (message.content[0] as { type: string; text: string })?.text?.trim() ?? ''
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Allow ?date=YYYY-MM-DD override (defaults to today UTC)
  const dateParam = request.nextUrl.searchParams.get('date')
  const targetDate = dateParam ? new Date(dateParam + 'T12:00:00Z') : new Date()
  const dateStr = targetDate.toISOString().split('T')[0]

  if (!isPostDay(targetDate)) {
    return NextResponse.json({ isPostDay: false, dateStr, nextPostDays: getNextPostDays(targetDate) })
  }

  const pillar = getPillarForDate(targetDate)
  if (!pillar) return NextResponse.json({ isPostDay: false, dateStr, nextPostDays: getNextPostDays(targetDate) })

  const admin = createAdminClient()

  // Return existing draft if one exists
  const { data: existing } = await admin
    .from('social_posts')
    .select('*')
    .eq('post_date', dateStr)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ isPostDay: true, dateStr, pillar, pillarLabel: PILLAR_LABELS[pillar], post: existing })
  }

  // Pull recent signals (last 7 days) as context for generation
  const since7d = new Date(targetDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data: signalRows } = await admin
    .from('company_signals')
    .select('signal_summary, signal_type')
    .gte('signal_date', since7d)
    .neq('signal_type', 'pattern_alert')
    .order('signal_date', { ascending: false })
    .limit(10)

  const recentSignals = (signalRows ?? []).map((s: { signal_summary: string; signal_type: string }) =>
    `[${s.signal_type}] ${s.signal_summary}`
  )

  const draftText = await generateDraft(pillar, recentSignals)

  const { data: created, error } = await admin
    .from('social_posts')
    .insert({ post_date: dateStr, pillar, draft_text: draftText })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ isPostDay: true, dateStr, pillar, pillarLabel: PILLAR_LABELS[pillar], post: created })
}

function getNextPostDays(from: Date): string[] {
  const result: string[] = []
  const d = new Date(from)
  for (let i = 1; i <= 7 && result.length < 3; i++) {
    d.setUTCDate(d.getUTCDate() + 1)
    if (isPostDay(d)) result.push(d.toISOString().split('T')[0])
  }
  return result
}
