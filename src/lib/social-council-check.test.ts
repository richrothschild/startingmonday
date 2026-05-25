import { describe, expect, it } from 'vitest'
import {
  evaluateShortFormCouncilCheck,
  getNoteToken,
  hashDraftText,
  setNoteToken,
} from './social-council-check'

describe('social council check helpers', () => {
  it('reads and writes note tokens idempotently', () => {
    const notes = 'foo=1 | bar=2'
    expect(getNoteToken(notes, 'foo')).toBe('1')
    const updated = setNoteToken(notes, 'foo', '3')
    expect(getNoteToken(updated, 'foo')).toBe('3')
  })

  it('hashDraftText is deterministic', () => {
    expect(hashDraftText('same')).toBe(hashDraftText('same'))
    expect(hashDraftText('same')).not.toBe(hashDraftText('different'))
  })
})

describe('evaluateShortFormCouncilCheck', () => {
  it('fails weak draft with no emotional angle', () => {
    const result = evaluateShortFormCouncilCheck('Generic post with no detail. Comment below.', null, null)
    expect(result.councilPass).toBe(false)
    expect(result.topFixes.length).toBeGreaterThan(0)
  })

  it('passes strong draft with rotated emotional angle', () => {
    const draft = 'This week a client moved from stalled to final-round after we reframed one executive story with hard numbers from a pilot. If helpful, I can share the exact prompt we used.'
    const result = evaluateShortFormCouncilCheck(draft, 'earned_optimism', 'grounded_concern')
    expect(result.checks.emotionalAnglePresent).toBe(true)
    expect(result.checks.emotionalAngleRotation).toBe(true)
    expect(result.score).toBeGreaterThan(70)
  })
})
