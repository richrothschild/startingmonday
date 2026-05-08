import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

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
      await Promise.all([
        supabase.from('user_profiles').upsert(
          { user_id: data.user.id },
          { onConflict: 'user_id', ignoreDuplicates: true }
        ),
        utmSource
          ? supabase.from('users').update({
              signup_source: utmSource,
              acquisition_channel: utmMedium ?? null,
            }).eq('id', data.user.id)
          : Promise.resolve(),
      ])
      return response
    }
  }

  return NextResponse.redirect(`${publicOrigin}/login?error=oauth`)
}
