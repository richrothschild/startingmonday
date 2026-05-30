import { describe, expect, it } from 'vitest'
import {
  buildPrepClaimProvenance,
  validatePrepClaimProvenance,
  type PrepClaimProvenance,
} from '@/lib/prep-provenance'

describe('prep provenance', () => {
  it('builds provenance records with origin classes', () => {
    const brief = [
      '## Bottom Line',
      'Candidate has a verified track record of scaling platform teams.',
      '## The Situation',
      '- Recent company signals indicate governance pressure from the board.',
    ].join('\n')

    const claims = buildPrepClaimProvenance(brief)
    expect(claims.length).toBeGreaterThan(0)
    expect(claims.every((claim) => !!claim.originClass)).toBe(true)
  })

  it('blocks sensitive inferred claims', () => {
    const claims: PrepClaimProvenance[] = [
      {
        claimText: 'Compensation should be at $450K base with significant equity upside.',
        originClass: 'inferred',
        section: 'Offer',
        sensitivePolicyHooks: ['compensation_claim'],
      },
    ]

    const errors = validatePrepClaimProvenance(claims)
    expect(errors.some((e) => e.code === 'sensitive_inferred_block')).toBe(true)
  })

  it('flags invalid origin classes', () => {
    const claims = [
      {
        claimText: 'A claim without a valid origin class.',
        originClass: 'unknown_class',
        section: 'Bottom Line',
        sensitivePolicyHooks: [],
      },
    ] as unknown as PrepClaimProvenance[]

    const errors = validatePrepClaimProvenance(claims)
    expect(errors.some((e) => e.code === 'invalid_origin_class')).toBe(true)
  })
})
