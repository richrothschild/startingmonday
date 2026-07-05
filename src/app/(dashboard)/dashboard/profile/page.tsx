import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { saveProfile } from './actions'
import { TagInput } from '@/components/TagInput'
import { getActivationStatus } from '@/lib/activation'
import { ProfileInactivityNudge } from '@/components/ProfileInactivityNudge'
import { PositioningGeneratorTextarea } from './positioning-generator'
import { LinkedInGenerator } from './linkedin-generator'
import { canUserSeeAdminHeader } from '@/lib/staff'
import { ProfileAdvancedPanels } from './profile-advanced-panels'

const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const ABBR_TO_FULL: Record<string, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday',
  Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { saved, error: saveError } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  type ProfileRow = {
    full_name: string | null
    current_title: string | null
    current_company: string | null
    briefing_time: string | null
    briefing_days: string[] | null
    briefing_timezone: string | null
    briefing_email: string | null
    target_titles: string[] | null
    target_sectors: string[] | null
    target_locations: string[] | null
    positioning_summary: string | null
    resume_text: string | null
    beyond_resume: string | null
    linkedin_url: string | null
    linkedin_headline: string | null
    linkedin_about: string | null
    search_persona: string | null
    role_type: string | null
    role_context: Record<string, unknown> | null
    star_stories: unknown[] | null
  }

  const [{ data: rawProfile }, activation] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('full_name, current_title, current_company, briefing_time, briefing_days, briefing_timezone, briefing_email, target_titles, target_sectors, target_locations, positioning_summary, resume_text, beyond_resume, linkedin_url, linkedin_headline, linkedin_about, search_persona, role_type, role_context, star_stories')
      .eq('user_id', user.id)
      .single(),
    getActivationStatus(user.id),
  ])
  const profile = rawProfile as ProfileRow | null

  const activeDays = (profile?.briefing_days ?? DEFAULT_DAYS).map((day: string) => ABBR_TO_FULL[day] ?? day)
  const briefingTime = profile?.briefing_time ? profile.briefing_time.slice(0, 5) : '07:00'
  const targetTitles = (profile?.target_titles ?? []).join(', ')
  const targetSectors = (profile?.target_sectors ?? []).join(', ')
  const targetLocations = (profile?.target_locations ?? []).join(', ')
  const positioningSummary = profile?.positioning_summary ?? ''
  const resumeText = profile?.resume_text ?? ''
  const beyondResume = profile?.beyond_resume ?? ''
  const linkedinUrl = profile?.linkedin_url ?? ''
  const linkedinHeadline = profile?.linkedin_headline ?? ''
  const linkedinAbout = profile?.linkedin_about ?? ''
  const roleCtx = (profile?.role_context as Record<string, unknown> | null) ?? {}
  const securityFrameworks = ((roleCtx.security_frameworks as string[] | null) ?? []).join(', ')
  const boardSecurityMaturity = (roleCtx.board_security_maturity as string | null) ?? ''
  const productTypeExp = (roleCtx.product_type_exp as string | null) ?? ''
  const productAchievement = (roleCtx.product_achievement as string | null) ?? ''
  const productMetric = (roleCtx.product_metric as string | null) ?? ''
  const cooMandateTypes = (roleCtx.coo_mandate_types as string[] | null) ?? []
  const cooCeoPartnership = (roleCtx.coo_ceo_partnership as string | null) ?? ''
  const ctoTechnicalFlavor = (roleCtx.cto_technical_flavor as string[] | null) ?? []
  const ctoArchitectureDecision = (roleCtx.cto_architecture_decision as string | null) ?? ''
  const dataMaturityOrientation = (roleCtx.data_maturity_orientation as string | null) ?? ''
  const dataPlatformBuilt = (roleCtx.data_platform_built as string | null) ?? ''
  const digitalBackgroundType = (roleCtx.digital_background_type as string | null) ?? ''
  const digitalTransformationDelivered = (roleCtx.digital_transformation_delivered as string | null) ?? ''
  const starStories = Array.isArray(profile?.star_stories) ? (profile.star_stories as never[]) : []
  const beyondResumePlaceholder =
    (profile?.role_type === 'cio' ? 'Highlight your transformation record, CIO-CEO operating model, and one high-stakes decision.' : null)
    ?? (profile?.role_type === 'cto' ? 'Summarize what you built, a key architecture choice, and how you handled inherited debt.' : null)
    ?? (profile?.role_type === 'cdo_data' ? 'Describe starting data maturity, platform progress, and one business decision that improved.' : null)
    ?? (profile?.role_type === 'cdo_digital' ? 'Describe your nontraditional edge and one digital transformation outcome.' : null)
    ?? (profile?.role_type === 'ciso' ? 'List implemented frameworks, board maturity progress, and one defining security moment.' : null)
    ?? (profile?.role_type === 'cpo' ? 'State product philosophy, strongest launch, and one metric shift.' : null)
    ?? (profile?.role_type === 'coo' ? 'Summarize CEO-COO model, operating scope, and one recovery example.' : null)
    ?? (profile?.role_type === 'vp_technology' ? 'Summarize real scope, team scale, and budget ownership.' : null)
    ?? "What motivates you, your leadership philosophy, things you're proud of that don't fit in a resume..."

  const isRothschildAdmin = await canUserSeeAdminHeader(user.email ?? '')
  const progressSections = [
    { label: 'Identity', done: !!(profile?.role_type && profile?.full_name) },
    { label: 'Targets', done: ((profile?.target_titles as string[] | null)?.length ?? 0) > 0 },
    { label: 'Resume', done: (profile?.resume_text?.length ?? 0) >= 200 },
    { label: 'Positioning', done: (profile?.positioning_summary?.length ?? 0) >= 50 },
    { label: 'Briefing', done: !!profile?.briefing_time },
  ]
  const completedSections = progressSections.filter(section => section.done).length

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-400"><span className="text-white">Starting </span><span className="text-orange-500">Monday</span></span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[13px] text-slate-300 hover:text-white transition-colors">â† Dashboard</Link>
            {isRothschildAdmin && <Link href="/dashboard/admin" className="text-[13px] font-semibold text-orange-400 hover:text-orange-300 transition-colors">Admin</Link>}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Profile</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">{user.email}</p>
        </div>

        <div className="mb-6 bg-white border border-slate-200 rounded px-5 py-3.5 max-w-xl flex items-center gap-4">
          <div className="flex items-center gap-1.5 shrink-0">
            {progressSections.map((section, index) => <div key={index} title={section.label} className={`h-1.5 w-9 rounded-full transition-colors ${section.done ? 'bg-slate-900' : 'bg-slate-200'}`} />)}
          </div>
          <span className="text-[13px] font-semibold text-slate-500">{completedSections} of 5 sections complete</span>
        </div>

        <div className="mb-4 max-w-xl px-5 py-4 bg-slate-50 border border-slate-200 rounded flex items-start gap-3">
          <div className="shrink-0 mt-0.5 text-slate-400">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5C5.567 1.5 4 3.067 4 5v1H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1V5c0-1.933-1.567-3.5-3.5-3.5Zm2.5 4.5V5a2.5 2.5 0 0 0-5 0v1h5Z" fill="currentColor"/></svg>
          </div>
          <p className="text-[13px] text-slate-700 leading-relaxed">Your resume and career notes are stored only in your account and are used only to generate your briefs.</p>
        </div>

        <section id="profile-editor" className="bg-white border border-slate-200 rounded p-8 max-w-xl">
          {saved && <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded text-[13px] text-green-700">Profile saved.</div>}
          {saveError && <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded text-[13px] text-red-700">Save failed: {decodeURIComponent(saveError)}</div>}

          <form id="profile-form" action={saveProfile} className="flex flex-col gap-6">
            <section id="section-identity">
              <h2 className="block text-[13px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-3">Identity and role</h2>
              <label htmlFor="full_name" className="block text-[13px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">Full name</label>
              <input id="full_name" name="full_name" type="text" defaultValue={profile?.full_name ?? ''} placeholder="Richard Rothschild" className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="current_title" className="block text-[13px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">Current or most recent title</label>
                  <input id="current_title" name="current_title" type="text" defaultValue={profile?.current_title ?? ''} placeholder="Chief Information Officer" className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label htmlFor="current_company" className="block text-[13px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">Current or most recent company</label>
                  <input id="current_company" name="current_company" type="text" defaultValue={profile?.current_company ?? ''} placeholder="Acme Corp" className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400" />
                </div>
              </div>
            </section>

            <section id="section-targets">
              <h2 className="block text-[13px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-3">Targets</h2>
              <label htmlFor="target_titles" className="block text-[13px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">Target titles</label>
              <TagInput id="target_titles" name="target_titles" defaultValue={targetTitles} placeholder="Type a title and press Enter - CIO, VP of Technology..." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="target_sectors" className="block text-[13px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">Target sectors</label>
                  <TagInput id="target_sectors" name="target_sectors" defaultValue={targetSectors} placeholder="Healthcare, Fintech, SaaS..." />
                </div>
                <div>
                  <label htmlFor="target_locations" className="block text-[13px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">Target locations</label>
                  <TagInput id="target_locations" name="target_locations" defaultValue={targetLocations} placeholder="New York, Remote, Dallas..." />
                </div>
              </div>
            </section>

            <section id="section-positioning">
              <h2 className="block text-[13px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-3">Positioning</h2>
              <PositioningGeneratorTextarea defaultValue={positioningSummary} resumeText={resumeText} beyondResume={beyondResume} targetTitles={targetTitles} roleType={profile?.role_type ?? ''} currentTitle={profile?.current_title ?? ''} currentCompany={profile?.current_company ?? ''} />
            </section>

            <div>
              <label htmlFor="linkedin_url" className="block text-[13px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">LinkedIn URL</label>
              <input id="linkedin_url" name="linkedin_url" type="url" defaultValue={linkedinUrl} placeholder="https://www.linkedin.com/in/yourname" className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400" />
              <LinkedInGenerator positioning={positioningSummary} targetTitles={targetTitles} roleType={profile?.role_type ?? ''} currentTitle={profile?.current_title ?? ''} initialHeadline={linkedinHeadline} initialAbout={linkedinAbout} />
            </div>

            <ProfileAdvancedPanels
              resumeText={resumeText}
              beyondResume={beyondResume}
              beyondResumePlaceholder={beyondResumePlaceholder}
              linkedinUrl={linkedinUrl}
              linkedinHeadline={linkedinHeadline}
              linkedinAbout={linkedinAbout}
              targetTitles={targetTitles}
              roleType={profile?.role_type ?? ''}
              currentTitle={profile?.current_title ?? ''}
              currentCompany={profile?.current_company ?? ''}
              careerEntries={null}
              starStories={starStories as never}
              securityFrameworks={securityFrameworks}
              boardSecurityMaturity={boardSecurityMaturity}
              productTypeExp={productTypeExp}
              productAchievement={productAchievement}
              productMetric={productMetric}
              cooMandateTypes={cooMandateTypes}
              cooCeoPartnership={cooCeoPartnership}
              ctoTechnicalFlavor={ctoTechnicalFlavor}
              ctoArchitectureDecision={ctoArchitectureDecision}
              dataMaturityOrientation={dataMaturityOrientation}
              dataPlatformBuilt={dataPlatformBuilt}
              digitalBackgroundType={digitalBackgroundType}
              digitalTransformationDelivered={digitalTransformationDelivered}
              briefingTime={briefingTime}
              activeDays={activeDays}
              briefingTimezone={profile?.briefing_timezone ?? null}
              briefingEmail={profile?.briefing_email ?? ''}
              userEmail={user.email ?? ''}
            />

            <button type="submit" className="bg-slate-900 text-white text-[14px] font-semibold px-6 py-2.5 rounded cursor-pointer border-0">Save profile</button>
          </form>
        </section>
      </main>

      <ProfileInactivityNudge formId="profile-form" />
    </div>
  )
}
