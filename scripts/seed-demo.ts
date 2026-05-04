/**
 * Demo account seed script.
 *
 * Creates (or resets) the demo user "Sarah Chen" with a fully populated pipeline.
 * Run with: bun scripts/seed-demo.ts
 *
 * Requires in .env.local (or environment):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   DEMO_USER_EMAIL          (e.g. demo@startingmonday.app)
 *   DEMO_USER_PASSWORD       (any strong password — this account is public)
 *
 * After running, add these to Railway:
 *   DEMO_USER_ID             (printed at end of this script)
 *   NEXT_PUBLIC_DEMO_USER_EMAIL
 *   NEXT_PUBLIC_DEMO_USER_PASSWORD
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const DEMO_EMAIL = process.env.DEMO_USER_EMAIL ?? 'demo@startingmonday.app'
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? 'DemoAccount2025!'

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function run() {
  console.log('Setting up demo user...')

  // Create or find the demo user
  let userId: string

  const { data: existing } = await admin.auth.admin.listUsers()
  const found = existing?.users.find(u => u.email === DEMO_EMAIL)

  if (found) {
    userId = found.id
    await admin.auth.admin.updateUserById(userId, {
      password: DEMO_PASSWORD,
      email_confirm: true,
    })
    console.log(`Found existing demo user: ${userId}`)
  } else {
    const { data: created, error } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    })
    if (error || !created.user) {
      console.error('Failed to create demo user:', error)
      process.exit(1)
    }
    userId = created.user.id
    console.log(`Created demo user: ${userId}`)
  }

  // Upsert users row (subscription = active to unlock all features)
  await admin.from('users').upsert({
    id: userId,
    email: DEMO_EMAIL,
    subscription_tier: 'active',
    subscription_status: 'active',
    trial_ends_at: null,
  }, { onConflict: 'id' })

  // Upsert user_profiles
  const searchStarted = new Date()
  searchStarted.setDate(searchStarted.getDate() - 14)

  await admin.from('user_profiles').upsert({
    user_id: userId,
    full_name: 'Sarah Chen',
    current_title: 'VP of Engineering',
    current_company: 'Revvity',
    target_titles: ['CTO', 'SVP of Engineering', 'VP of Engineering'],
    target_sectors: ['Health Tech', 'Fintech', 'Enterprise SaaS'],
    target_locations: ['Boston', 'Remote', 'New York'],
    positioning_summary: 'Engineering executive with 14 years in healthcare technology. Built and scaled three engineering organizations, most recently from 18 to 72 engineers at Revvity. Deep experience in healthcare data platforms, PE-backed environments, and acquisition integration.',
    resume_text: `SARAH CHEN
VP of Engineering | Boston, MA | sarah.chen@email.com

EXPERIENCE

Revvity (formerly PerkinElmer) | Boston, MA
VP of Engineering, SaaS Platform | 2019 - Present
- Built engineering organization from 18 to 72 engineers across 4 teams
- Led platform migration serving 4M active devices (up from 500K)
- Delivered IVDR compliance initiative ($4M, 18 months, 0 audit findings)
- Owned $23M engineering budget, delivered within 3% annually
- Managed two acquisition integrations while maintaining delivery velocity

Director of Engineering | 2017 - 2019
- Established core engineering practices, CI/CD pipeline, and on-call structure
- Grew team from 8 to 18 engineers

Veritas Technologies | Mountain View, CA
Senior Engineering Manager | 2014 - 2017
- Led 12-person team building enterprise backup infrastructure
- Shipped 3 major product versions under Veritas rebrand post-Symantec split

EDUCATION
Wharton School, University of Pennsylvania - MBA, 2014
Cornell University - BS Computer Science, 2010`,
    search_status: 'active',
    briefing_timezone: 'America/New_York',
    briefing_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    onboarding_completed_at: searchStarted.toISOString(),
    search_started_at: searchStarted.toISOString(),
  }, { onConflict: 'user_id' })

  // Delete existing company data for clean reset
  const { data: existingCompanies } = await admin
    .from('companies')
    .select('id')
    .eq('user_id', userId)

  if (existingCompanies?.length) {
    const ids = existingCompanies.map(c => c.id)
    await admin.from('scan_results').delete().in('company_id', ids)
    await admin.from('contacts').delete().eq('user_id', userId)
    await admin.from('follow_ups').delete().eq('user_id', userId)
    await admin.from('companies').delete().eq('user_id', userId)
  }

  // Insert companies
  const now = new Date()
  const { data: companies, error: coErr } = await admin.from('companies').insert([
    {
      user_id: userId,
      name: 'Cotiviti',
      career_page_url: 'https://careers.cotiviti.com',
      sector: 'Health Tech',
      fit_score: 9,
      stage: 'interviewing',
      notes: 'SVP Engineering role open since March. Jennifer Walsh (CTO, hired 10 months ago) rebuilding tech leadership after delivery miss. PE-backed by Apax Partners since 2021. Interview panel scheduled.',
    },
    {
      user_id: userId,
      name: 'Kyruus Health',
      career_page_url: 'https://kyruushealth.com/careers',
      sector: 'Health Tech',
      fit_score: 9,
      stage: 'researching',
      notes: 'No open req yet. David Park (SVP Product, LinkedIn connection) hinted they are building out the tech org under new CTO hired January. Watching closely.',
    },
    {
      user_id: userId,
      name: 'Arcadia',
      career_page_url: 'https://arcadia.io/careers',
      sector: 'Health Tech',
      fit_score: 8,
      stage: 'watching',
      notes: 'Health data platform, Series D. Focus on value-based care analytics.',
    },
    {
      user_id: userId,
      name: 'Netsmart Technologies',
      career_page_url: 'https://ntst.com/Careers',
      sector: 'Health Tech',
      fit_score: 7,
      stage: 'watching',
      notes: null,
    },
    {
      user_id: userId,
      name: 'Waystar',
      career_page_url: 'https://waystar.com/careers',
      sector: 'Health Tech',
      fit_score: 6,
      stage: 'watching',
      notes: null,
    },
  ]).select('id, name')

  if (coErr || !companies) {
    console.error('Failed to insert companies:', coErr)
    process.exit(1)
  }

  const byName = Object.fromEntries(companies.map(c => [c.name, c.id]))
  const scan3dAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const scan5dAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()

  // Insert scan results
  await admin.from('scan_results').insert([
    {
      company_id: byName['Cotiviti'],
      user_id: userId,
      scanned_at: scan3dAgo,
      status: 'success',
      ai_score: 91,
      ai_summary: 'SVP Technology Platform Engineering role opened this week, following PE-backed expansion into care management. Headcount authorization for 12 additional engineering positions suggests a significant platform rebuild ahead.',
      raw_hits: [
        {
          title: 'SVP, Technology Platform Engineering',
          score: 91,
          is_match: true,
          is_new: false,
          summary: 'New leadership role for the platform modernization initiative under PE investor mandate.',
        },
      ],
    },
    {
      company_id: byName['Kyruus Health'],
      user_id: userId,
      scanned_at: scan5dAgo,
      status: 'success',
      ai_score: null,
      ai_summary: 'No matching roles detected. Monitoring for engineering leadership openings.',
      raw_hits: [],
    },
    {
      company_id: byName['Netsmart Technologies'],
      user_id: userId,
      scanned_at: scan3dAgo,
      status: 'success',
      ai_score: 72,
      ai_summary: 'Director of Product Engineering role open -- director-level framing but company size suggests VP-equivalent scope. Could be negotiated.',
      raw_hits: [
        {
          title: 'Director of Product Engineering',
          score: 72,
          is_match: true,
          is_new: false,
          summary: 'Director-level framing -- negotiation toward VP title may be possible given headcount and scope.',
        },
      ],
    },
    {
      company_id: byName['Arcadia'],
      user_id: userId,
      scanned_at: scan3dAgo,
      status: 'success',
      ai_score: null,
      ai_summary: 'No matching roles detected.',
      raw_hits: [],
    },
  ])

  // Insert contacts
  await admin.from('contacts').insert([
    {
      user_id: userId,
      company_id: byName['Cotiviti'],
      name: 'Jennifer Walsh',
      title: 'Chief Technology Officer',
      firm: 'Cotiviti',
      channel: 'referral',
      status: 'active',
      notes: 'Referred by David Kim at Flagship Ventures. New CTO, hired 10 months ago, rebuilding engineering leadership.',
    },
    {
      user_id: userId,
      company_id: byName['Cotiviti'],
      name: 'Michael Torres',
      title: 'Chief People Officer',
      firm: 'Cotiviti',
      channel: 'linkedin',
      status: 'active',
      notes: 'LinkedIn connection accepted 3 weeks ago. Part of the interview panel.',
    },
    {
      user_id: userId,
      company_id: byName['Kyruus Health'],
      name: 'David Park',
      title: 'SVP Product',
      firm: 'Kyruus Health',
      channel: 'linkedin',
      status: 'active',
      notes: '15-min intro call last week. Mentioned CTO is actively building the engineering team.',
    },
  ])

  // Insert follow-ups (one overdue, two upcoming)
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 2)
  const in1day = new Date(now)
  in1day.setDate(in1day.getDate() + 1)
  const in3days = new Date(now)
  in3days.setDate(in3days.getDate() + 3)

  const fmt = (d: Date) => d.toISOString().split('T')[0]

  await admin.from('follow_ups').insert([
    {
      user_id: userId,
      company_id: byName['Kyruus Health'],
      action: 'Follow up with David Park -- has been 8 days since intro call',
      due_date: fmt(yesterday),
      status: 'pending',
    },
    {
      user_id: userId,
      company_id: byName['Cotiviti'],
      action: 'Send thank-you note to Michael Torres (Chief People Officer)',
      due_date: fmt(in1day),
      status: 'pending',
    },
    {
      user_id: userId,
      company_id: byName['Cotiviti'],
      action: 'Review Cotiviti prep brief before panel interview',
      due_date: fmt(in3days),
      status: 'pending',
    },
  ])

  console.log('\nDemo account seeded successfully.')
  console.log('\nAdd these to Railway environment variables:')
  console.log(`  DEMO_USER_ID=${userId}`)
  console.log(`  NEXT_PUBLIC_DEMO_USER_EMAIL=${DEMO_EMAIL}`)
  console.log(`  NEXT_PUBLIC_DEMO_USER_PASSWORD=${DEMO_PASSWORD}`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
