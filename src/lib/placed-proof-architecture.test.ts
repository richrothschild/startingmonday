import { describe, expect, it } from 'vitest'
import { getPlacedProofActions } from '@/lib/placed-proof-architecture'

describe('placed proof architecture scaffold', () => {
  it('keeps the trust-action sequence stable', () => {
    const actions = getPlacedProofActions()
    expect(actions.map((action) => action.id)).toEqual(['celebration', 'maintenance', 'peer_referral'])
  })

  it('leaves peer referral disabled as an explicit sprint placeholder', () => {
    const referral = getPlacedProofActions().find((action) => action.id === 'peer_referral')
    expect(referral).toBeDefined()
    expect(referral?.isEnabled).toBe(false)
    expect(referral?.disabledReason).toContain('Sprint 7')
  })
})