import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { parsePixelTokenLegacyForTelemetry, parsePixelTokenSigned } from '@/lib/pixel-token'

// 1x1 transparent GIF
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
)

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('t')
  const payload = token ? parsePixelTokenSigned(token) : null

  if (!payload && token) {
    const legacyPayload = parsePixelTokenLegacyForTelemetry(token)
    if (legacyPayload) {
      console.warn(
        `[pixel] rejected unsigned token for uid=${legacyPayload.uid} type=${legacyPayload.type}`,
      )
    }
  }

  if (payload) {
    const ip =
      request.headers.get('x-real-ip') ??
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      null
    const ua = request.headers.get('user-agent') ?? null

    // Fire-and-forget - never delay the pixel response for a DB write.
    void (async () => {
      const { error } = await createAdminClient()
        .from('watermark_events')
        .insert({
          user_id: payload.uid,
          email_type: payload.type,
          sent_date: payload.d || null,
          open_ip: ip,
          user_agent: ua,
          raw_token: token ? createHash('sha256').update(token).digest('hex') : null,
          token_signed: true,
        })

      if (error) {
        // Silently fail - never block pixel response
        console.error('[pixel] failed to log event:', error.message)
      }
    })()
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type':  'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma':        'no-cache',
      'Expires':       '0',
    },
  })
}
