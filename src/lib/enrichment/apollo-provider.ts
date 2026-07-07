import type { EnrichmentContext, EnrichmentProvider, SuggestedPerson } from './types'

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0.5
  return Math.min(0.99, Math.max(0.2, value))
}

export class ApolloEnrichmentProvider implements EnrichmentProvider {
  readonly providerName = 'apollo' as const

  async enrichPeople(context: EnrichmentContext): Promise<SuggestedPerson[]> {
    const apiKey = process.env.APOLLO_API_KEY
    if (!apiKey) return []

    // Apollo API usage is intentionally resilient: if request shape changes or fails,
    // discovery continues with model-derived suggestions.
    try {
      const response = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': apiKey,
        },
        body: JSON.stringify({
          q_organization_name: context.companyName,
          person_titles: context.persona === 'board'
            ? ['Board Member', 'Advisor', 'Independent Director']
            : ['Chief Executive Officer', 'Chief Operating Officer', 'Chief Human Resources Officer', 'Chief Information Officer'],
          page: 1,
          per_page: 3,
        }),
      })

      if (!response.ok) return []

      // The people search API (api_search) returns first name + an obfuscated last name
      // only. Full name, email, and LinkedIn require a separate People Enrichment
      // (people/match) call that consumes Apollo credits, so discovery intentionally
      // stops at name + title here and defers reveal to the outreach step.
      const data = await response.json() as {
        people?: Array<{
          first_name?: string
          last_name_obfuscated?: string
          title?: string
          organization?: { name?: string }
          seniority?: string
        }>
      }

      const people = Array.isArray(data.people) ? data.people : []
      return people
        .filter((person) => person.first_name && person.title)
        .slice(0, 3)
        .map((person, index) => {
          const lastInitial = person.last_name_obfuscated
            ? ` ${person.last_name_obfuscated.charAt(0)}.`
            : ''
          return {
            name: `${person.first_name}${lastInitial}`,
            title: person.title as string,
            reason: `Apollo-verified ${person.seniority ?? 'senior'} contact at ${context.companyName}; full details revealed at outreach.`,
            source: 'apollo' as const,
            confidence: clampConfidence(0.82 - index * 0.07),
          }
        })
    } catch {
      return []
    }
  }
}
