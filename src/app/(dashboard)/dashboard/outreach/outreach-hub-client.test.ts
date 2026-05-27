import { describe, expect, it } from 'vitest'
import { buildCrossChannelFollowUpDraft, formatOutreachErrorMessage, OutreachHubClient } from './outreach-hub-client'

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

  it('does not surface raw html error pages as outreach explanations', () => {
    expect(formatOutreachErrorMessage('Request failed (502): <!DOCTYPE html><html><body>Bad gateway</body></html>', 'live')).toEqual({
      title: 'Email was not sent',
      detail: 'The outreach email failed before delivery.',
      rawReason: 'Request failed (502): <!DOCTYPE html><html><body>Bad gateway</body></html>',
    })
  })

  it('builds follow-up drafts with binary CTA across channels', () => {
    const executiveDraft = buildCrossChannelFollowUpDraft({
      fullName: 'Alex Morgan',
      roleBucket: 'CFO',
      company: 'Acme',
      email: 'alex@example.com',
      emailConfidence: 'high',
      status: 'reached_out',
      emailOpening: '',
      emailBodyCore: '',
      defaultSubject: '',
      defaultBody: '',
      outreachChannel: 'executives',
      fitTier: 'strong',
      personaFocus: 'CFO transitions',
    })

    const coachDraft = buildCrossChannelFollowUpDraft({
      fullName: 'Jordan Lee',
      roleBucket: 'Executive Coach',
      company: 'CoachCo',
      email: 'jordan@example.com',
      emailConfidence: 'high',
      status: 'reached_out',
      emailOpening: '',
      emailBodyCore: '',
      defaultSubject: '',
      defaultBody: '',
      outreachChannel: 'coaches',
      fitTier: 'strong',
      personaFocus: 'Coaching workflows',
    })

    expect(executiveDraft.subject).toContain('Quick follow-up')
    expect(executiveDraft.body).toContain('reply yes')
    expect(executiveDraft.body).toContain('reply pass')
    expect(coachDraft.subject).toContain('between-session momentum')
    expect(coachDraft.body).toContain('Momentum Signal')
  })
})