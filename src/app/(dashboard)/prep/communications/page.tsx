import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Communications Prep - Starting Monday',
  description: 'Craft your outreach messages, talking points, and follow-up sequences.',
}

export default async function CommunicationsPrepPage() {
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
          Communications Prep
        </h1>
        <p className="text-[16px] leading-relaxed text-slate-300 max-w-2xl">
          Craft messages, templates, and talking points for your outreach.
        </p>
      </div>

      {/* Research insight card */}
      <div className="rounded-2xl border border-orange-400/30 bg-orange-500/5 p-6 sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-orange-300 mb-3">
          From coaching research
        </p>
        <p className="text-[15px] leading-relaxed text-slate-100">
          "The leaders who got the most responses told us they had 2-3 strong opening messages. They didn't change the message every day. They sent the same message to 10 people, learned what worked, then refined it. Consistency beats perfection."
        </p>
      </div>

      {/* Form sections */}
      <form className="space-y-8">
        {/* Opening message */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            Opening Message Template
          </legend>

          <div>
            <label htmlFor="opening-message" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Your standard opening (LinkedIn/Email)
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Keep it to 3-4 sentences. What makes them want to respond?
            </p>
            <textarea
              id="opening-message"
              placeholder="Hi [Name], I've been following [Company] for the [reason]. I'm currently exploring [roles/opportunities] in [market]. Would you be open to a quick conversation about [context]?&#10;&#10;— [Your name]"
              rows={6}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 font-mono text-[12px] focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="opening-variants" className="block text-[13px] font-semibold text-slate-200 mb-2">
              2-3 variations of your opening
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Different angles for different types of contacts. Test each one.
            </p>
            <textarea
              id="opening-variants"
              placeholder="Variation 1: [Different angle/context]&#10;&#10;Variation 2: [Alternative approach]&#10;&#10;Variation 3: [Third perspective]"
              rows={6}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 font-mono text-[12px] focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>
        </fieldset>

        {/* Value proposition */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            Your Value Proposition
          </legend>

          <div>
            <label htmlFor="value-prop" className="block text-[13px] font-semibold text-slate-200 mb-2">
              In one sentence: what value do you bring?
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Be specific. What problem do you solve? What experience matters?
            </p>
            <input
              id="value-prop"
              type="text"
              placeholder="E.g., I build engineering teams that scale from startup chaos to systematic execution."
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="proof-points" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Your top 3 proof points
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Specific wins or experiences that support your value prop.
            </p>
            <textarea
              id="proof-points"
              placeholder="1. [Specific win or accomplishment]&#10;2. [Another relevant success]&#10;3. [Third proof point]"
              rows={4}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 font-mono text-[12px] focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>
        </fieldset>

        {/* Follow-up sequences */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            Follow-Up Sequence
          </legend>

          <div>
            <label htmlFor="followup-1" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Follow-up 1 (3-5 days later)
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Light touch. Add new context or just a reminder.
            </p>
            <textarea
              id="followup-1"
              placeholder="Hi [Name], wanted to circle back on my previous message. I see [Company] just [recent news]. Would be great to chat about [angle]. Let me know your availability?"
              rows={3}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 font-mono text-[12px] focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="followup-2" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Follow-up 2 (7-10 days later)
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Change channel or add a different angle.
            </p>
            <textarea
              id="followup-2"
              placeholder="Hi [Name], I'm going to assume you're busy (or missed my previous message). I'm specifically interested in [specific context]. If you're open to a quick 15-min call, let me know."
              rows={3}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 font-mono text-[12px] focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>
        </fieldset>

        {/* Conversation starters */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            Conversation Starters
          </legend>

          <div>
            <label htmlFor="intro-questions" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Questions you'll ask in an intro call
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Start here. Learn about them first.
            </p>
            <textarea
              id="intro-questions"
              placeholder="1. How did you end up at [Company]?&#10;2. What are your biggest priorities right now?&#10;3. What's the org structure like on your team?"
              rows={4}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 font-mono text-[12px] focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="listening-moments" className="block text-[13px] font-semibold text-slate-200 mb-2">
              When/how you'll transition to your background
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Listen first. Then share when there's a natural connection.
            </p>
            <textarea
              id="listening-moments"
              placeholder="When they mention [challenge], that's when I'll share [my relevant experience]. I'll keep it to one quick story, then ask a follow-up question."
              rows={3}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>
        </fieldset>

        {/* Objection handling */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            Common Objections & Your Response
          </legend>

          <div>
            <label htmlFor="objections" className="block text-[13px] font-semibold text-slate-200 mb-2">
              "I'm not sure if we're hiring right now"
            </label>
            <textarea
              id="objections"
              placeholder="Your response..."
              rows={2}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="objections-2" className="block text-[13px] font-semibold text-slate-200 mb-2">
              "Send me your resume and I'll pass it along"
            </label>
            <textarea
              id="objections-2"
              placeholder="Your response..."
              rows={2}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="objections-3" className="block text-[13px] font-semibold text-slate-200 mb-2">
              "I'm pretty happy where I am"
            </label>
            <textarea
              id="objections-3"
              placeholder="Your response..."
              rows={2}
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
            Save communications prep
          </button>
        </div>
      </form>

      {/* Complete message */}
      <div className="rounded-2xl border border-green-400/30 bg-green-500/5 p-6 sm:p-8">
        <p className="text-[13px] font-semibold text-green-300 mb-3">✓ Your prep is complete</p>
        <p className="text-[14px] leading-relaxed text-slate-100 mb-4">
          You've now completed Interview, Companies, Meetings, and Communications prep. You're ready to execute:
        </p>
        <ul className="space-y-2 text-[13px] text-slate-300 mb-6">
          <li>• <strong>Week 1-2:</strong> Research your target companies and signals</li>
          <li>• <strong>Week 3-4:</strong> Begin warm introductions through your network</li>
          <li>• <strong>Week 5+:</strong> Move into active conversations and interviews</li>
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-[13px] font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-center"
          >
            Back to dashboard
          </Link>
          <Link
            href="/prep/interview"
            className="px-4 py-2 text-[13px] font-semibold text-orange-300 hover:text-orange-200 transition-colors text-center"
          >
            Review your prep
          </Link>
        </div>
      </div>
    </div>
  )
}
