import { describe, expect, it } from 'vitest'
import { CompanySearchInput } from './company-search-input'

describe('company search input module', () => {
  it('exports CompanySearchInput', () => {
    expect(typeof CompanySearchInput).toBe('function')
  })
})