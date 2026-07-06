import { logger } from '../lib/logger.js'
import { getSupabase } from '../lib/supabase.js'
import { buildBacktestCohortsAndControls } from '../lib/backtest-cohort-builder.js'

const COHORT_BUILDER_LOCK_KEY = 7241936120n

export async function runCohortBuilderJob() {
  const supabase = getSupabase()

  const { data: locked } = await supabase.rpc('try_advisory_lock', { p_key: COHORT_BUILDER_LOCK_KEY })
  if (!locked) {
    logger.warn('cohort-builder-job: another instance running — skipping')
    return
  }

  try {
    const result = await buildBacktestCohortsAndControls(supabase)
    logger.info('cohort-builder-job: complete', result)
  } finally {
    await supabase.rpc('advisory_unlock', { p_key: COHORT_BUILDER_LOCK_KEY })
  }
}
