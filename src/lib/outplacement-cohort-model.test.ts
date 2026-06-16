import { describe, expect, it } from 'vitest'
import { buildCohortModel } from './outplacement-cohort-model'

describe('outplacement cohort model', () => {
  it('applies tenant default program overrides', () => {
    const cohorts = buildCohortModel({
      partners: [{ id: 'p_1', name: 'Acme Partners' }],
      attributions: [{ partner_id: 'p_1', signup_user_id: 'u_1', attributed_at: '2026-06-03T10:00:00.000Z' }],
      activeUsers: new Set(['u_1']),
      prepUsers: new Set(['u_1']),
      outreachUsers: new Set(['u_1']),
      closedFollowupUsers: new Set(),
      defaultProgramByPartnerId: new Map([['p_1', 'outplacement_enterprise']]),
    })

    expect(cohorts).toHaveLength(1)
    expect(cohorts[0].program).toBe('outplacement_enterprise')
  })

  it('prefixes cohort labels when a naming prefix is configured', () => {
    const cohorts = buildCohortModel({
      partners: [{ id: 'p_1', name: 'Acme Partners' }],
      attributions: [{ partner_id: 'p_1', signup_user_id: 'u_1', attributed_at: '2026-06-03T10:00:00.000Z' }],
      activeUsers: new Set(),
      prepUsers: new Set(),
      outreachUsers: new Set(),
      closedFollowupUsers: new Set(),
      cohortNamingPrefixByPartnerId: new Map([['p_1', 'NTG']]),
    })

    expect(cohorts).toHaveLength(1)
    expect(cohorts[0].cohortKey.startsWith('NTG-')).toBe(true)
  })
})
