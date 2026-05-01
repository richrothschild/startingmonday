import { logger } from '../lib/logger.js'

// Gathers all data needed for one user's daily briefing.
// Returns null if there is nothing actionable to send.
export async function assembleContext(supabase, userId, userEmail, tz = 'UTC') {
  const now = new Date()
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now)

  const [profileResult, companiesResult, recentScansResult, followUpsResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('full_name, target_titles')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('companies')
      .select('id, name, last_checked_at')
      .eq('user_id', userId)
      .is('archived_at', null),
    supabase
      .from('scan_results')
      .select('company_id, scanned_at, ai_score, ai_summary, raw_hits')
      .eq('user_id', userId)
      .eq('status', 'success')
      .gte('scanned_at', since24h.toISOString())
      .gt('ai_score', 0)
      .order('ai_score', { ascending: false }),
    supabase
      .from('follow_ups')
      .select('id, due_date, action, contact_id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .lte('due_date', todayStr)
      .order('due_date', { ascending: true }),
  ])

  if (profileResult.error) {
    logger.warn('assemble-context: profile error', { userId, error: profileResult.error.message })
  }

  const profile = profileResult.data ?? {}
  const companies = companiesResult.data ?? []
  const recentScans = recentScansResult.data ?? []
  const rawFollowUps = followUpsResult.data ?? []

  const companyById = Object.fromEntries(companies.map(c => [c.id, c]))

  const newMatches = recentScans
    .map(scan => ({
      companyName: companyById[scan.company_id]?.name ?? 'Unknown Company',
      aiScore: scan.ai_score,
      aiSummary: scan.ai_summary,
      matchingRoles: (scan.raw_hits ?? [])
        .filter(h => h.is_match)
        .map(h => ({ title: h.title, score: h.score, isNew: h.is_new, summary: h.summary })),
    }))
    .filter(m => m.matchingRoles.length > 0)

  // Fetch contact names for any follow-ups that have a contact_id
  const contactIds = rawFollowUps.filter(f => f.contact_id).map(f => f.contact_id)
  let contactById = {}
  if (contactIds.length) {
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, name, title')
      .in('id', contactIds)
    if (contacts) contactById = Object.fromEntries(contacts.map(c => [c.id, c]))
  }

  const followUps = rawFollowUps.map(f => ({
    id: f.id,
    dueDate: f.due_date,
    action: f.action,
    contact: f.contact_id ? (contactById[f.contact_id] ?? null) : null,
  }))

  if (!newMatches.length && !followUps.length) return null

  return {
    userEmail,
    userName: profile.full_name ?? userEmail,
    targetTitles: profile.target_titles ?? [],
    totalCompanies: companies.length,
    newMatches,
    followUps,
    todayStr,
  }
}
