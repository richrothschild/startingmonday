import { describe, expect, it } from 'vitest'
import { buildReliabilitySnapshot } from './reliability-metrics'

describe('reliability-metrics', () => {
  it('computes high confidence with healthy outcomes', () => {
    const snapshot = buildReliabilitySnapshot({
      now: new Date('2026-05-26T12:10:00.000Z'),
      windowDays: 14,
      jobs: [
        { created_at: '2026-05-26T10:00:00.000Z', state: 'delivered', domain_bucket: 'corporate', attempt_count: 1, accepted_at: '2026-05-26T10:02:00.000Z', locked_at: null, next_attempt_at: null },
        { created_at: '2026-05-26T12:00:00.000Z', state: 'accepted', domain_bucket: 'gmail', attempt_count: 1, accepted_at: '2026-05-26T12:05:00.000Z', locked_at: null, next_attempt_at: null },
        { created_at: '2026-05-26T12:00:00.000Z', state: 'replied', domain_bucket: 'corporate', attempt_count: 1, accepted_at: '2026-05-26T12:03:00.000Z', locked_at: null, next_attempt_at: null },
      ],
    })

    expect(snapshot.confidence.score).toBeGreaterThanOrEqual(90)
    expect(snapshot.confidence.band).toBe('high')
    expect(snapshot.alerts.length).toBe(0)
    expect(snapshot.totals.acceptedRatePct).toBe(100)
  })

  it('raises critical alerts for stale queue and poor outcomes', () => {
    const snapshot = buildReliabilitySnapshot({
      now: new Date('2026-05-27T12:00:00.000Z'),
      windowDays: 14,
      jobs: [
        { created_at: '2026-05-27T09:00:00.000Z', state: 'queued', domain_bucket: 'corporate', attempt_count: 1, accepted_at: null, locked_at: null, next_attempt_at: '2026-05-27T09:05:00.000Z' },
        { created_at: '2026-05-27T08:00:00.000Z', state: 'sending', domain_bucket: 'corporate', attempt_count: 1, accepted_at: null, locked_at: '2026-05-27T08:10:00.000Z', next_attempt_at: null },
        { created_at: '2026-05-27T07:00:00.000Z', state: 'accepted', domain_bucket: 'gmail', attempt_count: 2, accepted_at: '2026-05-27T07:05:00.000Z', locked_at: null, next_attempt_at: null },
        { created_at: '2026-05-27T06:00:00.000Z', state: 'failed', domain_bucket: 'corporate', attempt_count: 3, accepted_at: null, locked_at: null, next_attempt_at: null },
        { created_at: '2026-05-27T05:00:00.000Z', state: 'bounced', domain_bucket: 'microsoft', attempt_count: 1, accepted_at: null, locked_at: null, next_attempt_at: null },
      ],
      thresholds: {
        minAcceptedRatePct: 95,
        maxNegativeOutcomeRatePct: 10,
        maxHardFailureRatePct: 5,
        maxQueueStaleMinutes: 20,
        maxSendingLockMinutes: 15,
        maxWebhookLagMinutes: 45,
        maxRetryRatePct: 5,
      },
    })

    const codes = snapshot.alerts.map(a => a.code)
    expect(codes).toContain('accepted_rate_below_floor')
    expect(codes).toContain('negative_outcomes_high')
    expect(codes).toContain('queued_stale_jobs')
    expect(codes).toContain('sending_stale_jobs')
    expect(codes).toContain('webhook_lag')
    expect(snapshot.confidence.band).toBe('low')
  })
})
