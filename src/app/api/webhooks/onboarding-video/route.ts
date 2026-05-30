import { timingSafeEqual } from 'crypto'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { updateOnboardingVideoRunFromWebhook } from '@/lib/onboarding-video-queue'

type OnboardingVideoWebhookPayload = {
  type?: string
  data?: {
    provider_run_id?: string
    message?: string
    video_url?: string
    [key: string]: unknown
  }
}

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function isValidWebhookSecret(secret: string, expected: string): boolean {
  try {
    const a = Buffer.from(secret)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

function parsePayload(rawBody: string): OnboardingVideoWebhookPayload | null {
  try {
    return JSON.parse(rawBody) as OnboardingVideoWebhookPayload
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret') ?? ''
  const expected = process.env.ONBOARDING_VIDEO_WEBHOOK_SECRET ?? ''
  if (!expected || !secret || !isValidWebhookSecret(secret, expected)) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 })
  }

  const rawBody = await request.text()
  const payload = parsePayload(rawBody)
  if (!payload?.type || !payload?.data?.provider_run_id) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const updatedRuns = await updateOnboardingVideoRunFromWebhook(supabase as unknown as any, {
    providerRunId: payload.data.provider_run_id,
    eventType: payload.type,
    eventPayload: payload.data,
  })

  return NextResponse.json({
    ok: true,
    matchedRuns: updatedRuns.length,
  })
}
