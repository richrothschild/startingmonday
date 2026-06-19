import { describe, expect, it } from 'vitest'
import { aggregate, toCsv } from '../../scripts/export-relationship-kpi-chain.mjs'
import { parseArgs } from '../../scripts/cleanup-relationship-kpi-chain-seed.mjs'

describe('relationship kpi script semantics', () => {
  it('returns null closeProbabilityProxy when user has interviews but no recommendations/actions', () => {
    const report = aggregate({
      recommendations: [],
      relationshipActions: [],
      partnerInterviews: [],
      companyInterviews: [{ id: 'i1', user_id: 'u1', created_at: '2026-06-19T00:00:00.000Z' }],
      sinceIso: '2026-05-20T00:00:00.000Z',
    }, 30)

    expect(report.userBreakdown).toHaveLength(1)
    expect(report.userBreakdown[0].userId).toBe('u1')
    expect(report.userBreakdown[0].closeProbabilityProxy).toBeNull()
  })

  it('caps closeProbabilityProxy at 1.0 when interviews exceed denominator', () => {
    const report = aggregate({
      recommendations: [{ id: 'r1', user_id: 'u1', created_at: '2026-06-19T00:00:00.000Z' }],
      relationshipActions: [{ id: 'a1', user_id: 'u1', created_at: '2026-06-19T00:00:00.000Z', properties: { chain_stage: 'relationship_action' } }],
      partnerInterviews: [],
      companyInterviews: [
        { id: 'i1', user_id: 'u1', created_at: '2026-06-19T00:00:00.000Z' },
        { id: 'i2', user_id: 'u1', created_at: '2026-06-19T01:00:00.000Z' },
      ],
      sinceIso: '2026-05-20T00:00:00.000Z',
    }, 30)

    expect(report.userBreakdown[0].closeProbabilityProxy).toBe(1)
  })

  it('includes taxonomy counts from action_type and action_channel', () => {
    const report = aggregate({
      recommendations: [],
      relationshipActions: [
        {
          id: 'a1',
          user_id: 'u1',
          created_at: '2026-06-19T00:00:00.000Z',
          properties: {
            chain_stage: 'relationship_action',
            action_type: 'linkedin_connect',
            action_channel: 'linkedin',
          },
        },
      ],
      partnerInterviews: [],
      companyInterviews: [],
      sinceIso: '2026-05-20T00:00:00.000Z',
    }, 30)

    expect(report.action_taxonomy.action_type_breakdown.linkedin_connect).toBe(1)
    expect(report.action_taxonomy.action_channel_breakdown.linkedin).toBe(1)
  })

  it('renders null as empty cell in CSV output', () => {
    const csv = toCsv([
      {
        userId: 'u1',
        recommendationsAccepted: 0,
        relationshipActions: 0,
        interviewProgressions: 1,
        hasFullChain: false,
        closeProbabilityProxy: null,
      },
    ], [
      'userId',
      'recommendationsAccepted',
      'relationshipActions',
      'interviewProgressions',
      'hasFullChain',
      'closeProbabilityProxy',
    ])

    expect(csv).toContain('u1,0,0,1,false,')
  })
})

describe('cleanup script arg parsing', () => {
  it('uses defaults when no args provided', () => {
    const parsed = parseArgs(['node', 'script'])
    expect(parsed.tag).toBe('synthetic_kpi_chain_seed')
    expect(parsed.apply).toBe(false)
    expect(parsed.json).toBe(false)
    expect(parsed.includeLegacy).toBe(false)
  })

  it('parses include-legacy apply and tag flags', () => {
    const parsed = parseArgs([
      'node',
      'script',
      '--tag',
      'custom_tag',
      '--include-legacy',
      '--apply',
      '--json',
    ])

    expect(parsed.tag).toBe('custom_tag')
    expect(parsed.includeLegacy).toBe(true)
    expect(parsed.apply).toBe(true)
    expect(parsed.json).toBe(true)
  })
})
