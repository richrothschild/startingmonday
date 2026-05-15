import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard/briefing'

  // Railway proxies requests: request.url uses the internal localhost:8080 address.
  // x-forwarded-host contains the real public hostname (startingmonday.app).
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  const publicOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin

  if (code) {
    const cookieStore = await cookies()

    // Use a JS redirect (location.replace) instead of an HTTP 302 so the
    // OAuth callback URL is replaced in browser history rather than pushed.
    // Pressing Back will skip past the Google account chooser entirely.
    const destination = `${publicOrigin}${next}`
    const response = new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><script>location.replace(${JSON.stringify(destination)})</script></head><body></body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Write to both the Next.js cookie store and directly onto the
              // redirect response; whichever Railway/Next.js uses wins.
              try { cookieStore.set(name, value, options) } catch {}
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      event: 'auth_callback',
      ok: !error && !!data.session,
      userId: data.user?.id ?? null,
      error: error?.message ?? null,
    }))

    if (!error && data.session && data.user) {
      const utmSource = searchParams.get('utm_source')
      const utmMedium = searchParams.get('utm_medium')
      const isNewUser = data.user.created_at
        ? (Date.now() - new Date(data.user.created_at).getTime()) < 60_000
        : false
      // utm_source carries the referral code when signup came through a partner link (?ref=CODE)
      const refCode = utmSource && /^[A-Z0-9]{6,12}$/.test(utmSource) ? utmSource : null
      await Promise.all([
        supabase.from('user_profiles').upsert(
          { user_id: data.user.id, ...(refCode ? { referred_by: refCode } : {}) },
          { onConflict: 'user_id', ignoreDuplicates: true }
        ),
        utmSource
          ? supabase.from('users').update({
              signup_source: utmSource,
              acquisition_channel: utmMedium ?? (refCode ? 'referral' : null),
              referral_source: utmSource,
            }).eq('id', data.user.id)
          : Promise.resolve(),
        isNewUser
          ? fetch(`${publicOrigin}/api/notify/new-user`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: data.user.email, tier: 'trialing', source: utmSource }),
            }).catch(() => {})
          : Promise.resolve(),
        isNewUser && refCode
          ? (async () => {
              const admin = createAdminClient()
              const { data: partner } = await admin
                .from('partners')
                .select('id')
                .eq('referral_code', refCode)
                .eq('is_active', true)
                .maybeSingle()
              if (partner) {
                await admin.from('referral_attributions').upsert(
                  { signup_user_id: data.user.id, partner_id: partner.id },
                  { onConflict: 'signup_user_id', ignoreDuplicates: true }
                )
              }
            })().catch(() => {})
          : Promise.resolve(),
      ])
      return response
    }
  }

  return NextResponse.redirect(`${publicOrigin}/login?error=oauth`)
}
