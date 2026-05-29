import { describe, expect, it } from 'vitest'
import * as actions from './actions'

describe('new company actions module', () => {
  it('exports addCompany', () => {
    expect(typeof actions.addCompany).toBe('function')
  })
})