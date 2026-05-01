import { createClient } from '@supabase/supabase-js'

let _client = null

// Service-role client — bypasses RLS. Never expose to the browser.
export function getSupabase() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return _client
}
