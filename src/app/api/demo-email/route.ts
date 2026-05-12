import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'
  const { allowed, retryAfter } = checkRateLimit(`demo-email:${ip}`, 3)
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests' },
      { status: 429, headers: retryAfter ? { 'Retry-After': String(retryAfter) } : {} },
    )
  }

  let email: string, company: string, role: string
  try {
    const body = await request.json()
    email   = typeof body.email   === 'string' ? body.email.trim().toLowerCase()   : ''
    company = typeof body.company === 'string' ? body.company.trim() : ''
    role    = typeof body.role    === 'string' ? body.role.trim()    : ''
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (!email || !email.includes('@') || !email.includes('.')) {
    return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 })
  }

  const supabase = createAdminClient()
  await supabase
    .from('demo_leads')
    .upsert({ email, company, role }, { onConflict: 'email' })

  return NextResponse.json({ ok: true })
}
