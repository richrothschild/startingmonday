import { getSupabase } from '../lib/supabase.js'
import { logger } from '../lib/logger.js'

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export async function runMomentumJob() {
  const supabase = getSupabase()
  logger.info('momentum-job: starting')

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email')

  if (error || !users?.length) {
    logger.info('momentum-job: no users — done')
    return
  }

  const since30 = daysAgo(30)
  const since7 = daysAgo(7)

  for (const user of users) {
    try {
      const [
        { data: companies },
        { data: recentFollowUps },
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
          .select('id, status, due_date')
          .eq('user_id', user.id)
          .gte('created_at', since7),
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

      const companyList = companies ?? []
      const active = companyList.filter(c =>
        ['interviewing', 'applied', 'offer'].includes(c.stage)
      ).length
      const addedLast30 = companyList.filter(c => c.created_at >= since30).length
      const updatedLast7 = companyList.filter(c => c.updated_at >= since7).length
      const completedActions = (completedFollowUps ?? []).length
      const avgScanScore = scans?.length
        ? Math.round(scans.reduce((sum, s) => sum + (s.ai_score ?? 0), 0) / scans.length)
        : null

      logger.info('momentum-job: user stats', {
        userId: user.id,
        pipeline: companyList.length,
        active,
        addedLast30,
        updatedLast7,
        completedActionsLast30: completedActions,
        avgScanScore,
        recentFollowUps: (recentFollowUps ?? []).length,
      })
    } catch (err) {
      logger.error(`momentum-job: error for user ${user.id}`, { error: err.message })
    }
  }

  logger.info('momentum-job: complete')
}
