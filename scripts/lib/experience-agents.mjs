export const experienceAgents = [
  {
    id: 'route-inventory-agent.yml',
    name: 'Route Inventory Agent',
    maxAgeMinutes: 60 * 30,
    recommendation: 'Regenerate inventory and reconcile newly added or removed routes before claiming full-site compliance.',
  },
  {
    id: 'experience-vitals-agent.yml',
    name: 'Experience Vitals Agent',
    maxAgeMinutes: 60 * 8,
    recommendation: 'Triage tier-level vitals budget breaches and reconcile baseline drift before regressions harden.',
  },
  {
    id: 'cognitive-load-agent.yml',
    name: 'Cognitive Load Agent',
    maxAgeMinutes: 60 * 24 * 8,
    recommendation: 'Review high-density public routes and reduce CTA competition or paragraph density before fluency regresses further.',
  },
  {
    id: 'cognitive-fluency-calibration-dispatch.yml',
    name: 'Cognitive Fluency Calibration Dispatch',
    maxAgeMinutes: 60 * 24 * 40,
    recommendation: 'Run Page Experience Auditor on the monthly worst routes packet and feed the resulting corrections back into deterministic scoring.',
  },
]
