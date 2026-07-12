export const trustWorkflows = [
  {
    id: 'trust-integrity-agent.yml',
    name: 'Trust Integrity Agent',
    maxAgeMinutes: 60 * 30,
    recommendation: 'Resolve parity/title/landmark contract failures before certifying dashboard trust posture.',
  },
  {
    id: 'trust-escalation-agent.yml',
    name: 'Trust Escalation Agent',
    maxAgeMinutes: 60 * 2,
    recommendation: 'Route trust violations to owning teams quickly and escalate P0 findings within the SLA window.',
  },
  {
    id: 'trust-weekly-issues-report.yml',
    name: 'Trust Weekly Issues Report',
    maxAgeMinutes: 60 * 24 * 8,
    recommendation: 'Review trust issue clusters and convert repeated failures into owned remediation actions.',
  },
  {
    id: 'trust-monthly-trends-report.yml',
    name: 'Trust Monthly Trends Report',
    maxAgeMinutes: 60 * 24 * 40,
    recommendation: 'Use monthly trust trend deltas to tighten contracts and prevent trust drift normalization.',
  },
]
