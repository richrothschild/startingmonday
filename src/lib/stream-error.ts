export function streamErrorMessage(err: unknown, context?: { feature?: string; userId?: string }): string {
  const msg = err instanceof Error ? err.message : 'Unknown error'
  console.error(JSON.stringify({
    ts: new Date().toISOString(),
    event: 'stream_error',
    feature: context?.feature ?? 'unknown',
    user_id: context?.userId ?? null,
    error: msg,
  }))
  return `__ERROR__${msg}`
}
