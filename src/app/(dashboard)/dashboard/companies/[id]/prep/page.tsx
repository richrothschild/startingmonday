import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PrepClient } from './prep-client'

const STAGE_LABEL: Record<string, string> = {
  watching:     'Watching',
  researching:  'Researching',
  applied:      'In Process',
  interviewing: 'Interviewing',
  offer:        'Offer',
}

export default async function PrepPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase
    .from('companies')
    .select('name, stage')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('archived_at', null)
    .single()

  if (!company) notFound()

  return (
    <PrepClient
      companyId={id}
      companyName={company.name}
      stageLabel={STAGE_LABEL[company.stage] ?? company.stage}
    />
  )
}
