import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforcePublicEndpointGuard } from '@/lib/public-endpoint-guard'

export async function POST(request: NextRequest) {
  let email: string
  try {
    const body = await request.json()
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const blocked = await enforcePublicEndpointGuard({
    request,
    rateLimitKey: 'concierge-waitlist',
    maxPerMinute: 3,
  })
  if (blocked) return blocked

  if (!email || !email.includes('@') || !email.includes('.')) {
    return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 })
  }

  const supabase = createAdminClient()
  await supabase
    .from('demo_leads')
    .upsert({ email, company: 'concierge-waitlist', role: '' }, { onConflict: 'email' })

  return NextResponse.json({ ok: true })
}
