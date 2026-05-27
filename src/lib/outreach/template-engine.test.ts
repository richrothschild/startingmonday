import { describe, it, expect } from 'vitest'
import { evaluateEmailCouncilQuality } from '../email-council'
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

function toHtml(text: string) {
  return `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0f172a;">${text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')}</div>`
}

function ensureSignatureLine(messageText: string) {
  return `${messageText.replace(/\r\n/g, '\n').trim()}\n\nRich\nstartingmonday.app`
}

function withComplianceFooter(messageText: string) {
  return [
    messageText.trim(),
    '',
    '---',
    'Starting Monday',
    'If you prefer no further outreach, reply with "unsubscribe" and I will stop.',
  ].join('\n')
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

    expect(draft.subject).toBe('Simple CFO first-call plan for Acme team')
    expect(draft.body).toContain('In first-week CFO moves, early momentum can slip when the first-call story is not clear.')
    expect(draft.body).toContain('When the first serious call is strong, search momentum usually gets easier.')
    expect(draft.body).toContain('Starting Monday gives leaders one working plan')
    expect(draft.body).toContain('Jan-May 2026 pilot group (n=27)')
    expect(draft.body).toContain('Use this as directional evidence, not a guarantee')
    expect(draft.body).toContain('If useful, reply yes and I will send the one-page first-call plan')
    expect(draft.body).toContain('reply pass and I will close the loop')
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
    expect(draft.body).toContain('In retained search, first-touch quality can slip once partner review starts repeating.')
    expect(draft.body).toContain('hold one clear bar before shortlist outreach scales')
    expect(draft.body).toContain('If useful, reply yes and I will send the one-page first-touch plan')
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
    expect(draft.body).toContain('Between sessions, client prep can end up split across inboxes, docs, and memory.')
    expect(draft.body).toContain('Starting Monday gives coaches one shared place for signal review, prep, and next-action follow-through without adding admin weight.')
    expect(draft.body).toContain('Jan-May 2026 pilot group (n=27)')
    expect(draft.body).toContain('If useful, reply yes and I will send the coach signal map')
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

    expect(draft.subject).toBe('Cohort first-call readiness plan for Outplace Inc')
    expect(draft.body).toContain('Across Executive transition programs, first-call quality can vary more than teams expect.')
    expect(draft.body).toContain('Starting Monday gives counselors one shared readiness check before the first serious conversation')
    expect(draft.body).toContain('directional evidence, not a guarantee')
    expect(draft.body).toContain('If useful, reply yes and I will send the cohort readiness checklist')
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

    expect(followup2.subject).toBe('Should I send the CIO benchmark for Northstar')
    expect(followup2.body).toContain('One update from recent CIO transitions at Northstar')
    expect(followup2.body).toContain('Starting Monday tracks that with Momentum Signal.')
    expect(followup2.body).toContain('Jan-May 2026 pilot cohort (n=27)')
    expect(followup2.body).not.toContain('If this is not relevant right now, no problem')
  })

  it('keeps follow-up drafts above the live council gate', () => {
    const drafts: DraftInput[] = [
      { channel: 'executives', firstName: 'Riley', company: 'Northstar', roleLabel: 'CIO', focus: 'CIO', step: 'followup_1' },
      { channel: 'executives', firstName: 'Riley', company: 'Northstar', roleLabel: 'CIO', focus: 'CIO', step: 'followup_2' },
      { channel: 'executives', firstName: 'Riley', company: 'Northstar', roleLabel: 'CIO', focus: 'CIO', step: 'followup_3' },
      { channel: 'search_firms', firstName: 'Sam', company: 'SearchCo', roleLabel: 'Partner', focus: 'CIO', step: 'followup_1' },
      { channel: 'search_firms', firstName: 'Sam', company: 'SearchCo', roleLabel: 'Partner', focus: 'CIO', step: 'followup_2' },
      { channel: 'search_firms', firstName: 'Sam', company: 'SearchCo', roleLabel: 'Partner', focus: 'CIO', step: 'followup_3' },
      { channel: 'coaches', firstName: 'Jordan', company: 'CoachCo', roleLabel: 'Executive Coach', focus: 'Executive Coach', step: 'followup_1' },
      { channel: 'coaches', firstName: 'Jordan', company: 'CoachCo', roleLabel: 'Executive Coach', focus: 'Executive Coach', step: 'followup_2' },
      { channel: 'coaches', firstName: 'Jordan', company: 'CoachCo', roleLabel: 'Executive Coach', focus: 'Executive Coach', step: 'followup_3' },
      { channel: 'outplacement_firms', firstName: 'Casey', company: 'Outplace Inc', roleLabel: 'Managing Director', focus: 'Executive transition programs', step: 'followup_1' },
      { channel: 'outplacement_firms', firstName: 'Casey', company: 'Outplace Inc', roleLabel: 'Managing Director', focus: 'Executive transition programs', step: 'followup_2' },
      { channel: 'outplacement_firms', firstName: 'Casey', company: 'Outplace Inc', roleLabel: 'Managing Director', focus: 'Executive transition programs', step: 'followup_3' },
    ]

    for (const input of drafts) {
      const draft = build(input)
      const finalMessageText = withComplianceFooter(ensureSignatureLine(draft.body))
      const evaluation = evaluateEmailCouncilQuality({
        channel: input.channel,
        subject: `[TEST] ${draft.subject}`,
        html: toHtml(finalMessageText),
        minEjes: 90,
      })

      expect(evaluation.passes, `${input.channel} ${input.step} draft blocked: ${evaluation.blockers.join(', ')}`).toBe(true)
      expect(evaluation.scores.ejes).toBeGreaterThanOrEqual(90)
    }
  })

  it('keeps long-company coach followups under the route subject guardrail', () => {
    const draft = build({
      channel: 'coaches',
      firstName: 'Marshall',
      company: 'Marshall Goldsmith Stakeholder Centered Coaching',
      roleLabel: 'Executive Coach',
      focus: 'CEO-to-Board',
      step: 'followup_1',
    })

    expect(draft.subject).toBe('Quick follow-up on coach momentum for Marshall Goldsmith team')
    expect(draft.subject.length).toBeLessThanOrEqual(80)

    const finalMessageText = withComplianceFooter(ensureSignatureLine(draft.body))
    const evaluation = evaluateEmailCouncilQuality({
      channel: 'coaches',
      subject: draft.subject,
      html: toHtml(finalMessageText),
      minEjes: 90,
    })

    expect(evaluation.passes, evaluation.blockers.join(', ')).toBe(true)
    expect(evaluation.scores.ejes).toBeGreaterThanOrEqual(90)
  })

  it('builds a plain-language executive draft for board roles', () => {
    const draft = build({
      channel: 'executives',
      firstName: 'Taylor',
      company: 'BoardCo',
      roleLabel: 'Board Advisor',
      focus: 'Board Advisor',
    })

    expect(draft.subject).toBe('Simple Board Advisor first-call plan for BoardCo team')
    expect(draft.body).toContain('When the first serious call is strong, search momentum usually gets easier.')
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

  it('keeps default first-touch drafts above the live council gate', () => {
    const drafts: DraftInput[] = [
      { channel: 'executives', firstName: 'Alex', company: 'Acme', roleLabel: 'CFO', focus: 'CFO' },
      { channel: 'search_firms', firstName: 'Sam', company: 'SearchCo', roleLabel: 'Partner', focus: 'CIO' },
      { channel: 'coaches', firstName: 'Jordan', company: 'CoachCo', roleLabel: 'Executive Coach', focus: 'Executive Coach' },
      { channel: 'outplacement_firms', firstName: 'Casey', company: 'Outplace Inc', roleLabel: 'Managing Director', focus: 'Executive transition programs' },
    ]

    for (const input of drafts) {
      const draft = build(input)
      const evaluation = evaluateEmailCouncilQuality({
        channel: input.channel,
        subject: draft.subject,
        html: toHtml(draft.body),
        minEjes: 90,
      })

      expect(evaluation.passes, `${input.channel} draft blocked: ${evaluation.blockers.join(', ')}`).toBe(true)
      expect(evaluation.scores.ejes).toBeGreaterThanOrEqual(90)
    }
  })
})
