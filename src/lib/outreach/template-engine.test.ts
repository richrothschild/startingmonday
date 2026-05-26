import { describe, it, expect } from 'vitest'
import templateEngine from './template-engine.cjs'

type DraftInput = {
  channel: 'executives' | 'search_firms' | 'coaches' | 'outplacement_firms'
  firstName: string
  company: string
  roleLabel: string
  focus: string
  step?: string
  state?: 'panic' | 'optionality' | 'burnout' | 'board-track'
  profileTrigger?: string
  postTrigger?: string
  newsTrigger?: string
}

function build(input: DraftInput) {
  return (templateEngine as { buildLatestTemplateDraft: (payload: DraftInput) => { subject: string; body: string } }).buildLatestTemplateDraft(input)
}

describe('outreach template engine', () => {
  it('builds executive copy with EMI spine, legal-safe proof, and binary CTA', () => {
    const draft = build({
      channel: 'executives',
      firstName: 'Alex',
      company: 'Acme',
      roleLabel: 'CFO',
      focus: 'CFO',
      state: 'panic',
    })

    expect(draft.subject).toBe('CFO first-call plan for Acme')
    expect(draft.body).toContain('In first-week CFO moves, early momentum can slip when the first-call story is not clear.')
    expect(draft.body).toContain('In a job search, the first call often decides momentum.')
    expect(draft.body).toContain('use Starting Monday to run one clear plan')
    expect(draft.body).toContain('Jan-May 2026 pilot group (n=27)')
    expect(draft.body).toContain('results vary by market and execution')
    expect(draft.body).toContain('Reply yes and I will send the one-page first-call plan')
    expect(draft.body).toContain('Reply pass and I will close the loop')
    expect(draft.body).not.toContain('Proof detail:')
    expect(draft.body).not.toContain('If this is ignored')
    expect(draft.body).not.toContain('reply "send it"')
  })

  it('builds search firm copy with mandate economics and operating model language', () => {
    const draft = build({
      channel: 'search_firms',
      firstName: 'Sam',
      company: 'Summit Search',
      roleLabel: 'Partner',
      focus: 'Partner',
    })

    expect(draft.subject).toBe('Partner search first-touch plan for Summit Search')
    expect(draft.body).toContain('In search work, first-touch quality can slip and partner review cycles can repeat.')
    expect(draft.body).toContain('one clear standard before shortlist outreach scales')
    expect(draft.body).toContain('Reply yes and I will send the one-page first-touch plan')
  })

  it('builds coach copy with explicit emotional-state variant and binary CTA', () => {
    const draft = build({
      channel: 'coaches',
      firstName: 'Jordan',
      company: 'CoachCo',
      roleLabel: 'Executive Coach',
      focus: 'Executive Coach',
      state: 'burnout',
    })

    expect(draft.subject).toBe('Simple between-session plan for CoachCo')
    expect(draft.body).toContain('Between sessions, prep can sprawl across inboxes, docs, and memory.')
    expect(draft.body).toContain('Most teams either keep prep manual')
    expect(draft.body).toContain('Jan-May 2026 pilot group (n=27)')
    expect(draft.body).toContain('Reply yes and I will send the coach signal map')
    expect(draft.body).not.toContain('between-session execution layer')
  })

  it('builds outplacement copy with measurable standard and operating-model differentiation', () => {
    const draft = build({
      channel: 'outplacement_firms',
      firstName: 'Casey',
      company: 'Outplace Inc',
      roleLabel: 'Managing Director',
      focus: 'Executive transition programs',
      state: 'optionality',
    })

    expect(draft.subject).toBe('Cohort first-call plan for Outplace Inc')
    expect(draft.body).toContain('Across Executive transition programs, first-call quality can vary more than teams expect.')
    expect(draft.body).toContain('Most teams either keep first-call prep manual')
    expect(draft.body).toContain('directional evidence, not a guarantee')
    expect(draft.body).toContain('Reply yes and I will send the cohort readiness checklist')
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

    expect(followup2.subject).toBe('Should I send the CIO benchmark for Northstar?')
    expect(followup2.body).toContain('One concrete update from recent CIO transitions')
    expect(followup2.body).toContain('Jan-May 2026 pilot cohort (n=27)')
    expect(followup2.body).not.toContain('If this is not relevant right now, no problem')
  })

  it('builds a plain-language executive draft for board roles', () => {
    const draft = build({
      channel: 'executives',
      firstName: 'Taylor',
      company: 'BoardCo',
      roleLabel: 'Board Advisor',
      focus: 'Board Advisor',
    })

    expect(draft.subject).toBe('Board Advisor first-call plan for BoardCo')
    expect(draft.body).toContain('In a job search, the first call often decides momentum.')
  })

  it('uses dynamic trigger inputs when provided', () => {
    const executive = build({
      channel: 'executives',
      firstName: 'Alex',
      company: 'Acme',
      roleLabel: 'CFO',
      focus: 'CFO',
      newsTrigger: 'new CFO search announced after earnings reset',
    })

    const coach = build({
      channel: 'coaches',
      firstName: 'Jordan',
      company: 'CoachCo',
      roleLabel: 'Executive Coach',
      focus: 'Executive Coach',
      postTrigger: 'your post on keeping client prep simple',
    })

    const outplacement = build({
      channel: 'outplacement_firms',
      firstName: 'Casey',
      company: 'Outplace Inc',
      roleLabel: 'Managing Director',
      focus: 'Executive transition programs',
      profileTrigger: 'your cohort model now spans three regions',
    })

    expect(executive.body).toContain('I saw new CFO search announced after earnings reset, and that usually adds pressure to early search conversations.')
    expect(executive.body).toContain('Momentum Signal')
    expect(coach.body).toContain('I saw your post on keeping client prep simple, and that pressure is real for most coaches.')
    expect(coach.body).toContain('Momentum Signal')
    expect(outplacement.body).toContain('I saw your cohort model now spans three regions, and it often signals uneven first-call readiness across the cohort.')
    expect(outplacement.body).toContain('Momentum Signal')
  })

  it('includes Momentum Signal language for search firms', () => {
    const search = build({
      channel: 'search_firms',
      firstName: 'Taylor',
      company: 'SearchCo',
      roleLabel: 'Partner',
      focus: 'CIO',
      newsTrigger: 'new CIO mandate announced',
    })

    expect(search.body).toContain('Momentum Signal')
  })
})
