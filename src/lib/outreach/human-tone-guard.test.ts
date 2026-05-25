import { describe, expect, it } from 'vitest'
import {
  DEFAULT_HUMAN_TONE_PASS_THRESHOLD,
  evaluateHumanTone,
  humanToneSkeleton,
} from './human-tone-guard'

describe('human tone guard', () => {
  it('normalizes urls and emails in skeleton output', () => {
    const skeleton = humanToneSkeleton({
      subject: 'Quick idea',
      body: 'See https://example.com and email me at rich@example.com',
    })
    expect(skeleton).toContain('URL')
    expect(skeleton).toContain('EMAIL')
  })

  it('fails pressure-heavy outreach at default threshold', () => {
    const result = evaluateHumanTone({
      subject: 'Act now',
      body: 'I hope this finds you well. Act now. If this is ignored, the cost is high. Book a call now.',
      recipientName: 'Alex',
    })
    expect(result.threshold).toBe(DEFAULT_HUMAN_TONE_PASS_THRESHOLD)
    expect(result.passed).toBe(false)
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it('passes targeted low-pressure message with detail', () => {
    const result = evaluateHumanTone(
      {
        subject: 'Alex, quick idea from this week',
        body: 'Hi Alex, in week one with a recent client we improved prep quality by 18% by tightening question framing. If useful, I can send the 5-point checklist we used.',
        recipientName: 'Alex',
      },
      { duplicateCount: 1 },
    )
    expect(result.score).toBeGreaterThanOrEqual(80)
  })
})
