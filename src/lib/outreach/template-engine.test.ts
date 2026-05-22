import { describe, it, expect } from 'vitest'
import templateEngine from './template-engine.cjs'

type DraftInput = {
  channel: 'executives' | 'search_firms' | 'coaches' | 'outplacement_firms'
  firstName: string
  company: string
  roleLabel: string
  focus: string
  step?: string
}

function build(input: DraftInput) {
  return (templateEngine as { buildLatestTemplateDraft: (payload: DraftInput) => { subject: string; body: string } }).buildLatestTemplateDraft(input)
}

describe('outreach template engine', () => {
  it('builds executive copy with softer CTA and no pressure language', () => {
    const draft = build({
      channel: 'executives',
      firstName: 'Alex',
      company: 'Acme',
      roleLabel: 'CFO',
      focus: 'CFO',
    })

    expect(draft.subject).toBe('Quick question on CFO transition conversations at Acme')
    expect(draft.body).toContain('If helpful, I can send')
    expect(draft.body).toContain('If not useful right now, no worries')
    expect(draft.body).not.toContain('If this is ignored')
    expect(draft.body).not.toContain('reply "send it"')
  })

  it('builds search firm copy with mandate language', () => {
    const draft = build({
      channel: 'search_firms',
      firstName: 'Sam',
      company: 'Summit Search',
      roleLabel: 'Partner',
      focus: 'Partner',
    })

    expect(draft.subject).toBe('Quick question on Summit Search mandate readiness')
    expect(draft.body).toContain('one-page example tailored to your mandate mix')
  })

  it('builds latest coach copy and blocks legacy phrase drift', () => {
    const draft = build({
      channel: 'coaches',
      firstName: 'Jordan',
      company: 'CoachCo',
      roleLabel: 'Executive Coach',
      focus: 'Executive Coach',
    })

    expect(draft.subject).toBe('Quick question on executive transition readiness for CoachCo')
    expect(draft.body).toContain('practical execution layer')
    expect(draft.body).not.toContain('between-session execution layer')
  })

  it('builds latest outplacement copy with measurable standard marker', () => {
    const draft = build({
      channel: 'outplacement_firms',
      firstName: 'Casey',
      company: 'Outplace Inc',
      roleLabel: 'Managing Director',
      focus: 'Executive transition programs',
    })

    expect(draft.body).toContain('measurable execution standard across targeting, narrative quality, and first-conversation readiness')
    expect(draft.body).toContain('If helpful, I can send')
  })

  it('builds executive followup subjects with step-specific variants', () => {
    const followup2 = build({
      channel: 'executives',
      firstName: 'Riley',
      company: 'Northstar',
      roleLabel: 'CIO',
      focus: 'CIO',
      step: 'followup_2',
    })

    expect(followup2.subject).toBe('Quick question on senior CIO transition conversations at Northstar')
    expect(followup2.body).toContain('had one more thought on CIO transitions')
    expect(followup2.body).toContain('If this is not relevant right now, no problem')
  })
})
