import { describe, expect, it } from 'vitest'
import { buildFailureSummaryPayload, type SummaryRow } from './copy-summary'

describe('buildFailureSummaryPayload', () => {
  const rows: SummaryRow[] = [
    ['tone_wrong', 6],
    ['questions_too_generic', 4],
    ['format_off', 2],
    ['factual_error', 1],
    ['company_context_thin', 1],
    ['role_fit_not_established', 1],
    ['competitive_framing_missed', 1],
  ]

  it('builds list payload without trim', () => {
    const payload = buildFailureSummaryPayload(rows, {
      modeLabel: 'current page',
      includeZeroCounts: false,
      trimForSlack: false,
      copyFormat: 'list',
      topFailureTheme: rows[0],
    })

    expect(payload).toContain('Failure tags (current page)')
    expect(payload).toContain('- tone_wrong: 6')
    expect(payload).toContain('- competitive_framing_missed: 1')
    expect(payload).toContain('Top theme: tone_wrong (6)')
    expect(payload).not.toContain('omitted')
  })

  it('builds trimmed list payload with omitted note', () => {
    const payload = buildFailureSummaryPayload(rows, {
      modeLabel: 'session',
      includeZeroCounts: false,
      trimForSlack: true,
      copyFormat: 'list',
      topFailureTheme: rows[0],
    })

    expect(payload).toContain('Failure tags (session, trimmed for Slack)')
    expect(payload).toContain('- role_fit_not_established: 1')
    expect(payload).not.toContain('- competitive_framing_missed: 1')
    expect(payload).toContain('(1 additional tag omitted)')
  })

  it('builds table payload with markdown top theme', () => {
    const payload = buildFailureSummaryPayload(rows.slice(0, 2), {
      modeLabel: 'session',
      includeZeroCounts: false,
      trimForSlack: false,
      copyFormat: 'table',
      topFailureTheme: rows[0],
    })

    expect(payload).toContain('| Tag | Count |')
    expect(payload).toContain('| tone_wrong | 6 |')
    expect(payload).toContain('Top theme: **tone_wrong** (6)')
  })

  it('includes zero-count marker in header when enabled', () => {
    const payload = buildFailureSummaryPayload(rows.slice(0, 1), {
      modeLabel: 'session',
      includeZeroCounts: true,
      trimForSlack: false,
      copyFormat: 'list',
      topFailureTheme: null,
    })

    expect(payload).toContain('Failure tags (session, includes zeros)')
  })
})
