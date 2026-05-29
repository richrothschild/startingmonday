import { describe, expect, it } from 'vitest'
import { IntelligenceAdminClient } from './client'

describe('admin intelligence client module', () => {
  it('exports IntelligenceAdminClient', () => {
    expect(typeof IntelligenceAdminClient).toBe('function')
  })
})