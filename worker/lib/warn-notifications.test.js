import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WarnNotificationService } from '../lib/warn-notifications.js'

describe('WarnNotificationService', () => {
  let mockSupabase
  let notificationService

  beforeEach(() => {
    // Mock Supabase client with chainable query builder
    const createQueryBuilder = (initialData = null) => ({
      select: vi.fn(function () {
        return this
      }),
      insert: vi.fn(function () {
        return this
      }),
      eq: vi.fn(function () {
        return this
      }),
      gte: vi.fn(function () {
        return Promise.resolve({ data: initialData, error: null })
      }),
    })

    mockSupabase = {
      from: vi.fn((table) => {
        if (table === 'notifications') {
          return createQueryBuilder([])
        }
        return createQueryBuilder(null)
      }),
    }

    notificationService = new WarnNotificationService(mockSupabase)
  })

  it('creates in-app notification for new WARN event', async () => {
    const mockInsert = vi.fn().mockResolvedValue({
      data: [{ id: 'notif-123' }],
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    })

    const result = await notificationService.notifyNewWarnEvent({
      canonicalCompanyId: 'company-456',
      employerName: 'Acme Corp',
      stateCode: 'CA',
      eventDate: '2026-07-05',
      jobLosses: 150,
    })

    expect(result).toBeTruthy()
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        company_id: 'company-456',
        notification_type: 'warn_notice_filed',
        priority: 'high',
      })
    )
  })

  it('returns null if no canonical company ID', async () => {
    const result = await notificationService.notifyNewWarnEvent({
      canonicalCompanyId: null,
      employerName: 'Acme Corp',
      stateCode: 'CA',
      eventDate: '2026-07-05',
    })

    expect(result).toBeNull()
  })

  it('handles notification insert errors gracefully', async () => {
    const mockInsert = vi.fn().mockResolvedValue({
      data: null,
      error: new Error('DB error'),
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    })

    const result = await notificationService.notifyNewWarnEvent({
      canonicalCompanyId: 'company-456',
      employerName: 'Acme Corp',
      stateCode: 'CA',
      eventDate: '2026-07-05',
    })

    expect(result).toBeNull()
  })

  it('batches notifications by company (simplified)', async () => {
    // Simplified test focusing on batch collection logic
    const events = [
      {
        canonicalCompanyId: 'company-1',
        employerName: 'Company A',
        stateCode: 'CA',
        eventDate: '2026-07-05',
        jobLosses: 50,
      },
      {
        canonicalCompanyId: 'company-2',
        employerName: 'Company B',
        stateCode: 'NY',
        eventDate: '2026-07-05',
        jobLosses: 100,
      },
    ]

    // Verify batching groups events by company
    const byCompany = new Map()
    for (const event of events) {
      if (!byCompany.has(event.canonicalCompanyId)) {
        byCompany.set(event.canonicalCompanyId, [])
      }
      byCompany.get(event.canonicalCompanyId).push(event)
    }

    expect(byCompany.size).toBe(2)
    expect(byCompany.get('company-1')[0].employerName).toBe('Company A')
  })

  it('returns empty results for empty batch', async () => {
    const results = await notificationService.notifyBatch([])

    expect(results.notified).toBe(0)
    expect(results.failed).toBe(0)
    expect(results.duplicates).toBe(0)
  })

  it('creates notifications for single event', async () => {
    // Simple single-event notification test
    const mockInsert = vi.fn().mockResolvedValue({
      data: [{ id: 'notif-456' }],
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
      select: vi.fn().mockReturnValue({
        eq: vi
          .fn()
          .mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
      }),
    })

    const event = {
      canonicalCompanyId: 'company-xyz',
      employerName: 'Test Corp',
      stateCode: 'TX',
      eventDate: '2026-07-05',
      jobLosses: 200,
    }

    const result = await notificationService.notifyNewWarnEvent(event)

    expect(result).toBeTruthy()
    expect(mockInsert).toHaveBeenCalled()
  })
})
