import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { logEvent, logCompanyWatch } from '@/lib/events'
import { captureServerEvent } from '@/lib/posthog-server'
import { PMF_EVENTS } from '@/lib/pmf-event-taxonomy'

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { userId } = auth
  const supabase = await createClient()

  let name: string, sector: string | null, fitScore: number | null
  try {
    const body = await request.json()
    name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : ''
    sector = typeof body.sector === 'string' && body.sector.trim() ? body.sector.trim().slice(0, 100) : null
    fitScore = typeof body.fit_score === 'number' && body.fit_score >= 1 && body.fit_score <= 10
      ? Math.round(body.fit_score)
      : null
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const { data: inserted, error } = await supabase
    .from('companies')
    .insert({ user_id: userId, name, sector, fit_score: fitScore, stage: 'watching' })
    .select('id')
    .single()

  if (error?.code === '23505') {
    return NextResponse.json({ error: 'duplicate' }, { status: 409 })
  }
  if (error) {
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  await logEvent(userId, 'company_added', { source: 'discover', sector: sector ?? '' })
  captureServerEvent(userId, 'company_added', { source: 'discover', sector: sector ?? '' })
  await logEvent(userId, PMF_EVENTS.activation.first_company_added, { source: 'discover', company_id: inserted?.id ?? null })
  captureServerEvent(userId, PMF_EVENTS.activation.first_company_added, { source: 'discover', company_id: inserted?.id ?? null })
  if (inserted?.id) {
    await logCompanyWatch(userId, inserted.id, { sector, careerPageUrlPresent: false, fitScore, stage: 'watching' })
  }

  return NextResponse.json({ id: inserted?.id })
}
