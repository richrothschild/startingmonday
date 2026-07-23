import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
  insert: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'users') {
        return {
          select: state.select,
        }
      }
      if (table === 'user_events') {
        return {
          insert: state.insert,
        }
      }
      return {
        select: state.select,
        insert: state.insert,
      }
    },
  }),
}))

import { logEvent } from './events'

describe('src/lib/events.ts', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    state.select.mockReturnValue({ eq: state.eq })
    state.eq.mockReturnValue({ maybeSingle: state.maybeSingle })
    state.maybeSingle.mockResolvedValue({
      data: {
        signup_source: 'managertools',
        referral_source: 'partner_alpha',
        acquisition_channel: 'self_reported',
      },
    })
    state.insert.mockResolvedValue({ error: null })
  })

  it('enriches logged events with source context when available', async () => {
    await logEvent('user-1', 'contact_added', { channel: 'manual' })

    expect(state.insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      event_name: 'contact_added',
      properties: {
        signup_source: 'managertools',
        referral_source: 'partner_alpha',
        acquisition_channel: 'self_reported',
        channel: 'manual',
      },
    })
  })

  it('preserves explicit source values when provided by caller', async () => {
    await logEvent('user-1', 'contact_added', {
      signup_source: 'explicit',
      referral_source: 'explicit_ref',
      acquisition_channel: 'newsletter',
      channel: 'manual',
    })

    expect(state.insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      event_name: 'contact_added',
      properties: {
        signup_source: 'explicit',
        referral_source: 'explicit_ref',
        acquisition_channel: 'newsletter',
        channel: 'manual',
      },
    })
  })
})
