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

export function isPMFEventName(value: string): value is PMFEventName {
  return Object.values(PMF_EVENTS)
    .flatMap((group) => Object.values(group))
    .includes(value as PMFEventName)
}
