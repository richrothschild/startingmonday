import { describe, expect, it } from 'vitest'
import { SpeakersClient } from './speakers-client'

describe('admin speakers client module', () => {
  it('exports SpeakersClient', () => {
    expect(typeof SpeakersClient).toBe('function')
  })
})