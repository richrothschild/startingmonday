import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { loadAllFeatureDocs, searchFeatureDocs } from '@/lib/feature-docs'
import { requireAuth, withAuthCookies } from '@/lib/require-auth'

const requestSchema = z.object({
  question: z.string().min(3).max(500),
})

function intentLead(question: string): string {
  const lower = question.toLowerCase()
  if (lower.includes('pricing') || lower.includes('cost')) return 'Pricing-oriented matches:'
  if (lower.includes('onboarding') || lower.includes('quick start') || lower.includes('setup')) return 'Onboarding-oriented matches:'
  if (lower.includes('white label') || lower.includes('whitelabel')) return 'White-label matches:'
  return 'Top document matches:'
}

function buildAnswer(question: string, top: Array<{ title: string; summary: string; snippet: string }>): string {
  const lines = [
    `${intentLead(question)} ${question}`,
    '',
  ]

  for (const item of top) {
    lines.push(`- ${item.title}: ${item.summary}`)
    lines.push(`  Context: ${item.snippet}`)
  }

  lines.push('Open the linked docs below for complete sections and full pricing details.')
  return lines.join('\n')
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const jsonWithAuth = (body: unknown, init?: ResponseInit) => withAuthCookies(NextResponse.json(body, init), auth)

  const body = await request.json().catch(() => null)
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return jsonWithAuth({ error: 'Please ask a clear question with at least 3 characters.' }, { status: 400 })
  }

  try {
    const docs = await loadAllFeatureDocs()
    if (docs.length === 0) {
      return jsonWithAuth({ error: 'Feature docs are temporarily unavailable.' }, { status: 503 })
    }

    const ranked = searchFeatureDocs(docs, parsed.data.question)
    if (ranked.length === 0) {
      return jsonWithAuth({
        answer: 'No close matches were found yet. Try keywords like pricing, onboarding, white label, executive coaches, search firms, or outplacement.',
        confidence: 0,
        sources: [],
      })
    }

    const top = ranked.slice(0, 5)
    const answer = buildAnswer(
      parsed.data.question,
      top.slice(0, 3).map((entry) => ({ title: entry.title, summary: entry.summary, snippet: entry.snippet })),
    )

    return jsonWithAuth({
      answer,
      confidence: Math.min(1, (top[0]?.score ?? 0) / 12),
      sources: top,
    })
  } catch (error) {
    Sentry.captureException(error, { extra: { route: 'features/chat', userId: auth.userId } })
    return jsonWithAuth({ error: 'Failed to answer feature question.' }, { status: 500 })
  }
}