import { createAdminClient } from '@/lib/supabase/admin'
import type { PMFEventName } from '@/lib/pmf-event-taxonomy'

export type UserEventName =
  | 'resume_uploaded'
  | 'linkedin_imported'
  | 'company_added'
  | 'prep_brief_generated'
  | 'strategy_brief_generated'
  | 'outreach_draft_generated'
  | 'contact_added'
  | 'briefing_configured'
  | 'follow_up_set'
  | 'pipeline_stage_changed'
  | 'brief_rated'
  | 'activation_complete'
  | 'offer_accepted'
  | 'onboarding_completed'
  | 'positioning_saved'
  | 'signal_outreach_generated'
  | 'signals_page_viewed'
  | 'briefing_viewed'
  | 'briefing_action_clicked'
  | 'search_paused'
  | 'search_resumed'
  | 'channel_entry_clicked'
  | 'persona_route_selected'
  | 'trust_block_viewed'
  | 'trust_block_interacted'
  | 'micro_product_boundary_viewed'
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_nudge_shown'
  | 'onboarding_low_energy_enabled'
  | 'onboarding_first_value_ready'
  | 'emi_assessment_started'
  | 'emi_assessment_completed'
  | 'emi_onboarding_started'
  | 'emi_daily_loop_loaded'
  | 'emi_action_completed'
  | 'emi_daily_reflection_submitted'
  | 'discover_recommendations_generated'
  | 'discover_run_created'
  | 'discover_recommendation_opened'
  | 'discover_recommendation_added'
  | 'discover_outreach_started'
  | PMFEventName

type EventProperties = Record<string, string | number | boolean | null>

/**
 * Log a user behavior event to the user_events table.
 * Uses the admin client (bypasses RLS) - server-side only.
 * Never throws: event logging must not break the calling flow.
 */
export async function logEvent(
  userId: string,
  eventName: UserEventName,
  properties: EventProperties = {}
): Promise<void> {
  try {
    const admin = createAdminClient()
    await admin.from('user_events').insert({
      user_id: userId,
      event_name: eventName,
      properties,
    })
  } catch {
    // Intentionally silent - analytics must not interrupt product flows
  }
}

/**
 * Log a company watch event for aggregate market intelligence.
 * Called when a user adds a company to their pipeline.
 */
export async function logCompanyWatch(
  userId: string,
  companyId: string,
  opts: {
    sector: string | null
    careerPageUrlPresent: boolean
    fitScore: number | null
    stage: string
  }
): Promise<void> {
  try {
    const admin = createAdminClient()
    await admin.from('company_watch_events').insert({
      user_id: userId,
      company_id: companyId,
      sector: opts.sector,
      career_page_url_present: opts.careerPageUrlPresent,
      fit_score: opts.fitScore,
      stage: opts.stage,
    })
  } catch {
    // Intentionally silent
  }
}

/**
 * Mark offer accepted: sets offer_accepted_at on the users row.
 * Called when a company stage changes to 'offer'.
 */
export async function markOfferAccepted(userId: string): Promise<void> {
  try {
    const admin = createAdminClient()
    await admin
      .from('users')
      .update({ offer_accepted_at: new Date().toISOString() })
      .eq('id', userId)
      .is('offer_accepted_at', null) // only set once
  } catch {
    // Intentionally silent
  }
}
