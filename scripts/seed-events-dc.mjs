// One-time seed: Events DC company + Carmen Rodgers contact + follow-up reminder
// Run: node --env-file=.env.local scripts/seed-events-dc.mjs

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Try public.users first; fall back to auth.admin if empty
let userId, userEmail

const { data: pubUsers } = await supabase.from('users').select('id, email')

if (pubUsers?.length) {
  console.log('Public users:', pubUsers.map(u => u.email).join(', '))
  userId = pubUsers[0].id
  userEmail = pubUsers[0].email
} else {
  // public.users is empty — look up via auth admin and seed it
  console.log('public.users empty — checking auth.users...')
  // Create auth user — this fires the on_auth_user_created trigger
  console.log('Creating auth user for rothschild@gmail.com...')
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: 'rothschild@gmail.com',
    email_confirm: true,
    user_metadata: { full_name: 'Richard Rothschild' },
  })
  if (createErr) {
    console.error('Failed to create auth user:', createErr.message)
    process.exit(1)
  }
  userId = created.user.id
  userEmail = created.user.email
  console.log(`✓ Auth user created: ${userEmail} (${userId})`)

  // Update user_profiles with name (trigger creates the row, we just fill it in)
  await supabase
    .from('user_profiles')
    .update({ full_name: 'Richard Rothschild' })
    .eq('user_id', userId)
}

console.log(`\nUsing: ${userEmail} (${userId})`)

// 1. Events DC — active company to scan
const { data: company, error: companyErr } = await supabase
  .from('companies')
  .insert({
    user_id: userId,
    name: 'Events DC',
    career_page_url: 'https://eventsdc.com/about/careers',
  })
  .select()
  .single()

if (companyErr) {
  console.error('Company insert failed:', companyErr.message)
  process.exit(1)
}
console.log('✓ Company: Events DC', company.id)

// 2. Carmen Rodgers — recruiter contact
const { data: contact, error: contactErr } = await supabase
  .from('contacts')
  .insert({
    user_id: userId,
    company_id: company.id,
    name: 'Carmen Rodgers',
    title: 'Director of Executive Search',
    firm: 'SearchWide Global',
    notes: 'Recruiting for Events DC CITO role. Initial screen 2026-04-30. Strong rapport — music/Sharon Jones connection. Key gatekeeper: presents slate to Tan (SVP Ops) and Sean (SVP HR). Follow-up note sent same day.',
  })
  .select()
  .single()

if (contactErr) {
  console.error('Contact insert failed:', contactErr.message)
  process.exit(1)
}
console.log('✓ Contact: Carmen Rodgers', contact.id)

// 3. Follow-up reminder — May 12 if no response
const { error: fuErr } = await supabase
  .from('follow_ups')
  .insert({
    user_id: userId,
    contact_id: contact.id,
    company_id: company.id,
    due_date: '2026-05-12',
    action: 'Check in with Carmen if no word on Events DC CITO selection. She said mid-May at latest.',
    status: 'pending',
  })

if (fuErr) {
  console.error('Follow-up insert failed:', fuErr.message)
  process.exit(1)
}
console.log('✓ Follow-up: May 12 reminder set')

console.log('\nDone. Events DC is now being tracked and Carmen has a May 12 follow-up.')
