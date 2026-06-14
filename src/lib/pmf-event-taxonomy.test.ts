import { describe, expect, it } from 'vitest'
import {
  PMF_EVENT_DEFINITIONS,
  PMF_EVENTS,
  isPMFEventName,
} from '@/lib/pmf-event-taxonomy'

describe('pmf event taxonomy', () => {
  it('exposes unique event names across categories', () => {
    const names = Object.values(PMF_EVENTS).flatMap((group) => Object.values(group))
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })

  it('validates known event names', () => {
    expect(isPMFEventName(PMF_EVENTS.prep.prep_brief_generated)).toBe(true)
    expect(isPMFEventName(PMF_EVENTS.prep.prep_brief_reviewed)).toBe(true)
    expect(isPMFEventName(PMF_EVENTS.activation.first_prep_generated)).toBe(true)
    expect(isPMFEventName('prep_brief_generated')).toBe(false)
  })

  it('has owner, schema, and KPI mapping for every canonical PMF event', () => {
    const names = Object.values(PMF_EVENTS).flatMap((group) => Object.values(group))
    expect(Object.keys(PMF_EVENT_DEFINITIONS).length).toBe(names.length)

    for (const name of names) {
      const definition = PMF_EVENT_DEFINITIONS[name]
      expect(definition).toBeTruthy()
      expect(definition.owner.length).toBeGreaterThan(0)
      expect(definition.kpi.length).toBeGreaterThan(0)
      expect(definition.schema.required.length).toBeGreaterThan(0)
      expect(Array.isArray(definition.schema.optional)).toBe(true)
      expect(definition.description.length).toBeGreaterThan(0)
    }
  })
})
