import { logger } from './logger.js'

const TABLE = 'job_checkpoints'

export async function getJobCheckpoint(supabase, jobName) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('job_name, cursor, context, updated_at')
    .eq('job_name', jobName)
    .maybeSingle()

  if (error) {
    logger.error('job-checkpoint: read failed', { jobName, error: error.message })
    return null
  }

  return data ?? null
}

export async function saveJobCheckpoint(supabase, jobName, payload) {
  const { cursor = {}, context = {} } = payload ?? {}
  const { error } = await supabase
    .from(TABLE)
    .upsert(
      {
        job_name: jobName,
        cursor,
        context,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'job_name' }
    )

  if (error) {
    logger.error('job-checkpoint: save failed', { jobName, error: error.message })
    return false
  }

  return true
}

export async function clearJobCheckpoint(supabase, jobName) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('job_name', jobName)

  if (error) {
    logger.error('job-checkpoint: clear failed', { jobName, error: error.message })
    return false
  }

  return true
}
