'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
import { logEvent, logCompanyWatch } from '@/lib/events'
import { captureServerEvent } from '@/lib/posthog-server'
import { str, numOrNull } from '@/lib/form-utils'

export async function addCompany(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (isDemoUser(user.id)) redirect('/signup?from=demo')

  const name          = str(formData, 'name')
  const sector        = str(formData, 'sector') || null
  const stage         = str(formData, 'stage') || 'watching'
  const fitScore      = numOrNull(formData, 'fit_score')
  const companyUrl    = str(formData, 'company_url') || null
  const careerPageUrl = str(formData, 'career_page_url') || null
  const notes         = str(formData, 'notes') || null
  const validSizes    = ['startup', 'midmarket', 'enterprise'] as const
  const companySize   = validSizes.find(v => v === str(formData, 'company_size')) ?? null

  if (!name) redirect('/dashboard/companies/new?error=required')

  const { data: inserted, error } = await supabase.from('companies').insert({
    user_id: user.id,
    name,
    sector,
    stage,
    fit_score: fitScore,
    company_url: companyUrl,
    career_page_url: careerPageUrl,
    notes,
    company_size: companySize,
  }).select('id').single()

  if (error?.code === '23505') redirect('/dashboard/companies/new?error=duplicate')
  if (error) throw error

  if (inserted?.id && careerPageUrl && process.env.WORKER_URL && process.env.WORKER_SECRET) {
    fetch(`${process.env.WORKER_URL}/trigger-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-worker-secret': process.env.WORKER_SECRET },
      body: JSON.stringify({ companyId: inserted.id, userId: user.id }),
    }).catch(err => console.error('[scan-trigger] failed to reach worker:', err))
  }

  await logEvent(user.id, 'company_added', { career_page_url_present: !!careerPageUrl, sector: sector ?? '' })
  captureServerEvent(user.id, 'company_added', { career_page_url_present: !!careerPageUrl, sector: sector ?? '' })
  if (inserted?.id) {
    await logCompanyWatch(user.id, inserted.id, {
      sector,
      careerPageUrlPresent: !!careerPageUrl,
      fitScore,
      stage,
    })
  }

  redirect(`/dashboard/companies/${inserted.id}?scanning=1`)
}
