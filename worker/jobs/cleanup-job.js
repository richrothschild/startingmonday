import { getSupabase } from '../lib/supabase.js'
import { logger } from '../lib/logger.js'

export async function runCleanupJob() {
  const supabase = getSupabase()
  logger.info('cleanup-job: starting')

  const [signalResult, convResult] = await Promise.allSettled([
    supabase.rpc('delete_old_signals'),
    supabase.rpc('delete_stale_conversations'),
  ])

  if (signalResult.status === 'fulfilled') {
    logger.info('cleanup-job: signals deleted', { count: signalResult.value.data ?? 0 })
  } else {
    logger.error('cleanup-job: signal cleanup failed', { error: signalResult.reason?.message })
  }

  if (convResult.status === 'fulfilled') {
    logger.info('cleanup-job: conversations deleted', { count: convResult.value.data ?? 0 })
  } else {
    logger.error('cleanup-job: conversation cleanup failed', { error: convResult.reason?.message })
  }

  logger.info('cleanup-job: done')
}
