import { logger } from './logger.js'

const TABLE = 'heavy_job_queue'

export async function enqueueHeavyJob(supabase, {
  jobType,
  payload,
  idempotencyKey,
  maxAttempts = 5,
}) {
  const row = {
    job_type: jobType,
    payload: payload ?? {},
    idempotency_key: idempotencyKey,
    max_attempts: maxAttempts,
  }

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(row, { onConflict: 'idempotency_key' })
    .select('id, status, attempts, max_attempts')
    .single()

  if (error) {
    logger.error('heavy-job-queue: enqueue failed', {
      jobType,
      idempotencyKey,
      error: error.message,
    })
    throw error
  }

  return data
}

async function claimNextQueuedJobs(supabase, jobType, limit) {
  const { data: queued, error } = await supabase
    .from(TABLE)
    .select('id, job_type, payload, attempts, max_attempts')
    .eq('job_type', jobType)
    .in('status', ['queued', 'retry'])
    .order('updated_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  if (!queued?.length) return []

  const ids = queued.map((job) => job.id)
  const { error: updateError } = await supabase
    .from(TABLE)
    .update({
      status: 'processing',
      last_attempt_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .in('id', ids)
    .in('status', ['queued', 'retry'])

  if (updateError) throw updateError

  const { data: claimed, error: claimedError } = await supabase
    .from(TABLE)
    .select('id, job_type, payload, attempts, max_attempts')
    .in('id', ids)
    .eq('status', 'processing')

  if (claimedError) throw claimedError
  return claimed ?? []
}

export async function processHeavyJobs(supabase, {
  jobType,
  limit = 10,
  handler,
}) {
  const result = {
    processed: 0,
    completed: 0,
    retried: 0,
    deadLettered: 0,
    failed: 0,
  }

  let jobs = []
  try {
    jobs = await claimNextQueuedJobs(supabase, jobType, limit)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.error('heavy-job-queue: claim failed', { jobType, error: msg })
    return result
  }

  for (const job of jobs) {
    result.processed += 1
    try {
      await handler(job)
      const { error } = await supabase
        .from(TABLE)
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
          last_error: null,
        })
        .eq('id', job.id)

      if (error) throw error
      result.completed += 1
    } catch (err) {
      const attempts = (job.attempts ?? 0) + 1
      const maxAttempts = job.max_attempts ?? 5
      const lastError = err instanceof Error ? err.message : String(err)

      if (attempts >= maxAttempts) {
        const { error } = await supabase
          .from(TABLE)
          .update({
            status: 'dead_letter',
            attempts,
            updated_at: new Date().toISOString(),
            last_error: lastError,
          })
          .eq('id', job.id)

        if (error) {
          logger.error('heavy-job-queue: dead-letter update failed', { id: job.id, error: error.message })
          result.failed += 1
        } else {
          result.deadLettered += 1
        }
      } else {
        const { error } = await supabase
          .from(TABLE)
          .update({
            status: 'retry',
            attempts,
            updated_at: new Date().toISOString(),
            last_error: lastError,
          })
          .eq('id', job.id)

        if (error) {
          logger.error('heavy-job-queue: retry update failed', { id: job.id, error: error.message })
          result.failed += 1
        } else {
          result.retried += 1
        }
      }
    }
  }

  return result
}
