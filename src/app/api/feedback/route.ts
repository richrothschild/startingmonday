import { type NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const text = (body?.text ?? '').toString().trim()
  const inviteCode = (body?.invite_code ?? '').toString().trim() || null

  if (!text || text.length < 10) {
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
