// Shared FormData parsing helpers for server actions.
// Use these instead of inline `as string` casts to keep parsing consistent.

export function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

export function numOrNull(formData: FormData, key: string): number | null {
  const raw = formData.get(key)
  if (!raw) return null
  const v = Number(raw)
  return Number.isFinite(v) ? v : null
}
