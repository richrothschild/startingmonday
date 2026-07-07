import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ApolloEnrichmentProvider } from './apollo-provider'

const okJson = (body: unknown) => ({ ok: true, json: async () => body })
const failJson = () => ({ ok: false, json: async () => ({}) })

describe('ApolloEnrichmentProvider', () => {
  const provider = new ApolloEnrichmentProvider()
  let originalKey: string | undefined

  beforeEach(() => {
    originalKey = process.env.APOLLO_API_KEY
    process.env.APOLLO_API_KEY = 'test-key'
  })
  afterEach(() => {
    if (originalKey === undefined) delete process.env.APOLLO_API_KEY
    else process.env.APOLLO_API_KEY = originalKey
    vi.unstubAllGlobals()
  })

  it('returns [] and makes no request when APOLLO_API_KEY is missing', async () => {
    delete process.env.APOLLO_API_KEY
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const out = await provider.enrichPeople({ companyName: 'Acme', sector: 'MSP' })

    expect(out).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('resolves the org id by domain, then searches people by organization_ids', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(okJson({ organization: { id: 'org_123' } }))
      .mockResolvedValueOnce(okJson({ people: [{ first_name: 'Mike', last_name_obfuscated: 'Evans', title: 'COO', seniority: 'c_suite' }] }))
    vi.stubGlobal('fetch', fetchMock)

    const out = await provider.enrichPeople({ companyName: 'Ntiva', sector: 'MSP', domain: 'ntiva.com' })

    expect(fetchMock.mock.calls[0][0]).toContain('/organizations/enrich?domain=ntiva.com')
    const searchBody = JSON.parse(fetchMock.mock.calls[1][1].body)
    expect(searchBody.organization_ids).toEqual(['org_123'])
    expect(searchBody.q_organization_name).toBeUndefined()
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({ name: 'Mike E.', title: 'COO', source: 'apollo' })
  })

  it('falls back to name search when no domain is provided', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(okJson({ people: [{ first_name: 'Jane', last_name_obfuscated: 'Doe', title: 'CEO' }] }))
    vi.stubGlobal('fetch', fetchMock)

    const out = await provider.enrichPeople({ companyName: 'Acme', sector: 'MSP' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.q_organization_name).toBe('Acme')
    expect(body.organization_ids).toBeUndefined()
    expect(out[0]).toMatchObject({ name: 'Jane D.', title: 'CEO' })
  })

  it('falls back to name search when domain resolution fails', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(failJson())
      .mockResolvedValueOnce(okJson({ people: [{ first_name: 'Sam', title: 'CIO' }] }))
    vi.stubGlobal('fetch', fetchMock)

    const out = await provider.enrichPeople({ companyName: 'Acme', sector: 'MSP', domain: 'acme.com' })

    const body = JSON.parse(fetchMock.mock.calls[1][1].body)
    expect(body.q_organization_name).toBe('Acme')
    expect(out[0]).toMatchObject({ name: 'Sam', title: 'CIO' })
  })

  it('returns [] when the people search responds non-OK', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(failJson())
    vi.stubGlobal('fetch', fetchMock)

    const out = await provider.enrichPeople({ companyName: 'Acme', sector: 'MSP' })
    expect(out).toEqual([])
  })
})
