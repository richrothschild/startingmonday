import { type NextRequest } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited, trackApiUsage } from '@/lib/api-usage'
import { anthropic, MODELS, TEMP } from '@/lib/anthropic'
import { STRATEGY_SYSTEM } from '@/lib/prompts'

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

  const body = await request.json().catch(() => null)
  if (!body?.brief || !body?.question) {
    return new Response(JSON.stringify({ error: 'Missing brief or question' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { brief, question } = body as { brief: string; question: string }

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: MODELS.sonnet,
          max_tokens: 1000,
          temperature: TEMP.analytical,
          system: STRATEGY_SYSTEM,
          messages: [
            {
              role: 'user',
              content: `You previously produced this Search Strategy Brief:\n\n<brief>\n${brief}\n</brief>\n\nThe candidate has a follow-up question:\n\n${question}\n\nAnswer directly and specifically. Reference the brief where relevant. Keep it tight.`,
            },
          ],
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

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
