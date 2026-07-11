export const reliabilityWorkflows = [
  {
    id: 'production-synthetics.yml',
    name: 'Production Synthetics',
    maxAgeMinutes: 30,
    recommendation: 'Triage failing synthetic checks, quarantine flaky probes, and verify production auth/session health.',
  },
  {
    id: 'dashboard-behavior-baseline.yml',
    name: 'Dashboard Behavior Baseline Agent',
    maxAgeMinutes: 60 * 30,
    recommendation: 'Dispatch the baseline agent and validate dashboard route contracts and credentials.',
  },
  {
    id: 'monitoring.yml',
    name: 'Production Monitoring',
    maxAgeMinutes: 90,
    recommendation: 'Review production monitors and reconnect failing checks to service owners and runbooks.',
  },
  {
    id: 'monitoring-watchdog.yml',
    name: 'Monitoring Watchdog',
    maxAgeMinutes: 90,
    recommendation: 'Resolve watchdog freshness failures quickly to prevent silent monitoring outages.',
  },
  {
    id: 'deployment-watchdog.yml',
    name: 'Deployment Watchdog',
    maxAgeMinutes: 90,
    recommendation: 'Inspect deployment gate failures and verify branch-to-environment promotion health.',
  },
]
