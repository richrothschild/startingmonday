import { beforeEach, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

describe('resend webhook route auth', () => {
  beforeEach(() => {
    process.env.RESEND_WEBHOOK_SECRET = 'resend-secret'
  })

  it('returns 401 when webhook secret is missing', async () => {
    const request = new NextRequest('https://startingmonday.app/api/webhooks/resend', {
      method: 'POST',
      body: JSON.stringify({ type: 'email.delivered' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('returns 401 when webhook secret does not match', async () => {
    const request = new NextRequest('https://startingmonday.app/api/webhooks/resend', {
      method: 'POST',
      body: JSON.stringify({ type: 'email.delivered' }),
      headers: { 'x-webhook-secret': 'wrong-secret' },
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
