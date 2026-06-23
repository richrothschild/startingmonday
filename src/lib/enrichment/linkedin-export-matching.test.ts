import { describe, expect, it } from 'vitest'
import {
  LINKEDIN_MATCH_THRESHOLDS,
  buildMatchDecision,
  classifyMatchTier,
  normalizeCompanyName,
  normalizePersonName,
} from '@/lib/enrichment/linkedin-export-matching'

describe('linkedin export matching', () => {
  it('normalizes person names consistently', () => {
    expect(normalizePersonName('Dr. Jane A. Doe Jr.')).toBe('jane a doe')
    expect(normalizePersonName(' JANE DOE ')).toBe('jane doe')
  })

  it('normalizes company legal suffixes', () => {
    expect(normalizeCompanyName('The Acme Holdings, Inc.')).toBe('acme')
    expect(normalizeCompanyName('Acme LLC')).toBe('acme')
  })

  it('classifies profile url matches as high', () => {
    const result = buildMatchDecision(
      {
        fullName: 'Jane Doe',
        company: 'Acme Inc',
        profileUrl: 'https://www.linkedin.com/in/jane-doe/',
      },
      {
        fullName: 'Jane Doe',
        company: 'Acme',
        profileUrl: 'linkedin.com/in/jane-doe',
      },
    )

    expect(result.method).toBe('profile_url_exact')
    expect(result.tier).toBe('high')
  })

  it('classifies medium tier at configured boundary values', () => {
    const tier = classifyMatchTier(
      'name_company_fuzzy',
      LINKEDIN_MATCH_THRESHOLDS.medium.name,
      LINKEDIN_MATCH_THRESHOLDS.medium.company,
    )

    expect(tier).toBe('medium')
  })

  it('classifies low tier at configured boundary values', () => {
    const tier = classifyMatchTier(
      'name_company_fuzzy',
      LINKEDIN_MATCH_THRESHOLDS.low.name,
      LINKEDIN_MATCH_THRESHOLDS.low.company,
    )

    expect(tier).toBe('low')
  })

  it('rejects weak matches', () => {
    const result = buildMatchDecision(
      {
        fullName: 'Alice Johnson',
        company: 'Redwood Capital',
      },
      {
        fullName: 'Brian Foster',
        company: 'Blue Harbor Logistics',
      },
    )

    expect(result.tier).toBe('rejected')
    expect(result.overallScore).toBeLessThan(0.7)
  })
})
