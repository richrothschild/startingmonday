import { z } from 'zod'

export const SearchPersonaSchema = z.enum(['csuite', 'vp', 'director', 'board'])
export type SearchPersona = z.infer<typeof SearchPersonaSchema>

export const ExecutiveRoleSegmentSchema = z.enum([
  'CEO_PRESIDENT',
  'COO_GM_BU',
  'CFO',
  'CHRO_HR',
  'CIO_CTO_TECH',
  'CMO_CRO_COMMERCIAL',
  'PR_COMMS_FUNDRAISING',
  'BOARD_ADVISOR',
])
export type ExecutiveRoleSegment = z.infer<typeof ExecutiveRoleSegmentSchema>

export const ExecutiveTransitionTypeSchema = z.enum([
  'VOLUNTARY_GROWTH',
  'FORCED_EXIT',
  'INDUSTRY_PIVOT',
  'FUNCTIONAL_PIVOT',
  'GEOGRAPHY_PIVOT',
  'REENTRY_AFTER_BREAK',
])
export type ExecutiveTransitionType = z.infer<typeof ExecutiveTransitionTypeSchema>

export const ExecutiveSearchStageSchema = z.enum([
  'IDENTITY_RESET',
  'TARGET_SELECTION',
  'NARRATIVE_DEVELOPMENT',
  'MARKET_ACTIVATION',
  'PROCESS_NAVIGATION',
  'OFFER_DECISION',
  'FIRST_90_DAY_SETUP',
])
export type ExecutiveSearchStage = z.infer<typeof ExecutiveSearchStageSchema>

export const ExecutiveSearchModeSchema = z.enum([
  'PASSIVE',
  'SEMI_ACTIVE',
  'ACTIVE',
  'IN_PROCESS',
  'DECIDING',
  'TRANSITIONING_IN',
])
export type ExecutiveSearchMode = z.infer<typeof ExecutiveSearchModeSchema>

export const ExecutiveNetworkStrengthSchema = z.enum(['WEAK', 'MODERATE', 'STRONG', 'SPONSOR_DENSE'])
export type ExecutiveNetworkStrength = z.infer<typeof ExecutiveNetworkStrengthSchema>

export const ExecutiveUrgencyLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'IMMEDIATE'])
export type ExecutiveUrgencyLevel = z.infer<typeof ExecutiveUrgencyLevelSchema>

export const ExecutiveBoardVisibilitySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
export type ExecutiveBoardVisibility = z.infer<typeof ExecutiveBoardVisibilitySchema>

export const ExecutiveGeographyConstraintSchema = z.enum([
  'NONE',
  'PREFERRED_REGION',
  'LIMITED_REGIONS',
  'SINGLE_REGION',
  'RELOCATION_BLOCKED',
])
export type ExecutiveGeographyConstraint = z.infer<typeof ExecutiveGeographyConstraintSchema>

export const ExecutiveFamilyConstraintSchema = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
export type ExecutiveFamilyConstraint = z.infer<typeof ExecutiveFamilyConstraintSchema>

export const ExecutiveConfidenceTierSchema = z.enum(['TIER_A', 'TIER_B', 'TIER_C'])
export type ExecutiveConfidenceTier = z.infer<typeof ExecutiveConfidenceTierSchema>

export const ExecutiveJobSearchIntakeSchema = z.object({
  full_name: z.string().trim().min(2).default(''),
  search_persona: SearchPersonaSchema,
  current_title: z.string().trim().default(''),
  current_company: z.string().trim().default(''),
  positioning_summary: z.string().trim().default(''),
  resume_text: z.string().trim().default(''),
  beyond_resume: z.string().trim().default(''),
  target_titles: z.array(z.string().trim().min(1)).default([]),
  company_names: z.array(z.string().trim().min(1)).default([]),
  employment_status: z.string().trim().default(''),
  search_timeline: z.string().trim().default(''),
  search_driver: z.string().trim().default(''),
  role_segment: ExecutiveRoleSegmentSchema.nullable().optional().default(null),
  transition_type: ExecutiveTransitionTypeSchema.nullable().optional().default(null),
  search_stage: ExecutiveSearchStageSchema.nullable().optional().default(null),
  search_mode: ExecutiveSearchModeSchema.nullable().optional().default(null),
  network_strength: ExecutiveNetworkStrengthSchema.nullable().optional().default(null),
  urgency_level: ExecutiveUrgencyLevelSchema.nullable().optional().default(null),
  board_visibility: ExecutiveBoardVisibilitySchema.nullable().optional().default(null),
  geography_constraint: ExecutiveGeographyConstraintSchema.nullable().optional().default(null),
  family_constraint: ExecutiveFamilyConstraintSchema.nullable().optional().default(null),
  confidence_tier: ExecutiveConfidenceTierSchema.nullable().optional().default(null),
})

export type ExecutiveJobSearchIntake = z.infer<typeof ExecutiveJobSearchIntakeSchema>

export type ExecutiveSearchDimensionScores = {
  segmentFit: number
  narrativeClarity: number
  opportunityDiscipline: number
  outreachActivation: number
  processNavigation: number
  decisionQuality: number
  resilience: number
  transitionReadiness: number
}

export type ExecutiveSearchScore = {
  totalScore: number
  band: 'exceptional' | 'strong' | 'moderate' | 'fragile' | 'high-risk'
  dimensionScores: ExecutiveSearchDimensionScores
  recommendedInterventionKey:
    | 'ROLE_REFRAMING_SPRINT'
    | 'FOUR_CS_DECISION_WORKSHEET'
    | 'NETWORK_ACTIVATION_BURST'
    | 'REJECTION_RECOVERY_PROTOCOL'
    | 'PROOF_POINT_COMPRESSION'
    | 'BOARD_SPONSOR_MAP'
    | 'TIMING_AND_CONTEXT_CHECK'
    | 'FIRST_90_DAY_DESIGN'
    | 'SEARCH_RHYTHM_CONTRACT'
    | 'CHANNEL_MIX_REVIEW'
  evidenceNotes: string[]
}

const SEARCH_PERSONA_ROLE_MATCH: Record<SearchPersona, ExecutiveRoleSegment[]> = {
  csuite: ['CEO_PRESIDENT', 'COO_GM_BU', 'CFO', 'CHRO_HR', 'CIO_CTO_TECH', 'CMO_CRO_COMMERCIAL', 'PR_COMMS_FUNDRAISING'],
  vp: ['COO_GM_BU', 'CIO_CTO_TECH', 'CMO_CRO_COMMERCIAL', 'CHRO_HR', 'PR_COMMS_FUNDRAISING'],
  director: ['COO_GM_BU', 'CIO_CTO_TECH', 'CMO_CRO_COMMERCIAL', 'CHRO_HR'],
  board: ['BOARD_ADVISOR', 'CEO_PRESIDENT', 'PR_COMMS_FUNDRAISING'],
}

function normalizeList(items: string[]): string[] {
  return items.map((item) => item.trim()).filter(Boolean)
}

function inferRoleSegment(intake: ExecutiveJobSearchIntake): ExecutiveRoleSegment {
  if (intake.role_segment) return intake.role_segment

  const title = `${intake.current_title} ${intake.search_driver}`.toLowerCase()
  if (/(chief executive|ceo|president)/.test(title)) return 'CEO_PRESIDENT'
  if (/(chief operating officer|coo|general manager|general mgr|business unit|bu leader)/.test(title)) return 'COO_GM_BU'
  if (/(chief financial officer|cfo|finance)/.test(title)) return 'CFO'
  if (/(chief people officer|chro|human resources|hr)/.test(title)) return 'CHRO_HR'
  if (/(chief information officer|cio|chief technology officer|cto|technology|it leader)/.test(title)) return 'CIO_CTO_TECH'
  if (/(chief marketing officer|cmo|chief revenue officer|cro|commercial|sales)/.test(title)) return 'CMO_CRO_COMMERCIAL'
  if (/(communications|public relations|fundraising|development)/.test(title)) return 'PR_COMMS_FUNDRAISING'
  if (intake.search_persona === 'board') return 'BOARD_ADVISOR'
  if (intake.search_persona === 'vp') return 'COO_GM_BU'
  if (intake.search_persona === 'director') return 'COO_GM_BU'
  return 'CEO_PRESIDENT'
}

function inferTransitionType(intake: ExecutiveJobSearchIntake): ExecutiveTransitionType {
  if (intake.transition_type) return intake.transition_type

  const driver = intake.search_driver.toLowerCase()
  if (/(layoff|terminated|fired|eliminated|restructur|exit)/.test(driver)) return 'FORCED_EXIT'
  if (/(board|advisor|director)/.test(driver) && intake.search_persona === 'board') return 'REENTRY_AFTER_BREAK'
  if (/(country|location|relocate|move|geo)/.test(driver)) return 'GEOGRAPHY_PIVOT'
  if (/(product|function|domain|specialty)/.test(driver)) return 'FUNCTIONAL_PIVOT'
  if (/(industry|sector|market)/.test(driver)) return 'INDUSTRY_PIVOT'
  if (intake.employment_status === 'employed_exploring') return 'VOLUNTARY_GROWTH'
  return 'VOLUNTARY_GROWTH'
}

function inferSearchStage(intake: ExecutiveJobSearchIntake): ExecutiveSearchStage {
  if (intake.search_stage) return intake.search_stage

  if (!intake.positioning_summary.trim() && !intake.resume_text.trim()) return 'IDENTITY_RESET'
  if (normalizeList(intake.target_titles).length === 0 && normalizeList(intake.company_names).length === 0) return 'TARGET_SELECTION'
  if (intake.positioning_summary.trim() && !normalizeList(intake.company_names).length) return 'NARRATIVE_DEVELOPMENT'
  if (normalizeList(intake.company_names).length > 0 && !intake.board_visibility) return 'MARKET_ACTIVATION'
  if (intake.board_visibility || intake.network_strength) return 'PROCESS_NAVIGATION'
  if (intake.search_persona === 'board') return 'OFFER_DECISION'
  return 'TARGET_SELECTION'
}

function inferSearchMode(intake: ExecutiveJobSearchIntake): ExecutiveSearchMode {
  if (intake.search_mode) return intake.search_mode
  if (intake.employment_status === 'between_roles') return 'TRANSITIONING_IN'
  if (intake.employment_status === 'employed_exploring') return 'PASSIVE'
  if (intake.search_timeline === 'immediately') return 'ACTIVE'
  if (intake.search_timeline === 'opportunistic') return 'PASSIVE'
  return 'ACTIVE'
}

function inferNetworkStrength(intake: ExecutiveJobSearchIntake): ExecutiveNetworkStrength {
  if (intake.network_strength) return intake.network_strength
  if (intake.search_persona === 'board') return 'SPONSOR_DENSE'
  if (normalizeList(intake.company_names).length >= 4) return 'STRONG'
  if (normalizeList(intake.target_titles).length >= 3) return 'MODERATE'
  return 'WEAK'
}

function inferUrgencyLevel(intake: ExecutiveJobSearchIntake): ExecutiveUrgencyLevel {
  if (intake.urgency_level) return intake.urgency_level
  if (intake.employment_status === 'between_roles') return 'IMMEDIATE'
  if (intake.search_timeline === 'immediately') return 'HIGH'
  if (intake.search_timeline === 'opportunistic') return 'LOW'
  return 'MEDIUM'
}

function inferBoardVisibility(intake: ExecutiveJobSearchIntake): ExecutiveBoardVisibility {
  if (intake.board_visibility) return intake.board_visibility
  if (intake.search_persona === 'board') return 'CRITICAL'
  if (/(chief executive|ceo|president)/.test(`${intake.current_title} ${intake.search_driver}`.toLowerCase())) return 'HIGH'
  if (intake.search_persona === 'csuite' && intake.current_title.trim()) return 'HIGH'
  return 'MEDIUM'
}

function inferGeographyConstraint(intake: ExecutiveJobSearchIntake): ExecutiveGeographyConstraint {
  if (intake.geography_constraint) return intake.geography_constraint
  const text = `${intake.search_driver} ${intake.current_company}`.toLowerCase()
  if (/(relocate|relo|move)/.test(text)) return 'LIMITED_REGIONS'
  if (/(remote only|remote)/.test(text)) return 'PREFERRED_REGION'
  return 'NONE'
}

function inferFamilyConstraint(intake: ExecutiveJobSearchIntake): ExecutiveFamilyConstraint {
  if (intake.family_constraint) return intake.family_constraint
  const text = intake.search_driver.toLowerCase()
  if (/(family|spouse|partner|caregiv|children|school)/.test(text)) return 'MEDIUM'
  return 'NONE'
}

function scoreDimensionFromMatch(match: boolean, partial: boolean): number {
  if (match) return 5
  if (partial) return 4
  return 3
}

function scoreSegmentFit(intake: ExecutiveJobSearchIntake, roleSegment: ExecutiveRoleSegment): number {
  const matches = SEARCH_PERSONA_ROLE_MATCH[intake.search_persona].includes(roleSegment)
  const explicit = !!intake.role_segment
  const titleSignals = /chief|c-level|vice president|svp|board/.test(`${intake.current_title} ${intake.search_driver}`.toLowerCase())
  if (matches && (explicit || titleSignals)) return 5
  if (matches) return 4
  return scoreDimensionFromMatch(explicit, titleSignals)
}

function scoreNarrativeClarity(intake: ExecutiveJobSearchIntake): number {
  const summaryLen = intake.positioning_summary.trim().length
  const resumeLen = intake.resume_text.trim().length
  const hasSummary = summaryLen >= 60
  const hasResume = resumeLen >= 100
  const hasDriver = intake.search_driver.trim().length >= 15
  if (hasSummary && hasResume && hasDriver) return 5
  if ((hasSummary && hasDriver) || (hasResume && hasDriver)) return 4
  if (hasSummary || hasResume || hasDriver) return 3
  return 2
}

function scoreOpportunityDiscipline(intake: ExecutiveJobSearchIntake): number {
  const titleCount = normalizeList(intake.target_titles).length
  const companyCount = normalizeList(intake.company_names).length
  if (titleCount >= 3 && companyCount >= 3) return 5
  if (titleCount >= 2 || companyCount >= 2) return 4
  if (titleCount >= 1 || companyCount >= 1) return 3
  return 2
}

function scoreOutreachActivation(networkStrength: ExecutiveNetworkStrength): number {
  if (networkStrength === 'SPONSOR_DENSE') return 5
  if (networkStrength === 'STRONG') return 4
  if (networkStrength === 'MODERATE') return 3
  return 2
}

function scoreProcessNavigation(boardVisibility: ExecutiveBoardVisibility, roleSegment: ExecutiveRoleSegment): number {
  if (boardVisibility === 'CRITICAL' && roleSegment === 'CEO_PRESIDENT') return 5
  if (boardVisibility === 'HIGH' && (roleSegment === 'CEO_PRESIDENT' || roleSegment === 'BOARD_ADVISOR')) return 5
  if (boardVisibility === 'HIGH' || boardVisibility === 'CRITICAL') return 4
  if (boardVisibility === 'MEDIUM') return 3
  return 2
}

function scoreDecisionQuality(intake: ExecutiveJobSearchIntake, urgencyLevel: ExecutiveUrgencyLevel, geographyConstraint: ExecutiveGeographyConstraint, familyConstraint: ExecutiveFamilyConstraint): number {
  const contextualized = intake.search_stage || intake.transition_type || geographyConstraint !== 'NONE' || familyConstraint !== 'NONE'
  if (urgencyLevel === 'LOW' && contextualized) return 5
  if (contextualized && urgencyLevel !== 'IMMEDIATE') return 4
  if (contextualized) return 3
  return 2
}

function scoreResilience(intake: ExecutiveJobSearchIntake, transitionType: ExecutiveTransitionType): number {
  const stable = intake.search_mode === 'ACTIVE' || intake.search_mode === 'PASSIVE' || intake.search_mode === 'TRANSITIONING_IN'
  if (transitionType === 'VOLUNTARY_GROWTH' && stable) return 5
  if (transitionType === 'FORCED_EXIT' || transitionType === 'REENTRY_AFTER_BREAK') return 3
  if (transitionType === 'INDUSTRY_PIVOT' || transitionType === 'FUNCTIONAL_PIVOT') return 4
  return 4
}

function scoreTransitionReadiness(intake: ExecutiveJobSearchIntake, stage: ExecutiveSearchStage): number {
  const companies = normalizeList(intake.company_names).length
  const titles = normalizeList(intake.target_titles).length
  if (stage === 'FIRST_90_DAY_SETUP') return 5
  if (stage === 'OFFER_DECISION' && companies >= 2 && titles >= 2) return 5
  if ((stage === 'PROCESS_NAVIGATION' || stage === 'MARKET_ACTIVATION') && companies >= 2) return 4
  if (companies >= 1 || titles >= 1) return 3
  return 2
}

function weightedTotal(scores: ExecutiveSearchDimensionScores): number {
  const weights: Record<keyof ExecutiveSearchDimensionScores, number> = {
    segmentFit: 15,
    narrativeClarity: 15,
    opportunityDiscipline: 10,
    outreachActivation: 10,
    processNavigation: 15,
    decisionQuality: 15,
    resilience: 10,
    transitionReadiness: 10,
  }

  const total = Object.entries(scores).reduce((sum, [key, value]) => {
    const scoreKey = key as keyof ExecutiveSearchDimensionScores
    return sum + value * weights[scoreKey]
  }, 0)

  return Math.round(total / 5)
}

function bandForScore(totalScore: number): ExecutiveSearchScore['band'] {
  if (totalScore >= 80) return 'exceptional'
  if (totalScore >= 70) return 'strong'
  if (totalScore >= 55) return 'moderate'
  if (totalScore >= 40) return 'fragile'
  return 'high-risk'
}

function interventionForLowestDimension(scores: ExecutiveSearchDimensionScores): ExecutiveSearchScore['recommendedInterventionKey'] {
  const entries = Object.entries(scores) as [keyof ExecutiveSearchDimensionScores, number][]
  entries.sort((a, b) => a[1] - b[1])
  const lowest = entries[0]?.[0] ?? 'narrativeClarity'

  if (lowest === 'outreachActivation') return 'NETWORK_ACTIVATION_BURST'
  if (lowest === 'decisionQuality') return 'FOUR_CS_DECISION_WORKSHEET'
  if (lowest === 'processNavigation') return 'BOARD_SPONSOR_MAP'
  if (lowest === 'resilience') return 'REJECTION_RECOVERY_PROTOCOL'
  if (lowest === 'transitionReadiness') return 'FIRST_90_DAY_DESIGN'
  if (lowest === 'opportunityDiscipline') return 'CHANNEL_MIX_REVIEW'
  if (lowest === 'segmentFit') return 'ROLE_REFRAMING_SPRINT'
  return 'PROOF_POINT_COMPRESSION'
}

export function normalizeExecutiveJobSearchIntake(input: ExecutiveJobSearchIntake): ExecutiveJobSearchIntake {
  const normalizedTargetTitles = normalizeList(input.target_titles)
  const normalizedCompanies = normalizeList(input.company_names)
  return {
    ...input,
    target_titles: normalizedTargetTitles,
    company_names: normalizedCompanies,
    role_segment: input.role_segment ?? inferRoleSegment(input),
    transition_type: input.transition_type ?? inferTransitionType(input),
    search_stage: input.search_stage ?? inferSearchStage(input),
    search_mode: input.search_mode ?? inferSearchMode(input),
    network_strength: input.network_strength ?? inferNetworkStrength(input),
    urgency_level: input.urgency_level ?? inferUrgencyLevel(input),
    board_visibility: input.board_visibility ?? inferBoardVisibility(input),
    geography_constraint: input.geography_constraint ?? inferGeographyConstraint(input),
    family_constraint: input.family_constraint ?? inferFamilyConstraint(input),
    confidence_tier: input.confidence_tier ?? 'TIER_B',
  }
}

export function buildExecutiveJobSearchScore(rawInput: ExecutiveJobSearchIntake): ExecutiveSearchScore {
  const intake = normalizeExecutiveJobSearchIntake(rawInput)
  const roleSegment = intake.role_segment as ExecutiveRoleSegment
  const transitionType = intake.transition_type as ExecutiveTransitionType
  const searchStage = intake.search_stage as ExecutiveSearchStage
  const searchMode = intake.search_mode as ExecutiveSearchMode
  const networkStrength = intake.network_strength as ExecutiveNetworkStrength
  const urgencyLevel = intake.urgency_level as ExecutiveUrgencyLevel
  const boardVisibility = intake.board_visibility as ExecutiveBoardVisibility
  const geographyConstraint = intake.geography_constraint as ExecutiveGeographyConstraint
  const familyConstraint = intake.family_constraint as ExecutiveFamilyConstraint

  const dimensionScores: ExecutiveSearchDimensionScores = {
    segmentFit: scoreSegmentFit(intake, roleSegment),
    narrativeClarity: scoreNarrativeClarity(intake),
    opportunityDiscipline: scoreOpportunityDiscipline(intake),
    outreachActivation: scoreOutreachActivation(networkStrength),
    processNavigation: scoreProcessNavigation(boardVisibility, roleSegment),
    decisionQuality: scoreDecisionQuality(intake, urgencyLevel, geographyConstraint, familyConstraint),
    resilience: scoreResilience({ ...intake, search_mode: searchMode }, transitionType),
    transitionReadiness: scoreTransitionReadiness(intake, searchStage),
  }

  const totalScore = weightedTotal(dimensionScores)
  const band = bandForScore(totalScore)
  const recommendedInterventionKey = interventionForLowestDimension(dimensionScores)

  const evidenceNotes = [
    `role_segment=${roleSegment}`,
    `transition_type=${transitionType}`,
    `search_stage=${searchStage}`,
    `search_mode=${searchMode}`,
    `network_strength=${networkStrength}`,
    `board_visibility=${boardVisibility}`,
  ]

  return {
    totalScore,
    band,
    dimensionScores,
    recommendedInterventionKey,
    evidenceNotes,
  }
}

export function formatExecutiveSearchBand(band: ExecutiveSearchScore['band']): string {
  if (band === 'exceptional') return 'Exceptional readiness'
  if (band === 'strong') return 'Strong readiness'
  if (band === 'moderate') return 'Moderate readiness'
  if (band === 'fragile') return 'Fragile readiness'
  return 'High-risk transition'
}

export function interventionLabel(key: ExecutiveSearchScore['recommendedInterventionKey']): string {
  if (key === 'ROLE_REFRAMING_SPRINT') return 'Role Reframing Sprint'
  if (key === 'FOUR_CS_DECISION_WORKSHEET') return '4Cs Decision Worksheet'
  if (key === 'NETWORK_ACTIVATION_BURST') return 'Network Activation Burst'
  if (key === 'REJECTION_RECOVERY_PROTOCOL') return 'Rejection Recovery Protocol'
  if (key === 'PROOF_POINT_COMPRESSION') return 'Proof-Point Compression'
  if (key === 'BOARD_SPONSOR_MAP') return 'Board / Sponsor Map'
  if (key === 'TIMING_AND_CONTEXT_CHECK') return 'Timing and Context Check'
  if (key === 'FIRST_90_DAY_DESIGN') return 'First-90-Day Design'
  if (key === 'SEARCH_RHYTHM_CONTRACT') return 'Search Rhythm Contract'
  return 'Channel Mix Review'
}
