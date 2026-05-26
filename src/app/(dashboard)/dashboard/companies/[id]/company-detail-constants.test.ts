import { describe, expect, it } from 'vitest'
import {
  CHANNEL,
  CSUITE_PATTERNS,
  DOC_LABELS,
  getNextScanDate,
  NOTES_PLACEHOLDERS,
  OUTREACH_STATUS,
  SIGNAL_LABELS,
  STAGES,
} from './company-detail-constants'

describe('company detail constants module', () => {
  it('exports constants and helpers', () => {
    expect(typeof getNextScanDate).toBe('function')
    expect(Object.keys(SIGNAL_LABELS).length).toBeGreaterThan(0)
    expect(Object.keys(DOC_LABELS).length).toBeGreaterThan(0)
    expect(Object.keys(CHANNEL).length).toBeGreaterThan(0)
    expect(Object.keys(OUTREACH_STATUS).length).toBeGreaterThan(0)
    expect(Array.isArray(STAGES)).toBe(true)
    expect(Object.keys(NOTES_PLACEHOLDERS).length).toBeGreaterThan(0)
    expect(Array.isArray(CSUITE_PATTERNS)).toBe(true)
  })
})