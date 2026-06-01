import { type NextRequest, NextResponse } from 'next/server'

/**
 * Safe dry-run publish endpoint for production automation verification.
 *
 * Configure MAKE_WEBHOOK_URL to this endpoint with a token query param:
 * /api/admin/social/mock-publish?token=...
 */
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const expected = process.env.SOCIAL_DRY_RUN_WEBHOOK_TOKEN

  if (!token || !expected || token !== expected) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)

  const postUrn = `urn:li:ugcPost:dryrun-${Date.now()}`

  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    event: 'social_mock_publish',
    dryRunMode: true,
    post_date: body?.post_date ?? null,
    pillar: body?.pillar ?? null,
    audience: body?.audience ?? null,
    post_target: body?.post_target ?? null,
    has_text: typeof body?.text === 'string' && body.text.length > 0,
  }))

  return NextResponse.json({
    ok: true,
    dryRunMode: true,
    linkedin_post_urn: postUrn,
  })
}
