import { ApolloEnrichmentProvider } from './apollo-provider'
import type { EnrichmentContext, EnrichmentProvider, SuggestedPerson } from './types'

class NoopEnrichmentProvider implements EnrichmentProvider {
  readonly providerName = 'none' as const

  async enrichPeople(_context: EnrichmentContext): Promise<SuggestedPerson[]> {
    return []
  }
}

export function getEnrichmentProvider(): EnrichmentProvider {
  const enabled = process.env.APOLLO_ENRICHMENT_ENABLED === 'true'
  if (enabled) return new ApolloEnrichmentProvider()
  return new NoopEnrichmentProvider()
}

export * from './types'
