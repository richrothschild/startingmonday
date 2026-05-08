import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { APP_URL } from '@/lib/config'

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response
  const { userId } = auth

  const body = await request.json().catch(() => null)
  const email = (body?.email ?? '').toString().trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('user_id', userId)
    .single()

  // Use admin client to insert so the owner_id RLS policy applies correctly
  const admin = createAdminClient()
  const { data: seat, error } = await admin
    .from('team_seats')
    .insert({ owner_id: userId, member_email: email })
    .select('token')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This email has already been invited.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create invite.' }, { status: 500 })
  }

  const inviterName = profile?.full_name ?? 'A colleague'
  const joinUrl = `${APP_URL}/team/join/${seat.token}`

  sendEmail({
    to: email,
    subject: `${inviterName} invited you to Starting Monday`,
    html: `
      <p>Hi,</p>
      <p>${inviterName} has invited you to join their Starting Monday account.</p>
      <p>Starting Monday is an AI-powered platform for senior executive searches: pipeline tracking, company intelligence, and interview prep briefs.</p>
      <p><a href="${joinUrl}" style="font-weight:bold;">Accept your invite</a></p>
      <p>This link will prompt you to create or log in to your account.</p>
      <p style="color:#94a3b8;font-size:12px;">Starting Monday - startingmonday.app</p>
    `,
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
