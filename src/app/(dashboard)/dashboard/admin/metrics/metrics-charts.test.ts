import { describe, expect, it } from 'vitest'
import { MetricsCharts } from './metrics-charts'

describe('admin metrics charts module', () => {
  it('exports MetricsCharts', () => {
    expect(typeof MetricsCharts).toBe('function')
  })
})