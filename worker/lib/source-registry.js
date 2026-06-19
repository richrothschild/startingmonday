import { logger } from './logger.js'

export async function resolveSourceDecision(supabase, sourceKey) {
  try {
    const { data, error } = await supabase
      .from('signal_sources')
      .select('source_key, source_status, rights_status')
      .eq('source_key', sourceKey)
      .maybeSingle()

    if (error) {
      logger.warn('source-registry: read failed', { sourceKey, error: error.message })
      return {
        sourceKey,
        allowed: true,
        sourceStatus: 'unknown',
        rightsStatus: 'unknown',
        reason: 'registry_read_failed_fail_open',
      }
    }

    if (data?.source_key) {
      const sourceStatus = data.source_status ?? 'unknown'
      const rightsStatus = data.rights_status ?? 'unknown'
      const rightsBlocked = ['blocked', 'prohibited', 'disallowed'].includes(String(rightsStatus).toLowerCase())
      const allowed = sourceStatus !== 'deprecated' && !rightsBlocked
      return {
        sourceKey,
        allowed,
        sourceStatus,
        rightsStatus,
        reason: allowed ? 'allowed_by_registry' : 'blocked_by_registry',
      }
    }

    return {
      sourceKey,
      allowed: true,
      sourceStatus: 'unknown',
      rightsStatus: 'unknown',
      reason: 'registry_miss_fail_open',
    }
  } catch (error) {
    logger.warn('source-registry: unexpected error', { sourceKey, error: error.message })
    return {
      sourceKey,
      allowed: true,
      sourceStatus: 'unknown',
      rightsStatus: 'unknown',
      reason: 'registry_exception_fail_open',
    }
  }
}
