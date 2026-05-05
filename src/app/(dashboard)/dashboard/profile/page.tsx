import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { saveProfile } from './actions'
import ProfileResumeUpload from './profile-resume-upload'
import { TagInput } from '@/components/TagInput'
import { getActivationStatus } from '@/lib/activation'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_ABBR: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
  Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
}
const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

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
      .select('full_name, current_title, current_company, briefing_time, briefing_days, briefing_timezone, target_titles, target_sectors, target_locations, positioning_summary, resume_text, beyond_resume, linkedin_url, search_persona')
      .eq('user_id', user.id)
      .single(),
    getActivationStatus(user.id),
  ])

  const activeDays: string[] = profile?.briefing_days ?? DEFAULT_DAYS
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

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
          <Link
            href="/dashboard"
            className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Profile</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">{user.email}</p>
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
              Save failed. Please try again.
            </div>
          )}

          <form action={saveProfile} className="flex flex-col gap-6">

            {/* Search level */}
            <div>
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
            <div>
              <label htmlFor="target_titles" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Target titles
              </label>
              <TagInput
                id="target_titles"
                name="target_titles"
                defaultValue={targetTitles}
                placeholder="Type a title and press Enter — CIO, VP of Technology…"
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
            <div>
              <label htmlFor="positioning_summary" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
                Positioning summary
              </label>
              <textarea
                id="positioning_summary"
                name="positioning_summary"
                rows={4}
                defaultValue={positioningSummary}
                placeholder="2–3 sentences: your title + years of experience, what you're known for, and what you're targeting next."
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none leading-relaxed"
              />
              <p className="mt-1.5 text-[12px] text-slate-400">Used to personalize interview prep briefs and chat context.</p>
              {!positioningSummary && (
                <div className="mt-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded text-[12px] text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-400 uppercase tracking-wide text-[10px]">Example</span>
                  <p className="mt-1">Transformation CIO with 18 years leading enterprise technology modernization in healthcare and financial services. Known for delivering large-scale ERP migrations and building platform engineering teams from scratch. Seeking CIO and VP Technology roles at growth-stage companies where I can drive digital transformation.</p>
                </div>
              )}
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
            </div>

            {/* Resume */}
            <div>
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
                placeholder="What motivates you, your leadership philosophy, things you're proud of that don't fit in a resume…"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none leading-relaxed"
              />
              <p className="mt-1.5 text-[12px] text-slate-400">Gives the AI richer context for cover letters and interview prep.</p>
            </div>

            {/* Briefing time */}
            <div>
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


      </main>
    </div>
  )
}
