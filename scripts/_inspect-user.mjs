import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) {
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = v
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const id = '88866733-968d-4d18-8842-e90f33e70278'

// 1. Full auth record
const { data: u, error: uerr } = await supabase.auth.admin.getUserById(id)
if (uerr) console.error('auth err', uerr.message)
console.log('=== auth.users ===')
console.log(JSON.stringify({
  id: u?.user?.id,
  email: u?.user?.email,
  phone: u?.user?.phone,
  created_at: u?.user?.created_at,
  user_metadata: u?.user?.user_metadata,
  app_metadata: u?.user?.app_metadata,
  identities: u?.user?.identities?.map(i => ({ provider: i.provider, email: i.identity_data?.email, name: i.identity_data?.name })),
}, null, 2))

// 2. Does the email sludunge@ map to more than one profile / user?
const { data: sameEmail } = await supabase
  .from('user_profiles')
  .select('user_id, full_name')
  .limit(50)
// (can't filter on auth email from user_profiles; just show this profile)
console.log('\n=== user_profiles row ===')
const { data: prof } = await supabase.from('user_profiles').select('*').eq('user_id', id).single()
console.log(JSON.stringify(prof, null, 2))

// 3. Is "David Dillion" present anywhere else as a contact/speaker/connection?
for (const [table, col] of [['conference_speakers','full_name'], ['linkedin_imported_connections','full_name']]) {
  const { data, error } = await supabase.from(table).select('*').ilike(col, '%dillion%')
  if (!error && data?.length) {
    console.log(`\n=== ${table} matches on ${col} ===`)
    console.log(JSON.stringify(data, null, 2))
  }
}
