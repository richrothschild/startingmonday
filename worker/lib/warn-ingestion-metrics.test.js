import { describe, it, expect } from 'vitest'
import { WarnIngestionMetrics } from '../lib/warn-ingestion-metrics.js'

describe('WarnIngestionMetrics', () => {
  it('tracks per-state fetch metrics', () => {
    const metrics = new WarnIngestionMetrics()

    metrics.recordStateFetch('CA', 150)
    metrics.recordStateFetch('TX', 200)

    expect(metrics.states.CA.noticesFetched).toBe(150)
    expect(metrics.states.TX.noticesFetched).toBe(200)
    expect(metrics.globalStats.noticesFetched).toBe(350)
  })

  it('flags zero-record states as anomalies', () => {
    const metrics = new WarnIngestionMetrics()

    metrics.recordStateFetch('CA', 100)
    metrics.recordStateFetch('FL', 0) // Zero records

    expect(metrics.anomalies).toContainEqual(
      expect.objectContaining({
        type: 'zero_records',
        state: 'FL',
      })
    )
  })

  it('calculates parse rate by state', () => {
    const metrics = new WarnIngestionMetrics()

    metrics.recordStateFetch('CA', 100, 10) // 10 parse errors
    const parseRate = metrics.getStateParseRate('CA')

    expect(parseRate).toBe(90.0) // 90% success
  })

  it('tracks upsert success and skip rates', () => {
    const metrics = new WarnIngestionMetrics()

    metrics.recordStateFetch('CA', 100)
    metrics.recordStateUpsert('CA', 85, 15) // 85 upserted, 15 skipped

    expect(metrics.states.CA.noticesUpserted).toBe(85)
    expect(metrics.states.CA.skipped).toBe(15)
    expect(metrics.globalStats.noticesUpserted).toBe(85)
    expect(metrics.globalStats.skippedNotices).toBe(15)
  })

  it('tracks layoff events by state', () => {
    const metrics = new WarnIngestionMetrics()

    metrics.recordLayoffEvent('CA')
    metrics.recordLayoffEvent('CA')
    metrics.recordLayoffEvent('TX')

    expect(metrics.states.CA.layoffEvents).toBe(2)
    expect(metrics.states.TX.layoffEvents).toBe(1)
    expect(metrics.globalStats.layoffEvents).toBe(3)
  })

  it('records fetch errors with anomaly flags', () => {
    const metrics = new WarnIngestionMetrics()

    metrics.recordError('CA', new Error('Connection timeout'))

    expect(metrics.anomalies).toContainEqual(
      expect.objectContaining({
        type: 'fetch_error',
        state: 'CA',
        severity: 'error',
      })
    )
    expect(metrics.globalStats.errors).toBe(1)
  })

  it('generates comprehensive summary', () => {
    const metrics = new WarnIngestionMetrics()

    metrics.recordStateFetch('CA', 100)
    metrics.recordStateFetch('TX', 0)
    metrics.recordStateUpsert('CA', 90, 10)
    metrics.recordLayoffEvent('CA')
    metrics.recordLayoffEvent('CA')

    const summary = metrics.getSummary()

    expect(summary.global.noticesFetched).toBe(100)
    expect(summary.global.noticesUpserted).toBe(90)
    expect(summary.global.layoffEvents).toBe(2)
    expect(summary.anomalyCount).toBe(1) // Zero records for TX
    expect(summary.successRate).toBe('90.0%')
  })
})
