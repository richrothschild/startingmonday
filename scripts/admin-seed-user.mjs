// WBS 1.6 — Admin Tooling: seed a beta user with profile + company watchlist.
//
// Usage:
//   node --env-file=.env.local scripts/admin-seed-user.mjs
//   node --env-file=.env.local scripts/admin-seed-user.mjs --list
//   node --env-file=.env.local scripts/admin-seed-user.mjs --delete email@example.com

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const args = process.argv.slice(2)

// ── List mode ────────────────────────────────────────────────────────────────

if (args.includes('--list')) {
  const { data: users } = await supabase.from('users').select('id, email, subscription_tier, subscription_status, created_at').order('created_at')
  if (!users?.length) { console.log('No users.'); process.exit(0) }
  console.log(`\n${'Email'.padEnd(35)} ${'Tier'.padEnd(12)} Status`)
  console.log('─'.repeat(60))
  for (const u of users) {
    const { count } = await supabase.from('companies').select('id', { count: 'exact', head: true }).eq('user_id', u.id)
    console.log(`${u.email.padEnd(35)} ${u.subscription_tier.padEnd(12)} ${u.subscription_status}  (${count ?? 0} companies)`)
  }
  process.exit(0)
}

// ── Delete mode ───────────────────────────────────────────────────────────────

if (args.includes('--delete')) {
  const email = args[args.indexOf('--delete') + 1]
  if (!email) { console.error('Usage: --delete email@example.com'); process.exit(1) }

  const { data: { users } } = await supabase.auth.admin.listUsers()
  const authUser = users.find(u => u.email === email)
  if (!authUser) { console.error(`No auth user found for ${email}`); process.exit(1) }

  const { error } = await supabase.auth.admin.deleteUser(authUser.id)
  if (error) { console.error('Delete failed:', error.message); process.exit(1) }
  console.log(`✓ Deleted ${email} and all associated data (cascade)`)
  process.exit(0)
}

// ── Seed mode ────────────────────────────────────────────────────────────────

// ── Edit this section to configure a new beta user ───────────────────────────

const USER = {
  email: 'rothschild@gmail.com',
  subscription_tier: 'active',
  subscription_status: 'active',
}

const PROFILE = {
  full_name: 'Richard Rothschild',
  target_titles: ['CIO', 'VP of Technology', 'Head of Digital Transformation', 'Chief Digital Officer', 'VP IT'],
  target_sectors: ['Technology', 'Financial Services', 'Healthcare', 'Media', 'Government', 'Entertainment'],
  target_locations: ['San Francisco Bay Area', 'New York', 'Washington DC', 'Remote'],
  target_salary_min: 280000,
  positioning_summary: 'Transformation-focused technology executive with 30+ years spanning NASA, Apple, TiVo, Cisco WebEx, and Zebra Technologies. Built Netflix streaming, led NFL RFID deployment, achieved first FedRAMP authorization at Cisco. Known for simplifying complex problems and delivering measurable outcomes in high-stakes live environments.',
  search_status: 'active',
  briefing_time: '06:00:00',
  briefing_timezone: 'America/Los_Angeles',
  briefing_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  search_started_at: new Date().toISOString(),
}

const COMPANIES = [
  // fit_score: 1-10. alert_threshold: 5-10 (min match quality to trigger alert).
  // fit_score: 1-10. alert_threshold: 5-10. stage: watching|researching|applied|interviewing|offer
  { name: 'Events DC',        career_page_url: 'https://eventsdc.com/about/careers',                  sector: 'Entertainment / Convention',  stage: 'interviewing', fit_score: 9, alert_threshold: 5, notes: 'CITO role. Carmen Rodgers (SearchWide Global) recruiter. Next: Zoom with Tan (SVP Ops) + Sean (SVP HR). Decision by mid-May 2026.' },
  { name: 'Live Nation',      career_page_url: 'https://livenation.wd1.myworkdayjobs.com/LN_careers', sector: 'Entertainment / Live Events', stage: 'watching',     fit_score: 8, alert_threshold: 6 },
  { name: 'AEG',              career_page_url: 'https://www.aegworldwide.com/careers',                sector: 'Entertainment / Live Events', stage: 'watching',     fit_score: 8, alert_threshold: 6 },
  { name: 'Visa',             career_page_url: 'https://www.visa.com/careers/',                       sector: 'Financial Services',          stage: 'watching',     fit_score: 7, alert_threshold: 7 },
  { name: 'Accenture',        career_page_url: 'https://www.accenture.com/us-en/careers',             sector: 'Technology / Consulting',     stage: 'watching',     fit_score: 7, alert_threshold: 7 },
  { name: 'NBCUniversal',     career_page_url: 'https://www.nbcunicareers.com/',                      sector: 'Media / Entertainment',       stage: 'watching',     fit_score: 7, alert_threshold: 7 },
  { name: 'Deloitte',         career_page_url: 'https://www2.deloitte.com/us/en/careers.html',        sector: 'Technology / Consulting',     stage: 'watching',     fit_score: 7, alert_threshold: 7 },
  { name: 'Cisco',            career_page_url: 'https://jobs.cisco.com/',                             sector: 'Technology',                  stage: 'watching',     fit_score: 7, alert_threshold: 7 },
  { name: 'Salesforce',       career_page_url: 'https://www.salesforce.com/company/careers/',         sector: 'Technology',                  stage: 'watching',     fit_score: 7, alert_threshold: 7 },
  { name: 'Kaiser Permanente',career_page_url: 'https://jobs.kaiserpermanente.org/',                  sector: 'Healthcare',                  stage: 'watching',     fit_score: 6, alert_threshold: 7 },
]

// ── Run seed ─────────────────────────────────────────────────────────────────

console.log(`\nSeeding: ${USER.email}`)

// 1. Check if auth user already exists
const { data: { users: existingAuthUsers } } = await supabase.auth.admin.listUsers()
let authUser = existingAuthUsers.find(u => u.email === USER.email)

if (authUser) {
  console.log(`  Auth user already exists: ${authUser.id}`)
} else {
  const { data: created, error } = await supabase.auth.admin.createUser({
    email: USER.email,
    email_confirm: true,
    user_metadata: { full_name: PROFILE.full_name },
  })
  if (error) { console.error('Failed to create auth user:', error.message); process.exit(1) }
  authUser = created.user
  console.log(`  ✓ Auth user created: ${authUser.id}`)
}

const userId = authUser.id

// 2. Update subscription tier (trigger creates the row with defaults)
const { error: tierErr } = await supabase
  .from('users')
  .update({ subscription_tier: USER.subscription_tier, subscription_status: USER.subscription_status })
  .eq('id', userId)
if (tierErr) console.warn('  ! Could not update tier:', tierErr.message)
else console.log(`  ✓ Subscription: ${USER.subscription_tier} / ${USER.subscription_status}`)

// 3. Upsert profile
const { error: profileErr } = await supabase
  .from('user_profiles')
  .upsert({ user_id: userId, ...PROFILE }, { onConflict: 'user_id' })
if (profileErr) console.warn('  ! Profile upsert failed:', profileErr.message)
else console.log(`  ✓ Profile: ${PROFILE.full_name}`)

// 4. Seed companies (skip any that already exist by name)
const { data: existingCompanies } = await supabase
  .from('companies')
  .select('name')
  .eq('user_id', userId)

const existingNames = new Set((existingCompanies ?? []).map(c => c.name))
let added = 0

for (const co of COMPANIES) {
  if (existingNames.has(co.name)) {
    console.log(`  · ${co.name} — already exists, skipping`)
    continue
  }
  const { error } = await supabase.from('companies').insert({ user_id: userId, ...co })
  if (error) console.warn(`  ! ${co.name}: ${error.message}`)
  else { console.log(`  ✓ ${co.name}`); added++ }
}

console.log(`\nDone. ${added} new companies added.`)
console.log(`Run --list to see all users.`)
