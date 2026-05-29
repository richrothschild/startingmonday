import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { logEvent } from '@/lib/events'
import { captureServerEvent } from '@/lib/posthog-server'
import { watermarkText } from '@/lib/watermark'
import { PMF_EVENTS } from '@/lib/pmf-event-taxonomy'
import {
  PREP_PROVENANCE_VERSION,
  type PrepClaimProvenance,
  validatePrepClaimProvenance,
} from '@/lib/prep-provenance'

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { userId } = auth
  const body = await request.json().catch(() => null)

  if (!body?.type || !body?.text) {
    return NextResponse.json({ error: 'Missing type or text' }, { status: 400 })
  }

  const { type, text, company_id, contact_id, section_name, claim_provenance, provenance_version } = body as {
    type: string
    text: string
    company_id?: string
    contact_id?: string
    section_name?: string
    claim_provenance?: PrepClaimProvenance[]
    provenance_version?: number
  }

  if (!['strategy', 'prep', 'prep_section', 'outreach'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const isPrepType = type === 'prep' || type === 'prep_section'
  let validatedClaimProvenance: PrepClaimProvenance[] | null = null

  if (isPrepType) {
    if (!Array.isArray(claim_provenance)) {
      return NextResponse.json({ error: 'Missing claim_provenance for prep brief write' }, { status: 400 })
    }

    const errors = validatePrepClaimProvenance(claim_provenance)
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid claim_provenance payload', details: errors.slice(0, 3) },
        { status: 400 },
      )
    }

    validatedClaimProvenance = claim_provenance
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('briefs')
    .insert({
      user_id: userId,
      type,
      output_text: watermarkText(text, userId),
      company_id: company_id ?? null,
      contact_id: contact_id ?? null,
      section_name: section_name ?? null,
      provenance_version: isPrepType ? (provenance_version ?? PREP_PROVENANCE_VERSION) : null,
      claim_provenance: isPrepType ? validatedClaimProvenance : null,
    })
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to save brief' }, { status: 500 })
  }

  if (type === 'prep' || type === 'strategy') {
    const eventName = type === 'prep'
      ? PMF_EVENTS.prep.prep_brief_generated
      : 'strategy_brief_generated'
    await logEvent(userId, eventName, { type, company_id: company_id ?? null })
    captureServerEvent(userId, eventName, { type, company_id: company_id ?? null })

    if (type === 'prep') {
      await logEvent(userId, PMF_EVENTS.activation.first_prep_generated, { company_id: company_id ?? null })
      captureServerEvent(userId, PMF_EVENTS.activation.first_prep_generated, { company_id: company_id ?? null })
    }
  }

  return NextResponse.json({ id: data.id })
}
