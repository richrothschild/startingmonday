'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { markOfferAccepted, logEvent } from '@/lib/events'
import { captureServerEvent } from '@/lib/posthog-server'

const VALID_STAGES = ['watching', 'researching', 'applied', 'interviewing', 'offer']

export async function moveCompanyStage(companyId: string, stage: string): Promise<{ ok: boolean }> {
  if (!VALID_STAGES.includes(stage)) return { ok: false }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false }

  const { error } = await supabase
    .from('companies')
    .update({ stage })
    .eq('id', companyId)
    .eq('user_id', user.id)

  if (error) return { ok: false }

  if (stage === 'offer') {
    await markOfferAccepted(user.id)
    await logEvent(user.id, 'offer_accepted', { company_id: companyId })
    captureServerEvent(user.id, 'offer_accepted', { company_id: companyId })
  }

  await logEvent(user.id, 'pipeline_stage_changed', { company_id: companyId, stage })
  captureServerEvent(user.id, 'pipeline_stage_changed', { company_id: companyId, stage })

  revalidatePath('/dashboard/kanban')
  revalidatePath('/dashboard')
  return { ok: true }
}
