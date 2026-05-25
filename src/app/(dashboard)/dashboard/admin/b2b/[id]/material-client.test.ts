import { describe, expect, it } from 'vitest'
import MaterialClient from './material-client'

describe('admin b2b material client module', () => {
  it('exports MaterialClient', () => {
    expect(typeof MaterialClient).toBe('function')
  })
})