import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ExecutiveBriefHub, type ExecutiveBriefHubData } from './executive-brief-hub'

export const metadata = {
  title: 'Executive Brief - Starting Monday',
}

type ProfileRow = {
  full_name: string | null
  onboarding_completed_at: string | null
  briefing_timezone: string | null
}

type CompanyRow = {
  id: string
  name: string
  stage: string
}

type ContactRow = {
  id: string
  name: string
  title: string | null
  company_id: string | null
  outreach_status: string | null
}

type BriefRow = {
  id: string
  type: string
  output_text: string
  created_at: string
  company_id: string | null
  contact_id: string | null
  section_name: string | null
}

type InterviewLogRow = {
  id: string
  company_id: string
  interview_date: string | null
  interview_stage: string | null
  questions_asked: string | null
  what_landed: string | null
  what_surprised: string | null
  follow_up_needed: string | null
  created_at: string
}

function summarize(text: string, maxChars = 220): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxChars) return normalized
  return `${normalized.slice(0, maxChars - 3).trimEnd()}...`
}

export default async function ExecutiveBriefPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profileRaw }, { data: companiesRaw }, { data: contactsRaw }, { data: briefsRaw }, { data: logsRaw }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('full_name, onboarding_completed_at, briefing_timezone')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('companies')
      .select('id, name, stage')
      .eq('user_id', user.id)
      .is('archived_at', null)
      .order('updated_at', { ascending: false })
      .limit(80),
    supabase
      .from('contacts')
      .select('id, name, title, company_id, outreach_status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(220),
    supabase
      .from('briefs')
      .select('id, type, output_text, created_at, company_id, contact_id, section_name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(120),
    supabase
      .from('company_interview_logs')
      .select('id, company_id, interview_date, interview_stage, questions_asked, what_landed, what_surprised, follow_up_needed, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(80),
  ])

  const profile = profileRaw as ProfileRow | null
  if (!profile?.onboarding_completed_at) redirect('/onboarding')

  const companies = (companiesRaw ?? []) as CompanyRow[]
  const contacts = (contactsRaw ?? []) as ContactRow[]
  const briefs = (briefsRaw ?? []) as BriefRow[]
  const logs = (logsRaw ?? []) as InterviewLogRow[]

  const companyNameById = new Map(companies.map(company => [company.id, company.name]))

  const mappedBriefs: ExecutiveBriefHubData['briefs'] = briefs.map(brief => ({
    id: brief.id,
    type: brief.type,
    createdAt: brief.created_at,
    companyName: brief.company_id ? (companyNameById.get(brief.company_id) ?? 'Unknown company') : null,
    sectionName: brief.section_name,
    preview: summarize(brief.output_text),
    fullContent: brief.output_text,
  }))

  const peopleToReachOut = contacts
    .filter(contact => (contact.outreach_status ?? 'prospect') !== 'active_outreach')
    .slice(0, 40)
    .map(contact => ({
      id: contact.id,
      name: contact.name,
      title: contact.title,
      companyName: contact.company_id ? (companyNameById.get(contact.company_id) ?? null) : null,
      rationale: contact.outreach_status === 'prospect'
        ? 'Prospect stage with no active outreach in progress.'
        : 'Active relationship worth re-engaging based on campaign context.',
      source: 'contact' as const,
    }))

  const recentInterviewSignals = logs.slice(0, 20).map(log => ({
    id: log.id,
    companyName: companyNameById.get(log.company_id) ?? 'Unknown company',
    date: log.interview_date ?? log.created_at,
    stage: log.interview_stage,
    whatSurprised: log.what_surprised,
    followUpNeeded: log.follow_up_needed,
    whatLanded: log.what_landed,
  }))

  const data: ExecutiveBriefHubData = {
    userName: profile.full_name,
    companies: companies.map(company => ({ id: company.id, name: company.name, stage: company.stage })),
    briefs: mappedBriefs,
    peopleToReachOut,
    recentInterviewSignals,
  }

  return <ExecutiveBriefHub data={data} />
}
