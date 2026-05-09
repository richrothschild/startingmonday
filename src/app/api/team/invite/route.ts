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
    subject: `${inviterName} gave you access to Starting Monday`,
    html: `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:560px;margin:40px auto;padding:0 16px;color:#334155;">
<p style="font-size:13px;color:#64748b;margin:0 0 20px 0;">
  <strong style="color:#0f172a;">Starting Monday</strong>
</p>
<p style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 8px 0;">
  You have been given access
</p>
<p style="font-size:14px;color:#334155;margin:0 0 16px 0;line-height:1.6;">
  ${inviterName} has activated a seat for you on Starting Monday -- an AI-powered platform for senior executive job searches.
</p>
<p style="font-size:14px;color:#334155;margin:0 0 24px 0;line-height:1.6;">
  Starting Monday gives you daily company intelligence, interview prep briefs, and a full pipeline view of your search.
</p>
<p style="margin:0 0 24px 0;">
  <a href="${joinUrl}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-size:14px;font-weight:600;">Accept your seat</a>
</p>
<p style="font-size:13px;color:#64748b;margin:0 0 8px 0;">
  You will be asked to create a free account or log in. Your access is already waiting.
</p>
<p style="font-size:12px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:16px;margin-top:24px;">
  Starting Monday -- startingmonday.app
</p>
</body></html>`,
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
