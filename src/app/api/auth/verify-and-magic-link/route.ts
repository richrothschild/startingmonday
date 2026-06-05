import { type NextRequest, NextResponse } from 'next/server'
import { enforcePublicEndpointGuard } from '@/lib/public-endpoint-guard'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const guardResponse = await enforcePublicEndpointGuard({
    request,
    rateLimitKey: 'magic-link',
    maxPerMinute: 5,
    requireCaptcha: true,
  })
  if (guardResponse) return guardResponse

  return NextResponse.json(
    {
      ok: false,
      error: 'Magic link sign-in is disabled. Use password or social sign-in.',
      code: 'MAGIC_LINK_DISABLED',
    },
    { status: 410 },
  )
}