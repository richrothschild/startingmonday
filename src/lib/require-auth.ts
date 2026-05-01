import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export type AuthResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }

// Call at the top of every API route handler.
// Returns the authenticated user's ID, or a 401 response to return immediately.
//
// Usage:
//   const auth = await requireAuth(request)
//   if (!auth.ok) return auth.response
//   const { userId } = auth
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
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

  return { ok: true, userId: user.id }
}
