import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/require-auth'
import { withApiTelemetry } from '@/lib/telemetry'
import { NextRequest, NextResponse } from 'next/server'

async function deleteHandler(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(_req)
  if (!auth.ok) return auth.response

  const { id } = await context.params
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId)

    if (error) {
      console.error('[contacts] delete error:', error)
      return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, deleted: true })
  } catch (error) {
    console.error('[contacts] delete exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const DELETE = withApiTelemetry('/api/contacts/[id]', deleteHandler)