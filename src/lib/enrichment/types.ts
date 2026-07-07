export type SuggestedPerson = {
  name: string
  title: string
  reason: string
  source: 'anthropic' | 'apollo' | 'fallback'
  confidence: number
}

export type CompanyCandidate = {
  name: string
  sector: string
  why: string
  fit: number
  keySignals: string[]
  keyAttributes: string[]
  suggestedPeople: SuggestedPerson[]
}

export type EnrichmentContext = {
  companyName: string
  sector: string
  persona?: string
  // Optional company domain. When present, the Apollo provider resolves the exact
  // organization id from it before searching people, avoiding wrong-company matches
  // on colliding names. Discovery candidates are model-generated and usually have no
  // domain, so the provider falls back to name search in that case.
  domain?: string
}

export interface EnrichmentProvider {
  readonly providerName: 'apollo' | 'none'
  enrichPeople(context: EnrichmentContext): Promise<SuggestedPerson[]>
}
