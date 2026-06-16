/**
 * what-matters-scoring.ts
 *
 * Sprint ITS-3: Weighted "what matters" scoring engine.
 *
 * AC:
 * - Weighted criteria with user-defined custom factors
 * - Hard constraint gates that disqualify before weighted scoring
 * - Fit score, risk score, and tradeoff notes per target/offer
 * - Criteria adjustable over time
 */

// ─── Default criteria ────────────────────────────────────────────

export interface WhatMattersCriterion {
  id: string
  label: string
  weight: number         // 1–10 user-assigned importance
  isHardConstraint: boolean  // if true, must-meet or target is disqualified
  constraintDescription?: string  // only used when isHardConstraint = true
  isCustom: boolean      // true for user-defined factors
}

export const DEFAULT_CRITERIA: WhatMattersCriterion[] = [
  { id: 'location',        label: 'Location / geography',             weight: 7, isHardConstraint: false, isCustom: false },
  { id: 'family_impact',   label: 'Family and household impact',       weight: 8, isHardConstraint: false, isCustom: false },
  { id: 'base_comp',       label: 'Base compensation',                 weight: 8, isHardConstraint: false, isCustom: false },
  { id: 'total_comp',      label: 'Total compensation (equity/bonus)', weight: 9, isHardConstraint: false, isCustom: false },
  { id: 'industry_fit',    label: 'Industry and sector fit',           weight: 6, isHardConstraint: false, isCustom: false },
  { id: 'brand_impact',    label: 'Brand impact on career narrative',  weight: 7, isHardConstraint: false, isCustom: false },
  { id: 'lifestyle',       label: 'Lifestyle fit (pace, culture)',     weight: 6, isHardConstraint: false, isCustom: false },
  { id: 'timing',          label: 'Timing and transition readiness',   weight: 5, isHardConstraint: false, isCustom: false },
  { id: 'scope',           label: 'Role scope and real authority',     weight: 8, isHardConstraint: false, isCustom: false },
  { id: 'mandate_quality', label: 'Mandate clarity and quality',      weight: 9, isHardConstraint: false, isCustom: false },
  { id: 'values_fit',      label: 'CEO/board values alignment',        weight: 8, isHardConstraint: false, isCustom: false },
]

// ─── Scoring types ───────────────────────────────────────────────

export interface CriterionScore {
  criterionId: string
  score: number   // 1–10 how well this target/offer meets this criterion
  notes?: string
}

export interface TargetEvaluation {
  targetId: string
  targetName: string
  criterionScores: CriterionScore[]
  hardConstraintFails: string[]   // ids of failed hard constraints
  tradeoffNotes?: string
  preInterviewThoughts?: string
  postInterviewThoughts?: string
  perceivedFitDelta?: number      // -5 to +5 change in perceived fit after interview
  confidenceDelta?: number        // -5 to +5 change in confidence after interview
  objectionNotes?: string
  overallRank?: number            // overall rank vs other targets (1 = top)
  criterionRanks?: Record<string, number>  // rank per criterion vs other targets
}

export interface WhatMattersProfile {
  userId: string
  criteria: WhatMattersCriterion[]
  evaluations: TargetEvaluation[]
  lastUpdatedAt: string
}

// ─── Scoring engine ──────────────────────────────────────────────

export interface ScoringResult {
  targetId: string
  targetName: string
  isDisqualified: boolean
  disqualificationReasons: string[]
  weightedFitScore: number    // 0–100
  weightedRiskScore: number   // 0–100 (higher = riskier)
  criterionBreakdown: Array<{
    criterionId: string
    label: string
    weight: number
    score: number
    weightedContribution: number
    isHardConstraint: boolean
    passed: boolean
  }>
  tradeoffNotes?: string
}

export function scoreTarget(
  evaluation: TargetEvaluation,
  criteria: WhatMattersCriterion[],
): ScoringResult {
  const criterionMap = new Map(criteria.map((c) => [c.id, c]))
  const scoreMap = new Map(evaluation.criterionScores.map((s) => [s.criterionId, s]))

  const disqualificationReasons: string[] = []

  // Step 1: Check hard constraints
  for (const criterion of criteria) {
    if (!criterion.isHardConstraint) continue
    const score = scoreMap.get(criterion.id)
    if (!score || score.score < 5) {
      disqualificationReasons.push(
        criterion.constraintDescription ?? `Does not meet hard constraint: ${criterion.label}`,
      )
    }
  }

  if (disqualificationReasons.length > 0) {
    return {
      targetId: evaluation.targetId,
      targetName: evaluation.targetName,
      isDisqualified: true,
      disqualificationReasons,
      weightedFitScore: 0,
      weightedRiskScore: 100,
      criterionBreakdown: [],
      tradeoffNotes: evaluation.tradeoffNotes,
    }
  }

  // Step 2: Weighted scoring
  let totalWeight = 0
  let weightedFitSum = 0
  let weightedRiskSum = 0

  const breakdown = criteria.map((criterion) => {
    const score = scoreMap.get(criterion.id)?.score ?? 5
    const weight = criterion.weight
    const weightedContribution = (score / 10) * weight

    totalWeight += weight
    weightedFitSum += weightedContribution
    weightedRiskSum += ((10 - score) / 10) * weight

    return {
      criterionId: criterion.id,
      label: criterion.label,
      weight,
      score,
      weightedContribution: Math.round(weightedContribution * 10) / 10,
      isHardConstraint: criterion.isHardConstraint,
      passed: true,
    }
  })

  const weightedFitScore = totalWeight > 0
    ? Math.round((weightedFitSum / totalWeight) * 100)
    : 0
  const weightedRiskScore = totalWeight > 0
    ? Math.round((weightedRiskSum / totalWeight) * 100)
    : 0

  return {
    targetId: evaluation.targetId,
    targetName: evaluation.targetName,
    isDisqualified: false,
    disqualificationReasons: [],
    weightedFitScore,
    weightedRiskScore,
    criterionBreakdown: breakdown,
    tradeoffNotes: evaluation.tradeoffNotes,
  }
}

export function rankTargets(
  evaluations: TargetEvaluation[],
  criteria: WhatMattersCriterion[],
): Array<ScoringResult & { overallRank: number }> {
  const scored = evaluations
    .map((e) => scoreTarget(e, criteria))
    .sort((a, b) => {
      // Disqualified always last
      if (a.isDisqualified && !b.isDisqualified) return 1
      if (!a.isDisqualified && b.isDisqualified) return -1
      return b.weightedFitScore - a.weightedFitScore
    })

  return scored.map((result, index) => ({
    ...result,
    overallRank: index + 1,
  }))
}
