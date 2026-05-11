import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { saveProfile, deleteNotes } from './actions'
import ProfileResumeUpload from './profile-resume-upload'
import { TagInput } from '@/components/TagInput'
import { getActivationStatus } from '@/lib/activation'
import CareerVerificationPanel from '@/components/CareerVerificationPanel'
import type { CareerEntry } from '@/components/CareerVerificationPanel'
import StarStoriesPanel from '@/components/StarStoriesPanel'
import type { StarStory } from '@/components/StarStoriesPanel'
import { ProfileInactivityNudge } from '@/components/ProfileInactivityNudge'
import { PositioningGeneratorTextarea } from './positioning-generator'
import { LinkedInGenerator } from './linkedin-generator'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_ABBR: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
  Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
}
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

  const [{ data: profile }, activation] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('full_name, current_title, current_company, briefing_time, briefing_days, briefing_timezone, briefing_email, target_titles, target_sectors, target_locations, positioning_summary, resume_text, beyond_resume, linkedin_url, linkedin_headline, linkedin_about, search_persona, role_type, career_history_json, role_context, star_stories, updated_at')
      .eq('user_id', user.id)
      .single(),
    getActivationStatus(user.id),
  ])

  const activeDays: string[] = (profile?.briefing_days ?? DEFAULT_DAYS).map((d: string) => ABBR_TO_FULL[d] ?? d)
  const briefingTime = profile?.briefing_time
    ? profile.briefing_time.slice(0, 5)
    : '07:00'
  const targetTitles    = (profile?.target_titles    ?? []).join(', ')
  const targetSectors   = (profile?.target_sectors   ?? []).join(', ')
  const targetLocations = (profile?.target_locations ?? []).join(', ')
  const positioningSummary = profile?.positioning_summary ?? ''
  const resumeText = profile?.resume_text ?? ''
  const beyondResume = profile?.beyond_resume ?? ''
  const linkedinUrl = profile?.linkedin_url ?? ''
  const linkedinHeadline = (profile as unknown as { linkedin_headline?: string | null })?.linkedin_headline ?? ''
  const linkedinAbout    = (profile as unknown as { linkedin_about?: string | null })?.linkedin_about ?? ''

  const roleCtx = (profile?.role_context as Record<string, unknown> | null) ?? {}
  const securityFrameworks      = ((roleCtx.security_frameworks as string[] | null) ?? []).join(', ')
  const boardSecurityMaturity   = (roleCtx.board_security_maturity as string | null) ?? ''
  const productTypeExp          = (roleCtx.product_type_exp as string | null) ?? ''
  const productAchievement      = (roleCtx.product_achievement as string | null) ?? ''
  const productMetric           = (roleCtx.product_metric as string | null) ?? ''
  const cooMandateTypes         = (roleCtx.coo_mandate_types as string[] | null) ?? []
  const cooCeoPartnership       = (roleCtx.coo_ceo_partnership as string | null) ?? ''
  const ctoTechnicalFlavor      = (roleCtx.cto_technical_flavor as string[] | null) ?? []
  const ctoArchitectureDecision = (roleCtx.cto_architecture_decision as string | null) ?? ''
  const dataMaturityOrientation = (roleCtx.data_maturity_orientation as string | null) ?? ''
  const dataPlatformBuilt       = (roleCtx.data_platform_built as string | null) ?? ''
  const digitalBackgroundType   = (roleCtx.digital_background_type as string | null) ?? ''
  const digitalTransformationDelivered = (roleCtx.digital_transformation_delivered as string | null) ?? ''

  const BEYOND_RESUME_PLACEHOLDERS: Record<string, string> = {
    cio:          'What transformation have you driven that does not appear in your title? What is your model for the CIO-CEO relationship? What is the biggest technology decision you made under pressure?',
    cto:          'What did you actually build? What architectural decision are you most proud of? What technical debt did you inherit and what did you do with it?',
    cdo_data:     'What was the data maturity of the organization when you joined? What business decision changed because of what you built? What does your data platform actually look like?',
    cdo_digital:  'What does your background give you that a pure technologist does not have? What business transformation did you drive? What did the customer experience look like before and after?',
    ciso:         "What frameworks have you implemented? What was the board's security awareness when you started vs when you left? What breach or regulatory event shaped your approach?",
    cpo:          "What is your product philosophy? What product are you most proud of and why? What metric did you move? What product bet was wrong and what did you learn?",
    coo:          "What is your model for the CEO-COO relationship? What operational phase have you navigated that does not appear in your title? What broke and how did you fix it?",
    vp_technology:'What does your scope actually look like beyond your title? What is the largest team you have built or inherited? Where have you had P&L or budget ownership?',
  }
  const beyondResumePlaceholder = (profile?.role_type ? BEYOND_RESUME_PLACEHOLDERS[profile.role_type] : null)
    ?? "What motivates you, your leadership philosophy, things you're proud of that don't fit in a resume..."
  const starStories = Array.isArray((profile as unknown as { star_stories?: unknown })?.star_stories)
    ? ((profile as unknown as { star_stories: StarStory[] }).star_stories)
    : [] as StarStory[]

  const careerEntries = Array.isArray(profile?.career_history_json)
    ? (profile.career_history_json as CareerEntry[])
    : null

  const updatedAtLabel = profile?.updated_at
    ? new Date(profile.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  const progressSections = [
    { label: 'Identity',    done: !!(profile?.role_type && profile?.full_name) },
    { label: 'Targets',     done: ((profile?.target_titles as string[] | null)?.length ?? 0) > 0 },
    { label: 'Resume',      done: (profile?.resume_text?.length ?? 0) >= 200 },
    { label: 'Positioning', done: (profile?.positioning_summary?.length ?? 0) >= 50 },
    { label: 'Briefing',    done: !!profile?.briefing_time },
  ]
  const completedSections = progressSections.filter(s => s.done).length

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link
            href="/dashboard"
            className="text-[13px] text-slate-300 hover:text-white transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Profile</h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <p className="text-[13px] text-slate-500">{user.email}</p>
            {updatedAtLabel && (
              <span className="text-[12px] text-slate-400">· Last updated {updatedAtLabel}</span>
            )}
          </div>
        </div>

        {/* Profile progress bar */}
        <div className="mb-6 bg-white border border-slate-200 rounded px-5 py-3.5 max-w-xl flex items-center gap-4">
          <div className="flex items-center gap-1.5 shrink-0">
            {progressSections.map((s, i) => (
              <div
                key={i}
                title={s.label}
                className={`h-1.5 w-9 rounded-full transition-colors ${s.done ? 'bg-slate-900' : 'bg-slate-200'}`}
              />
            ))}
          </div>
          <span className="text-[12px] font-semibold text-slate-500">
            {completedSections} of 5 sections complete
          </span>
          {completedSections < 5 && (
            <span className="text-[11px] text-slate-400 ml-auto">
              {progressSections.find(s => !s.done)?.label} is next
            </span>
          )}
          {completedSections === 5 && (
            <span className="text-[11px] font-semibold text-emerald-600 ml-auto">Profile complete</span>
          )}
        </div>

        <div className="mb-4 max-w-xl px-5 py-4 bg-slate-50 border border-slate-200 rounded flex items-start gap-3">
          <div className="shrink-0 mt-0.5 text-slate-400">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5C5.567 1.5 4 3.067 4 5v1H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1V5c0-1.933-1.567-3.5-3.5-3.5Zm2.5 4.5V5a2.5 2.5 0 0 0-5 0v1h5Z" fill="currentColor"/></svg>
          </div>
          <div>
            <p className="text-[12px] text-slate-700 leading-relaxed">
              Your resume and career notes are stored only in your account.
              They are used only to generate your briefs.
              They are never used to train AI models.
              You can delete them at any time.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-8 max-w-xl">

          {saved && (
            <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded text-[13px] text-green-700">
              Profile saved.
            </div>
          )}
          {saved && activation.a1_resume && !activation.a2_company && (
            <div className="mb-6 px-4 py-3 bg-slate-900 rounded flex items-center justify-between gap-4">
              <p className="text-[13px] text-slate-300">Next: add your first target company to start building your pipeline.</p>
              <Link href="/dashboard/companies/new" className="shrink-0 text-[12px] font-semibold text-white border border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded transition-colors">
                Add company
              </Link>
            </div>
          )}
          {saveError && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded text-[13px] text-red-700">
              Save failed: {decodeURIComponent(saveError)}
            </div>
          )}

          <form id="profile-form" action={saveProfile} className="flex flex-col gap-6">

            {/* Search level */}
            <div id="section-identity">
              <p className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-3">
                Search level
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'csuite', label: 'C-Suite',         sub: 'CEO, CFO, CTO, COO, CIO, CHRO, etc.' },
                  { value: 'vp',     label: 'VP / SVP',        sub: 'VP, SVP, or EVP targeting C-suite or a larger VP role' },
                  { value: 'board',  label: 'Board / Advisor', sub: 'Board seat, operating partner, or advisory role' },
                ].map(opt => (
                  <label
                    key={opt.value}
                    className="flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors border-slate-200 hover:border-slate-400 has-[:checked]:bg-slate-900 has-[:checked]:border-slate-900"
                  >
                    <input
                      type="radio"
                      name="search_persona"
                      value={opt.value}
                      defaultChecked={profile?.search_persona === opt.value}
                      className="sr-only"
                    />
                    <div>
                      <p className="text-[13px] font-semibold leading-none mb-0.5">
                        <span className="[label:has(:checked)_&]:text-white text-slate-900 font-semibold">{opt.label}</span>
                      </p>
                      <p className="text-[12px] text-slate-400 [label:has(:checked)_&]:text-slate-400 mt-0.5">{opt.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="mt-1.5 text-[12px] text-slate-400">Calibrates interview prep briefs and AI coaching to your actual level.</p>
            </div>

            {/* Role type */}
            <div>
              <p className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-3">
                Role type
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'cio',          label: 'CIO',                        sub: 'Chief Information Officer' },
                  { value: 'cto',          label: 'CTO',                        sub: 'Chief Technology Officer' },
                  { value: 'cdo_data',     label: 'CDO - Data & Analytics',     sub: 'Chief Data Officer, analytics and data products' },
                  { value: 'cdo_digital',  label: 'CDO - Digital',              sub: 'Chief Digital Officer, digital transformation' },
                  { value: 'ciso',         label: 'CISO',                       sub: 'Chief Information Security Officer' },
                  { value: 'cpo',          label: 'CPO',                        sub: 'Chief Product Officer' },
                  { value: 'coo',          label: 'COO',                        sub: 'Chief Operating Officer' },
                  { value: 'vp_technology',label: 'VP of Technology',           sub: 'VP, SVP, or EVP of Technology or Engineering' },
                  { value: 'other_csuite', label: 'Other C-Suite',              sub: 'CEO, CFO, CHRO, or other executive function' },
                ].map(opt => (
                  <label
                    key={opt.value}
                    className="flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors border-slate-200 hover:border-slate-400 has-[:checked]:bg-slate-900 has-[:checked]:border-slate-900"
                  >
                    <input
                      type="radio"
                      name="role_type"
                      value={opt.value}
                      defaultChecked={profile?.role_type === opt.value}
                      className="sr-only"
                    />
                    <div>
                      <p className="text-[13px] font-semibold leading-none mb-0.5">
                        <span className="[label:has(:checked)_&]:text-white text-slate-900 font-semibold">{opt.label}</span>
                      </p>
                      <p className="text-[12px] text-slate-400 [label:has(:checked)_&]:text-slate-400 mt-0.5">{opt.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="mt-1.5 text-[12px] text-slate-400">Tailors every interview prep brief to your specific function and interview dynamics.</p>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="full_name" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Full name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                defaultValue={profile?.full_name ?? ''}
                placeholder="Richard Rothschild"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* Current role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="current_title" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                  Current or most recent title
                </label>
                <input
                  id="current_title"
                  name="current_title"
                  type="text"
                  defaultValue={profile?.current_title ?? ''}
                  placeholder="Chief Information Officer"
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label htmlFor="current_company" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                  Current or most recent company
                </label>
                <input
                  id="current_company"
                  name="current_company"
                  type="text"
                  defaultValue={profile?.current_company ?? ''}
                  placeholder="Acme Corp"
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {/* Target titles */}
            <div id="section-targets">
              <label htmlFor="target_titles" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Target titles
              </label>
              <TagInput
                id="target_titles"
                name="target_titles"
                defaultValue={targetTitles}
                placeholder="Type a title and press Enter - CIO, VP of Technology…"
              />
              <p className="mt-1.5 text-[12px] text-slate-400">Press Enter or comma after each. Used to score job matches in company scans.</p>
            </div>

            {/* Target sectors */}
            <div>
              <label htmlFor="target_sectors" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Target sectors
              </label>
              <TagInput
                id="target_sectors"
                name="target_sectors"
                defaultValue={targetSectors}
                placeholder="Healthcare, Fintech, SaaS…"
              />
              <p className="mt-1.5 text-[12px] text-slate-400">Press Enter or comma after each. Helps refine match scoring.</p>
            </div>

            {/* Target locations */}
            <div>
              <label htmlFor="target_locations" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Target locations
              </label>
              <TagInput
                id="target_locations"
                name="target_locations"
                defaultValue={targetLocations}
                placeholder="New York, Remote, Dallas…"
              />
              <p className="mt-1.5 text-[12px] text-slate-400">Press Enter or comma after each. Used in your Search Strategy Brief.</p>
            </div>

            {/* Positioning summary */}
            <div id="section-positioning">
              <PositioningGeneratorTextarea
                defaultValue={positioningSummary}
                resumeText={resumeText}
                beyondResume={beyondResume}
                targetTitles={targetTitles}
                roleType={profile?.role_type ?? ''}
                currentTitle={profile?.current_title ?? ''}
                currentCompany={profile?.current_company ?? ''}
              />
            </div>

            {/* LinkedIn URL */}
            <div>
              <label htmlFor="linkedin_url" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                LinkedIn URL
              </label>
              <input
                id="linkedin_url"
                name="linkedin_url"
                type="url"
                defaultValue={linkedinUrl}
                placeholder="https://www.linkedin.com/in/yourname"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
              />
              <LinkedInGenerator
                positioning={positioningSummary}
                targetTitles={targetTitles}
                roleType={profile?.role_type ?? ''}
                currentTitle={profile?.current_title ?? ''}
                initialHeadline={linkedinHeadline}
                initialAbout={linkedinAbout}
              />
            </div>

            {/* Resume */}
            <div id="section-resume">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="resume_text" className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">
                  Resume / career history
                </label>
                {resumeText.length >= 200 && (
                  <Link href="/dashboard/profile/tailor" className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                    Tailor for a role &rarr;
                  </Link>
                )}
              </div>
              <ProfileResumeUpload />
              <textarea
                id="resume_text"
                name="resume_text"
                rows={12}
                maxLength={100000}
                defaultValue={resumeText}
                placeholder="Paste your resume text here, or upload a PDF/DOCX above…"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-y leading-relaxed font-mono text-[12px]"
              />
              <p className="mt-1.5 text-[12px] text-slate-400">Used in interview prep briefs and AI context.</p>
            </div>

            {/* Career verification */}
            <CareerVerificationPanel
              initialEntries={careerEntries}
              resumeText={resumeText}
            />

            {/* Beyond the resume */}
            <div>
              <label htmlFor="beyond_resume" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Beyond the resume
              </label>
              <textarea
                id="beyond_resume"
                name="beyond_resume"
                rows={4}
                defaultValue={beyondResume}
                placeholder={beyondResumePlaceholder}
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none leading-relaxed"
              />
              <p className="mt-1.5 text-[12px] text-slate-400">Gives the AI richer context for cover letters and interview prep.</p>
            </div>

            {/* STAR stories */}
            <div className="pt-6 border-t border-slate-100">
              <div className="mb-3">
                <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-orange-500 mb-0.5">Interview stories</p>
                <p className="text-[12px] text-slate-400">Save your best 5-8 STAR stories. The prep brief will map them to specific questions so you know exactly which story to use in the room.</p>
              </div>
              <StarStoriesPanel initial={starStories} />
            </div>

            {/* Role-specific context */}
            {['ciso', 'cpo', 'coo', 'cto', 'cdo_data', 'cdo_digital'].includes(profile?.role_type ?? '') && (
              <div className="flex flex-col gap-6 pt-6 border-t border-slate-100">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-orange-500 mb-0.5">Role context</p>
                  <p className="text-[12px] text-slate-400">These fields give the AI what it cannot infer from your resume. The more specific, the sharper the brief.</p>
                </div>

                {profile?.role_type === 'ciso' && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">Security frameworks implemented</label>
                      <TagInput id="security_frameworks" name="security_frameworks" defaultValue={securityFrameworks} placeholder="SOC2, ISO 27001, NIST CSF, PCI-DSS, HIPAA..." />
                      <p className="mt-1.5 text-[12px] text-slate-400">Used to match your background to this company's compliance requirements in prep briefs.</p>
                    </div>
                    <div>
                      <label htmlFor="board_security_maturity" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">Board security maturity</label>
                      <textarea id="board_security_maturity" name="board_security_maturity" rows={3} defaultValue={boardSecurityMaturity}
                        placeholder="What was the board's security awareness when you started? What changed by the time you left?"
                        className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none leading-relaxed" />
                    </div>
                    <div className="px-3 py-2.5 bg-amber-50 border border-amber-200 rounded text-[12px] text-amber-700 leading-relaxed">
                      Do not enter confidential security architecture, active incident details, or client infrastructure information. These notes are used for your prep briefs only.
                    </div>
                  </div>
                )}

                {profile?.role_type === 'cpo' && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-2">Product experience type</p>
                      <div className="flex gap-4">
                        {(['B2C', 'B2B', 'Both'] as const).map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="product_type_exp" value={opt} defaultChecked={productTypeExp === opt} className="accent-slate-900" />
                            <span className="text-[13px] text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="product_achievement" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">Key product achievement</label>
                      <textarea id="product_achievement" name="product_achievement" rows={3} defaultValue={productAchievement}
                        placeholder="What product are you most proud of and why? What user problem did it solve?"
                        className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none leading-relaxed" />
                    </div>
                    <div>
                      <label htmlFor="product_metric" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">Primary metric moved</label>
                      <input id="product_metric" name="product_metric" type="text" defaultValue={productMetric}
                        placeholder="+22% retention, 40% MAU growth, $8M ARR from new product line..."
                        className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400" />
                    </div>
                  </div>
                )}

                {profile?.role_type === 'coo' && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-2">Mandate type(s) sought</p>
                      <div className="flex flex-col gap-2">
                        {(['Scaling', 'Turnaround', 'Post-M&A integration', 'Professionalization'] as const).map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="coo_mandate_types" value={opt} defaultChecked={cooMandateTypes.includes(opt)} className="accent-slate-900" />
                            <span className="text-[13px] text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="coo_ceo_partnership" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">CEO partnership model</label>
                      <textarea id="coo_ceo_partnership" name="coo_ceo_partnership" rows={3} defaultValue={cooCeoPartnership}
                        placeholder="What is your model for the CEO-COO relationship? Where does the CEO lead and where do you own the execution?"
                        className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none leading-relaxed" />
                    </div>
                  </div>
                )}

                {profile?.role_type === 'cto' && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-2">Technical flavor</p>
                      <div className="flex flex-col gap-2">
                        {(['Infrastructure', 'Product engineering', 'Platform', 'AI and ML'] as const).map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="cto_technical_flavor" value={opt} defaultChecked={ctoTechnicalFlavor.includes(opt)} className="accent-slate-900" />
                            <span className="text-[13px] text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="cto_architecture_decision" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">Key architectural decision</label>
                      <textarea id="cto_architecture_decision" name="cto_architecture_decision" rows={3} defaultValue={ctoArchitectureDecision}
                        placeholder="What is the architectural decision you are most proud of? What was the problem, what did you decide, and what changed?"
                        className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none leading-relaxed" />
                    </div>
                  </div>
                )}

                {profile?.role_type === 'cdo_data' && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-2">Data mandate orientation</p>
                      <div className="flex gap-4">
                        {(['Governance-first', 'Products-first'] as const).map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="data_maturity_orientation" value={opt} defaultChecked={dataMaturityOrientation === opt} className="accent-slate-900" />
                            <span className="text-[13px] text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                      <p className="mt-1.5 text-[12px] text-slate-400">Governance-first: compliance, data quality, master data management. Products-first: analytics, ML models, data products for internal or external use.</p>
                    </div>
                    <div>
                      <label htmlFor="data_platform_built" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">Data platform built</label>
                      <textarea id="data_platform_built" name="data_platform_built" rows={3} defaultValue={dataPlatformBuilt}
                        placeholder="What platform did you build or inherit and transform? What business decisions changed as a result?"
                        className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none leading-relaxed" />
                    </div>
                  </div>
                )}

                {profile?.role_type === 'cdo_digital' && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-2">Professional background</p>
                      <div className="flex flex-col gap-2">
                        {(['Consulting', 'Operations', 'Marketing', 'Technology'] as const).map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="digital_background_type" value={opt} defaultChecked={digitalBackgroundType === opt} className="accent-slate-900" />
                            <span className="text-[13px] text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                      <p className="mt-1.5 text-[12px] text-slate-400">Shapes how your brief frames your non-traditional background as an advantage over purely technical candidates.</p>
                    </div>
                    <div>
                      <label htmlFor="digital_transformation_delivered" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">Business transformation delivered</label>
                      <textarea id="digital_transformation_delivered" name="digital_transformation_delivered" rows={3} defaultValue={digitalTransformationDelivered}
                        placeholder="What business transformation did you drive? What changed for the customer or the business that would not have happened otherwise?"
                        className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none leading-relaxed" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Briefing time */}
            <div id="section-briefing">
              <label htmlFor="briefing_time" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Daily briefing time
              </label>
              <input
                id="briefing_time"
                name="briefing_time"
                type="time"
                defaultValue={briefingTime}
                className="border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400"
              />
              {profile?.briefing_timezone && (
                <p className="mt-1.5 text-[12px] text-slate-400">
                  {profile.briefing_timezone}
                </p>
              )}
            </div>

            {/* Briefing days */}
            <div>
              <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-3">
                Briefing days
              </p>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map(day => (
                  <label
                    key={day}
                    className="flex items-center justify-center w-12 h-9 rounded text-[12px] font-semibold cursor-pointer border transition-colors border-slate-200 text-slate-400 hover:border-slate-400 has-[:checked]:bg-slate-900 has-[:checked]:text-white has-[:checked]:border-slate-900"
                  >
                    <input
                      type="checkbox"
                      name="briefing_days"
                      value={day}
                      defaultChecked={activeDays.includes(day)}
                      className="sr-only"
                    />
                    {DAY_ABBR[day]}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-[12px] text-slate-400">
                The daily briefing email will be sent on these days at the time above.
              </p>
            </div>

            {/* Briefing delivery email */}
            <div id="briefing-email">
              <label htmlFor="briefing_email" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Briefing delivery email
              </label>
              <input
                id="briefing_email"
                name="briefing_email"
                type="email"
                defaultValue={profile?.briefing_email ?? ''}
                placeholder={user.email}
                className="w-full max-w-sm border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
              />
              <p className="mt-1.5 text-[12px] text-slate-400">
                Optional. If set, all briefings and system emails are sent here instead of your login address.
                Use a personal email if an assistant manages your work inbox.
              </p>
            </div>

            <div>
              <button
                type="submit"
                className="bg-slate-900 text-white text-[14px] font-semibold px-6 py-2.5 rounded cursor-pointer border-0"
              >
                Save profile
              </button>
            </div>

          </form>
        </div>
        <div className="bg-white border border-slate-200 rounded p-6 max-w-xl mt-6">
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-2">
            LinkedIn profile
          </p>
          <p className="text-[13px] text-slate-500 leading-relaxed">
            A strong LinkedIn profile is often the first thing a hiring team checks before reaching out.{' '}
            <a
              href="https://www.linkedin-makeover.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-900 underline underline-offset-2 hover:text-slate-600"
            >
              LinkedIn-Makeover.com
            </a>{' '}
            is one of the most established services for executive-level profile optimization.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-6 max-w-xl mt-6">
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-4">
            Data and privacy
          </p>

          <div className="mb-5">
            <p className="text-[12px] font-semibold text-slate-700 mb-1">Download your data</p>
            <p className="text-[12px] text-slate-500 leading-relaxed mb-2">
              Export everything stored in your account as a JSON file: profile, companies, contacts, follow-ups, signals, and brief history.
            </p>
            <a
              href="/api/profile/export"
              className="inline-block text-[13px] font-semibold text-slate-700 border border-slate-300 hover:border-slate-500 px-4 py-2 rounded transition-colors"
            >
              Download your data
            </a>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <p className="text-[12px] font-semibold text-slate-700 mb-1">Delete sensitive data</p>
            <p className="text-[12px] text-slate-500 leading-relaxed mb-1">
              Removes your positioning summary, beyond-resume notes, and verified career history.
            </p>
            <p className="text-[12px] text-slate-400 leading-relaxed mb-3">
              Does not affect your account, login, companies, contacts, or follow-ups.
            </p>
            <form action={deleteNotes}>
              <button
                type="submit"
                className="text-[13px] font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-2 rounded cursor-pointer bg-white transition-colors"
              >
                Delete sensitive data
              </button>
            </form>
          </div>
        </div>

      </main>

      <ProfileInactivityNudge formId="profile-form" />
    </div>
  )
}
