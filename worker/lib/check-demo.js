import { getSupabase } from './supabase.js'
import { logger } from './logger.js'

const PERSONAL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'live.com', 'icloud.com', 'me.com', 'mac.com', 'protonmail.com', 'proton.me',
  'pm.me', 'hey.com', 'fastmail.com', 'aol.com', 'zoho.com',
])

function isCorporateEmail(email) {
  const domain = email?.split('@')[1]?.toLowerCase() ?? ''
  return !!domain && !PERSONAL_DOMAINS.has(domain)
}

export async function runDemoCheck() {
  const demoUserId = process.env.DEMO_USER_ID
  if (!demoUserId) {
    logger.warn('check-demo: DEMO_USER_ID not set — skipping')
    return
  }

  const supabase = getSupabase()
  const issues = []

  // ── Profile ───────────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, resume_text, briefing_days, briefing_time, onboarding_completed_at, search_started_at, momentum_score')
    .eq('user_id', demoUserId)
    .single()

  if (!profile) {
    issues.push('CRITICAL: user_profiles row missing — run npm run seed:demo')
  } else {
    if (!profile.full_name)              issues.push('user_profiles.full_name is null')
    if (!profile.resume_text)            issues.push('user_profiles.resume_text is null')
    if (!profile.onboarding_completed_at) issues.push('user_profiles.onboarding_completed_at is null')
    if (!profile.search_started_at)      issues.push('user_profiles.search_started_at is null')
    if (profile.briefing_time)           issues.push('user_profiles.briefing_time is set — demo will receive live briefings (set to null)')

    const days = profile.briefing_days ?? []
    const hasAbbrev = days.some(d => d.length <= 3)
    if (hasAbbrev) issues.push(`user_profiles.briefing_days uses abbreviated names: ${JSON.stringify(days)} — re-run seed`)
  }

  // ── Users row ─────────────────────────────────────────────────────────────
  const { data: userRow } = await supabase
    .from('users')
    .select('email, subscription_status')
    .eq('id', demoUserId)
    .single()

  if (!userRow) {
    issues.push('CRITICAL: users row missing — run npm run seed:demo')
  } else {
    if (userRow.subscription_status !== 'active') issues.push(`users.subscription_status is "${userRow.subscription_status}" — demo should be "active"`)
    if (isCorporateEmail(userRow.email))          issues.push(`users.email "${userRow.email}" is corporate — PersonalEmailNudge will show in demo (check layout guard)`)
  }

  // ── Companies ─────────────────────────────────────────────────────────────
  const { count: companyCount } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', demoUserId)
    .is('archived_at', null)

  if ((companyCount ?? 0) < 5) issues.push(`companies: expected 5, found ${companyCount ?? 0} — run npm run seed:demo`)

  // ── Contacts ──────────────────────────────────────────────────────────────
  const { count: contactCount } = await supabase
    .from('contacts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', demoUserId)

  if ((contactCount ?? 0) < 3) issues.push(`contacts: expected 3+, found ${contactCount ?? 0}`)

  // ── Follow-ups ────────────────────────────────────────────────────────────
  const { count: followUpCount } = await supabase
    .from('follow_ups')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', demoUserId)
    .eq('status', 'pending')

  if ((followUpCount ?? 0) < 2) issues.push(`follow_ups: expected 2+ pending, found ${followUpCount ?? 0}`)

  // ── Momentum scores ───────────────────────────────────────────────────────
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setUTCDate(twoWeeksAgo.getUTCDate() - 14)

  const { count: momentumCount } = await supabase
    .from('momentum_scores')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', demoUserId)
    .gte('week_of', twoWeeksAgo.toISOString().split('T')[0])

  if ((momentumCount ?? 0) < 2) issues.push(`momentum_scores: expected 2 recent rows, found ${momentumCount ?? 0} — weekly report delta will be blank`)

  // ── Scan results ──────────────────────────────────────────────────────────
  const { count: scanCount } = await supabase
    .from('scan_results')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', demoUserId)

  if ((scanCount ?? 0) < 3) issues.push(`scan_results: expected 3+, found ${scanCount ?? 0}`)

  // ── Report ────────────────────────────────────────────────────────────────
  if (issues.length === 0) {
    logger.info('check-demo: all checks passed', { userId: demoUserId })
  } else {
    for (const issue of issues) {
      logger.warn(`check-demo: ${issue}`, { userId: demoUserId })
    }
    logger.warn('check-demo: demo account has issues — run npm run seed:demo to reset', {
      issueCount: issues.length,
    })
  }

  return issues
}
