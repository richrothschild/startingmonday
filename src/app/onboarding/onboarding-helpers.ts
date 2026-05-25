export type SearchPersona = 'csuite' | 'vp' | 'director' | 'board'

const SUGGESTIONS_BY_PERSONA: Record<SearchPersona, string[]> = {
  csuite: ['Microsoft', 'Salesforce', 'ServiceNow', 'Oracle', 'Workday'],
  vp: ['Stripe', 'Snowflake', 'Databricks', 'Figma', 'Anthropic'],
  director: ['HubSpot', 'Okta', 'Crowdstrike', 'MongoDB', 'Datadog'],
  board: ['KKR', 'Blackstone', 'General Atlantic', 'Vista Equity', 'Thoma Bravo'],
}

export function seededCompaniesFor(persona: SearchPersona | ''): string[] {
  const picks = SUGGESTIONS_BY_PERSONA[persona || 'csuite'] ?? []
  return picks.slice(0, 3)
}

export function suggestionsForPersona(persona: SearchPersona | ''): string[] {
  return SUGGESTIONS_BY_PERSONA[persona || 'csuite'] ?? []
}
