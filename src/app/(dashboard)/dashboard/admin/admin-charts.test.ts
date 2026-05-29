import { describe, expect, it } from 'vitest'
import { EventVolumeChart, FunnelChart } from './admin-charts'

describe('admin charts module', () => {
  it('exports chart components', () => {
    expect(typeof FunnelChart).toBe('function')
    expect(typeof EventVolumeChart).toBe('function')
  })
})