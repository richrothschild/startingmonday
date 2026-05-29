import { describe, expect, it } from 'vitest'
import * as actions from './actions'

describe('company detail actions module', () => {
  it('exports actions', () => {
    expect(typeof actions.updateCompany).toBe('function')
    expect(typeof actions.archiveCompany).toBe('function')
    expect(typeof actions.addFollowUp).toBe('function')
    expect(typeof actions.addContact).toBe('function')
    expect(typeof actions.archiveContact).toBe('function')
    expect(typeof actions.markFollowUpDone).toBe('function')
    expect(typeof actions.addDocument).toBe('function')
    expect(typeof actions.addInterviewLog).toBe('function')
    expect(typeof actions.deleteInterviewLog).toBe('function')
    expect(typeof actions.removeDocument).toBe('function')
  })
})