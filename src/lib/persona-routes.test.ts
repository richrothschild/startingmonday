import { describe, expect, it } from 'vitest'
import {
  COACH_PERSONAS,
  EXECUTIVE_PERSONAS,
  OUTPLACEMENT_PERSONAS,
  SEARCH_FIRM_PERSONAS,
} from './persona-routes'

function assertUniqueSlugs(items: ReadonlyArray<{ slug: string }>) {
  const seen = new Set<string>()
  for (const item of items) {
    expect(item.slug.length).toBeGreaterThan(0)
    expect(seen.has(item.slug)).toBe(false)
    seen.add(item.slug)
  }
}

describe('persona route registry', () => {
  it('uses unique slugs in every persona collection', () => {
    assertUniqueSlugs(EXECUTIVE_PERSONAS)
    assertUniqueSlugs(COACH_PERSONAS)
    assertUniqueSlugs(OUTPLACEMENT_PERSONAS)
    assertUniqueSlugs(SEARCH_FIRM_PERSONAS)
  })

  it('keeps all destinations on first-party paths', () => {
    const all = [
      ...EXECUTIVE_PERSONAS,
      ...COACH_PERSONAS,
      ...OUTPLACEMENT_PERSONAS,
      ...SEARCH_FIRM_PERSONAS,
    ]

    for (const persona of all) {
      expect(persona.destination.startsWith('/')).toBe(true)
      expect(persona.destination.startsWith('http')).toBe(false)
    }
  })

  it('includes search-affiliate coach persona route', () => {
    const searchAffiliate = COACH_PERSONAS.find((persona) => persona.slug === 'search-affiliate-transition-coach')
    expect(searchAffiliate).toBeTruthy()
    expect(searchAffiliate?.destination).toBe('/for-coaches/search-affiliate')
  })
})
