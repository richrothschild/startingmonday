import { describe, expect, it } from 'vitest'
import * as actions from './actions'

describe('briefing actions module', () => {
  it('exports logBriefingAction', () => {
    expect(typeof actions.logBriefingAction).toBe('function')
  })
})