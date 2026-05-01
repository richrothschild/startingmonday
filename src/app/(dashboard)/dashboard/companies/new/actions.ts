'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function addCompany(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string ?? '').trim()
  const sector = (formData.get('sector') as string ?? '').trim() || null
  const stage = (formData.get('stage') as string) || 'watching'
  const fitRaw = formData.get('fit_score') as string
  const fitScore = fitRaw ? Number(fitRaw) : null
  const careerPageUrl = (formData.get('career_page_url') as string ?? '').trim() || null
  const notes = (formData.get('notes') as string ?? '').trim() || null

  if (!name) redirect('/dashboard/companies/new?error=required')

  const { error } = await supabase.from('companies').insert({
    user_id: user.id,
    name,
    sector,
    stage,
    fit_score: fitScore,
    career_page_url: careerPageUrl,
    notes,
  })

  if (error?.code === '23505') redirect('/dashboard/companies/new?error=duplicate')
  if (error) throw error

  redirect('/dashboard')
}
