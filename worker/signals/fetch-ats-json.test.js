import { describe, it, expect } from 'vitest'
import { detectProviderFromUrl, candidateTokens } from './fetch-ats-json.js'

describe('detectProviderFromUrl', () => {
  it('detects greenhouse-hosted boards', () => {
    expect(detectProviderFromUrl('https://boards.greenhouse.io/stripe')).toEqual({
      provider: 'greenhouse',
      token: 'stripe',
    })
    expect(detectProviderFromUrl('https://job-boards.greenhouse.io/acme/jobs')).toEqual({
      provider: 'greenhouse',
      token: 'jobs',
    })
  })

  it('detects lever-hosted boards', () => {
    expect(detectProviderFromUrl('https://jobs.lever.co/netflix')).toEqual({
      provider: 'lever',
      token: 'netflix',
    })
  })

  it('detects ashby-hosted boards', () => {
    expect(detectProviderFromUrl('https://jobs.ashbyhq.com/linear')).toEqual({
      provider: 'ashby',
      token: 'linear',
    })
  })

  it('returns null for non-ATS urls', () => {
    expect(detectProviderFromUrl('https://acme.com/careers')).toBeNull()
    expect(detectProviderFromUrl('not a url')).toBeNull()
    expect(detectProviderFromUrl(null)).toBeNull()
  })
})

describe('candidateTokens', () => {
  it('prefers the domain label', () => {
    const tokens = candidateTokens({ name: 'Acme Corp', domain: 'acme.com' })
    expect(tokens[0]).toBe('acme')
  })

  it('strips corporate suffixes from names', () => {
    const tokens = candidateTokens({ name: 'Widget Works Inc.', domain: null })
    expect(tokens).toContain('widgetworks')
    expect(tokens).toContain('widget-works')
    expect(tokens.join(' ')).not.toContain('inc')
  })

  it('deduplicates and skips empty inputs', () => {
    expect(candidateTokens({ name: null, domain: null })).toEqual([])
    const tokens = candidateTokens({ name: 'Acme', domain: 'acme.io' })
    expect(new Set(tokens).size).toBe(tokens.length)
  })
})
