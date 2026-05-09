import { type NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

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
      <p><strong>Name:</strong> ${escHtml(name)}</p>
      <p><strong>Company:</strong> ${escHtml(company)}</p>
      <p><strong>Role:</strong> ${escHtml(role)}</p>
      <p><strong>Partnership type:</strong> ${escHtml(interests ?? 'Not specified')}</p>
      <p><strong>How they heard:</strong> ${escHtml(how_heard ?? 'Not specified')}</p>
    `,
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
