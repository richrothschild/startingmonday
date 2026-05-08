import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (!q || q.length < 2) return NextResponse.json({ companies: [], contacts: [] })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: companies }, { data: contacts }] = await Promise.all([
    supabase
      .from('companies')
      .select('id, name, stage, sector')
      .eq('user_id', user.id)
      .is('archived_at', null)
      .ilike('name', `%${q}%`)
      .limit(5),
    supabase
      .from('contacts')
      .select('id, full_name, title, company_name')
      .eq('user_id', user.id)
      .ilike('full_name', `%${q}%`)
      .limit(5),
  ])

  return NextResponse.json({ companies: companies ?? [], contacts: contacts ?? [] })
}
