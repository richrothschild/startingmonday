import { describe, expect, it } from 'vitest'
import { PrepClient } from './prep-client'

describe('prep client module', () => {
  it('exports PrepClient', () => {
    expect(typeof PrepClient).toBe('function')
  })
})