import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { logEvent } from '@/lib/events'
import { captureServerEvent } from '@/lib/posthog-server'

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { userId } = auth
  const body = await request.json().catch(() => null)

  if (!body?.type || !body?.text) {
    return NextResponse.json({ error: 'Missing type or text' }, { status: 400 })
  }

  const { type, text, company_id, contact_id } = body as {
    type: string
    text: string
    company_id?: string
    contact_id?: string
  }

  if (!['strategy', 'prep', 'prep_section', 'outreach'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('briefs')
    .insert({
      user_id: userId,
      type,
      output_text: text,
      company_id: company_id ?? null,
      contact_id: contact_id ?? null,
    })
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to save brief' }, { status: 500 })
  }

  if (type === 'prep' || type === 'strategy_brief_generated') {
    const eventName = type === 'prep' ? 'prep_brief_generated' : 'strategy_brief_generated'
    await logEvent(userId, eventName, { type, company_id: company_id ?? null })
    captureServerEvent(userId, eventName, { type, company_id: company_id ?? null })
  }

  return NextResponse.json({ id: data.id })
}
