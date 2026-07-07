import { type NextRequest, NextResponse } from 'next/server'
import { mapCoachHandoffToPreview, type CoachHandoffPayload } from '@/lib/coach-handoff-import'

export const runtime = 'nodejs'
const MAX_BODY_BYTES = 64 * 1024

export async function POST(request: NextRequest) {
  let body: CoachHandoffPayload
  try {
    const rawBody = await request.text()
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: 'Payload too large' }, { status: 413 })
    }
    body = JSON.parse(rawBody) as CoachHandoffPayload
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const preview = mapCoachHandoffToPreview(body)

  if (!preview.positioningSummary && preview.targetSectors.length === 0 && preview.targetCompanies.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: 'No usable handoff fields found. Include at least one of: career vision, industries, or companies.',
      },
      { status: 400 }
    )
  }

  return NextResponse.json({ ok: true, preview })
}
