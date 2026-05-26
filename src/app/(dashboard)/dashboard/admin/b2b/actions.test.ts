import { describe, expect, it } from 'vitest'
import * as actions from './actions'

describe('admin b2b actions module', () => {
  it('exports action handlers', () => {
    expect(typeof actions.createProspect).toBe('function')
    expect(typeof actions.updateProspectStage).toBe('function')
    expect(typeof actions.archiveProspect).toBe('function')
  })
})