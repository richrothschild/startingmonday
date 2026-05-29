import { describe, expect, it } from 'vitest'
import { InterviewSessionsPanel } from './interview-sessions-panel'

describe('interview sessions panel module', () => {
  it('exports InterviewSessionsPanel', () => {
    expect(typeof InterviewSessionsPanel).toBe('function')
  })
})