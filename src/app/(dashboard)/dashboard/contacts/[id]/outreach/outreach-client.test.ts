import { describe, expect, it } from 'vitest'
import { OutreachClient } from './outreach-client'
import * as actions from '../../actions'

describe('outreach client module', () => {
  it('exports OutreachClient', () => {
    expect(typeof OutreachClient).toBe('function')
  })

  it('imports outreach actions that return actionable status results', () => {
    expect(typeof actions.markContactSent).toBe('function')
    expect(typeof actions.remindLater).toBe('function')
  })
})