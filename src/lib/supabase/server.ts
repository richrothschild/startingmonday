import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "./database.types"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { headers } from 'next/headers'
import { createAdminClient as createServiceClient } from './admin'
import { resolveDevAuthUser } from '../dev-auth'

export async function createClient() {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const devAuthUser = process.env.NODE_ENV === 'development'
    ? await resolveDevAuthUser(createServiceClient() as any, headerStore)
    : null

  if (devAuthUser) {
    const adminClient = createServiceClient()
    const fakeUser = {
      id: devAuthUser.userId,
      email: devAuthUser.email,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const authProxy = new Proxy(adminClient.auth, {
      get(target, property, receiver) {
        if (property === 'getUser') {
          return async () => ({ data: { user: fakeUser }, error: null })
        }
        if (property === 'getSession') {
          return async () => ({ data: { session: { user: fakeUser } }, error: null })
        }
        return Reflect.get(target, property, receiver)
      },
    })

    return new Proxy(adminClient, {
      get(target, property, receiver) {
        if (property === 'auth') return authProxy
        return Reflect.get(target, property, receiver)
      },
    })
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component; middleware handles session refresh
          }
        },
      },
    }
  )
}

export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
