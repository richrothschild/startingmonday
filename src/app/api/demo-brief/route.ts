import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM =
  'You are a senior executive coach preparing a candidate for a high-stakes interview. ' +
  'Rules: Be specific. Name real business conditions, strategic pressures, and known challenges for this specific company. ' +
  'No generic advice. Every sentence must be specific to this company and this role. ' +
  'No filler. No em dashes. No motivational language. This is coaching, not cheerleading.'

export async function POST(request: NextRequest) {
  let company: string, role: string
  try {
    const body = await request.json()
    company = typeof body.company === 'string' ? body.company.trim() : ''
    role    = typeof body.role    === 'string' ? body.role.trim()    : ''
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  if (!company || !role) return new Response('company and role required', { status: 400 })
  if (company.length > 200 || role.length > 200) return new Response('Input too long', { status: 400 })

  const prompt = `Generate a prep brief for a candidate interviewing for ${role} at ${company}.

## What ${company} Is Navigating Right Now
4-5 bullet points. The specific business conditions, strategic priorities, and known challenges this company faces right now. Name their competitive dynamics, recent leadership transitions, strategic shifts, or market pressures. Be specific to this company's actual situation, not generic industry trends.

## What They Need in a ${role}
4-5 bullet points. Given the company's specific situation, the capabilities and experience that will matter most for this role. What problems this person will be asked to solve in the first 12 months. What will make them succeed or fail at this specific company.

## How to Open the First Conversation
3-4 sentences. The specific frame to use in the first 10 minutes. Not a generic opening. A narrative that connects a senior leader's background to this company's actual situation. Reference something real and specific about the company.

## Five Questions to Prepare For
Five questions this company is likely to ask a ${role} candidate. For each, one sentence of coaching on how to answer it. Make the questions specific to this company's situation.

Use ## for section headers. Use - for bullets. No em dashes. Write at senior executive level. Be direct.`

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        const model = process.env.ANTHROPIC_PREP_MODEL || 'claude-sonnet-4-6'
        const stream = anthropic.messages.stream({
          model,
          max_tokens: 1400,
          system: SYSTEM,
          messages: [{ role: 'user', content: prompt }],
        })
        stream.on('text', text => controller.enqueue(encoder.encode(text)))
        await stream.finalMessage()
        controller.close()
      } catch (err) {
        controller.enqueue(encoder.encode(`__ERROR__${err instanceof Error ? err.message : 'Unknown error'}`))
        controller.close()
      }
    },
  })

  return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
