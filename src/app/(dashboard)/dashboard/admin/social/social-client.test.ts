import { describe, expect, it } from 'vitest'
import { SocialClient } from './social-client'

describe('social client module', () => {
  it('exports a SocialClient component', () => {
    expect(typeof SocialClient).toBe('function')
  })
})