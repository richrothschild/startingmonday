import { type NextRequest } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscription, canAccessFeature } from '@/lib/subscription'
import { isRateLimited } from '@/lib/api-usage'
import { type SupabaseClient } from '@supabase/supabase-js'

type PrepAccessResult =
  | { ok: true; userId: string; supabase: SupabaseClient }
  | { ok: false; response: Response }

// Single guard used by all /api/prep/[id]/* routes.
// Checks: auth → subscription (prep_brief feature) → monthly/daily rate limit.
export async function requirePrepAccess(request: NextRequest): Promise<PrepAccessResult> {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth

  const { userId } = auth
  const supabase = await createClient()

  const sub = await getUserSubscription(userId)
  if (!canAccessFeature(sub, 'prep_brief')) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ error: 'Interview prep requires an Active plan.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ),
    }
  }

  if (await isRateLimited(supabase, userId)) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ error: 'Monthly token limit reached.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      ),
    }
  }

  return { ok: true, userId, supabase }
}
