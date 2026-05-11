import { type NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid')
  if (!uid) return new NextResponse('Invalid link.', { status: 400 })

  let userId: string
  try {
    userId = Buffer.from(uid, 'base64url').toString()
  } catch {
    return new NextResponse('Invalid link.', { status: 400 })
  }

  if (!UUID_RE.test(userId)) {
    return new NextResponse('Invalid link.', { status: 400 })
  }

  const admin = createAdminClient()
  await admin
    .from('users')
    .update({ drip_unsubscribed_at: new Date().toISOString() })
    .eq('id', userId)
    .is('drip_unsubscribed_at', null)

  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unsubscribed</title>
    <style>body{font-family:-apple-system,sans-serif;max-width:480px;margin:80px auto;padding:0 24px;color:#334155;}
    h1{font-size:20px;color:#0f172a;margin:0 0 12px 0;}p{font-size:14px;line-height:1.7;margin:0 0 12px 0;}</style>
    </head><body>
    <h1>You are unsubscribed.</h1>
    <p>You will not receive any more activation emails from Starting Monday.</p>
    <p>Your account and trial are unaffected. You can still log in and use the platform.</p>
    <p><a href="/" style="color:#0f172a;">Return to Starting Monday</a></p>
    </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}
