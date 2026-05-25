import { describe, expect, it } from 'vitest'
import * as tracesActions from './actions'

describe('traces actions module', () => {
  it('exports rateTrace', () => {
    expect(typeof tracesActions.rateTrace).toBe('function')
  })
})