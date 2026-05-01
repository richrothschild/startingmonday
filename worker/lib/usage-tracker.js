import { logger } from './logger.js'

function monthKey() {
  return new Date().toISOString().slice(0, 7) // 'YYYY-MM'
}

// Atomically increment usage counters. userId=null for worker/system calls.
export async function trackUsage(supabase, { userId = null, service, requests = 1, tokens = 0 }) {
  const { error } = await supabase.rpc('increment_api_usage', {
    p_user_id:   userId,
    p_service:   service,
    p_month_key: monthKey(),
    p_requests:  requests,
    p_tokens:    tokens,
  })
  if (error) logger.warn('usage-tracker: failed to record usage', { service, error: error.message })
}

export async function getMonthlyUsage(supabase, { userId = null, service }) {
  const { data } = await supabase
    .from('api_usage')
    .select('request_count, token_count')
    .eq('service', service)
    .eq('month_key', monthKey())
    .is('user_id', userId)
    .maybeSingle()
  return { requests: data?.request_count ?? 0, tokens: data?.token_count ?? 0 }
}
