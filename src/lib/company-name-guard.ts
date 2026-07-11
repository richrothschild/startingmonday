const SYNTHETIC_TEST_NAME_REGEX = /test/i
const TIMESTAMP_FRAGMENT_REGEX = /\d{8,}/

function isProductionRuntime(): boolean {
  if (process.env.NODE_ENV !== 'production') return false
  const appEnv = (process.env.APP_ENV ?? process.env.NEXT_PUBLIC_APP_ENV ?? '').toLowerCase()
  if (appEnv === 'staging' || appEnv === 'preview' || appEnv === 'development') return false
  return true
}

export function blocksSyntheticCompanyName(rawName: string): boolean {
  if (!isProductionRuntime()) return false
  const name = rawName.trim()
  if (!name) return false
  return SYNTHETIC_TEST_NAME_REGEX.test(name) && TIMESTAMP_FRAGMENT_REGEX.test(name)
}
