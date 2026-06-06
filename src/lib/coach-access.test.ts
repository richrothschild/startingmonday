import { describe, expect, it } from 'vitest'
import { hasCoachWriteAccess } from '@/lib/coach-access'

describe('hasCoachWriteAccess', () => {
  it('rejects read-only level', () => {
    expect(hasCoachWriteAccess('read_only')).toBe(false)
  })

  it('allows read-write and legacy default levels', () => {
    expect(hasCoachWriteAccess('read_write')).toBe(true)
    expect(hasCoachWriteAccess(null)).toBe(true)
    expect(hasCoachWriteAccess(undefined)).toBe(true)
  })
})
