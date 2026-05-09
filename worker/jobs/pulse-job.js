import { logger } from '../lib/logger.js'
import { getSupabase } from '../lib/supabase.js'
import { sendPipelinePulse } from '../lib/pulse-email.js'

const PULSE_LOCK_KEY = 8834720165n

export async function runPulseJob() {
  const supabase = getSupabase()

  const { data: locked } = await supabase.rpc('try_advisory_lock', { p_key: PULSE_LOCK_KEY })
  if (!locked) {
    logger.warn('pulse-job: another instance running — skipping')
    return
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('subscription_tier', 'executive')
      .in('subscription_status', ['active', 'trialing'])
      .limit(500)

    if (error) {
      logger.error('pulse-job: failed to fetch users', { error: error.message })
      return
    }

    if (!users?.length) {
      logger.info('pulse-job: no executive users')
      return
    }

    const userIds = users.map(u => u.id)
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, full_name')
      .in('user_id', userIds)
    const profileByUserId = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))

    const since7d  = new Date(Date.now() -  7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const since14d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const todayISO = new Date().toISOString().split('T')[0]

    let emailsSent = 0

    for (const user of users) {
      if (!user.email) continue

      try {
        const profile = profileByUserId[user.id] ?? null
        const firstName = profile?.full_name?.split(' ')[0] ?? null

        const [
          { data: newSignalRows },
          { count: draftReadyCount },
          { count: overdueCount },
          { count: totalCompanies },
          { data: signalCompanyRows },
        ] = await Promise.all([
          supabase
            .from('company_signals')
            .select('signal_summary, company_id, companies(name)')
            .eq('user_id', user.id)
            .gte('signal_date', since7d)
            .order('signal_date', { ascending: false })
            .limit(20),
          supabase
            .from('company_signals')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .not('outreach_draft', 'is', null)
            .gte('signal_date', since14d),
          supabase
            .from('follow_ups')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .lte('due_date', todayISO),
          supabase
            .from('companies')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .is('archived_at', null),
          supabase
            .from('company_signals')
            .select('company_id')
            .eq('user_id', user.id)
            .gte('signal_date', since30d),
        ])

        const recentSignalCompanyIds = new Set((signalCompanyRows ?? []).map(r => r.company_id))
        const staleCompanyCount = Math.max(0, (totalCompanies ?? 0) - recentSignalCompanyIds.size)

        const newSignals = (newSignalRows ?? []).map(sig => ({
          signal_summary: sig.signal_summary,
          company_name: (sig.companies)?.name ?? '',
        }))

        await sendPipelinePulse({
          to: user.email,
          firstName,
          newSignals,
          draftReadyCount: draftReadyCount ?? 0,
          overdueCount: overdueCount ?? 0,
          staleCompanyCount,
          totalCompanies: totalCompanies ?? 0,
        })
        emailsSent++
        logger.info('pulse-job: sent', { userId: user.id })
      } catch (err) {
        logger.error('pulse-job: email failed', { userId: user.id, error: err.message })
      }
    }

    logger.info('pulse-job: complete', { emailsSent })
  } finally {
    await supabase.rpc('advisory_unlock', { p_key: PULSE_LOCK_KEY })
  }
}
