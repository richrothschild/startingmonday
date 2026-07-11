export const experienceWorkflows = [
  {
    id: 'route-inventory-agent.yml',
    name: 'Route Inventory Agent',
    maxAgeMinutes: 60 * 30,
    recommendation: 'Regenerate route inventory and reconcile unexpected route additions/removals before compliance claims.',
  },
  {
    id: 'luxury-page-sentinel.yml',
    name: 'Luxury Page Sentinel',
    maxAgeMinutes: 120,
    recommendation: 'Triage blocking incidents by dimension and burn down quarantine debt before expiry.',
  },
  {
    id: 'dashboard-behavior-baseline.yml',
    name: 'Dashboard Behavior Baseline Agent',
    maxAgeMinutes: 60 * 30,
    recommendation: 'Validate dashboard contracts and probe credentials, then address route-specific regressions.',
  },
]
