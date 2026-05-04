import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Obvious non-browser clients to block from the public /api/optimize endpoint
const BOT_UA_RE = /^(curl|python-requests|python-urllib|go-http|java\/|wget|scrapy|httpx|aiohttp|libwww-perl|okhttp|axios\/|node-fetch)/i

const NOINDEX = { 'X-Robots-Tag': 'noindex, nofollow' }

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- API routes: early return after header/bot handling ---
  if (pathname.startsWith('/api/')) {
    // Item 8: Block automated clients from the public LinkedIn review tool
    if (pathname === '/api/optimize') {
      const ua = request.headers.get('user-agent') ?? ''
      if (!ua || BOT_UA_RE.test(ua)) {
        return new NextResponse('Forbidden', { status: 403 })
      }
    }
    // Item 6: Tell crawlers not to index API responses
    const res = NextResponse.next()
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return res
  }

  // --- Dashboard routes: session refresh + redirect guard ---
  // Item 4: Refresh Supabase session cookie on every dashboard request.
  // getUser() validates with the Supabase Auth server and rotates the
  // refresh token when needed. getSession() must not be used here.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          Object.entries(NOINDEX).forEach(([k, v]) => supabaseResponse.headers.set(k, v))
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  Object.entries(NOINDEX).forEach(([k, v]) => supabaseResponse.headers.set(k, v))
  return supabaseResponse
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
  ],
}
