import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { userId } = auth

  let name: string
  try {
    const body = await request.json()
    name = typeof body.name === 'string' ? body.name.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  if (name.length > 200) {
    return NextResponse.json({ error: 'name too long' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('companies')
    .insert({ user_id: userId, name, stage: 'watching' })
    .select('id, name, stage')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'already_exists' }, { status: 409 })
    }
    console.error(JSON.stringify({ ts: new Date().toISOString(), event: 'quick_add_error', error: error.message, userId }))
    return NextResponse.json({ error: 'Failed to add company' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id, name: data.name, stage: data.stage })
}
