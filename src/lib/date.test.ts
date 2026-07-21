import { describe, expect, it } from 'vitest'
import { greetingForHour } from './date'

describe('greetingForHour', () => {
  it('returns "Good morning" from midnight through 11:59', () => {
    expect(greetingForHour(0)).toBe('Good morning')
    expect(greetingForHour(6)).toBe('Good morning')
    expect(greetingForHour(11)).toBe('Good morning')
  })

  it('returns "Good afternoon" from 12:00 through 16:59', () => {
    expect(greetingForHour(12)).toBe('Good afternoon')
    expect(greetingForHour(14)).toBe('Good afternoon')
    expect(greetingForHour(16)).toBe('Good afternoon')
  })

  it('returns "Good evening" from 17:00 onward', () => {
    expect(greetingForHour(17)).toBe('Good evening')
    expect(greetingForHour(21)).toBe('Good evening')
    expect(greetingForHour(23)).toBe('Good evening')
  })

  it('normalizes an out-of-range 24 (midnight edge from hour12:false) to morning', () => {
    expect(greetingForHour(24)).toBe('Good morning')
  })
})
