import { describe, expect, it } from 'vitest'
import { getBrandContextFromHost, getBrandContextFromHosts } from '@/lib/brand'

describe('brand host resolution', () => {
  it('identifies mandatesignal from an exact host', () => {
    const brand = getBrandContextFromHost('mandatesignal.com')
    expect(brand.isMandateSignal).toBe(true)
    expect(brand.name).toBe('MandateSignal')
  })

  it('prefers a recognized mandatesignal host when forwarded and host disagree', () => {
    const brand = getBrandContextFromHosts(['startingmonday.app', 'mandatesignal.com'])
    expect(brand.isMandateSignal).toBe(true)
    expect(brand.origin).toBe('https://mandatesignal.com')
  })

  it('handles comma-delimited proxy headers', () => {
    const brand = getBrandContextFromHosts(['internal.service', 'www.mandatesignal.com, internal.service'])
    expect(brand.isMandateSignal).toBe(true)
    expect(brand.wordmarkPrimary).toBe('Mandate')
  })
})
