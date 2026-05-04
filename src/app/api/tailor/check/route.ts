import { NextRequest } from 'next/server'
import { anthropic, MODELS } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscription, canAccessFeature } from '@/lib/subscription'

const SYSTEM_PROMPT = `You are a senior executive recruiter and hiring manager with 20 years placing C-suite and VP-level technology leaders. You evaluate resumes with ruthless precision.

You will receive a tailored resume and the job description it was tailored for. Score it across five dimensions.

Output format - use these exact headers and follow the format precisely:

## ATS SCORE
[number 0-100 only, nothing else on this line]

## ATS NOTES
Present: [comma-separated JD keywords found in the resume]
Missing: [comma-separated important JD keywords absent from the resume]

## RECRUITER GRADE
[single letter A/B/C/D/F only, nothing else on this line]

## RECRUITER NOTES
[2-4 bullets. Be specific and line-level where possible. What would make a recruiter pause, skip, or call immediately?]

## HIRING MANAGER GRADE
[single letter A/B/C/D/F only, nothing else on this line]

## HIRING MANAGER NOTES
[2-4 bullets. What gaps or strengths will a hiring manager focus on? What will they probe in the first 10 minutes?]

## WEAK BULLETS
[List only the weak bullets - those with no metric, vague scope, or passive construction. Format each as:]
BULLET: [first 8-10 words of the bullet]
FIX: [one sentence on what specifically to add or change]
[blank line between each]

## VERBAL COVER
[2-4 items the JD requires that the resume cannot address on paper. These need to be covered in conversation. Format as bullets.]

## SIX SECOND TEST
[single letter A/B/C/D/F only, nothing else on this line]

## SIX SECOND NOTES
[What does a recruiter see in the first 6 seconds - name, current title, first 2 bullets of most recent role. Does it earn the call? One short paragraph.]`

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

  let tailoredResume: string, jobDescription: string, companyName: string
  try {
    const body = await request.json()
    tailoredResume = (body.tailoredResume ?? '').trim()
    jobDescription = (body.jobDescription ?? '').trim()
    companyName    = (body.companyName    ?? '').trim()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 })
  }

  if (!tailoredResume || !jobDescription) {
    return new Response(JSON.stringify({ error: 'Missing resume or job description.' }), { status: 400 })
  }

  const context = companyName ? `Company: ${companyName}\n\n` : ''
  const userMessage = `${context}Job Description:\n${jobDescription.slice(0, 8000)}\n\nTailored Resume:\n${tailoredResume.slice(0, 12000)}`

  const stream = await anthropic.messages.stream({
    model: MODELS.sonnet,
    max_tokens: 2000,
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
