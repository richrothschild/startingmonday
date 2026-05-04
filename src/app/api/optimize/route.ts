import { NextRequest } from 'next/server'
import { anthropic, MODELS } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'

const DAILY_LIMIT = 3

const SYSTEM_PROMPT = `You are an executive LinkedIn profile coach specializing in senior technology and business leaders (CIO, CTO, VP Engineering, COO, CDO). You review LinkedIn profiles and deliver honest, direct, actionable feedback.

Format your response exactly as follows - use these exact section headers:

## Overall Assessment
One paragraph. Be direct and specific. Name the single biggest strength and the single most important thing to fix.

## Section Grades

**Headline** - Grade: [A/B/C/D/F]
2-3 sentences. What works, what is weak, why this grade.

**About / Summary** - Grade: [A/B/C/D/F]
2-3 sentences. Is it a story or a job description? Does it have a clear value proposition? Does it speak to the reader or about the writer?

**Experience** - Grade: [A/B/C/D/F]
2-3 sentences. Are bullets achievement-focused with metrics, or duty-focused? Does the progression tell a coherent story?

**Skills** - Grade: [A/B/C/D/F]
1-2 sentences. Are the right skills listed? Are they endorsed?

**Profile Completeness** - Grade: [A/B/C/D/F]
1-2 sentences. Photo, connections count, recommendations, featured section.

## Priority Rewrites

Rewrite the 2-3 weakest sections. Be specific - show exactly what to write, not just what to do. Do not add generic filler or AI-sounding language. Write the way the person would actually speak.

### [Section Name] - Rewrite
[The new text, ready to copy-paste into LinkedIn]

### [Section Name] - Rewrite
[The new text, ready to copy-paste into LinkedIn]

Keep the total response under 900 words. Be direct. Executives respond to specificity.`

function dayWindow() {
  return new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
}

export async function POST(request: NextRequest) {
  // Bot detection is handled in middleware.ts (User-Agent check).
  // Here we enforce the persistent per-IP daily rate limit.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  // Use the Supabase anon client; check_and_increment_rate_limit is
  // security definer so anon can call it.
  const supabase = await createClient()
  const { data: allowed } = await supabase.rpc('check_and_increment_rate_limit', {
    p_key:    `ip:${ip}`,
    p_window: dayWindow(),
    p_limit:  DAILY_LIMIT,
  })

  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit reached. You can analyze 3 profiles per day.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let text: string
  try {
    const body = await request.json()
    text = (body.text ?? '').trim()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 })
  }

  if (!text || text.length < 100) {
    return new Response(
      JSON.stringify({ error: 'Paste at least a few sections of your LinkedIn profile.' }),
      { status: 400 }
    )
  }

  if (text.length > 20000) text = text.slice(0, 20000)

  const stream = await anthropic.messages.stream({
    model: MODELS.sonnet,
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Please review this LinkedIn profile:\n\n${text}` }],
  })

  const encoder = new TextEncoder()
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
