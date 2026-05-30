export type ProgramTemplatePackId = 'executive_transition' | 'board_track' | 'restructuring'

export type ProgramTemplateSection = {
  id: string
  title: string
  required: boolean
}

export type ProgramTemplateDefinition = {
  template_id: string
  name: string
  program_type: string
  version: number
  sections: ProgramTemplateSection[]
  milestones: string[]
  session_cadence: string
  sponsor_summary_fields: string[]
  defaults: Record<string, string | number | boolean>
}

export const REQUIRED_TEMPLATE_SECTION_IDS = ['overview', 'milestones', 'cadence', 'sponsor_summary']

export const TEMPLATE_PACK_LIBRARY: Record<ProgramTemplatePackId, Omit<ProgramTemplateDefinition, 'template_id' | 'version'>> = {
  executive_transition: {
    name: 'Executive Transition Pack',
    program_type: 'outplacement_executive_transition',
    sections: [
      { id: 'overview', title: 'Program Overview', required: true },
      { id: 'milestones', title: 'Milestone Ladder', required: true },
      { id: 'cadence', title: 'Session Cadence', required: true },
      { id: 'sponsor_summary', title: 'Sponsor Summary', required: true },
      { id: 'role_narrative', title: 'Role Narrative', required: false },
    ],
    milestones: ['intake_complete', 'positioning_ready', 'pipeline_live', 'offer_ready'],
    session_cadence: 'weekly',
    sponsor_summary_fields: ['roster_size', 'milestone_completion_rate', 'active_search_rate'],
    defaults: { coach_touchpoints_per_month: 4, include_board_readiness: false },
  },
  board_track: {
    name: 'Board-Track Pack',
    program_type: 'outplacement_board_track',
    sections: [
      { id: 'overview', title: 'Program Overview', required: true },
      { id: 'milestones', title: 'Milestone Ladder', required: true },
      { id: 'cadence', title: 'Session Cadence', required: true },
      { id: 'sponsor_summary', title: 'Sponsor Summary', required: true },
      { id: 'board_strategy', title: 'Board Strategy', required: true },
    ],
    milestones: ['board_targeting', 'board_storyline', 'board_network_activation', 'board_shortlist'],
    session_cadence: 'biweekly',
    sponsor_summary_fields: ['roster_size', 'board_pipeline_rate', 'board_intro_count'],
    defaults: { coach_touchpoints_per_month: 2, include_board_readiness: true },
  },
  restructuring: {
    name: 'Restructuring Pack',
    program_type: 'outplacement_restructuring',
    sections: [
      { id: 'overview', title: 'Program Overview', required: true },
      { id: 'milestones', title: 'Milestone Ladder', required: true },
      { id: 'cadence', title: 'Session Cadence', required: true },
      { id: 'sponsor_summary', title: 'Sponsor Summary', required: true },
      { id: 'communications', title: 'Communications Plan', required: true },
    ],
    milestones: ['risk_triage', 'transition_plan', 'placement_pipeline', 'closure_review'],
    session_cadence: 'weekly',
    sponsor_summary_fields: ['roster_size', 'risk_resolution_rate', 'placement_rate'],
    defaults: { coach_touchpoints_per_month: 6, include_board_readiness: false },
  },
}

export function templateHasRequiredSections(sections: ProgramTemplateSection[]): boolean {
  const ids = new Set(sections.map((section) => section.id))
  return REQUIRED_TEMPLATE_SECTION_IDS.every((requiredId) => ids.has(requiredId))
}

export function createTemplateFromPack(packId: ProgramTemplatePackId): ProgramTemplateDefinition {
  const pack = TEMPLATE_PACK_LIBRARY[packId]
  return {
    template_id: `tpl_${packId}`,
    version: 1,
    name: pack.name,
    program_type: pack.program_type,
    sections: pack.sections,
    milestones: pack.milestones,
    session_cadence: pack.session_cadence,
    sponsor_summary_fields: pack.sponsor_summary_fields,
    defaults: pack.defaults,
  }
}
