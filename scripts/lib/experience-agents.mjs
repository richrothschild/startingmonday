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
]
