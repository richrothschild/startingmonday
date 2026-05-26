import { describe, expect, it } from 'vitest'
import * as actions from './actions'

describe('admin team actions module', () => {
  it('exports team action handlers', () => {
    expect(typeof actions.addTeamMember).toBe('function')
    expect(typeof actions.changeTeamRole).toBe('function')
    expect(typeof actions.removeTeamMember).toBe('function')
  })
})