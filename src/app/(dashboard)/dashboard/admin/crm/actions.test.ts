import { describe, expect, it } from 'vitest'
import * as actions from './actions'

describe('admin crm actions module', () => {
  it('exports runLeadScoringNow', () => {
    expect(typeof actions.runLeadScoringNow).toBe('function')
  })
})