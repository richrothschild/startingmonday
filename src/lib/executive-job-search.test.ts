import { describe, expect, it } from 'vitest'
import {
  buildExecutiveJobSearchScore,
  formatExecutiveSearchBand,
  type ExecutiveJobSearchIntake,
} from './executive-job-search'

function makeIntake(overrides: Partial<ExecutiveJobSearchIntake> = {}): ExecutiveJobSearchIntake {
  return {
    full_name: 'Taylor Reed',
    search_persona: 'csuite',
    current_title: 'Chief Executive Officer',
    current_company: 'Northwind',
    positioning_summary: 'CEO who scaled a multi-site business and led board-visible transformation.',
    resume_text: 'Led enterprise-wide growth, operating model redesign, and post-merger integration across multiple markets.',
    beyond_resume: 'Known for stakeholder alignment and decisive execution.',
    target_titles: ['Chief Executive Officer', 'President'],
    company_names: ['Acme Corp', 'Vertex Labs'],
    employment_status: 'employed_exploring',
    search_timeline: 'opportunistic',
    search_driver: 'voluntary growth move toward a larger enterprise mandate',
    role_segment: null,
    transition_type: null,
    search_stage: null,
    search_mode: null,
    network_strength: null,
    urgency_level: null,
    board_visibility: null,
    geography_constraint: null,
    family_constraint: null,
    confidence_tier: null,
    ...overrides,
  }
}

describe('executive job search scoring', () => {
  it('infers a CEO search profile and returns an executive-ready scorecard', () => {
    const score = buildExecutiveJobSearchScore(makeIntake())

    expect(score.totalScore).toBeGreaterThan(80)
    expect(score.band).toBe('exceptional')
    expect(formatExecutiveSearchBand(score.band)).toBe('Exceptional readiness')
    expect(score.recommendedInterventionKey).toBe('NETWORK_ACTIVATION_BURST')
    expect(score.dimensionScores.segmentFit).toBeGreaterThanOrEqual(4)
    expect(score.dimensionScores.narrativeClarity).toBeGreaterThanOrEqual(4)
  })

  it('still produces a valid scorecard when the intake is sparse', () => {
    const score = buildExecutiveJobSearchScore(
      makeIntake({
        current_title: '',
        current_company: '',
        positioning_summary: '',
        resume_text: '',
        beyond_resume: '',
        target_titles: [],
        company_names: [],
        search_driver: '',
      }),
    )

    expect(score.totalScore).toBeGreaterThanOrEqual(0)
    expect(score.totalScore).toBeLessThanOrEqual(100)
    expect(['moderate', 'fragile', 'high-risk']).toContain(score.band)
    expect(score.evidenceNotes.length).toBeGreaterThan(0)
  })
})
