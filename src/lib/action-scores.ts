export type ScoreGroup =
  | 'onboarding'
  | 'pipeline'
  | 'intelligence'
  | 'signals'
  | 'communication'
  | 'profile'

export type ActionScore = {
  label: string
  group: ScoreGroup
  // 1-10: how emotionally significant is this moment for the user
  emotion: number
  // 1-10: mental effort required (NASA-TLX simplified). Lower = better UX.
  cognitive_load: number
  // 1-10: impact on subscription renewal probability
  retention: number
}

export const ACTION_SCORES: Record<string, ActionScore> = {
  // Onboarding
  onboarding_completed:     { label: 'Onboarding completed',       group: 'onboarding',    emotion: 8, cognitive_load: 7, retention: 10 },
  activation_complete:      { label: 'Activation milestone (6)',   group: 'onboarding',    emotion: 9, cognitive_load: 1, retention: 10 },

  // Pipeline
  company_added:            { label: 'Company added',              group: 'pipeline',      emotion: 7, cognitive_load: 3, retention: 9  },
  contact_added:            { label: 'Contact added',              group: 'pipeline',      emotion: 6, cognitive_load: 3, retention: 7  },
  pipeline_stage_changed:   { label: 'Pipeline stage changed',     group: 'pipeline',      emotion: 7, cognitive_load: 2, retention: 6  },
  offer_accepted:           { label: 'Offer accepted',             group: 'pipeline',      emotion: 10, cognitive_load: 1, retention: 2 },
  follow_up_set:            { label: 'Follow-up set',              group: 'pipeline',      emotion: 4, cognitive_load: 2, retention: 6  },

  // Intelligence
  prep_brief_generated:     { label: 'Prep brief generated',       group: 'intelligence',  emotion: 9, cognitive_load: 2, retention: 10 },
  strategy_brief_generated: { label: 'Strategy brief generated',   group: 'intelligence',  emotion: 8, cognitive_load: 2, retention: 9  },
  briefing_viewed:          { label: 'Briefing viewed',            group: 'intelligence',  emotion: 6, cognitive_load: 2, retention: 8  },
  briefing_action_clicked:  { label: 'Briefing action clicked',    group: 'intelligence',  emotion: 7, cognitive_load: 2, retention: 9  },
  brief_rated:              { label: 'Brief rated (feedback)',      group: 'intelligence',  emotion: 3, cognitive_load: 1, retention: 4  },

  // Signals
  signals_page_viewed:      { label: 'Signals page viewed',        group: 'signals',       emotion: 8, cognitive_load: 3, retention: 8  },
  signal_classified:        { label: 'Signal classified (system)', group: 'signals',       emotion: 5, cognitive_load: 1, retention: 6  },
  signal_outreach_generated:{ label: 'Signal outreach generated',  group: 'signals',       emotion: 8, cognitive_load: 2, retention: 9  },

  // Communication
  outreach_draft_generated: { label: 'Outreach draft generated',   group: 'communication', emotion: 7, cognitive_load: 2, retention: 8  },

  // Profile
  resume_uploaded:          { label: 'Resume uploaded',            group: 'profile',       emotion: 5, cognitive_load: 4, retention: 8  },
  briefing_configured:      { label: 'Briefing configured',        group: 'profile',       emotion: 5, cognitive_load: 4, retention: 8  },
  positioning_saved:        { label: 'Positioning saved',          group: 'profile',       emotion: 7, cognitive_load: 6, retention: 7  },
  linkedin_imported:        { label: 'LinkedIn imported',          group: 'profile',       emotion: 6, cognitive_load: 3, retention: 7  },
}

// Higher = better interaction moment. Used for top/bottom rankings.
export function compositeScore(s: ActionScore): number {
  return s.emotion + s.retention - s.cognitive_load
}

export const GROUP_LABELS: Record<ScoreGroup, string> = {
  onboarding:    'Onboarding',
  pipeline:      'Pipeline',
  intelligence:  'Intelligence',
  signals:       'Signals',
  communication: 'Communication',
  profile:       'Profile',
}

export const GROUP_COLORS: Record<ScoreGroup, string> = {
  onboarding:    '#f97316',
  pipeline:      '#0f172a',
  intelligence:  '#3b82f6',
  signals:       '#f59e0b',
  communication: '#10b981',
  profile:       '#8b5cf6',
}
