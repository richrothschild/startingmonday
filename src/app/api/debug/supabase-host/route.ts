import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  try {
    const parsed = new URL(url)
    const startedAt = Date.now()
    const response = await fetch(parsed.toString(), { method: 'HEAD' })
    const latencyMs = Date.now() - startedAt

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      latencyMs,
      host: parsed.host,
      protocol: parsed.protocol,
      urlLooksValid: true,
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      host: url ? (() => {
        try {
          return new URL(url).host
        } catch {
          return null
        }
      })() : null,
      urlLooksValid: Boolean(url),
      error: error instanceof Error ? error.message : 'unknown_error',
    }, { status: 500 })
  }
}