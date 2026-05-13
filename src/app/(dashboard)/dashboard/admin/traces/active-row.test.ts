import { describe, expect, it } from 'vitest'
import { resolveNextActiveRowId } from './active-row'

describe('resolveNextActiveRowId', () => {
  const traces = [
    { id: 'a' },
    { id: 'b' },
    { id: 'c' },
  ]

  it('keeps active row when removed row is not active', () => {
    const next = resolveNextActiveRowId(traces, 'b', 'a')
    expect(next).toBe('a')
  })

  it('moves to next row when active row is removed from middle', () => {
    const next = resolveNextActiveRowId(traces, 'b', 'b')
    expect(next).toBe('c')
  })

  it('moves to previous row when active row is removed from end', () => {
    const next = resolveNextActiveRowId(traces, 'c', 'c')
    expect(next).toBe('b')
  })

  it('returns null when last row is removed', () => {
    const next = resolveNextActiveRowId([{ id: 'solo' }], 'solo', 'solo')
    expect(next).toBeNull()
  })

  it('falls back to first remaining row when removed row is missing', () => {
    const next = resolveNextActiveRowId(traces, 'missing', 'missing')
    expect(next).toBe('a')
  })
})