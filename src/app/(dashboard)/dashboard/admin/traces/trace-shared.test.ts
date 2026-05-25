import { describe, expect, it } from 'vitest'
import {
  buildUrl,
  composeEvalNotes,
  FAILURE_CATEGORIES,
  FEATURES,
  FEATURE_LABELS,
  parseEvalNotes,
} from './trace-shared'

describe('trace shared module', () => {
  it('exports expected constants and helpers', () => {
    expect(Array.isArray(FEATURES)).toBe(true)
    expect(Object.keys(FEATURE_LABELS).length).toBeGreaterThan(0)
    expect(Array.isArray(FAILURE_CATEGORIES)).toBe(true)
    expect(typeof parseEvalNotes).toBe('function')
    expect(typeof composeEvalNotes).toBe('function')
    expect(typeof buildUrl).toBe('function')
  })
})