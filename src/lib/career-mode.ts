export type CareerMode = 'active_search' | 'post_search' | 'optionality' | 'board_track'

type CareerModeInput = {
  placedAt?: string | null
  searchStatus?: string | null
}

const POST_SEARCH_STATUSES = new Set(['complete', 'paused'])
const OPTIONALITY_STATUSES = new Set(['optionality', 'quiet'])
const BOARD_TRACK_STATUSES = new Set(['board_track', 'board'])

export function resolveCareerMode(input: CareerModeInput): CareerMode {
  const normalizedStatus = (input.searchStatus ?? '').trim().toLowerCase()

  if (OPTIONALITY_STATUSES.has(normalizedStatus)) return 'optionality'
  if (BOARD_TRACK_STATUSES.has(normalizedStatus)) return 'board_track'
  if (input.placedAt) return 'post_search'
  if (POST_SEARCH_STATUSES.has(normalizedStatus)) return 'post_search'

  return 'active_search'
}

export function postSearchDigestFrequency(input: { briefingFrequency?: string | null }): 'weekly' | 'daily' {
  const normalized = (input.briefingFrequency ?? '').trim().toLowerCase()
  return normalized === 'daily' ? 'daily' : 'weekly'
}