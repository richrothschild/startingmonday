import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from './supabase/admin'
import { resolveDevAuthUser } from './dev-auth'

export type AuthResult =
  | { ok: true; userId: string; response: NextResponse }
  | { ok: false; response: NextResponse }

// Call at the top of every API route handler.
// Returns the authenticated user's ID, or a 401 response to return immediately.
//
// Usage:
//   const auth = await requireAuth(request)
//   if (!auth.ok) return auth.response
//   const { userId } = auth
//
// The success result includes `response` with any refreshed session cookies.
// Pass it to withAuthCookies() when constructing a final NextResponse to ensure
// the browser receives updated tokens.
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const devAuthUser = process.env.NODE_ENV === 'development'
    ? await resolveDevAuthUser(createAdminClient() as any, request.headers)
    : null
  if (devAuthUser) {
    return {
      ok: true,
      userId: devAuthUser.userId,
      response: new NextResponse(),
    }
  }

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { ok: true, userId: user.id, response }
}

// Apply refreshed session cookies from requireAuth to a final API response.
// Use when the auth check may have rotated the refresh token.
export function withAuthCookies(apiResponse: NextResponse, auth: AuthResult & { ok: true }): NextResponse {
  auth.response.cookies.getAll().forEach(cookie => {
    apiResponse.cookies.set(cookie.name, cookie.value, cookie)
  })
  return apiResponse
}
