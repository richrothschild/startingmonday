import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PrepClient } from './prep-client'
import type { InterviewStage } from '@/lib/prompts'

const VALID_STAGES: InterviewStage[] = [
  'informal_meeting', 'first_interview', 'executive_interview', 'board_presentation', 'final_round',
]

const STAGE_LABEL: Record<string, string> = {
  watching:     'Watching',
  researching:  'Researching',
  applied:      'In Process',
  interviewing: 'Interviewing',
  offer:        'Offer',
}

export default async function PrepPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ first?: string; stage?: string }>
}) {
  const { id } = await params
  const { first, stage } = await searchParams
  const isFirstCompany = first === '1'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: company }, { count: contactCount }, { data: profile }] = await Promise.all([
    supabase
      .from('companies')
      .select('name, stage, notes, interview_notes')
      .eq('id', id)
      .eq('user_id', user.id)
      .is('archived_at', null)
      .single(),
    supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active'),
    supabase
      .from('user_profiles')
      .select('role_type, positioning_summary, target_titles, career_history_json, full_name, resume_text, briefing_time')
      .eq('user_id', user.id)
      .single(),
  ])

  if (!company) notFound()

  const hasCareerHistory = Array.isArray(profile?.career_history_json) && (profile.career_history_json as unknown[]).length > 0
  const hasPositioning = !!(profile?.positioning_summary?.trim())
  const hasTargetTitles = (profile?.target_titles ?? []).length > 0

  const profileScore = Math.round(([
    !!(profile?.role_type && profile?.full_name),
    ((profile?.target_titles as string[] | null)?.length ?? 0) > 0,
    (profile?.resume_text?.length ?? 0) >= 200,
    (profile?.positioning_summary?.length ?? 0) >= 50,
    !!profile?.briefing_time,
  ].filter(Boolean).length / 5) * 100)

  return (
    <main>
      <h1 className="sr-only">Interview Prep Brief</h1>
      <nav className="sr-only" aria-label="Prep quick actions">
        <Link href={`/dashboard/companies/${id}`}>Back to company page</Link>
        <Link href={`/dashboard/companies/${id}/prep?stage=first_interview`}>Start first interview prep</Link>
        <Link href="/dashboard/briefing">Open daily briefing</Link>
      </nav>
      <PrepClient
        companyId={id}
        companyName={company.name}
        companyStage={company.stage}
        stageLabel={STAGE_LABEL[company.stage] ?? company.stage}
        hasContacts={(contactCount ?? 0) > 0}
        hasNotes={!!(company.notes?.trim())}
        hasInterviewNotes={!!(company.interview_notes?.trim())}
        roleType={profile?.role_type ?? null}
        hasCareerHistory={hasCareerHistory}
        hasPositioning={hasPositioning}
        hasTargetTitles={hasTargetTitles}
        profileScore={profileScore}
        firstCompany={isFirstCompany}
        initialStage={VALID_STAGES.includes(stage as InterviewStage) ? (stage as InterviewStage) : undefined}
      />
    </main>
  )
}
