import { describe, expect, it } from 'vitest'
import * as actions from './actions'

describe('admin b2b detail actions module', () => {
  it('exports action handlers', () => {
    expect(typeof actions.addContact).toBe('function')
    expect(typeof actions.logActivity).toBe('function')
    expect(typeof actions.updateProspect).toBe('function')
    expect(typeof actions.saveMaterial).toBe('function')
    expect(typeof actions.deleteMaterial).toBe('function')
  })
})