import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// Load env from .env.local
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

// Try a few spelling variants
const patterns = ['%david%dillion%', '%david%dillon%', '%dillion%', '%dillon%']
const found = new Map()
for (const p of patterns) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, full_name, current_title, current_company, linkedin_url')
    .ilike('full_name', p)
  if (error) { console.error('query error for', p, error.message); continue }
  for (const row of data) found.set(row.user_id, row)
}

const rows = [...found.values()]
if (!rows.length) {
  console.log('No matching user_profiles.')
  process.exit(0)
}

// Enrich with auth email
for (const r of rows) {
  const { data: u } = await supabase.auth.admin.getUserById(r.user_id)
  r.email = u?.user?.email ?? null
  r.created_at = u?.user?.created_at ?? null
}

console.log(JSON.stringify(rows, null, 2))
