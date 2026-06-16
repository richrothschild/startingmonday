/**
 * executive-lifecycle.ts
 *
 * Sprint ITS-3: Executive lifecycle types, state definitions,
 * persona variants, and lifecycle template anchors.
 *
 * AC: Persona variants are first-class - in-role optionality,
 * active transition, post-landing, board-track.
 */

// ─── Lifecycle States ───────────────────────────────────────────

export type ExecutiveLifecycleState =
  | 'optionality'      // In-role, quiet monitoring, low-visibility
  | 'active_search'    // Full campaign mode, high urgency
  | 'post_landing'     // Accepted offer, onboarding 30/60/90
  | 'board_track'      // Long-horizon governance and board pursuit

export const LIFECYCLE_STATE_LABELS: Record<ExecutiveLifecycleState, string> = {
  optionality:   'Optionality Mode',
  active_search: 'Active Search',
  post_landing:  'Post-Landing',
  board_track:   'Board Track',
}

export const LIFECYCLE_STATE_DESCRIPTIONS: Record<ExecutiveLifecycleState, string> = {
  optionality:
    'You are employed and monitoring the market quietly. Confidentiality is the priority. ' +
    'The goal is to stay ready without signaling departure.',
  active_search:
    'You are in a focused search. Urgency is high. The goal is quality conversations, ' +
    'not just activity volume.',
  post_landing:
    'You have accepted an offer. The goal is a strong first 90 days, early wins, and ' +
    'maintaining long-horizon optionality.',
  board_track:
    'You are pursuing board seats or governance roles over a multi-quarter horizon. ' +
    'Relationship continuity and narrative consistency are the main levers.',
}

// ─── Persona Variants ───────────────────────────────────────────

export type ExecutivePersonaVariant =
  | 'in_role_quiet'       // Confidential, low-visibility optionality
  | 'active_transitioning' // Post-separation or open-search executive
  | 'post_landing_new'    // Just started new role, first-quarter focus
  | 'board_governance'    // Long-horizon board and governance track

export const PERSONA_VARIANT_LABELS: Record<ExecutivePersonaVariant, string> = {
  in_role_quiet:       'In-Role (Quiet Search)',
  active_transitioning: 'Active Transition',
  post_landing_new:    'Post-Landing (New Role)',
  board_governance:    'Board & Governance Track',
}

// ─── Lifecycle Template Anchors ─────────────────────────────────

export interface LifecycleTemplate {
  state: ExecutiveLifecycleState
  persona: ExecutivePersonaVariant
  weeklyFocus: string[]
  sessionOpeningPrompts: string[]
  confidentialityNotes?: string
  positioningGuidance?: string
}

export const LIFECYCLE_TEMPLATES: LifecycleTemplate[] = [
  {
    state: 'optionality',
    persona: 'in_role_quiet',
    weeklyFocus: [
      'Monitor 3-5 target companies for mandate changes or leadership shifts',
      'Warm one tier-1 relationship without job-search framing',
      'Keep narrative thesis current - refresh positioning summary quarterly',
      'Review accomplishment log - capture one recent win',
    ],
    sessionOpeningPrompts: [
      'What shifted in your market this week that is worth knowing about?',
      'Is there a relationship you should warm before urgency arrives?',
      'Has your narrative thesis stayed current with your current role progress?',
    ],
    confidentialityNotes:
      'Do not update LinkedIn with search-adjacent language. ' +
      'Avoid "open to opportunities" signals. ' +
      'Keep target company research on-platform only.',
    positioningGuidance:
      'Tune profile to reflect scope expansion in current role. ' +
      'Use "open to conversations about board and advisory roles" if applicable - this is search-neutral language.',
  },
  {
    state: 'active_search',
    persona: 'active_transitioning',
    weeklyFocus: [
      'Run weekly priority stack: top 5 target companies, top 10 relationships, top 2 narrative risks',
      'Rehearse interview arcs by stakeholder (CEO, board, CHRO, peer)',
      'Tighten decision filters - decline mandates that fail must-have gates',
      'Review and resolve all overdue actions from last session',
    ],
    sessionOpeningPrompts: [
      'What is the one strategic decision you need to make this session?',
      'Which company or conversation moved since last time?',
      'Is there any narrative inconsistency showing up across audiences?',
    ],
    positioningGuidance:
      'Update LinkedIn with clear current-level positioning. ' +
      'Lead with mandate language, not titles. ' +
      'Personal brand should communicate "what I fix" not "what I was".',
  },
  {
    state: 'post_landing',
    persona: 'post_landing_new',
    weeklyFocus: [
      'Execute 30/60/90 day stakeholder introduction plan',
      'Capture early wins as proof points - record the specific outcomes',
      'Build stakeholder trust map - who are the key people, what do they need to see from you?',
      'Maintain one high-value external relationship per week - keep optionality warm',
    ],
    sessionOpeningPrompts: [
      'What early win can you capture and articulate clearly this week?',
      'Who in your stakeholder map needs more attention?',
      'How is your onboarding narrative landing - are you being perceived as intended?',
    ],
    positioningGuidance:
      'Shift LinkedIn to reflect the new role with clear mandate framing. ' +
      'Avoid oversharing early challenges publicly. ' +
      'Keep accomplishment log active - this will be your proof base for the next transition.',
  },
  {
    state: 'board_track',
    persona: 'board_governance',
    weeklyFocus: [
      'Review board composition at 2-3 target companies for inflection signals',
      'Maintain cadence with 2-3 director-level relationships per month',
      'Sharpen governance thesis - what committee fits best, what unique value do you bring?',
      'Document one governance credential or insight this quarter',
    ],
    sessionOpeningPrompts: [
      'Which board-track relationship needs a touchpoint this week?',
      'Is there a governance signal at a target company worth exploring?',
      'Has your board value narrative evolved since last session?',
    ],
    positioningGuidance:
      'Add "Board experience" or "Advisory" language to profile if applicable. ' +
      'Publish governance-adjacent thought leadership quarterly. ' +
      'Position as "operator who governs" not "operator looking for a board seat".',
  },
]
