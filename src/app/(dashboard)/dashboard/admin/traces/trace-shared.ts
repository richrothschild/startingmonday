export type Trace = {
  id: string
  created_at: string
  user_id: string | null
  feature: string
  model: string
  prompt_tokens: number | null
  completion_tokens: number | null
  latency_ms: number | null
  input_snapshot: Record<string, unknown> | null
  output_snapshot: string | null
  eval_pass: boolean | null
  eval_notes: string | null
}

export type ToastState = {
  kind: 'success' | 'error'
  message: string
}

export type LastActionState = {
  message: string
  at: string
}

export type BulkApplyUndoChange = {
  traceId: string
  prevNotes: string | null
  prevSessionTags: string[] | undefined
}

export const FEATURES = ['', 'prep_brief', 'prep_refine', 'chat', 'suggestions']
export const FEATURE_LABELS: Record<string, string> = {
  '': 'All features',
  prep_brief: 'Prep brief',
  prep_refine: 'Prep refine',
  chat: 'Chat',
  suggestions: 'Suggestions',
}

export const FAILURE_CATEGORIES = [
  'company_context_thin',
  'role_fit_not_established',
  'questions_too_generic',
  'format_off',
  'tone_wrong',
  'factual_error',
  'missing_context_not_flagged',
  'competitive_framing_missed',
]

export function parseEvalNotes(raw: string | null): { body: string; categories: string[] } {
  if (!raw?.trim()) return { body: '', categories: [] }

  const lines = raw.split(/\r?\n/)
  const categoryLineIndex = lines.findIndex((line) => /^\s*categories\s*:/i.test(line))

  if (categoryLineIndex < 0) return { body: raw.trim(), categories: [] }

  const categoryLine = lines[categoryLineIndex].replace(/^\s*categories\s*:/i, '')
  const categories = categoryLine
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const body = lines
    .filter((_, idx) => idx !== categoryLineIndex)
    .join('\n')
    .trim()

  return { body, categories }
}

export function composeEvalNotes(body: string, categories: string[]): string {
  const normalizedBody = body.trim()
  const normalizedCategories = [...new Set(categories.map((item) => item.trim()).filter(Boolean))]
  if (normalizedCategories.length === 0) return normalizedBody

  const categoryLine = `Categories: ${normalizedCategories.join(', ')}`
  return normalizedBody ? `${normalizedBody}\n\n${categoryLine}` : categoryLine
}

export function buildUrl(params: { feature?: string; unrated?: string; page?: string }) {
  const sp = new URLSearchParams()
  if (params.feature) sp.set('feature', params.feature)
  if (params.unrated === '1') sp.set('unrated', '1')
  if (params.page && params.page !== '0') sp.set('page', params.page)
  const qs = sp.toString()
  return `/dashboard/admin/traces${qs ? '?' + qs : ''}`
}