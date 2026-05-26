import { describe, expect, it } from 'vitest'
import { OutreachClient } from './outreach-client'

describe('outreach client module', () => {
  it('exports OutreachClient', () => {
    expect(typeof OutreachClient).toBe('function')
  })
})