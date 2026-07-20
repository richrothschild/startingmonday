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
})
