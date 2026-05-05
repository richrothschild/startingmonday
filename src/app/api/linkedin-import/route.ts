import Anthropic from '@anthropic-ai/sdk'
import { type NextRequest } from 'next/server'
import { requireAuth } from '@/lib/require-auth'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  let text: string
  try {
    const body = await request.json()
    text = typeof body.text === 'string' ? body.text.trim() : ''
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (text.length < 50) return Response.json({ error: 'Paste more of your profile; this is too short to extract from.' }, { status: 400 })
  if (text.length > 60000) text = text.slice(0, 60000)

  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_CHAT_MODEL ?? 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `Extract structured career information from this LinkedIn profile text. Return ONLY a valid JSON object with no explanation, no markdown, no code fences.

Fields (use null for anything that cannot be confidently determined):
{
  "full_name": string | null,
  "current_title": string | null,
  "current_company": string | null,
  "positioning_summary": string | null,
  "resume_text": string | null,
  "beyond_resume": string | null,
  "target_titles": string | null
}

Rules:
- positioning_summary: 2–3 sentences, first person, executive-level narrative. What makes this person distinctive as a leader. If insufficient information, return null.
- resume_text: career history as plain text. Include company names, titles, date ranges, and key accomplishments. Preserve chronological order.
- beyond_resume: board seats, advisory roles, publications, patents, speaking engagements, community work, awards. Omit if none found.
- target_titles: comma-separated list of likely next-step executive titles based on career trajectory. Infer if not stated.

LinkedIn profile text:
---
${text}
---`,
    }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  const match = raw.match(/\{[\s\S]*\}/)

  if (match) {
    try {
      return Response.json(JSON.parse(match[0]))
    } catch {
      // fall through to raw-text fallback
    }
  }

  // Claude returned something unparseable. Return the paste text itself as resume_text
  // so the user's input is never lost. The frontend detects importThin and shows a soft notice.
  return Response.json({
    full_name: null,
    current_title: null,
    current_company: null,
    positioning_summary: null,
    resume_text: text.slice(0, 20000),
    beyond_resume: null,
    target_titles: null,
  })
}
