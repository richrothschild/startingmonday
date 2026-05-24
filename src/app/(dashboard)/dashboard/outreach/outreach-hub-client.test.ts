import { describe, expect, it } from 'vitest'
import { OutreachHubClient } from './outreach-hub-client'

describe('outreach hub module', () => {
  it('exports OutreachHubClient', () => {
    expect(typeof OutreachHubClient).toBe('function')
  })
})