'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
import { logEvent, logCompanyWatch } from '@/lib/events'
import { captureServerEvent } from '@/lib/posthog-server'
import { str, numOrNull } from '@/lib/form-utils'

function normalizeUrl(raw: string | null): string | null {
  if (!raw) return null
  const t = raw.trim()
  if (!t) return null
  return /^https?:\/\//i.test(t) ? t : `https://${t}`
}

export async function addCompany(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (isDemoUser(user.id)) redirect('/signup?from=demo')

  const name          = str(formData, 'name')
  const sector        = str(formData, 'sector') || null
  const stage         = str(formData, 'stage') || 'watching'
  const fitScore      = numOrNull(formData, 'fit_score')
  const companyUrl    = normalizeUrl(str(formData, 'company_url'))
  const careerPageUrl = normalizeUrl(str(formData, 'career_page_url'))
  const notes         = str(formData, 'notes') || null
  const validSizes    = ['startup', 'midmarket', 'enterprise'] as const
  const companySize   = validSizes.find(v => v === str(formData, 'company_size')) ?? null

  if (!name) redirect('/dashboard/companies/new?error=required')

  const { data: userRow } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()
  const tier = userRow?.subscription_tier ?? 'free'
  const hasUnlimitedPipeline = tier === 'executive' || tier === 'campaign'

  if (!hasUnlimitedPipeline) {
    const { count: currentCount } = await supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('archived_at', null)
    if ((currentCount ?? 0) >= 25) redirect('/dashboard/companies/new?error=limit')
  }

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

  const { count: companyCount } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('archived_at', null)

  if (companyCount === 1) {
    await supabase
      .from('users')
      .update({ first_company_added_at: new Date().toISOString() })
      .eq('id', user.id)
      .is('first_company_added_at', null)
    redirect(`/dashboard/companies/${inserted.id}/prep?first=1`)
  }
  redirect(`/dashboard/companies/${inserted.id}?scanning=1`)
}
