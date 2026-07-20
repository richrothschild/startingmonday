import { describe, expect, it } from 'vitest'
import { buildCompanyFitSummary, buildSignalTranslation } from './signal-orientation'

describe('buildSignalTranslation', () => {
  it('threads profile context into the why-it-matters line', () => {
    const result = buildSignalTranslation(
      { signal_type: 'funding', signal_summary: 'Raised $50M', outreach_angle: 'Growth window' },
      { target_titles: ['VP Engineering'], target_sectors: ['fintech'], positioning_summary: 'Scaling enterprise infrastructure' },
      { id: 'co-1', name: 'Acme' },
      'contact-1',
    )

    expect(result.whatHappened).toBe('Raised $50M')
    expect(result.whyItMatters).toContain('VP Engineering')
    expect(result.whyItMatters).toContain('fintech')
    expect(result.nextStepVerb).toBe('contact')
  })

  it('routes exec departure signals to prep', () => {
    const result = buildSignalTranslation(
      { signal_type: 'exec_departure', signal_summary: 'CIO left', outreach_angle: null },
      { role_type: 'cio' },
      { id: 'co-2', name: 'Beta' },
    )

    expect(result.nextStepVerb).toBe('prep')
    expect(result.nextStepHref).toContain('/dashboard/companies/co-2/prep')
  })

  it('routes layoffs to research', () => {
    const result = buildSignalTranslation(
      { signal_type: 'layoffs', signal_summary: 'Cut 10% of staff', outreach_angle: null },
      null,
      { id: 'co-3', name: 'Gamma' },
    )

    expect(result.nextStepVerb).toBe('research')
    expect(result.nextStepHref).toBe('/dashboard/companies/co-3')
  })

  it('routes pattern alerts to ignore', () => {
    const result = buildSignalTranslation(
      { signal_type: 'pattern_alert', signal_summary: 'Pattern: hiring wave', outreach_angle: null },
      { search_persona: 'vp' },
      { id: 'co-4', name: 'Delta' },
    )

    expect(result.nextStepVerb).toBe('ignore')
    expect(result.nextStepLabel).toBe('Ignore for now')
  })

  it('falls back to research for unknown signal types without a contact', () => {
    const result = buildSignalTranslation(
      { signal_type: 'filing_trend', signal_summary: 'New filings', outreach_angle: null },
      { positioning_summary: 'A very long positioning statement that goes well past the sixty-four character truncation threshold for nouns' },
      { id: 'co-5', name: 'Epsilon' },
    )

    expect(result.nextStepVerb).toBe('research')
    expect(result.whyItMatters).toContain('...')
  })

  it('uses sector search noun when titles are absent', () => {
    const result = buildSignalTranslation(
      { signal_type: 'funding', signal_summary: 'Raised seed', outreach_angle: null },
      { target_sectors: ['healthcare'] },
      { id: 'co-6', name: 'Zeta' },
    )

    expect(result.whyItMatters).toContain('healthcare search')
  })

  it('handles a missing profile and missing company', () => {
    const result = buildSignalTranslation(
      { signal_type: 'award', signal_summary: 'Won industry award', outreach_angle: null },
    )

    expect(result.whyItMatters).toContain('search')
    expect(result.nextStepVerb).toBe('research')
  })
})

describe('buildCompanyFitSummary', () => {
  it('creates fit, risk, and role-watch bullets from profile context', () => {
    const result = buildCompanyFitSummary(
      { id: 'co-1', name: 'Acme', sector: 'fintech', fit_score: 8, notes: 'Private notes', role_watch_description: null },
      [{ signal_type: 'funding', signal_summary: 'Raised Series B', outreach_angle: null }],
      { target_titles: ['VP Engineering'], target_sectors: ['fintech'], role_type: 'vp_technology' },
    )

    expect(result.whyThisFits.join(' ')).toContain('8/10')
    expect(result.whyThisFits.join(' ')).toContain('VP Engineering')
    expect(result.risksToVerify.join(' ')).toContain('fintech')
    expect(result.bestRolesToWatch.join(' ')).toContain('VP Engineering')
  })

  it('falls back gracefully with a sparse company and profile', () => {
    const result = buildCompanyFitSummary(
      { id: 'co-2', name: 'Beta', fit_score: null, notes: null, role_watch_description: 'Watch for platform lead roles' },
      [],
      { role_type: 'cio', search_persona: 'exec' },
    )

    expect(result.whyThisFits.join(' ')).toContain('Beta')
    expect(result.whyThisFits.join(' ')).toContain('No recent signals')
    expect(result.risksToVerify.join(' ')).toContain('Add notes')
    expect(result.bestRolesToWatch).toContain('Watch for platform lead roles')
    expect(result.bestRolesToWatch.join(' ')).toContain('Cio')
  })
})
