import { describe, expect, it } from 'vitest'
import { PMF_EVENTS, isPMFEventName } from '@/lib/pmf-event-taxonomy'

describe('pmf event taxonomy', () => {
  it('exposes unique event names across categories', () => {
    const names = Object.values(PMF_EVENTS).flatMap((group) => Object.values(group))
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })

  it('validates known event names', () => {
    expect(isPMFEventName(PMF_EVENTS.prep.prep_brief_generated)).toBe(true)
    expect(isPMFEventName(PMF_EVENTS.activation.first_prep_generated)).toBe(true)
    expect(isPMFEventName('prep_brief_generated')).toBe(false)
  })
})
