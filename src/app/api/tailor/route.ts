import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscription, canAccessFeature } from '@/lib/subscription'

const SYSTEM_PROMPT = `You are an executive resume writer specializing in senior technology leaders (CIO, CTO, VP Engineering, COO, CDO). You rewrite resumes to match specific job descriptions without losing the candidate's authentic voice.

Rules:
- No em dashes. Replace with periods, commas, or restructure. This is the most reliable signal of AI-generated text.
- No filler phrases: "results-driven", "proven track record", "dynamic leader", "passionate about", "leverage", "spearheaded", "orchestrated"
- Achievement bullets need a number. If the resume has "Improved team performance" rewrite it as "Raised on-time delivery from 71% to 93%". If no figures are available, write the bullet to invite the question rather than inventing data.
- One outcome per bullet. Not "built the team, scaled the platform, and cut costs by 40%."
- Match the job description language without keyword-stuffing. Use their exact phrases where natural.
- Preserve the candidate's voice. Read the original resume for sentence rhythm, vocabulary level, and formality. Match it.
- Reorder sections and bullets by relevance to this specific role.
- Cut anything that does not serve this application.

Output format - use these exact headers:

## TAILORED RESUME
[Full tailored resume text, ready to copy and use]

## KEYWORD ANALYSIS
Present: [comma-separated list of key JD terms that appear in the tailored version]
Missing: [comma-separated list of important JD terms not in the resume - things the candidate should address verbally]

## KEY CHANGES
[3-5 bullets describing what changed and why - concrete, not generic]`

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const sub = await getUserSubscription(user.id)
  if (!canAccessFeature(sub, 'resume_tailor')) {
    return new Response(
      JSON.stringify({ error: 'Resume tailoring requires an Active plan.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let resumeText: string, jobDescription: string, companyName: string, targetTitle: string
  try {
    const body = await request.json()
    resumeText    = (body.resumeText    ?? '').trim()
    jobDescription = (body.jobDescription ?? '').trim()
    companyName   = (body.companyName   ?? '').trim()
    targetTitle   = (body.targetTitle   ?? '').trim()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 })
  }

  if (!resumeText || resumeText.length < 200) {
    return new Response(
      JSON.stringify({ error: 'Resume text is too short. Update your profile first.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
  if (!jobDescription || jobDescription.length < 100) {
    return new Response(
      JSON.stringify({ error: 'Paste the full job description (at least a few paragraphs).' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const contextLines = [
    companyName  && `Company: ${companyName}`,
    targetTitle  && `Target title: ${targetTitle}`,
  ].filter(Boolean).join('\n')

  const userMessage = [
    contextLines,
    `Job Description:\n${jobDescription.slice(0, 8000)}`,
    `Resume:\n${resumeText.slice(0, 12000)}`,
  ].filter(Boolean).join('\n\n')

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
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
