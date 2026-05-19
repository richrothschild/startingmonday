import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/require-auth'
import { withApiTelemetry } from '@/lib/telemetry'
import { NextRequest, NextResponse } from 'next/server'

async function postHandler(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const supabase = await createClient()

  try {
    const body = await req.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const title = typeof body?.title === 'string' ? body.title.trim() || null : null
    const firm = typeof body?.firm === 'string' ? body.firm.trim() || null : null
    const channel = typeof body?.channel === 'string' ? body.channel.trim() || null : null
    const email = typeof body?.email === 'string' ? body.email.trim() || null : null
    const linkedinUrl = typeof body?.linkedin_url === 'string' ? body.linkedin_url.trim() || null : null
    const notes = typeof body?.notes === 'string' ? body.notes.trim() || null : null
    const status = typeof body?.status === 'string' && body.status.trim() ? body.status.trim() : 'active'
    const companyId = typeof body?.company_id === 'string' && body.company_id.trim() ? body.company_id.trim() : null

    if (companyId) {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', companyId)
        .eq('user_id', auth.userId)
        .maybeSingle()

      if (companyError) {
        return NextResponse.json({ error: 'Failed to verify company' }, { status: 500 })
      }

      if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 400 })
      }
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        user_id: auth.userId,
        company_id: companyId,
        name,
        title,
        firm,
        channel,
        email,
        linkedin_url: linkedinUrl,
        notes,
        status,
      })
      .select('id, name, title, firm, channel, email, linkedin_url, notes, company_id, status, contacted_at, follow_up_at')
      .single()

    if (error) {
      console.error('[contacts] create error:', error)
      return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
    }

    return NextResponse.json({ id: data.id, contact: data }, { status: 201 })
  } catch (error) {
    console.error('[contacts] create exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withApiTelemetry('/api/contacts', postHandler)