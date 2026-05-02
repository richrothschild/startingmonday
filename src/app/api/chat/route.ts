import Anthropic from '@anthropic-ai/sdk'
import { type NextRequest } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { todayInTz, fullDateInTz } from '@/lib/date'
import { isRateLimited, trackApiUsage, trimMessages } from '@/lib/api-usage'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
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

  let rawMessages: unknown[]
  try {
    const body = await request.json()
    rawMessages = Array.isArray(body?.messages) ? body.messages : []
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const messages = trimMessages(rawMessages as { role: string; content: string }[])

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, briefing_timezone')
    .eq('user_id', userId)
    .single()

  const tz = profile?.briefing_timezone ?? 'UTC'
  const name = profile?.full_name?.split(' ')[0] ?? 'there'
  const today = fullDateInTz(tz)

  const [{ data: companies }, { data: followUps }] = await Promise.all([
    supabase
      .from('companies')
      .select('name, stage, fit_score, sector, notes')
      .eq('user_id', userId)
      .is('archived_at', null)
      .order('fit_score', { ascending: false, nullsFirst: false }),
    supabase
      .from('follow_ups')
      .select('action, due_date, companies(name)')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .lte('due_date', todayInTz(tz))
      .order('due_date', { ascending: true }),
  ])

  const pipelineLines = (companies ?? [])
    .map(c =>
      `- ${c.name} | ${c.stage}${c.fit_score ? ` | fit: ${c.fit_score}/10` : ''}${c.sector ? ` | ${c.sector}` : ''}${c.notes ? ` — ${c.notes}` : ''}`
    )
    .join('\n')

  const actionsLines = (followUps ?? [])
    .map(fu => {
      const co = fu.companies as unknown as { name: string } | null
      return `- ${fu.action}${co ? ` (${co.name})` : ''} — due ${fu.due_date}`
    })
    .join('\n')

  const systemPrompt = `You are a strategic advisor helping ${name} with their executive job search. Speak directly and precisely — senior to senior. No motivational clichés. Short sentences. No em dashes.

Today is ${today}.

PIPELINE (${(companies ?? []).length} companies):
${pipelineLines || 'No companies yet.'}

ACTIONS OVERDUE OR DUE TODAY:
${actionsLines || 'None.'}`

  const encoder = new TextEncoder()
  let totalTokens = 0

  const readable = new ReadableStream({
    async start(controller) {
      const stream = anthropic.messages.stream({
        model: process.env.ANTHROPIC_CHAT_MODEL ?? 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      })

      stream.on('text', (text) => {
        controller.enqueue(encoder.encode(text))
      })

      stream.on('error', (err) => {
        controller.error(err)
      })

      const final = await stream.finalMessage()
      totalTokens = (final.usage.input_tokens ?? 0) + (final.usage.output_tokens ?? 0)
      controller.close()

      // Fire-and-forget usage tracking after stream closes
      trackApiUsage(supabase, userId, totalTokens).catch(() => {})
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
