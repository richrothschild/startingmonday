import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OutreachClient } from './outreach-client'

export const metadata = { title: 'Draft Outreach — Starting Monday' }

export default async function OutreachPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contact } = await supabase
    .from('contacts')
    .select('id, name, title, firm, channel, notes, companies(name)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!contact) notFound()

  const c = contact as typeof contact & { companies?: { name: string } | null }

  return (
    <OutreachClient
      contact={{
        id: c.id,
        name: c.name,
        title: c.title ?? null,
        firm: c.firm ?? null,
        channel: c.channel ?? null,
        notes: c.notes ?? null,
        company_name: c.companies?.name ?? null,
      }}
    />
  )
}
