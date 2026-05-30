export const PMF_EVENT_VERSION = 1

export const PMF_EVENTS = {
  activation: {
    profile_completed: 'pmf_activation_profile_completed',
    first_company_added: 'pmf_activation_first_company_added',
    first_prep_generated: 'pmf_activation_first_prep_generated',
  },
  prep: {
    prep_brief_generated: 'pmf_prep_brief_generated',
    prep_brief_refined: 'pmf_prep_brief_refined',
    prep_low_confidence_seen: 'pmf_prep_low_confidence_seen',
  },
  cadence: {
    follow_up_logged: 'pmf_cadence_follow_up_logged',
    weekly_session_completed: 'pmf_cadence_weekly_session_completed',
    stale_thread_recovered: 'pmf_cadence_stale_thread_recovered',
  },
  outcomes: {
    first_interview_reached: 'pmf_outcome_first_interview_reached',
    offer_stage_reached: 'pmf_outcome_offer_stage_reached',
    role_closed: 'pmf_outcome_role_closed',
  },
} as const

export type PMFEventCategory = keyof typeof PMF_EVENTS

export type PMFEventName = {
  [Category in PMFEventCategory]: (typeof PMF_EVENTS)[Category][keyof (typeof PMF_EVENTS)[Category]]
}[PMFEventCategory]

export const PMF_EVENT_OWNERS = {
  product: 'product',
  data: 'data',
  engineering: 'engineering',
} as const

export type PMFEventOwner = (typeof PMF_EVENT_OWNERS)[keyof typeof PMF_EVENT_OWNERS]

export const PMF_KPIS = {
  activation_completion_rate: 'activation_completion_rate',
  prep_brief_usage_rate: 'prep_brief_usage_rate',
  prep_quality_remediation_rate: 'prep_quality_remediation_rate',
  cadence_adherence_rate: 'cadence_adherence_rate',
  pipeline_progression_rate: 'pipeline_progression_rate',
  interview_to_offer_conversion_rate: 'interview_to_offer_conversion_rate',
} as const

export type PMFKPI = (typeof PMF_KPIS)[keyof typeof PMF_KPIS]

type EventSchema = {
  required: readonly string[]
  optional: readonly string[]
}

export type PMFEventDefinition = {
  category: PMFEventCategory
  owner: PMFEventOwner
  kpi: PMFKPI
  schema: EventSchema
  description: string
}

const SHARED_CONTEXT_FIELDS = ['source', 'mode', 'confidence_band', 'action_context'] as const

export const PMF_EVENT_DEFINITIONS: Record<PMFEventName, PMFEventDefinition> = {
  [PMF_EVENTS.activation.profile_completed]: {
    category: 'activation',
    owner: PMF_EVENT_OWNERS.product,
    kpi: PMF_KPIS.activation_completion_rate,
    schema: {
      required: ['profile_score'],
      optional: [...SHARED_CONTEXT_FIELDS],
    },
    description: 'User reached profile quality threshold required for activation.',
  },
  [PMF_EVENTS.activation.first_company_added]: {
    category: 'activation',
    owner: PMF_EVENT_OWNERS.engineering,
    kpi: PMF_KPIS.activation_completion_rate,
    schema: {
      required: ['company_id'],
      optional: [...SHARED_CONTEXT_FIELDS],
    },
    description: 'User added first tracked company in search pipeline.',
  },
  [PMF_EVENTS.activation.first_prep_generated]: {
    category: 'activation',
    owner: PMF_EVENT_OWNERS.product,
    kpi: PMF_KPIS.activation_completion_rate,
    schema: {
      required: ['company_id'],
      optional: [...SHARED_CONTEXT_FIELDS],
    },
    description: 'User generated first prep brief, completing activation loop.',
  },
  [PMF_EVENTS.prep.prep_brief_generated]: {
    category: 'prep',
    owner: PMF_EVENT_OWNERS.product,
    kpi: PMF_KPIS.prep_brief_usage_rate,
    schema: {
      required: ['company_id', 'type'],
      optional: [...SHARED_CONTEXT_FIELDS],
    },
    description: 'Prep brief created from company context and role mode.',
  },
  [PMF_EVENTS.prep.prep_brief_refined]: {
    category: 'prep',
    owner: PMF_EVENT_OWNERS.product,
    kpi: PMF_KPIS.prep_brief_usage_rate,
    schema: {
      required: ['company_id'],
      optional: [...SHARED_CONTEXT_FIELDS],
    },
    description: 'User requested refinement of generated prep brief.',
  },
  [PMF_EVENTS.prep.prep_low_confidence_seen]: {
    category: 'prep',
    owner: PMF_EVENT_OWNERS.data,
    kpi: PMF_KPIS.prep_quality_remediation_rate,
    schema: {
      required: ['company_id', 'confidence_band'],
      optional: [...SHARED_CONTEXT_FIELDS],
    },
    description: 'Low confidence guard surfaced to user for remediation.',
  },
  [PMF_EVENTS.cadence.follow_up_logged]: {
    category: 'cadence',
    owner: PMF_EVENT_OWNERS.engineering,
    kpi: PMF_KPIS.cadence_adherence_rate,
    schema: {
      required: ['company_id'],
      optional: [...SHARED_CONTEXT_FIELDS],
    },
    description: 'Follow-up action recorded against company relationship thread.',
  },
  [PMF_EVENTS.cadence.weekly_session_completed]: {
    category: 'cadence',
    owner: PMF_EVENT_OWNERS.product,
    kpi: PMF_KPIS.cadence_adherence_rate,
    schema: {
      required: ['week_start'],
      optional: [...SHARED_CONTEXT_FIELDS],
    },
    description: 'Weekly operating session completed in app flow.',
  },
  [PMF_EVENTS.cadence.stale_thread_recovered]: {
    category: 'cadence',
    owner: PMF_EVENT_OWNERS.data,
    kpi: PMF_KPIS.cadence_adherence_rate,
    schema: {
      required: ['company_id'],
      optional: [...SHARED_CONTEXT_FIELDS],
    },
    description: 'Stale conversation thread moved back into active cadence.',
  },
  [PMF_EVENTS.outcomes.first_interview_reached]: {
    category: 'outcomes',
    owner: PMF_EVENT_OWNERS.product,
    kpi: PMF_KPIS.pipeline_progression_rate,
    schema: {
      required: ['company_id'],
      optional: [...SHARED_CONTEXT_FIELDS],
    },
    description: 'Pipeline progressed to first interview stage.',
  },
  [PMF_EVENTS.outcomes.offer_stage_reached]: {
    category: 'outcomes',
    owner: PMF_EVENT_OWNERS.product,
    kpi: PMF_KPIS.interview_to_offer_conversion_rate,
    schema: {
      required: ['company_id'],
      optional: [...SHARED_CONTEXT_FIELDS],
    },
    description: 'Pipeline progressed to offer stage.',
  },
  [PMF_EVENTS.outcomes.role_closed]: {
    category: 'outcomes',
    owner: PMF_EVENT_OWNERS.data,
    kpi: PMF_KPIS.interview_to_offer_conversion_rate,
    schema: {
      required: ['company_id', 'result'],
      optional: [...SHARED_CONTEXT_FIELDS],
    },
    description: 'Role outcome closed as won or lost.',
  },
}

export function getPMFEventDefinition(eventName: PMFEventName): PMFEventDefinition {
  return PMF_EVENT_DEFINITIONS[eventName]
}

export function isPMFEventName(value: string): value is PMFEventName {
  return Object.values(PMF_EVENTS)
    .flatMap((group) => Object.values(group))
    .includes(value as PMFEventName)
}
