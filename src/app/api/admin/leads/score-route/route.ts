import { type NextRequest, NextResponse } from 'next/server'
import { validateCronRequest } from '@/lib/cron-auth'
import { requireAuth, withAuthCookies } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember } from '@/lib/staff'
import { routeLead, scoreLead } from '@/lib/lead-scoring'

type ScoreRequest = {
  limit?: number
  userId?: string
  dryRun?: boolean
}

async function parsePayload(request: NextRequest): Promise<ScoreRequest> {
  if (request.method !== 'POST') return {}
  try {
    const body = (await request.json()) as ScoreRequest
    return body ?? {}
  } catch {
    return {}
  }
}

async function runScoring(request: NextRequest) {
  const isCronRequest = validateCronRequest(request)
  const auth = await requireAuth(request)

  if (!auth.ok && !isCronRequest) {
    return auth.response
  }

  if (auth.ok && !isCronRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const staff = await getStaffMember(user.email ?? '')
    if (!staff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const payload = await parsePayload(request)
  const queryLimit = Number(request.nextUrl.searchParams.get('limit') ?? payload.limit ?? 500)
  const limit = Number.isFinite(queryLimit) ? Math.max(1, Math.min(queryLimit, 5000)) : 500
  const userId = request.nextUrl.searchParams.get('userId') ?? payload.userId
  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1' || payload.dryRun === true

  const admin = createAdminClient()
  let query = admin
    .from('contacts')
    .select('id, user_id, title, channel, status, outreach_status, is_priority, email, linkedin_url, notes, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (userId) query = query.eq('user_id', userId)

  const { data: contacts, error: loadError } = await query
  if (loadError) {
    const failure = NextResponse.json({ error: loadError.message }, { status: 500 })
    return auth.ok ? withAuthCookies(failure, auth) : failure
  }

  const rows = contacts ?? []
  let updated = 0
  const routed: Record<'hot' | 'warm' | 'nurture', number> = { hot: 0, warm: 0, nurture: 0 }
  const byChannel: Record<string, number> = {}

  for (const contact of rows) {
    const ageDays = Math.max(0, Math.floor((Date.now() - new Date(contact.created_at).getTime()) / 86_400_000))
    const { score, reasons } = scoreLead({
      title: contact.title,
      channel: contact.channel,
      outreachStatus: contact.outreach_status,
      isPriority: contact.is_priority,
      hasEmail: !!contact.email,
      hasLinkedIn: !!contact.linkedin_url,
      hasNotes: !!contact.notes,
      leadAgeDays: ageDays,
      status: contact.status,
    })
    const routing = routeLead(score)

    routed[routing.queue] += 1
    const channelKey = (contact.channel ?? 'unknown').toLowerCase()
    byChannel[channelKey] = (byChannel[channelKey] ?? 0) + 1

    if (!dryRun) {
      const { error: updateError } = await admin
        .from('contacts')
        .update({
          lead_score: score,
          lead_tier: routing.tier,
          lead_queue: routing.queue,
          lead_score_reasons: reasons,
          lead_scored_at: new Date().toISOString(),
          lead_routed_at: new Date().toISOString(),
        })
        .eq('id', contact.id)

      if (!updateError) {
        updated += 1
      }
    }
  }

  const success = NextResponse.json({
    ok: true,
    processed: rows.length,
    updated: dryRun ? 0 : updated,
    dryRun,
    routed,
    byChannel,
    trigger: isCronRequest ? 'cron' : 'admin',
  })

  return auth.ok ? withAuthCookies(success, auth) : success
}

export async function GET(request: NextRequest) {
  return runScoring(request)
}

export async function POST(request: NextRequest) {
  return runScoring(request)
}
