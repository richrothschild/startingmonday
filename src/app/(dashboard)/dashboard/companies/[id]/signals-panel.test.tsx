import { describe, expect, it } from 'vitest'
import { SignalsPanel } from './signals-panel'

describe('signals panel module', () => {
  it('exports SignalsPanel', () => {
    expect(typeof SignalsPanel).toBe('function')
  })
})