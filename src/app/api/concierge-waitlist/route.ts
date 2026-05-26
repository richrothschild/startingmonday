import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforcePublicEndpointGuard } from '@/lib/public-endpoint-guard'
const __councilObservabilitySignal = (...args: unknown[]) => console.error(...args)

export async function POST(request: NextRequest) {
  let email: string, company: string, role: string, situation: string, program: string
  try {
    const body = await request.json()
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    company = typeof body.company === 'string' ? body.company.trim() : ''
    role = typeof body.role === 'string' ? body.role.trim() : ''
    situation = typeof body.situation === 'string' ? body.situation.trim() : ''
    program = typeof body.program === 'string' ? body.program.trim().toLowerCase() : 'concierge'
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
  const normalizedCompany = company || (program === 'beta' ? 'confidential-beta' : 'concierge-waitlist')
  const roleSummary = [
    role || 'not_provided',
    program === 'beta' ? 'beta' : 'concierge',
    situation ? `note:${situation.slice(0, 220)}` : 'note:none',
  ].join(' | ')

  await supabase
    .from('demo_leads')
    .upsert({ email, company: normalizedCompany, role: roleSummary }, { onConflict: 'email' })

  return NextResponse.json({ ok: true })
}
