import { describe, expect, it } from 'vitest'
import * as actions from './actions'

describe('contacts actions module', () => {
  it('exports contacts actions', () => {
    expect(typeof actions.addContact).toBe('function')
    expect(typeof actions.markContactSent).toBe('function')
    expect(typeof actions.markContactSentForm).toBe('function')
    expect(typeof actions.updateOutreachStatus).toBe('function')
    expect(typeof actions.remindLater).toBe('function')
    expect(typeof actions.scheduleMeetingFollowUp).toBe('function')
    expect(typeof actions.archiveContact).toBe('function')
    expect(typeof actions.toggleContactPriority).toBe('function')
    expect(typeof actions.archiveContactSilent).toBe('function')
  })
})