/**
 * Aleksei Groshenko (Lead Forward) review account seed script.
 *
 * Creates (or resets) a review account preloaded with the anonymized
 * candidate profile Aleksei shared (docs/Anonymized_Candidate_Profile_for_
 * Starting_Monday_Demo.docx), so he can review the product from the user
 * side with a populated pipeline.
 *
 * Run with: npx tsx scripts/seed-aleksei-review.ts
 *
 * Requires env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 * Optional env:
 *   ALEKSEI_REVIEW_EMAIL     (default aleksei-review@startingmonday.app;
 *                             re-run with his real email once confirmed)
 *   ALEKSEI_REVIEW_PASSWORD  (default printed at end)
 */

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const REVIEW_EMAIL = process.env.ALEKSEI_REVIEW_EMAIL ?? 'aleksei-review@startingmonday.app'
const REVIEW_PASSWORD = process.env.ALEKSEI_REVIEW_PASSWORD ?? 'LeadForward-Review-2026'

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function run() {
  console.log(`Setting up review account for ${REVIEW_EMAIL}...`)

  let userId: string
  const { data: existing } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const found = existing?.users.find(u => u.email === REVIEW_EMAIL)

  if (found) {
    userId = found.id
    await admin.auth.admin.updateUserById(userId, {
      password: REVIEW_PASSWORD,
      email_confirm: true,
    })
    console.log(`Found existing review user: ${userId}`)
  } else {
    const { data: created, error } = await admin.auth.admin.createUser({
      email: REVIEW_EMAIL,
      password: REVIEW_PASSWORD,
      email_confirm: true,
    })
    if (error || !created.user) {
      console.error('Failed to create review user:', error)
      process.exit(1)
    }
    userId = created.user.id
    console.log(`Created review user: ${userId}`)
  }

  const now = new Date()
  const trialEnds = new Date(now)
  trialEnds.setDate(trialEnds.getDate() + 30)

  // 30-day trial = Active-tier feature access (prep briefs, strategy, briefings, chat)
  await admin.from('users').upsert({
    id: userId,
    email: REVIEW_EMAIL,
    subscription_tier: 'free',
    subscription_status: 'trialing',
    trial_ends_at: trialEnds.toISOString(),
  }, { onConflict: 'id' })

  const searchStarted = new Date(now)
  searchStarted.setDate(searchStarted.getDate() - 10)

  await admin.from('user_profiles').upsert({
    user_id: userId,
    full_name: 'Alex Morgan',
    current_title: 'Senior Account Manager, New Business Development',
    current_company: 'Regional Commercial Foodservice Equipment Dealer',
    target_titles: [
      'Senior Strategic Account Manager',
      'Key Account Manager',
      'Strategic Account Manager',
      'Business Development Manager (Foodservice Equipment)',
      'Regional Account Manager',
      'Regional Sales Manager',
    ],
    target_sectors: ['Commercial Foodservice Equipment', 'Foodservice Distribution (strategic roles only)', 'Food Processing Equipment'],
    target_locations: ['Western New York', 'Remote', 'Hybrid'],
    positioning_summary: 'A strategic commercial foodservice equipment professional who combines Executive Chef experience, operational leadership, and consultative sales to help hospitality, foodservice, healthcare, education, restaurant, and institutional clients improve kitchen workflow, labor efficiency, equipment decisions, and long-term ROI. Generated $3.0M in first-year territory growth; manages an estimated $2M pipeline and ~150 active accounts.',
    resume_text: `ALEX MORGAN (anonymized demo persona - profile prepared for platform review)
Senior Strategic Account Manager | Commercial Foodservice Equipment Sales | Operator-Led Kitchen Solutions | Executive Chef Credibility

PROFESSIONAL SUMMARY
Commercial foodservice equipment sales professional and ACF Certified Executive Chef with 17+ years of experience across hospitality operations, culinary leadership, business development, account management, and consultative equipment solutions. Combines operator credibility with strategic commercial thinking, customer education, and cross-functional project coordination from concept through installation.

CAREER HIGHLIGHTS
- Generated $3.0M in first-year territory growth through strategic account development and capital equipment sales
- Supported 20-30 commercial equipment projects, largest ~$890,000
- Manages an estimated $2M pipeline and ~150 active accounts
- Opened ~40-50 new accounts in current role; 200+ site visits evaluating workflow, utilities, and equipment placement
- Managed operations supporting 120 luxury suites at a major professional sports stadium

EXPERIENCE

Regional Commercial Foodservice Equipment Dealer
Senior Account Manager, New Business Development | Jul 2024 - Present
- Business development across Western New York: healthcare, education, hospitality, restaurant, and institutional clients
- Consults on commercial kitchen design, workflow optimization, equipment selection, labor efficiency, and production flow
- Leads equipment demonstrations and ROI-focused conversations with chefs, operators, purchasing stakeholders, and executives
- Represents major product lines including Welbilt, Middleby, Convotherm, Rational, Unox, Alto-Shaam, CaptiveAire

Foodservice Distribution Company
Territory Manager | May 2023 - Jul 2024
- Opened 30 new customer accounts; managed ~200+ accounts and ~$250K weekly territory sales

Hospitality & Culinary Leadership | 17+ years
- Executive Sous Chef, Executive Chef, Chef Patron, Culinary Instructor, Adjunct Professor
- Stadium hospitality (120 luxury suites), private club, culinary education, independent catering

EDUCATION & CERTIFICATIONS
- Associate degree in Culinary Arts, The Culinary Institute of America
- ACF Certified Executive Chef | ServSafe Certified | NAFEM CFSP Candidate (2027)

AWARDS
- ACF Culinary Salon Gold Medalist; First Place, NYS Restaurant Association Culinary Competition`,
    career_history_json: [
      {
        company: 'Regional Commercial Foodservice Equipment Dealer',
        title: 'Senior Account Manager, New Business Development',
        start_year: '2024',
        end_year: '',
        key_outcome: 'Generated $3.0M in first-year territory growth; manages an estimated $2M pipeline across ~150 active accounts; opened 40-50 new accounts.',
      },
      {
        company: 'Foodservice Distribution Company',
        title: 'Territory Manager',
        start_year: '2023',
        end_year: '2024',
        key_outcome: 'Opened 30 new customer accounts; managed 200+ accounts at approximately $250K weekly territory sales.',
      },
      {
        company: 'Hospitality & Culinary Leadership (multiple operations)',
        title: 'Executive Chef / Executive Sous Chef / Culinary Instructor',
        start_year: '2007',
        end_year: '2023',
        key_outcome: 'ACF Certified Executive Chef; led stadium hospitality operations across 120 luxury suites; culinary education and independent catering leadership.',
      },
    ],
    star_stories: [
      {
        situation: 'A healthcare client\u2019s kitchen was missing labor targets with aging equipment and a production line that fought the workflow.',
        action: 'Ran a full workflow audit on site, mapped utilities and equipment placement, and built an ROI model comparing combi-oven consolidation against their replacement plan.',
        result: 'Won an ~$890,000 equipment project, the largest in the territory, and the client cut production labor hours.',
        tags: ['consultative selling', 'ROI', 'healthcare'],
      },
      {
        situation: 'Took over a Western New York territory with no existing relationships and an empty pipeline.',
        action: 'Made 200+ site visits evaluating workflow, utilities, and equipment placement, leading with operator education instead of product pitches.',
        result: 'Generated $3.0M in first-year territory growth and opened 40-50 new accounts.',
        tags: ['business development', 'territory build'],
      },
      {
        situation: 'Stadium hospitality operation serving 120 luxury suites was struggling with game-day consistency.',
        action: 'Rebuilt the prep system and staffing model as Executive Sous Chef, sequencing production around service peaks.',
        result: 'Delivered consistent on-time suite service across the full season.',
        tags: ['operations', 'leadership'],
      },
    ],
    search_status: 'active',
    briefing_timezone: 'America/New_York',
    briefing_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    onboarding_completed_at: searchStarted.toISOString(),
    search_started_at: searchStarted.toISOString(),
  }, { onConflict: 'user_id' })

  // Clean reset of pipeline data for this user only
  const { data: existingCompanies } = await admin
    .from('companies')
    .select('id')
    .eq('user_id', userId)

  if (existingCompanies?.length) {
    const ids = existingCompanies.map(c => c.id)
    // Order matters: follow_ups references contacts; contacts reference companies.
    const { error: followUpsErr } = await admin.from('follow_ups').delete().eq('user_id', userId)
    if (followUpsErr) console.error('Cleanup failed (follow_ups):', followUpsErr.message)
    const { error: contactsErr } = await admin.from('contacts').delete().eq('user_id', userId)
    if (contactsErr) console.error('Cleanup failed (contacts):', contactsErr.message)
    const { error: scansErr } = await admin.from('scan_results').delete().in('company_id', ids)
    if (scansErr) console.error('Cleanup failed (scan_results):', scansErr.message)
    const { error: companiesErr } = await admin.from('companies').delete().eq('user_id', userId)
    if (companiesErr) {
      console.error('Cleanup failed (companies):', companiesErr.message)
      process.exit(1)
    }
  }

  const { data: companies, error: coErr } = await admin.from('companies').insert([
    {
      user_id: userId,
      name: 'Alto-Shaam',
      career_page_url: 'https://www.alto-shaam.com/en/about-us/careers',
      sector: 'Foodservice Equipment',
      fit_score: 9,
      stage: 'researching',
      notes: 'Tier 1 target. Combi, smoke, and holding solutions for institutional kitchens. Dealer and rep ecosystem central to regional growth. Currently represents this line - existing manufacturer relationship is a warm path.',
    },
    {
      user_id: userId,
      name: 'Rational',
      career_page_url: 'https://careers.rational-online.com',
      sector: 'Foodservice Equipment',
      fit_score: 8,
      stage: 'watching',
      notes: 'Tier 1. Combi-steamer market leader with a strong culinary-demo sales culture - Executive Chef background is a direct differentiator. Currently represents this line.',
    },
    {
      user_id: userId,
      name: 'Middleby',
      career_page_url: 'https://www.middleby.com/careers',
      sector: 'Foodservice Equipment',
      fit_score: 8,
      stage: 'watching',
      notes: 'Tier 1. Large multi-brand portfolio (incl. TurboChef). Regional account, dealer development, and channel account roles surface regularly.',
    },
    {
      user_id: userId,
      name: 'Henny Penny',
      career_page_url: 'https://www.hennypenny.com/careers',
      sector: 'Foodservice Equipment',
      fit_score: 7,
      stage: 'watching',
      notes: 'Tier 1. Employee-owned with mature leadership culture - matches stated culture filters. Strategic chain-account programs value operator credibility.',
    },
    {
      user_id: userId,
      name: 'ITW Food Equipment Group',
      career_page_url: 'https://careers.itw.com',
      sector: 'Foodservice Equipment',
      fit_score: 7,
      stage: 'watching',
      notes: 'Tier 1. Hobart and Vulcan parent. Corporate accounts and national account manager paths align with director-level growth goal.',
    },
    {
      user_id: userId,
      name: 'Gordon Food Service',
      career_page_url: 'https://careers.gfs.com',
      sector: 'Foodservice Distribution',
      fit_score: 6,
      stage: 'watching',
      notes: 'Tier 2A - filter carefully. Only strategic roles (key account, healthcare/education account manager). Avoid commodity territory sales.',
    },
  ]).select('id, name')

  if (coErr || !companies) {
    console.error('Failed to insert companies:', coErr)
    process.exit(1)
  }

  const byName = Object.fromEntries(companies.map(c => [c.name, c.id]))
  const scan2dAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()

  await admin.from('scan_results').insert([
    {
      company_id: byName['Alto-Shaam'],
      user_id: userId,
      scanned_at: scan2dAgo,
      status: 'success',
      ai_score: 88,
      ai_summary: 'Strategic account and regional sales roles active in the foodservice equipment channel. Dealer-network emphasis suggests consultative sellers with operator credibility are prioritized.',
      raw_hits: [
        {
          title: 'Strategic Account Manager',
          score: 88,
          is_match: true,
          is_new: false,
          summary: 'Consultative multi-stakeholder selling into institutional kitchens - strong match for operator-to-buyer translation experience.',
        },
      ],
    },
    {
      company_id: byName['Rational'],
      user_id: userId,
      scanned_at: scan2dAgo,
      status: 'success',
      ai_score: null,
      ai_summary: 'No matching roles detected. Monitoring for regional account and culinary sales openings.',
      raw_hits: [],
    },
  ])

  await admin.from('contacts').insert([
    {
      user_id: userId,
      company_id: byName['Alto-Shaam'],
      name: 'Regional Sales Director (target)',
      title: 'Regional Sales Director',
      firm: 'Alto-Shaam',
      channel: 'linkedin',
      status: 'active',
      notes: 'Target contact per search plan (VP Sales / Director of Strategic Accounts tier). Warm angle: already represents the line as a dealer. Open with kitchen throughput and labor-efficiency narrative tied to institutional use cases.',
    },
    {
      user_id: userId,
      company_id: byName['Rational'],
      name: 'Culinary Sales Lead (target)',
      title: 'Head of Culinary Sales',
      firm: 'Rational',
      channel: 'event',
      status: 'active',
      notes: 'Met at regional foodservice trade show. Follow up with before/after kitchen flow discussion backed by prior project outcomes.',
    },
    {
      user_id: userId,
      company_id: byName['Middleby'],
      name: 'Director of Strategic Accounts (target)',
      title: 'Director of Strategic Accounts',
      firm: 'Middleby',
      channel: 'linkedin',
      status: 'active',
      notes: 'Identified via platform contact mapping. Angle: dealer-side experience with the brand portfolio plus operator credibility.',
    },
  ])

  await admin.from('follow_ups').delete().eq('user_id', userId)

  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const in2days = new Date(now); in2days.setDate(in2days.getDate() + 2)
  const in4days = new Date(now); in4days.setDate(in4days.getDate() + 4)

  await admin.from('follow_ups').insert([
    {
      user_id: userId,
      company_id: byName['Alto-Shaam'],
      action: 'Draft 30-60-90 plan: dealer enablement cadence, rep feedback loop, target account conversion goals',
      due_date: fmt(in2days),
      status: 'pending',
    },
    {
      user_id: userId,
      company_id: byName['Rational'],
      action: 'Send trade-show follow-up note to Culinary Sales Lead',
      due_date: fmt(in4days),
      status: 'pending',
    },
  ])

  console.log('\nReview account seeded successfully.')
  console.log('\nShare with Aleksei:')
  console.log(`  URL:      https://startingmonday.app/login`)
  console.log(`  Email:    ${REVIEW_EMAIL}`)
  console.log(`  Password: ${REVIEW_PASSWORD}`)
  console.log('\nTo switch to his real email later, re-run with ALEKSEI_REVIEW_EMAIL set.')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
