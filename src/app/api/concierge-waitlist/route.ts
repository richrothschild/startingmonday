import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  let email: string
  try {
    const body = await request.json()
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (!email || !email.includes('@') || !email.includes('.')) {
    return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 })
  }

  const supabase = createAdminClient()
  await supabase
    .from('demo_leads')
    .upsert({ email, company: 'concierge-waitlist', role: '' }, { onConflict: 'email' })

  return NextResponse.json({ ok: true })
}
