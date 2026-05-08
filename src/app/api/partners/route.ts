import { type NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const name     = (body?.name     ?? '').toString().trim()
  const company  = (body?.company  ?? '').toString().trim()
  const role     = (body?.role     ?? '').toString().trim()
  const how_heard = (body?.how_heard ?? '').toString().trim() || null
  const interests = (body?.interests ?? '').toString().trim() || null

  if (!name || !company || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = createAdminClient()
  await admin.from('partner_inquiries').insert({ name, company, role, how_heard, interests })

  sendEmail({
    to: 'rothschild@gmail.com',
    subject: `Partner inquiry: ${name} at ${company}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Role:</strong> ${role}</p>
      <p><strong>Partnership type:</strong> ${interests ?? 'Not specified'}</p>
      <p><strong>How they heard:</strong> ${how_heard ?? 'Not specified'}</p>
    `,
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
