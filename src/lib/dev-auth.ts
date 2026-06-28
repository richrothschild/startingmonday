export const DEV_AUTH_HEADER = 'x-sm-dev-auth'
export const DEV_AUTH_USER_HEADER = 'x-sm-dev-user-id'
export const DEV_AUTH_EMAIL_HEADER = 'x-sm-dev-user-email'

export type DevAuthUser = {
  userId: string
  email: string
}

const FALLBACK_DEMO_USER_ID = '00000000-0000-0000-0000-000000000000'
const FALLBACK_DEMO_EMAIL = 'demo@startingmonday.app'
const FALLBACK_DEMO_FULL_NAME = 'Sarah Chen'

export function isDevAuthBypassEnabled(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function getDevAuthUser(headers: Pick<Headers, 'get'>): DevAuthUser | null {
  if (!isDevAuthBypassEnabled()) return null
  if (headers.get(DEV_AUTH_HEADER) !== '1') return null

  const userId =
    headers.get(DEV_AUTH_USER_HEADER)?.trim()
    || process.env.DEMO_USER_ID?.trim()
    || process.env.AUTOMATION_SERVICE_USER_ID?.trim()
    || FALLBACK_DEMO_USER_ID

  return {
    userId,
    email: headers.get(DEV_AUTH_EMAIL_HEADER)?.trim() || process.env.DEV_AUTH_EMAIL?.trim() || FALLBACK_DEMO_EMAIL,
  }
}

export async function resolveDevAuthUser(
  adminClient: { from: (table: string) => any },
  headers: Pick<Headers, 'get'>,
): Promise<DevAuthUser | null> {
  const devAuthUser = getDevAuthUser(headers)
  if (!devAuthUser) return null
  if (devAuthUser.userId !== FALLBACK_DEMO_USER_ID) return devAuthUser

  const { data } = await adminClient
    .from('user_profiles')
    .select('user_id')
    .eq('full_name', FALLBACK_DEMO_FULL_NAME)
    .limit(1)

  const resolvedUserId = data?.[0]?.user_id?.trim()
  if (!resolvedUserId) return devAuthUser

  return {
    userId: resolvedUserId,
    email: devAuthUser.email,
  }
}

export function getDevAuthHeaders(): Headers {
  const headers = new Headers()
  if (!isDevAuthBypassEnabled()) return headers

  headers.set(DEV_AUTH_HEADER, '1')
  headers.set(
    DEV_AUTH_USER_HEADER,
    process.env.DEMO_USER_ID?.trim()
      || process.env.AUTOMATION_SERVICE_USER_ID?.trim()
      || FALLBACK_DEMO_USER_ID
  )
  headers.set(DEV_AUTH_EMAIL_HEADER, process.env.DEV_AUTH_EMAIL?.trim() || FALLBACK_DEMO_EMAIL)
  return headers
}