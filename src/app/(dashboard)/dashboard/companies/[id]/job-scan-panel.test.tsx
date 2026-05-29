import { describe, expect, it } from 'vitest'
import { JobScanPanel } from './job-scan-panel'

describe('job scan panel module', () => {
  it('exports JobScanPanel', () => {
    expect(typeof JobScanPanel).toBe('function')
  })
})