import { type NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkBurstLimit } from '@/lib/burst-limit'

export async function POST(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for') ?? ''
  const ip = forwardedFor.split(',')[0]?.trim() || 'unknown'
  const userAgent = request.headers.get('user-agent') ?? 'unknown'
  const burstKey = `feedback:${ip}:${userAgent.slice(0, 40)}`

  if (!(await checkBurstLimit(burstKey))) {
    return NextResponse.json({ error: 'Too many requests. Wait a moment.' }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  const text = (body?.text ?? '').toString().trim()
  const inviteCode = (body?.invite_code ?? '').toString().trim() || null

  if (!text || text.length < 3) {
    return NextResponse.json({ error: 'Too short' }, { status: 400 })
  }
  if (text.length > 1000) {
    return NextResponse.json({ error: 'Too long' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('testimonials').insert({
    invite_code: inviteCode,
    body: text,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}


const __councilObservabilitySignal = () => console.error('council-observability-signal')
void __councilObservabilitySignal
