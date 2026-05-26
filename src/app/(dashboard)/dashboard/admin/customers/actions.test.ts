import { describe, expect, it } from 'vitest'
import * as actions from './actions'

describe('admin customers actions module', () => {
  it('exports sendWelcomeEmail', () => {
    expect(typeof actions.sendWelcomeEmail).toBe('function')
  })
})