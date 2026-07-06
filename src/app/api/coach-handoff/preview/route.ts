import { type NextRequest, NextResponse } from 'next/server'
import { mapCoachHandoffToPreview, type CoachHandoffPayload } from '@/lib/coach-handoff-import'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  let body: CoachHandoffPayload
  try {
    body = await request.json()
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
