import { describe, expect, it } from 'vitest'
import { INTERNAL_APIS, PAGE_GROUPS, STEP_LABELS } from './admin-page-config'

describe('admin page config module', () => {
  it('exports config collections', () => {
    expect(Object.keys(STEP_LABELS).length).toBeGreaterThan(0)
    expect(Array.isArray(PAGE_GROUPS)).toBe(true)
    expect(Array.isArray(INTERNAL_APIS)).toBe(true)
  })
})