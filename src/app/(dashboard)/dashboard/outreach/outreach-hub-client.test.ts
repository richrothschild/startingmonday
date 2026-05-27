import { describe, expect, it } from 'vitest'
import { formatOutreachErrorMessage, OutreachHubClient } from './outreach-hub-client'

describe('outreach hub module', () => {
  it('exports OutreachHubClient', () => {
    expect(typeof OutreachHubClient).toBe('function')
  })

  it('turns council gate failures into a clear no-send message', () => {
    expect(formatOutreachErrorMessage('Blocked by email council gate: EJES 87 < 90', 'live')).toEqual({
      title: 'Send blocked before delivery',
      detail: 'This draft did not meet the live email quality gate, so no email was sent. Tighten the copy and run a test to yourself before sending live.',
      rawReason: 'Blocked by email council gate: EJES 87 < 90',
    })
  })

  it('uses a sender-specific message for test send resolution failures', () => {
    expect(formatOutreachErrorMessage('Could not resolve test recipient email.', 'test_to_self')).toEqual({
      title: 'Test send could not start',
      detail: 'Your account email could not be resolved for Send Test To Me. Confirm your signed-in user has a valid email address.',
    })
  })
})