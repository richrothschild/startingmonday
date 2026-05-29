import { describe, expect, it } from 'vitest'
import { TeamClient } from './team-client'

describe('admin team client module', () => {
  it('exports TeamClient', () => {
    expect(typeof TeamClient).toBe('function')
  })
})