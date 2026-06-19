import { describe, expect, it } from 'vitest'
import { resolveRoleProfile } from '@/lib/role-taxonomy'

describe('resolveRoleProfile', () => {
  it('maps technical program manager titles to delivery leadership', () => {
    const result = resolveRoleProfile({
      currentTitle: 'Senior Technical Program Manager',
      targetTitles: ['TPM'],
      searchPersona: 'director',
    })

    expect(result.roleFamily).toBe('delivery_leadership')
    expect(result.roleTitle).toBe('senior_tpm')
    expect(result.workflowVariant).toBe('delivery_leadership_transition')
  })

  it('maps principal titles to technical leadership', () => {
    const result = resolveRoleProfile({
      currentTitle: 'Principal Engineer',
      targetTitles: ['Principal Architect'],
      searchPersona: 'director',
    })

    expect(result.roleFamily).toBe('technical_leadership')
    expect(result.roleTitle).toBe('senior_architect')
    expect(result.searchPersonaLegacy).toBe('director')
  })

  it('honors explicit role fields when provided', () => {
    const result = resolveRoleProfile({
      roleFamily: 'leadership',
      roleTitle: 'executive',
      searchPersona: 'vp',
    })

    expect(result.roleFamily).toBe('leadership')
    expect(result.roleTitle).toBe('executive')
    expect(result.searchPersonaLegacy).toBe('csuite')
    expect(result.roleTypeLegacy).toBe('executive')
  })
})
