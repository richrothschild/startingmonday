import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { completeOnboarding, skipOnboarding } from './actions'

const inputCls = 'w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400'
const labelCls = 'block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5'
const hintCls  = 'mt-1.5 text-[12px] text-slate-400'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Already onboarded — send to dashboard
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed_at, full_name, current_title, current_company')
    .eq('user_id', user.id)
    .single()

  if (profile?.onboarding_completed_at) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">

        <div className="mb-10">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Set up your profile</h1>
          <p className="text-[14px] text-slate-500 mt-2 leading-relaxed max-w-lg">
            Takes about 5 minutes. Everything here feeds your interview prep briefs, daily briefing, and AI assistant. You can edit any of this later.
          </p>
        </div>

        <form action={completeOnboarding} className="flex flex-col gap-6">

          {/* About you */}
          <div className="bg-white border border-slate-200 rounded p-8 flex flex-col gap-5">
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 -mb-1">
              About you
            </div>

            <div>
              <label htmlFor="full_name" className={labelCls}>
                Full name <span className="text-red-400">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                defaultValue={profile?.full_name ?? ''}
                placeholder="Richard Rothschild"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="current_title" className={labelCls}>Current or most recent title</label>
                <input
                  id="current_title"
                  name="current_title"
                  type="text"
                  defaultValue={profile?.current_title ?? ''}
                  placeholder="Chief Information Officer"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="current_company" className={labelCls}>Current or most recent company</label>
                <input
                  id="current_company"
                  name="current_company"
                  type="text"
                  defaultValue={profile?.current_company ?? ''}
                  placeholder="Acme Corp"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label htmlFor="linkedin_url" className={labelCls}>LinkedIn URL</label>
              <input
                id="linkedin_url"
                name="linkedin_url"
                type="url"
                placeholder="https://linkedin.com/in/yourname"
                className={inputCls}
              />
            </div>
          </div>

          {/* Situation */}
          <div className="bg-white border border-slate-200 rounded p-8 flex flex-col gap-5">
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 -mb-1">
              Your situation
            </div>

            <div>
              <label htmlFor="employment_status" className={labelCls}>Where are you right now?</label>
              <select
                id="employment_status"
                name="employment_status"
                className={inputCls + ' bg-white'}
              >
                <option value="">— Select —</option>
                <option value="employed_exploring">Employed and quietly exploring</option>
                <option value="active_search">In active search</option>
                <option value="consulting">Consulting or interim</option>
                <option value="between_roles">Between roles</option>
              </select>
            </div>

            <div>
              <label htmlFor="search_timeline" className={labelCls}>Timeline for landing a new role</label>
              <select
                id="search_timeline"
                name="search_timeline"
                className={inputCls + ' bg-white'}
              >
                <option value="">— Select —</option>
                <option value="immediately">Need something immediately</option>
                <option value="3_months">Within the next 3 months</option>
                <option value="6_months">Within the next 6 months</option>
                <option value="opportunistic">Only for the right opportunity — no rush</option>
              </select>
            </div>
          </div>

          {/* What you're targeting */}
          <div className="bg-white border border-slate-200 rounded p-8 flex flex-col gap-5">
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 -mb-1">
              What you&apos;re targeting
            </div>

            <div>
              <label htmlFor="target_titles" className={labelCls}>Roles you&apos;re targeting</label>
              <input
                id="target_titles"
                name="target_titles"
                type="text"
                placeholder="CIO, VP of Technology, Head of IT"
                className={inputCls}
              />
              <p className={hintCls}>Comma-separated. Used to score job matches in company scans.</p>
            </div>

            <div>
              <label htmlFor="target_sectors" className={labelCls}>Sectors you&apos;re interested in</label>
              <input
                id="target_sectors"
                name="target_sectors"
                type="text"
                placeholder="Healthcare, Fintech, SaaS, Public Sector"
                className={inputCls}
              />
              <p className={hintCls}>Comma-separated.</p>
            </div>

            <div>
              <label htmlFor="dream_companies" className={labelCls}>Dream companies</label>
              <textarea
                id="dream_companies"
                name="dream_companies"
                rows={2}
                placeholder="Companies you'd love to work for, even if there's no opening right now…"
                className={inputCls + ' resize-none leading-relaxed'}
              />
            </div>

            <div>
              <label htmlFor="dream_job" className={labelCls}>Dream role</label>
              <textarea
                id="dream_job"
                name="dream_job"
                rows={3}
                placeholder="Describe the role you'd take immediately if someone called you tomorrow…"
                className={inputCls + ' resize-none leading-relaxed'}
              />
            </div>
          </div>

          {/* Your background */}
          <div className="bg-white border border-slate-200 rounded p-8 flex flex-col gap-5">
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 -mb-1">
              Your background
            </div>

            <div>
              <label htmlFor="positioning_summary" className={labelCls}>How you&apos;d describe yourself</label>
              <textarea
                id="positioning_summary"
                name="positioning_summary"
                rows={3}
                placeholder="Transformation CIO with 20+ years leading enterprise technology modernization. Known for…"
                className={inputCls + ' resize-none leading-relaxed'}
              />
              <p className={hintCls}>2–3 sentences. Used to personalize your prep briefs and AI chat.</p>
            </div>

            <div>
              <label htmlFor="resume_text" className={labelCls}>Resume or career history</label>
              <textarea
                id="resume_text"
                name="resume_text"
                rows={12}
                placeholder="Paste your resume here — or summarize your key roles, accomplishments, and experience. The more detail, the sharper your interview prep briefs will be."
                className={inputCls + ' resize-y leading-relaxed'}
              />
              <p className={hintCls}>Paste plain text. Used by the AI to build your prep briefs and answer search questions.</p>
            </div>

            <div>
              <label htmlFor="beyond_resume" className={labelCls}>Beyond the resume</label>
              <textarea
                id="beyond_resume"
                name="beyond_resume"
                rows={4}
                placeholder="Board seats, advisory roles, publications, patents, speaking engagements, community work — anything that matters but doesn't fit neatly on a resume."
                className={inputCls + ' resize-none leading-relaxed'}
              />
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 pb-8">
            <button
              type="submit"
              className="bg-slate-900 text-white text-[14px] font-semibold px-7 py-3 rounded cursor-pointer border-0"
            >
              Complete setup
            </button>
            <button
              type="submit"
              formAction={skipOnboarding}
              className="text-[13px] text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer p-0"
            >
              Skip for now — I&apos;ll fill this in later
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}
