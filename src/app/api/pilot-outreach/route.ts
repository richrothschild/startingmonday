import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const name = (body?.name ?? '').toString().trim()
  const email = (body?.email ?? '').toString().trim().toLowerCase()
  const company = (body?.company ?? '').toString().trim()
  const message = (body?.message ?? '').toString().trim()
  if (!name || !email || !company) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  const admin = createAdminClient()
  await admin.from('pilot_outreach').insert({ name, email, company, message })
  await sendEmail({
    to: process.env.OWNER_EMAIL ?? '',
    subject: `Pilot Outreach: ${name} (${company})`,
    html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Company:</strong> ${company}</p><p><strong>Message:</strong> ${message}</p>`
  })
  return NextResponse.json({ ok: true })
}
