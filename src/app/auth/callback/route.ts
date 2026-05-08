import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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
    // Pre-build the redirect response before exchangeCodeForSession so Supabase
    // can write Set-Cookie headers directly onto it. Returning a different
    // NextResponse.redirect() after the exchange drops those headers, leaving
    // the browser with no session cookie and causing /dashboard -> /login flashing.
    const response = NextResponse.redirect(`${publicOrigin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      await supabase.from('user_profiles').upsert(
        { user_id: data.user.id },
        { onConflict: 'user_id', ignoreDuplicates: true }
      )
      return response
    }
  }

  return NextResponse.redirect(`${publicOrigin}/login?error=oauth`)
}
