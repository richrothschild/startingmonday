import { describe, expect, it } from 'vitest'
import { AdminPageClient } from './admin-page-client'

describe('admin page client module', () => {
  it('exports AdminPageClient', () => {
    expect(typeof AdminPageClient).toBe('function')
  })
})