import { describe, it, expect } from 'vitest'
import {
  inferRoleFamilyFromTitle,
  isLeadershipTitle,
  roleFamilyForRoleType,
  LABEL_LOOKBACK_DAYS,
  OPENING_DEDUP_WINDOW_DAYS,
} from './outcome-labels.js'

describe('inferRoleFamilyFromTitle', () => {
  it('classifies technical leadership titles', () => {
    expect(inferRoleFamilyFromTitle('Chief Information Security Officer')).toBe('technical_leadership')
    expect(inferRoleFamilyFromTitle('VP of Engineering')).toBe('technical_leadership')
    expect(inferRoleFamilyFromTitle('Chief Data Officer')).toBe('technical_leadership')
    expect(inferRoleFamilyFromTitle('CTO')).toBe('technical_leadership')
  })

  it('classifies delivery leadership titles', () => {
    expect(inferRoleFamilyFromTitle('Senior Technical Program Manager (TPM)')).toBe('delivery_leadership')
    expect(inferRoleFamilyFromTitle('VP Program Management')).toBe('delivery_leadership')
  })

  it('defaults to leadership for general executive roles', () => {
    expect(inferRoleFamilyFromTitle('Chief Operating Officer')).toBe('leadership')
    expect(inferRoleFamilyFromTitle('VP of Sales')).toBe('leadership')
    expect(inferRoleFamilyFromTitle('')).toBe('leadership')
    expect(inferRoleFamilyFromTitle(null)).toBe('leadership')
  })
})

describe('isLeadershipTitle', () => {
  it('accepts leadership-level titles', () => {
    expect(isLeadershipTitle('VP of Engineering')).toBe(true)
    expect(isLeadershipTitle('Chief Financial Officer')).toBe(true)
    expect(isLeadershipTitle('Director of Security')).toBe(true)
    expect(isLeadershipTitle('Head of Data')).toBe(true)
  })

  it('rejects individual-contributor titles', () => {
    expect(isLeadershipTitle('Senior Software Engineer')).toBe(false)
    expect(isLeadershipTitle('Data Analyst')).toBe(false)
    expect(isLeadershipTitle('')).toBe(false)
  })
})

describe('roleFamilyForRoleType', () => {
  it('maps technical role types', () => {
    expect(roleFamilyForRoleType('cio')).toBe('technical_leadership')
    expect(roleFamilyForRoleType('ciso')).toBe('technical_leadership')
    expect(roleFamilyForRoleType('cdo_data')).toBe('technical_leadership')
  })

  it('maps general leadership types and unknowns', () => {
    expect(roleFamilyForRoleType('coo')).toBe('leadership')
    expect(roleFamilyForRoleType('cpo')).toBe('leadership')
    expect(roleFamilyForRoleType(null)).toBe('leadership')
    expect(roleFamilyForRoleType('unknown_type')).toBe('leadership')
  })
})

describe('label window constants', () => {
  it('uses the plan-specified windows', () => {
    expect(LABEL_LOOKBACK_DAYS).toBe(180)
    expect(OPENING_DEDUP_WINDOW_DAYS).toBe(14)
  })
})
