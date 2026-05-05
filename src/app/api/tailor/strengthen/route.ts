import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODELS } from '@/lib/anthropic'
import { requireFeatureAccess } from '@/lib/require-feature-access'

const SYSTEM_PROMPT = `You are an expert executive resume writer. You will rewrite specific weak bullets in a resume to be stronger, more specific, and metrics-driven.

Instructions:
- Identify each weak bullet in the resume by matching the first 10+ words to the WEAK BULLETS list provided
- Rewrite ONLY those bullets: add specific metrics, use strong action verbs, make business impact explicit
- Keep ALL other resume content word-for-word identical
- Output ONLY the complete resume text with the weak bullets replaced
- No preamble, no headers, no "Strengthened Resume:" label - just the resume text
- Preserve the exact formatting style (bullet style, capitalization, spacing) of the original`

export async function POST(request: NextRequest) {
  const access = await requireFeatureAccess(request, 'resume_tailor')
  if (!access.ok) return access.response

  let tailoredResume: string, weakBullets: string, jobDescription: string, companyName: string
  try {
    const body = await request.json()
    tailoredResume = (body.tailoredResume ?? '').trim()
    weakBullets    = (body.weakBullets    ?? '').trim()
    jobDescription = (body.jobDescription ?? '').trim()
    companyName    = (body.companyName    ?? '').trim()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!tailoredResume || !weakBullets) {
    return NextResponse.json({ error: 'Missing resume or weak bullets.' }, { status: 400 })
  }

  const context = companyName ? `Company: ${companyName}\n\n` : ''
  const userMessage = `${context}WEAK BULLETS TO STRENGTHEN:
${weakBullets}

JOB DESCRIPTION (for context):
${jobDescription.slice(0, 4000)}

RESUME TO REWRITE:
${tailoredResume.slice(0, 12000)}`

  const stream = await anthropic.messages.stream({
    model: MODELS.sonnet,
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
