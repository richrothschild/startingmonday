import { describe, it, expect } from 'vitest'
import { normalizeCompanyName, extractDomain } from './canonical-company.js'

describe('normalizeCompanyName', () => {
  it('strips corporate suffixes and punctuation', () => {
    expect(normalizeCompanyName('Acme, Inc.')).toBe('acme')
    expect(normalizeCompanyName('Acme Corporation')).toBe('acme')
    expect(normalizeCompanyName('Acme Holdings LLC')).toBe('acme')
    expect(normalizeCompanyName('ACME CO., LTD.')).toBe('acme')
  })

  it('maps equivalent legal forms to the same key', () => {
    expect(normalizeCompanyName('DataCo Inc')).toBe(normalizeCompanyName('DataCo Corp'))
    expect(normalizeCompanyName('DataCo Ltd.')).toBe(normalizeCompanyName('DataCo, LLC'))
  })

  it('preserves distinguishing words', () => {
    expect(normalizeCompanyName('Acme Robotics')).not.toBe(normalizeCompanyName('Acme Analytics'))
  })

  it('normalizes ampersands', () => {
    expect(normalizeCompanyName('Johnson & Johnson')).toBe('johnson and johnson')
  })

  it('handles empty input', () => {
    expect(normalizeCompanyName('')).toBe('')
    expect(normalizeCompanyName(null)).toBe('')
  })
})

describe('extractDomain', () => {
  it('extracts registrable domains from URLs', () => {
    expect(extractDomain('https://www.acme.com/careers')).toBe('acme.com')
    expect(extractDomain('http://acme.io')).toBe('acme.io')
  })

  it('accepts bare hostnames', () => {
    expect(extractDomain('acme.com')).toBe('acme.com')
    expect(extractDomain('www.acme.com')).toBe('acme.com')
  })

  it('returns null for garbage', () => {
    expect(extractDomain(null)).toBeNull()
    expect(extractDomain('')).toBeNull()
  })
})
