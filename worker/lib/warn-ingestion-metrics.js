import { logger } from './logger.js'

export class WarnIngestionMetrics {
  constructor() {
    this.states = {}
    this.startTime = Date.now()
    this.globalStats = {
      noticesFetched: 0,
      noticesUpserted: 0,
      layoffEvents: 0,
      errors: 0,
      skippedNotices: 0,
    }
    this.anomalies = []
  }

  recordStateFetch(stateCode, noticeCount, parseErrors = 0) {
    if (!this.states[stateCode]) {
      this.states[stateCode] = {
        noticesFetched: 0,
        noticesUpserted: 0,
        layoffEvents: 0,
        parseErrors: 0,
        skipped: 0,
      }
    }

    this.states[stateCode].noticesFetched += noticeCount
    this.states[stateCode].parseErrors += parseErrors
    this.globalStats.noticesFetched += noticeCount

    // Flag zero-record states as anomaly
    if (noticeCount === 0) {
      this.anomalies.push({
        type: 'zero_records',
        state: stateCode,
        severity: 'warn',
        timestamp: new Date().toISOString(),
      })
    }

    return this
  }

  recordStateUpsert(stateCode, upsertedCount, skippedCount = 0) {
    if (!this.states[stateCode]) {
      this.states[stateCode] = {
        noticesFetched: 0,
        noticesUpserted: 0,
        layoffEvents: 0,
        parseErrors: 0,
        skipped: 0,
      }
    }

    this.states[stateCode].noticesUpserted += upsertedCount
    this.states[stateCode].skipped += skippedCount
    this.globalStats.noticesUpserted += upsertedCount
    this.globalStats.skippedNotices += skippedCount

    return this
  }

  recordLayoffEvent(stateCode) {
    if (!this.states[stateCode]) {
      this.states[stateCode] = {
        noticesFetched: 0,
        noticesUpserted: 0,
        layoffEvents: 0,
        parseErrors: 0,
        skipped: 0,
      }
    }

    this.states[stateCode].layoffEvents += 1
    this.globalStats.layoffEvents += 1

    return this
  }

  recordError(stateCode, error) {
    this.globalStats.errors += 1
    this.anomalies.push({
      type: 'fetch_error',
      state: stateCode,
      error: error?.message || String(error),
      severity: 'error',
      timestamp: new Date().toISOString(),
    })

    return this
  }

  getStateParseRate(stateCode) {
    const state = this.states[stateCode]
    if (!state) return null
    if (state.noticesFetched === 0) return 0
    return ((state.noticesFetched - state.parseErrors) / state.noticesFetched) * 100
  }

  getSummary() {
    const elapsedMs = Date.now() - this.startTime
    const stateBreakdown = Object.entries(this.states).map(([code, data]) => ({
      state: code,
      fetched: data.noticesFetched,
      upserted: data.noticesUpserted,
      layoffEvents: data.layoffEvents,
      parseErrors: data.parseErrors,
      parseRate: this.getStateParseRate(code).toFixed(1) + '%',
      skipRate: data.noticesFetched > 0 
        ? ((data.skipped / data.noticesFetched) * 100).toFixed(1) + '%'
        : '0%',
    }))

    return {
      duration: {
        ms: elapsedMs,
        seconds: (elapsedMs / 1000).toFixed(2),
      },
      global: this.globalStats,
      stateBreakdown,
      anomalies: this.anomalies,
      anomalyCount: this.anomalies.length,
      successRate: this.globalStats.noticesFetched > 0
        ? ((this.globalStats.noticesUpserted / this.globalStats.noticesFetched) * 100).toFixed(1) + '%'
        : '0%',
    }
  }

  logSummary() {
    const summary = this.getSummary()

    logger.info('warn-ingestion-job: ingestion complete', {
      duration: summary.duration,
      global: summary.global,
      stateCount: Object.keys(this.states).length,
      anomalyCount: summary.anomalyCount,
    })

    // Log per-state breakdown
    for (const state of summary.stateBreakdown) {
      logger.info(`warn-ingestion-job: state ${state.state}`, state)
    }

    // Log any anomalies
    if (summary.anomalies.length > 0) {
      logger.warn('warn-ingestion-job: anomalies detected', {
        count: summary.anomalyCount,
        anomalies: summary.anomalies,
      })
    }

    return summary
  }
}
