export type CareerMode = 'active_search' | 'post_search'

type CareerModeInput = {
  placedAt?: string | null
  searchStatus?: string | null
}

const POST_SEARCH_STATUSES = new Set(['complete', 'paused'])

export function resolveCareerMode(input: CareerModeInput): CareerMode {
  if (input.placedAt) return 'post_search'

  const normalizedStatus = (input.searchStatus ?? '').trim().toLowerCase()
  if (POST_SEARCH_STATUSES.has(normalizedStatus)) return 'post_search'

  return 'active_search'
}

export function postSearchDigestFrequency(input: { briefingFrequency?: string | null }): 'weekly' | 'daily' {
  const normalized = (input.briefingFrequency ?? '').trim().toLowerCase()
  return normalized === 'daily' ? 'daily' : 'weekly'
}