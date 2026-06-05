import { logger } from './logger.js'

export async function writeScanFailureDeadLetter(supabase, {
  jobName,
  userId,
  companyId,
  companyName,
  error,
  metadata = {},
}) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const payload = {
    job_name: jobName,
    user_id: userId,
    company_id: companyId,
    company_name: companyName,
    error_message: errorMessage,
    metadata,
  }

  const { error: insertErr } = await supabase
    .from('scan_failures')
    .insert(payload)

  if (insertErr) {
    logger.error('scan-dead-letter: failed to persist scan failure', {
      event: 'scan_failure_dead_letter_error',
      job: jobName,
      user_id: userId,
      company_id: companyId,
      error: insertErr.message,
    })
    return
  }

  logger.warn('scan-dead-letter: persisted scan failure', {
    event: 'scan_failure_dead_letter',
    job: jobName,
    user_id: userId,
    company_id: companyId,
  })
}