import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforcePublicEndpointGuard } from '@/lib/public-endpoint-guard'

export async function POST(request: NextRequest) {
  let email: string, company: string, role: string, captchaToken: string
  try {
    const body = await request.json()
    email   = typeof body.email   === 'string' ? body.email.trim().toLowerCase()   : ''
    company = typeof body.company === 'string' ? body.company.trim() : ''
    role    = typeof body.role    === 'string' ? body.role.trim()    : ''
    captchaToken = typeof body.captchaToken === 'string' ? body.captchaToken.trim() : ''
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const blocked = await enforcePublicEndpointGuard({
    request,
    captchaToken: captchaToken || null,
    rateLimitKey: 'demo-email',
    maxPerMinute: 3,
  })
  if (blocked) return blocked

  if (!email || !email.includes('@') || !email.includes('.')) {
    return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 })
  }

  const supabase = createAdminClient()
  await supabase
    .from('demo_leads')
    .upsert({ email, company, role }, { onConflict: 'email' })

  return NextResponse.json({ ok: true })
}
