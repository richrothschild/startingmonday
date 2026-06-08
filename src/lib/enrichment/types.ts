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
}

export interface EnrichmentProvider {
  readonly providerName: 'apollo' | 'none'
  enrichPeople(context: EnrichmentContext): Promise<SuggestedPerson[]>
}
