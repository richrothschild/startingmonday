import { type NextRequest } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const supabase = await createClient()
  const { data } = await supabase
    .from('conversations')
    .select('id, messages')
    .eq('user_id', auth.userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return Response.json({ id: data?.id ?? null, messages: data?.messages ?? [] })
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  let messages: unknown, conversationId: string | null
  try {
    const body = await request.json()
    messages = body?.messages
    conversationId = body?.conversationId ?? null
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const supabase = await createClient()

  if (conversationId) {
    // Rate limit: reject if this conversation was updated within the last 500ms.
    const { data: existing } = await supabase
      .from('conversations')
      .select('updated_at')
      .eq('id', conversationId)
      .eq('user_id', auth.userId)
      .maybeSingle()

    if (existing?.updated_at) {
      const age = Date.now() - new Date(existing.updated_at).getTime()
      if (age < 500) {
        return new Response(JSON.stringify({ error: 'Too many requests' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    await supabase
      .from('conversations')
      .update({ messages })
      .eq('id', conversationId)
      .eq('user_id', auth.userId)
  } else {
    const { data } = await supabase
      .from('conversations')
      .insert({ user_id: auth.userId, messages })
      .select('id')
      .single()
    return Response.json({ id: data?.id ?? null })
  }

  return Response.json({ id: conversationId })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  let conversationId: string | null
  try {
    const body = await request.json()
    conversationId = body?.conversationId ?? null
  } catch {
    return Response.json({ ok: true })
  }
  if (!conversationId) return Response.json({ ok: true })

  const supabase = await createClient()
  await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', auth.userId)

  return Response.json({ ok: true })
}
