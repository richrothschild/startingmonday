import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { userId } = auth
  const body = await request.json().catch(() => ({}))
  const { contactId, goal, additionalContext } = body

  if (!contactId || !goal) {
    return NextResponse.json({ error: 'contactId and goal are required' }, { status: 400 })
  }

  const supabase = await createClient()

  const [{ data: contact }, { data: profile }] = await Promise.all([
    supabase
      .from('contacts')
      .select('name, title, firm, channel, notes, companies(name)')
      .eq('id', contactId)
      .eq('user_id', userId)
      .single(),
    supabase
      .from('user_profiles')
      .select('full_name, positioning_summary, target_titles, target_sectors, resume_text, beyond_resume')
      .eq('user_id', userId)
      .single(),
  ])

  if (!contact) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }

  const companyName = Array.isArray(contact.companies)
    ? (contact.companies[0] as { name: string } | undefined)?.name ?? null
    : (contact.companies as { name: string } | null)?.name ?? null

  const contactDesc = [
    `Name: ${contact.name}`,
    contact.title ? `Title: ${contact.title}` : null,
    contact.firm ? `Firm: ${contact.firm}` : companyName ? `Company: ${companyName}` : null,
    contact.channel ? `How we met: ${contact.channel}` : null,
    contact.notes ? `Notes: ${contact.notes}` : null,
  ].filter(Boolean).join('\n')

  const senderDesc = [
    profile?.full_name ? `Name: ${profile.full_name}` : null,
    profile?.positioning_summary ? `Background: ${profile.positioning_summary}` : null,
    profile?.target_titles ? `Target roles: ${profile.target_titles}` : null,
    profile?.target_sectors ? `Target sectors: ${profile.target_sectors}` : null,
    profile?.beyond_resume ? `Additional context: ${profile.beyond_resume}` : null,
  ].filter(Boolean).join('\n')

  const prompt = `You are helping a senior executive draft a personalized outreach message.

SENDER:
${senderDesc || 'A senior executive in job search'}

RECIPIENT:
${contactDesc}

GOAL: ${goal}${additionalContext ? `\n\nADDITIONAL CONTEXT: ${additionalContext}` : ''}

Write a concise, warm, professional outreach message. Guidelines:
- 3-5 short paragraphs maximum
- Open with a specific, genuine reference to the person or how they met — not a generic opener
- State the ask clearly but without pressure
- Sound like a real human, not a template or AI
- No subject line needed, just the message body
- Do not use phrases like "I hope this finds you well", "I wanted to reach out", "touch base", or "circle back"
- End with a clear, low-friction call to action`

  const stream = await anthropic.messages.stream({
    model: process.env.ANTHROPIC_PREP_MODEL || 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new NextResponse(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
