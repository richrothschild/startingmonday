import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Interview Prep - Starting Monday',
  description: 'Prepare for your next interview with research-backed frameworks and position-specific talking points.',
}

export default async function InterviewPrepPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-[32px] font-bold tracking-tight text-white sm:text-[40px]">
          Interview Prep
        </h1>
        <p className="text-[16px] leading-relaxed text-slate-300 max-w-2xl">
          Build your interview narrative before the call. Research, positioning, and objection prep.
        </p>
      </div>

      {/* Research insight card */}
      <div className="rounded-2xl border border-orange-400/30 bg-orange-500/5 p-6 sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-orange-300 mb-3">
          From coaching research
        </p>
        <p className="text-[15px] leading-relaxed text-slate-100">
          "The leaders who got offers told us: they spent 3-4 hours before each call on research, positioning, and role-fit framing. They didn't rely on the interview to tell the story. They arrived with the story already clear."
        </p>
      </div>

      {/* Form sections */}
      <form className="space-y-8">
        {/* Role & Company */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            The Role
          </legend>

          <div>
            <label htmlFor="company-name" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Company name
            </label>
            <input
              id="company-name"
              type="text"
              placeholder="e.g., Figma, Stripe, Notion"
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="role-title" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Role title
            </label>
            <input
              id="role-title"
              type="text"
              placeholder="e.g., VP Engineering, Director of Product"
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="interview-date" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Interview date & time
            </label>
            <input
              id="interview-date"
              type="datetime-local"
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>
        </fieldset>

        {/* Positioning */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            Your Positioning
          </legend>

          <div>
            <label htmlFor="positioning" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Opening statement (2-3 sentences)
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              How you describe what you do and why you're right for this role.
            </p>
            <textarea
              id="positioning"
              placeholder="Describe your background and why this role matters to you..."
              rows={4}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="why-now" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Why you're moving now
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Your clear, compelling reason for this search.
            </p>
            <textarea
              id="why-now"
              placeholder="Be specific about timing, growth opportunities, or misalignment..."
              rows={3}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>
        </fieldset>

        {/* Company research */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            Company Research
          </legend>

          <div>
            <label htmlFor="company-context" className="block text-[13px] font-semibold text-slate-200 mb-2">
              What's happening at this company right now?
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Recent funding, product launches, reorganization, market moves.
            </p>
            <textarea
              id="company-context"
              placeholder="Recent news, strategy shifts, product announcements..."
              rows={4}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="role-fit" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Why this role matters to their strategy
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Connect the role to company moves. What problem are they solving?
            </p>
            <textarea
              id="role-fit"
              placeholder="How does this role support their current priorities?"
              rows={3}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>
        </fieldset>

        {/* Objections */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            Anticipated Objections
          </legend>

          <div>
            <label htmlFor="objection" className="block text-[13px] font-semibold text-slate-200 mb-2">
              What concerns might they have?
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Gaps in background, technical skills, industry experience?
            </p>
            <textarea
              id="objection"
              placeholder="Gaps you anticipate they might raise..."
              rows={3}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="objection-response" className="block text-[13px] font-semibold text-slate-200 mb-2">
              How you'll address it
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Your proof point or reframe.
            </p>
            <textarea
              id="objection-response"
              placeholder="Your response framing and proof..."
              rows={3}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between pt-4">
          <button
            type="button"
            className="px-6 py-3 text-[13px] font-semibold text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
          >
            Save as draft
          </button>
          <button
            type="submit"
            className="px-6 py-3 text-[13px] font-semibold bg-orange-500 text-slate-900 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Save interview prep
          </button>
        </div>
      </form>

      {/* Next steps */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8">
        <p className="text-[13px] font-semibold text-slate-300 mb-3">Next: Review your prep</p>
        <p className="text-[14px] leading-relaxed text-slate-100 mb-4">
          Come back here 24 hours before your interview. Practice your opening, your company narrative, and your objection responses. You're aiming for natural conversation, not recitation.
        </p>
        <Link
          href="/prep/communications"
          className="inline-flex px-4 py-2 text-[13px] font-semibold text-orange-300 hover:text-orange-200 transition-colors"
        >
          Move to communications prep →
        </Link>
      </div>
    </div>
  )
}
