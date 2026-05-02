'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

function numOrNull(formData: FormData, key: string): number | null {
  const raw = formData.get(key)
  if (!raw) return null
  const v = Number(raw)
  return Number.isFinite(v) ? v : null
}

export async function addCompany(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name          = str(formData, 'name')
  const sector        = str(formData, 'sector') || null
  const stage         = str(formData, 'stage') || 'watching'
  const fitScore      = numOrNull(formData, 'fit_score')
  const careerPageUrl = str(formData, 'career_page_url') || null
  const notes         = str(formData, 'notes') || null

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
