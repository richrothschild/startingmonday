import { cohortKeyFromDate, toPercent } from '@/lib/partner-kpi-schema'

export type CohortMilestoneId =
  | 'intake_complete'
  | 'prep_ready'
  | 'first_outreach'
  | 'followup_closure'

export type CohortMilestoneDefinition = {
  id: CohortMilestoneId
  label: string
  ownerLane: 'lane_b' | 'lane_c' | 'lane_d' | 'lane_e'
}

export const OUTPLACEMENT_MILESTONES: CohortMilestoneDefinition[] = [
  { id: 'intake_complete', label: 'Intake complete', ownerLane: 'lane_b' },
  { id: 'prep_ready', label: 'Prep ready', ownerLane: 'lane_d' },
  { id: 'first_outreach', label: 'First outreach sent', ownerLane: 'lane_e' },
  { id: 'followup_closure', label: 'Follow-up closure', ownerLane: 'lane_c' },
]

export type CohortRecord = {
  cohortId: string
  partnerId: string
  partnerName: string
  cohortKey: string
  program: string
  rosterUserIds: string[]
  rosterSize: number
  milestones: Array<{
    id: CohortMilestoneId
    label: string
    completedUsers: number
    completionRate: number
  }>
  sponsorSnapshot: {
    status: 'on_track' | 'needs_attention' | 'at_risk'
    fields: {
      roster_size: number
      active_seats: number
      milestone_completion_rate: number
      utilization_rate: number
      cadence_adherence_rate: number
    }
  }
}

type AttributionRow = {
  partner_id: string
  signup_user_id: string
  attributed_at: string
}

export function inferOutplacementProgram(partnerName: string): string {
  const normalized = partnerName.toLowerCase()
  if (normalized.includes('enterprise') || normalized.includes('global')) return 'outplacement_enterprise'
  if (normalized.includes('boutique') || normalized.includes('specialist')) return 'outplacement_boutique'
  return 'outplacement_standard'
}

export function buildCohortModel(args: {
  partners: Array<{ id: string; name: string }>
  attributions: AttributionRow[]
  activeUsers: Set<string>
  prepUsers: Set<string>
  outreachUsers: Set<string>
  closedFollowupUsers: Set<string>
}): CohortRecord[] {
  const partnerMap = new Map(args.partners.map((row) => [row.id, row.name]))
  const cohortBuckets = new Map<string, { partnerId: string; partnerName: string; cohortKey: string; userIds: Set<string> }>()

  for (const row of args.attributions) {
    const partnerName = partnerMap.get(row.partner_id)
    if (!partnerName) continue
    const cohortKey = cohortKeyFromDate(row.attributed_at)
    const bucketKey = `${row.partner_id}::${cohortKey}`
    const existing = cohortBuckets.get(bucketKey)
    if (existing) {
      existing.userIds.add(row.signup_user_id)
      continue
    }

    cohortBuckets.set(bucketKey, {
      partnerId: row.partner_id,
      partnerName,
      cohortKey,
      userIds: new Set([row.signup_user_id]),
    })
  }

  const cohorts: CohortRecord[] = []
  for (const bucket of cohortBuckets.values()) {
    const userIds = Array.from(bucket.userIds)
    const userSet = new Set(userIds)
    const rosterSize = userSet.size

    const intakeComplete = userIds.filter((userId) => args.activeUsers.has(userId)).length
    const prepReady = userIds.filter((userId) => args.prepUsers.has(userId)).length
    const firstOutreach = userIds.filter((userId) => args.outreachUsers.has(userId)).length
    const followupClosure = userIds.filter((userId) => args.closedFollowupUsers.has(userId)).length

    const milestones = [
      {
        id: 'intake_complete' as const,
        label: 'Intake complete',
        completedUsers: intakeComplete,
        completionRate: toPercent(intakeComplete, rosterSize),
      },
      {
        id: 'prep_ready' as const,
        label: 'Prep ready',
        completedUsers: prepReady,
        completionRate: toPercent(prepReady, rosterSize),
      },
      {
        id: 'first_outreach' as const,
        label: 'First outreach sent',
        completedUsers: firstOutreach,
        completionRate: toPercent(firstOutreach, rosterSize),
      },
      {
        id: 'followup_closure' as const,
        label: 'Follow-up closure',
        completedUsers: followupClosure,
        completionRate: toPercent(followupClosure, rosterSize),
      },
    ]

    const milestoneCompletionRate = toPercent(
      milestones.reduce((sum, row) => sum + row.completionRate, 0),
      milestones.length * 100,
    )
    const cadenceAdherenceRate = toPercent(intakeComplete + prepReady + firstOutreach, rosterSize * 3)

    const status = milestoneCompletionRate >= 70
      ? 'on_track'
      : milestoneCompletionRate >= 45
        ? 'needs_attention'
        : 'at_risk'

    cohorts.push({
      cohortId: `${bucket.partnerId}-${bucket.cohortKey}`,
      partnerId: bucket.partnerId,
      partnerName: bucket.partnerName,
      cohortKey: bucket.cohortKey,
      program: inferOutplacementProgram(bucket.partnerName),
      rosterUserIds: userIds,
      rosterSize,
      milestones,
      sponsorSnapshot: {
        status,
        fields: {
          roster_size: rosterSize,
          active_seats: intakeComplete,
          milestone_completion_rate: milestoneCompletionRate,
          utilization_rate: toPercent(intakeComplete, rosterSize),
          cadence_adherence_rate: cadenceAdherenceRate,
        },
      },
    })
  }

  return cohorts.sort((a, b) => {
    if (a.cohortKey === b.cohortKey) return a.partnerName.localeCompare(b.partnerName)
    return a.cohortKey < b.cohortKey ? 1 : -1
  })
}
