import { describe, expect, it } from 'vitest'
import { classifyOutreachDomainBucket, mapWebhookEventToJobState } from '@/lib/outreach/send-queue'

describe('classifyOutreachDomainBucket', () => {
  it('classifies gmail and googlemail domains as gmail bucket', () => {
    expect(classifyOutreachDomainBucket('person@gmail.com')).toBe('gmail')
    expect(classifyOutreachDomainBucket('person@googlemail.com')).toBe('gmail')
  })

  it('classifies microsoft consumer domains as microsoft bucket', () => {
    expect(classifyOutreachDomainBucket('person@outlook.com')).toBe('microsoft')
    expect(classifyOutreachDomainBucket('person@hotmail.com')).toBe('microsoft')
    expect(classifyOutreachDomainBucket('person@live.com')).toBe('microsoft')
    expect(classifyOutreachDomainBucket('person@msn.com')).toBe('microsoft')
  })

  it('classifies non-consumer domains as corporate bucket', () => {
    expect(classifyOutreachDomainBucket('ceo@acme.com')).toBe('corporate')
  })
})

describe('mapWebhookEventToJobState', () => {
  it('maps delivery and reply webhook events to queue states', () => {
    expect(mapWebhookEventToJobState('email.delivered')).toBe('delivered')
    expect(mapWebhookEventToJobState('email.bounced')).toBe('bounced')
    expect(mapWebhookEventToJobState('email.complained')).toBe('complained')
    expect(mapWebhookEventToJobState('email.replied')).toBe('replied')
    expect(mapWebhookEventToJobState('reply.received')).toBe('replied')
  })

  it('returns null for unrecognized webhook event types', () => {
    expect(mapWebhookEventToJobState('email.sent')).toBeNull()
    expect(mapWebhookEventToJobState('')).toBeNull()
  })
})
