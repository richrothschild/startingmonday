import { getSupabase } from '../lib/supabase.js'
import { logger } from '../lib/logger.js'

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function computeScore({ active, addedLast30, updatedLast7, completedLast30, avgScanScore }) {
  let score = 0
  score += Math.min(active * 10, 25)           // active pipeline: up to 25
  score += Math.min(addedLast30 * 7, 15)        // recent adds: up to 15
  score += Math.min(updatedLast7 * 5, 20)       // engagement recency: up to 20
  score += Math.min(completedLast30 * 8, 25)    // execution: up to 25
  score += (avgScanScore ?? 0) >= 60 ? 15 : (avgScanScore ?? 0) >= 40 ? 8 : 0  // scan quality: up to 15
  return Math.min(Math.round(score), 100)
}

// Returns true if this user should not receive momentum nudge emails.
// Called by weekly-report-job and any future nudge job.
export function shouldSuppressNudge(searchPersona, momentumScore, activeCount) {
  // Board persona prefers low-touch unless actively engaged
  if (searchPersona === 'board' && momentumScore < 25) return true
  // Already highly active — no nudge needed
  if (momentumScore >= 85) return true
  // Deep in multiple active conversations — don't interrupt
  if (activeCount >= 3) return true
  return false
}

export async function runMomentumJob() {
  const supabase = getSupabase()
  logger.info('momentum-job: starting')

  const { data: users, error } = await supabase
    .from('users')
    .select('id')
    .in('subscription_status', ['trialing', 'active'])

  if (error || !users?.length) {
    logger.info('momentum-job: no active users — done')
    return
  }

  const since30 = daysAgo(30)
  const since7  = daysAgo(7)

  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, search_persona')
    .in('user_id', users.map(u => u.id))

  const personaMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p.search_persona]))

  let updated = 0

  for (const user of users) {
    try {
      const [
        { data: companies },
        { data: completedFollowUps },
        { data: scans },
      ] = await Promise.all([
        supabase
          .from('companies')
          .select('id, stage, created_at, updated_at')
          .eq('user_id', user.id)
          .is('archived_at', null),
        supabase
          .from('follow_ups')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'done')
          .gte('updated_at', since30),
        supabase
          .from('scan_results')
          .select('id, ai_score')
          .eq('user_id', user.id)
          .eq('status', 'success')
          .gte('scanned_at', since30),
      ])

      const companyList  = companies ?? []
      const active       = companyList.filter(c => ['interviewing', 'applied', 'offer'].includes(c.stage)).length
      const addedLast30  = companyList.filter(c => c.created_at >= since30).length
      const updatedLast7 = companyList.filter(c => c.updated_at >= since7).length
      const completedLast30 = (completedFollowUps ?? []).length
      const avgScanScore = scans?.length
        ? Math.round(scans.reduce((sum, s) => sum + (s.ai_score ?? 0), 0) / scans.length)
        : null

      const score = computeScore({ active, addedLast30, updatedLast7, completedLast30, avgScanScore })
      const suppress = shouldSuppressNudge(personaMap[user.id], score, active)

      await supabase
        .from('user_profiles')
        .update({
          momentum_score: score,
          momentum_computed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      logger.info('momentum-job: scored', { userId: user.id, score, suppress, active, addedLast30, completedLast30 })
      updated++
    } catch (err) {
      logger.error(`momentum-job: error for user ${user.id}`, { error: err.message })
    }
  }

  logger.info('momentum-job: complete', { updated })
}
