import { describe, it, expect } from 'vitest'
import { laplaceRate, median, aggregatePrecursorStats } from './precursor-stats-core.js'
import { diffOfficerSnapshots } from '../signals/fetch-sec-officers.js'

describe('laplaceRate', () => {
  it('smooths extremes away from 0 and 1', () => {
    expect(laplaceRate(0, 10)).toBeCloseTo(1 / 12)
    expect(laplaceRate(10, 10)).toBeCloseTo(11 / 12)
    expect(laplaceRate(0, 0)).toBeCloseTo(0.5)
  })
})

describe('median', () => {
  it('computes odd and even medians', () => {
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 3, 2])).toBe(2.5)
    expect(median([])).toBeNull()
    expect(median(null)).toBeNull()
  })
})

describe('aggregatePrecursorStats', () => {
  const events = [
    { id: 'e1', event_type: 'exec_departure', sector: 'fintech' },
    { id: 'e2', event_type: 'exec_departure', sector: 'fintech' },
    { id: 'e3', event_type: 'exec_departure', sector: 'healthcare' },
    { id: 'e4', event_type: 'funding', sector: 'fintech' },
  ]
  const labels = new Map([
    ['e1', [{ days_to_opening: 30, role_family: 'technical_leadership' }]],
    ['e3', [{ days_to_opening: 60, role_family: 'leadership' }]],
  ])

  it('computes overall per-type rates with Laplace smoothing', () => {
    const rows = aggregatePrecursorStats(events, labels)
    const overall = rows.find(r => r.event_type === 'exec_departure' && r.sector === null && r.role_family === null)
    expect(overall.n_events).toBe(3)
    expect(overall.n_preceded).toBe(2)
    expect(overall.hit_rate).toBeCloseTo(3 / 5, 3)
    expect(overall.median_days_to_opening).toBe(45)
  })

  it('computes sector-dimension rates', () => {
    const rows = aggregatePrecursorStats(events, labels)
    const fintech = rows.find(r => r.event_type === 'exec_departure' && r.sector === 'fintech')
    expect(fintech.n_events).toBe(2)
    expect(fintech.n_preceded).toBe(1)
  })

  it('computes role-family rates with type-wide denominators', () => {
    const rows = aggregatePrecursorStats(events, labels)
    const tech = rows.find(r => r.event_type === 'exec_departure' && r.role_family === 'technical_leadership')
    expect(tech.n_events).toBe(3)
    expect(tech.n_preceded).toBe(1)
  })

  it('handles events with no labels at all', () => {
    const rows = aggregatePrecursorStats(events, new Map())
    const funding = rows.find(r => r.event_type === 'funding' && r.sector === null && r.role_family === null)
    expect(funding.n_preceded).toBe(0)
    expect(funding.hit_rate).toBeGreaterThan(0) // Laplace floor
    expect(funding.median_days_to_opening).toBeNull()
  })
})

describe('diffOfficerSnapshots', () => {
  const previous = [
    { name: 'Jane Smith', title: 'Chief Financial Officer' },
    { name: 'Robert Chen', title: 'Chief Technology Officer' },
  ]

  it('detects appointments (in latest, not in previous)', () => {
    const latest = [
      { name: 'Jane Smith', title: 'Chief Financial Officer' },
      { name: 'Maria Lopez', title: 'Chief Information Officer' },
    ]
    const appointments = diffOfficerSnapshots(previous, latest)
    expect(appointments).toHaveLength(1)
    expect(appointments[0].name).toBe('Maria Lopez')
  })

  it('is insensitive to punctuation and case in names', () => {
    const latest = [{ name: 'JANE SMITH, PH.D.', title: 'CFO' }]
    expect(diffOfficerSnapshots(previous, latest)).toHaveLength(0)
  })

  it('handles empty snapshots', () => {
    expect(diffOfficerSnapshots([], [{ name: 'New Exec', title: 'COO' }])).toHaveLength(1)
    expect(diffOfficerSnapshots(previous, [])).toHaveLength(0)
  })
})
