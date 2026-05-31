export type ProvisioningSeatStatus = 'invited' | 'active' | 'suspended' | 'transferred' | 'archived'

export type ProvisioningImportRow = {
  partner_id: string
  partner_name: string
  cohort_key: string
  user_email: string
  seat_id?: string
}

export type ProvisioningValidationError = {
  row_index: number
  code: 'missing_partner_id' | 'missing_cohort_key' | 'invalid_email' | 'duplicate_email_in_batch'
  reason: string
}

export type ProvisioningValidationResult = {
  valid: ProvisioningImportRow[]
  invalid: ProvisioningValidationError[]
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const SEAT_TRANSITIONS: Record<ProvisioningSeatStatus, ProvisioningSeatStatus[]> = {
  invited: ['active', 'suspended', 'archived'],
  active: ['suspended', 'transferred', 'archived'],
  suspended: ['active', 'transferred', 'archived'],
  transferred: ['active', 'suspended', 'archived'],
  archived: [],
}

export function canTransitionSeat(from: ProvisioningSeatStatus, to: ProvisioningSeatStatus): boolean {
  return SEAT_TRANSITIONS[from]?.includes(to) ?? false
}

export function validateProvisioningRows(rows: ProvisioningImportRow[]): ProvisioningValidationResult {
  const invalid: ProvisioningValidationError[] = []
  const valid: ProvisioningImportRow[] = []
  const seen = new Set<string>()

  rows.forEach((row, index) => {
    if (!row.partner_id || row.partner_id.trim().length === 0) {
      invalid.push({ row_index: index, code: 'missing_partner_id', reason: 'partner_id is required' })
      return
    }
    if (!row.cohort_key || row.cohort_key.trim().length === 0) {
      invalid.push({ row_index: index, code: 'missing_cohort_key', reason: 'cohort_key is required' })
      return
    }
    if (!EMAIL_RE.test(row.user_email.trim().toLowerCase())) {
      invalid.push({ row_index: index, code: 'invalid_email', reason: 'user_email must be a valid email address' })
      return
    }

    const dedupeKey = `${row.partner_id.trim()}::${row.cohort_key.trim()}::${row.user_email.trim().toLowerCase()}`
    if (seen.has(dedupeKey)) {
      invalid.push({ row_index: index, code: 'duplicate_email_in_batch', reason: 'duplicate user_email in same partner cohort batch' })
      return
    }
    seen.add(dedupeKey)

    valid.push({
      partner_id: row.partner_id.trim(),
      partner_name: row.partner_name?.trim() || 'Unknown partner',
      cohort_key: row.cohort_key.trim(),
      user_email: row.user_email.trim().toLowerCase(),
      seat_id: row.seat_id?.trim() || undefined,
    })
  })

  return { valid, invalid }
}

export function estimateImportDurationMinutes(seatCount: number): number {
  if (seatCount <= 0) return 0
  const base = 2
  const throughputPerMinute = 8
  return Number((base + seatCount / throughputPerMinute).toFixed(2))
}

export function summarizeProvisioningSla(args: {
  durationsMinutes: number[]
  errorClasses: Record<string, number>
}) {
  const sorted = [...args.durationsMinutes].sort((a, b) => a - b)
  const total = sorted.length
  const median = total > 0 ? sorted[Math.floor(total / 2)] : 0
  const p95 = total > 0 ? sorted[Math.floor(total * 0.95)] : 0
  const over15m = sorted.filter((n) => n > 15).length

  return {
    runs: total,
    median_minutes: Number(median.toFixed(2)),
    p95_minutes: Number(p95.toFixed(2)),
    sla_breach_count: over15m,
    breach_rate_pct: total > 0 ? Number(((over15m / total) * 100).toFixed(2)) : 0,
    error_class_distribution: args.errorClasses,
  }
}
