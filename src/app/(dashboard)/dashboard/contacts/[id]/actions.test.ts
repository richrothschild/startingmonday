import { describe, expect, it } from 'vitest'
import * as actions from './actions'

describe('contact detail actions module', () => {
  it('exports actions', () => {
    expect(typeof actions.updateContact).toBe('function')
    expect(typeof actions.logOutreach).toBe('function')
    expect(typeof actions.addContactFollowUp).toBe('function')
  })
})