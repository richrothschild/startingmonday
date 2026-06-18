import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/require-auth')
vi.mock('@/lib/feature-docs')

import { POST } from './route'
import { requireAuth, withAuthCookies } from '@/lib/require-auth'
import { loadAllFeatureDocs, searchFeatureDocs } from '@/lib/feature-docs'
import type { FeatureDocRecord, FeatureDocSearchResult } from '@/lib/feature-docs'

const mockRequireAuth = vi.mocked(requireAuth)
const mockWithAuthCookies = vi.mocked(withAuthCookies)
const mockLoadAllFeatureDocs = vi.mocked(loadAllFeatureDocs)
const mockSearchFeatureDocs = vi.mocked(searchFeatureDocs)

beforeEach(() => {
  vi.resetAllMocks()
  mockRequireAuth.mockResolvedValue({ ok: true as const, userId: 'user-1', response: new NextResponse() })
  mockWithAuthCookies.mockImplementation((response) => response)
})

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('https://startingmonday.app/api/features/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/features/chat auth guard', () => {
  it('returns 401 when unauthenticated', async () => {
    mockRequireAuth.mockResolvedValue({ ok: false as const, response: new NextResponse(null, { status: 401 }) })

    const response = await POST(makeRequest({ question: 'pricing' }))

    expect(response.status).toBe(401)
    expect(mockLoadAllFeatureDocs).not.toHaveBeenCalled()
  })
})

describe('POST /api/features/chat success and validation', () => {
  it('returns 400 for invalid short question', async () => {
    const response = await POST(makeRequest({ question: 'hi' }))

    expect(response.status).toBe(400)
  })

  it('returns 503 when docs are unavailable', async () => {
    mockLoadAllFeatureDocs.mockResolvedValue([])

    const response = await POST(makeRequest({ question: 'How does pricing work?' }))

    expect(response.status).toBe(503)
  })

  it('returns ranked response when docs exist', async () => {
    const docs: FeatureDocSearchResult[] = [
      { title: 'Pricing', summary: 'Pricing options', snippet: 'starts at', score: 10 },
      { title: 'Onboarding', summary: 'Onboarding path', snippet: 'setup', score: 8 },
    ].map((entry, index) => ({
      ...entry,
      slug: `doc-${index + 1}`,
      url: `/features/doc-${index + 1}`,
      category: 'features',
      persona: 'executives',
    }))

    const loadedDocs: FeatureDocRecord[] = [
      {
        slug: 'doc-1',
        title: 'Pricing',
        summary: 'Pricing options',
        persona: 'executives',
        category: 'features',
        filePath: 'docs/features/features-executives.md',
        lineCount: 20,
        headingCount: 3,
        lastLine: 'end',
        content: 'Pricing details and tiers',
      },
    ]

    mockLoadAllFeatureDocs.mockResolvedValue(loadedDocs)
    mockSearchFeatureDocs.mockReturnValue(docs)

    const response = await POST(makeRequest({ question: 'pricing details' }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.answer).toContain('Pricing-oriented matches')
    expect(body.sources).toHaveLength(2)
    expect(body.confidence).toBeGreaterThan(0)
  })
})
