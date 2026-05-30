export const PARTNER_PROGRAMS = ['intelligence', 'active', 'executive', 'free'] as const
export type PartnerProgram = (typeof PARTNER_PROGRAMS)[number]

export type PartnerKpiDefinition = {
  id: 'utilization_rate' | 'prep_completion_rate' | 'followup_completion_rate' | 'pipeline_movement_rate'
  label: string
  owner: 'revenue' | 'data'
  unit: 'percent'
  denominator: 'attributed_users_in_scope'
  numerator: string
  sourceTables: string[]
  sourceEvents: string[]
  requiredFields: string[]
  description: string
}

export const PARTNER_KPI_DEFINITIONS: PartnerKpiDefinition[] = [
  {
    id: 'utilization_rate',
    label: 'Utilization rate',
    owner: 'revenue',
    unit: 'percent',
    denominator: 'attributed_users_in_scope',
    numerator: 'distinct attributed users with at least one tracked event in window',
    sourceTables: ['referral_attributions', 'user_events', 'users'],
    sourceEvents: ['*'],
    requiredFields: ['referral_attributions.signup_user_id', 'user_events.user_id', 'user_events.created_at'],
    description: 'Measures whether attributed participants are active in product telemetry for the selected window.',
  },
  {
    id: 'prep_completion_rate',
    label: 'Prep completion rate',
    owner: 'data',
    unit: 'percent',
    denominator: 'attributed_users_in_scope',
    numerator: 'distinct attributed users with prep or prep_section brief in window',
    sourceTables: ['referral_attributions', 'briefs', 'users'],
    sourceEvents: [],
    requiredFields: ['briefs.user_id', 'briefs.type', 'briefs.created_at'],
    description: 'Tracks prep workflow completion among attributed users for partner reporting.',
  },
  {
    id: 'followup_completion_rate',
    label: 'Follow-up completion rate',
    owner: 'revenue',
    unit: 'percent',
    denominator: 'attributed_users_in_scope',
    numerator: 'distinct attributed users with completed follow-up tasks in window',
    sourceTables: ['referral_attributions', 'follow_ups', 'users'],
    sourceEvents: [],
    requiredFields: ['follow_ups.user_id', 'follow_ups.status', 'follow_ups.created_at'],
    description: 'Measures execution throughput on scheduled follow-up tasks in partner cohorts.',
  },
  {
    id: 'pipeline_movement_rate',
    label: 'Pipeline movement rate',
    owner: 'data',
    unit: 'percent',
    denominator: 'attributed_users_in_scope',
    numerator: 'distinct attributed users with at least one outreach log in window',
    sourceTables: ['referral_attributions', 'outreach_logs', 'users'],
    sourceEvents: [],
    requiredFields: ['outreach_logs.user_id', 'outreach_logs.sent_at'],
    description: 'Tracks whether attributed users move pipeline activity forward in the selected period.',
  },
]

export function inferPartnerProgramFromTier(tier: string | null): PartnerProgram {
  const normalized = (tier ?? '').trim().toLowerCase()
  if (normalized === 'passive') return 'intelligence'
  if (normalized === 'active') return 'active'
  if (normalized === 'executive') return 'executive'
  return 'free'
}

export function cohortKeyFromDate(value: string | null): string {
  if (!value) return 'unknown'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return 'unknown'
  const month = String(dt.getUTCMonth() + 1).padStart(2, '0')
  return `${dt.getUTCFullYear()}-${month}`
}

export function toPercent(numerator: number, denominator: number): number {
  if (!denominator) return 0
  return Number(((numerator / denominator) * 100).toFixed(2))
}
