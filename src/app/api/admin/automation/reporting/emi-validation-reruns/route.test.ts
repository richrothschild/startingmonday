import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const state = vi.hoisted(() => ({
  requireAutomationAccess: vi.fn(),
  parseAutomationBody: vi.fn(),
  from: vi.fn(),
  insertedRow: null as Record<string, unknown> | null,
}))

vi.mock('@/lib/admin-automation-route', () => ({
  requireAutomationAccess: state.requireAutomationAccess,
  parseAutomationBody: state.parseAutomationBody,
  asLooseSupabaseClient: (client: unknown) => client,
}))

import { POST } from './route'

describe('emi validation reruns reporting route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    state.insertedRow = null

    state.requireAutomationAccess.mockResolvedValue({
      ok: true,
      userId: 'user_1',
      supabase: { from: state.from },
    })

    state.parseAutomationBody.mockResolvedValue({
      ok: true,
      body: { tolerancePoints: 0 },
    })

    state.from.mockImplementation((table: string) => {
      if (table === 'emi_kpi_snapshots') {
        const rows = [
          { metric_name: 'emi_language_adoption_percent', metric_value: 100, metric_status: 'ok', week_start: '2026-05-19', week_end: '2026-05-25', generated_at: '2026-05-25T01:00:00.000Z', source_table: 'user_events', source_notes: '' },
          { metric_name: 'assessment_completion_percent', metric_value: 100, metric_status: 'ok', week_start: '2026-05-19', week_end: '2026-05-25', generated_at: '2026-05-25T01:00:00.000Z', source_table: 'onboarding_qa_weekly_scorecards', source_notes: '' },
          { metric_name: 'day7_return_percent', metric_value: 100, metric_status: 'ok', week_start: '2026-05-19', week_end: '2026-05-25', generated_at: '2026-05-25T01:00:00.000Z', source_table: 'user_events', source_notes: '' },
          { metric_name: 'proof_assets_published_count', metric_value: 3, metric_status: 'ok', week_start: '2026-05-19', week_end: '2026-05-25', generated_at: '2026-05-25T01:00:00.000Z', source_table: 'proof_assets', source_notes: '' },
          { metric_name: 'b2b_pilot_conversion_percent', metric_value: 28.57, metric_status: 'ok', week_start: '2026-05-19', week_end: '2026-05-25', generated_at: '2026-05-25T01:00:00.000Z', source_table: 'b2b_prospects', source_notes: '' },
          { metric_name: 'tier1_claim_compliance_percent', metric_value: 100, metric_status: 'ok', week_start: '2026-05-19', week_end: '2026-05-25', generated_at: '2026-05-25T01:00:00.000Z', source_table: 'tier1_claims', source_notes: '' },
        ]

        const chain = {
          select: vi.fn(() => chain),
          gte: vi.fn(() => chain),
          order: vi.fn(() => chain),
          limit: vi.fn(async () => ({ data: rows, error: null })),
        }
        return chain
      }

      if (table === 'scheduled_job_observability_runs') {
        const chain = {
          insert: vi.fn((payload: Record<string, unknown>) => {
            state.insertedRow = payload
            return chain
          }),
          select: vi.fn(() => chain),
          single: vi.fn(async () => ({ data: { id: 'run_2' }, error: null })),
        }
        return chain
      }

      throw new Error(`Unexpected table: ${table}`)
    })
  })

  it('returns ok when snapshots match published KPI baselines', async () => {
    const response = await POST(new NextRequest('https://startingmonday.app/api/admin/automation/reporting/emi-validation-reruns', {
      method: 'POST',
      body: JSON.stringify({ tolerancePoints: 0 }),
      headers: { 'Content-Type': 'application/json' },
    }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      runId: 'run_2',
      jobName: 'emi-production-validation-rerun',
      status: 'ok',
      mismatchCount: 0,
      nullStreakCount: 0,
    })

    expect(state.insertedRow).toMatchObject({
      user_id: 'user_1',
      job_name: 'emi-production-validation-rerun',
      status: 'ok',
    })
  })
})
