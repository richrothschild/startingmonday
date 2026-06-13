export function isEnabledFlag(value: string | null | undefined): boolean {
  if (value == null) return false

  const normalized = value.trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on'
}