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

  const { messages, conversationId } = await request.json()
  const supabase = await createClient()

  if (conversationId) {
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

  const { conversationId } = await request.json()
  if (!conversationId) return Response.json({ ok: true })

  const supabase = await createClient()
  await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', auth.userId)

  return Response.json({ ok: true })
}
