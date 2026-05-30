import { beforeEach, describe, expect, it, vi } from 'vitest'

const insertSpy = vi.fn()

vi.mock('@/lib/require-auth', () => ({
  requireAuth: vi.fn(async () => ({ ok: true, userId: 'user-1' })),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: vi.fn(() => ({
      insert: (payload: unknown) => {
        insertSpy(payload)
        return {
          select: () => ({
            single: async () => ({ data: { id: 'brief-1' }, error: null }),
          }),
        }
      },
    })),
  })),
}))

vi.mock('@/lib/events', () => ({
  logEvent: vi.fn(async () => undefined),
}))

vi.mock('@/lib/posthog-server', () => ({
  captureServerEvent: vi.fn(() => undefined),
}))

vi.mock('@/lib/watermark', () => ({
  watermarkText: vi.fn((text: string) => text),
}))

describe('src/app/api/briefs/save/route.ts', () => {
  beforeEach(() => {
    insertSpy.mockReset()
  })

  it('rejects prep writes without claim provenance', async () => {
    const { POST } = await import('@/app/api/briefs/save/route')
    const req = new Request('http://localhost/api/briefs/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'prep', text: 'Test prep brief output' }),
    })

    const res = await POST(req as any)
    expect(res.status).toBe(400)
    expect(insertSpy).not.toHaveBeenCalled()
  })

  it('persists provenance payload for prep writes', async () => {
    const { POST } = await import('@/app/api/briefs/save/route')
    const req = new Request('http://localhost/api/briefs/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'prep',
        text: 'Candidate has verified career history and signal context.',
        claim_provenance: [
          {
            claimText: 'Candidate has verified career history and signal context.',
            originClass: 'user_provided',
            section: 'Bottom Line',
            sensitivePolicyHooks: [],
          },
        ],
        provenance_version: 1,
      }),
    })

    const res = await POST(req as any)
    expect(res.status).toBe(200)
    expect(insertSpy).toHaveBeenCalledTimes(1)
    const payload = insertSpy.mock.calls[0][0] as Record<string, unknown>
    expect(payload.claim_provenance).toBeDefined()
    expect(payload.provenance_version).toBe(1)
  })

  it('rejects malformed company_id via schema validation', async () => {
    const { POST } = await import('@/app/api/briefs/save/route')
    const req = new Request('http://localhost/api/briefs/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'strategy',
        text: 'A valid strategy brief body',
        company_id: 'not-a-uuid',
      }),
    })

    const res = await POST(req as any)
    expect(res.status).toBe(400)
    expect(insertSpy).not.toHaveBeenCalled()
  })
})
