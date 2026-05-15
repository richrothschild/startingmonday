import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OutreachClient } from './outreach-client'

export const metadata = { title: 'Draft Outreach - Starting Monday' }

export default async function OutreachPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: contact }, { data: history }, { data: profileData }] = await Promise.all([
    supabase
      .from('contacts')
      .select('id, name, title, firm, channel, notes, email, linkedin_url, company_id, companies(name)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('briefs')
      .select('id, output_text, created_at')
      .eq('user_id', user.id)
      .eq('contact_id', id)
      .eq('type', 'outreach')
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('user_profiles')
      .select('role_type, full_name, target_titles, resume_text, positioning_summary, briefing_time')
      .eq('user_id', user.id)
      .single(),
  ])

  const companyId = (contact as typeof contact & { company_id?: string | null })?.company_id ?? null
  const { data: recentSignals } = companyId
    ? await supabase
        .from('company_signals')
        .select('id, signal_type, signal_summary, signal_date')
        .eq('company_id', companyId)
        .eq('user_id', user.id)
        .neq('signal_type', 'pattern_alert')
        .order('signal_date', { ascending: false })
        .limit(3)
    : { data: null }

  if (!contact) notFound()

  const profileSections = [
    !!(profileData?.role_type && profileData?.full_name),
    ((profileData?.target_titles as string[] | null)?.length ?? 0) > 0,
    (profileData?.resume_text?.length ?? 0) >= 200,
    (profileData?.positioning_summary?.length ?? 0) >= 50,
    !!profileData?.briefing_time,
  ]
  const profileScore = Math.round((profileSections.filter(Boolean).length / 5) * 100)

  const c = contact as typeof contact & { companies?: { name: string } | null; email?: string | null; linkedin_url?: string | null }

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
        email: c.email ?? null,
        linkedin_url: c.linkedin_url ?? null,
      }}
      history={(history ?? []).map(h => ({
        id: h.id,
        text: h.output_text,
        createdAt: h.created_at,
      }))}
      profileScore={profileScore}
      roleType={profileData?.role_type ?? null}
      fullName={profileData?.full_name ?? null}
      recentSignals={(recentSignals ?? []).map(s => ({
        signalType: s.signal_type,
        summary: s.signal_summary,
        date: s.signal_date,
      }))}
    />
  )
}
