/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Coach Outreach - Admin',
  description: 'Internal-only executive coach outreach strategy, tracking, and messaging.',
  robots: { index: false, follow: false },
}

type FilterSet = {
  title: string
  filters: string[]
}

type OutreachStep = {
  title: string
  action: string
}

type FollowUpSequence = {
  day: number
  action: string
  condition: string
}

type MessageTemplate = {
  title: string
  context: string
  body: string[]
}

export default async function CoachOutreachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const filters: FilterSet[] = [
    {
      title: 'LinkedIn Sales Navigator Search',
      filters: [
        'Title: "executive coach" OR "career coach" OR "outplacement consultant" OR "career strategist"',
        'Geography: United States',
        'Company: 1-10 employees (independent practitioners, not large firms)',
        'Active on LinkedIn: posted in last 30 days',
        'Connection degree: 2nd degree preferred',
        'Secondary filter: Review their posts. Coach content about VP→CXO moves, CEO prep, or board positioning = right fit. Resume formatting or early-career advice = not fit.',
      ],
    },
  ]

  const outreachSteps: OutreachStep[] = [
    {
      title: 'Step 1: Build your list',
      action: 'Run the Sales Navigator search above. Target 10-15 coaches per day. Create a list in Sales Navigator called "Coach Outreach" and add every prospect.',
    },
    {
      title: 'Step 2: Send connection request',
      action: 'Send a cold connection request with a personalized note (not a template). Reference something specific from their profile or a recent post they made. Keep the note under 250 characters.',
    },
    {
      title: 'Step 3: Track status',
      action: 'In your tracking spreadsheet, log: prospect name, LinkedIn URL, connection request sent date, note preview, and current status (pending, connected, responded, demo scheduled, demo completed, passed).',
    },
    {
      title: 'Step 4: Wait 2-3 days for acceptance',
      action: 'Do not send a message until they accept your connection. Once accepted, immediately send your follow-up message same day to capture their attention.',
    },
    {
      title: 'Step 5: Send follow-up message',
      action: 'Use the "Accepted Connection Follow-Up" template below. Offer a demo or a use case. Make it clear what the next step is and that there is no obligation.',
    },
    {
      title: 'Step 6: Log response',
      action: 'Update tracking spreadsheet: response date, response type (positive, neutral, declined), and notes. Move to appropriate follow-up sequence.',
    },
  ]

  const followUpSequence: FollowUpSequence[] = [
    {
      day: 0,
      action: 'Connection accepted',
      condition: 'Send follow-up message immediately (same day if possible)',
    },
    {
      day: 3,
      action: 'No response to follow-up',
      condition: 'Send: "Happy to share a short demo video if easier than a call."',
    },
    {
      day: 7,
      action: 'Still no response',
      condition: 'Send: "No worries if the timing is not right — just let me know if anything changes." Then stop.',
    },
    {
      day: 0,
      action: 'They respond positively',
      condition: 'Schedule a 15-minute walkthrough within 2 business days',
    },
    {
      day: 0,
      action: 'They ask a specific question',
      condition: 'Answer in 1-2 sentences, then ask to schedule a brief call',
    },
    {
      day: 0,
      action: 'They decline or say "not now"',
      condition: 'Tag as "passed" and move on. Do not follow up further.',
    },
  ]

  const messageTemplates: MessageTemplate[] = [
    {
      title: 'Cold Connection Request',
      context: 'First touch via connection request. Keep it personal and specific. Examples:',
      body: [
        '[Name] — I saw your post on executive transitions [or: your talk on board positioning, or: you coach CIO-level searches]. Built a tool that coaches are using to handle the daily company research for their clients. Would a 15-min demo be useful? No pressure.',
        '[Name] — You coach executives through transitions at the VP/CIO/CTO level. I work with the same audience building intelligence infrastructure for their searches. Thought it might be worth connecting.',
        '[Name] — Your [topic] insight is sharp. I spend a lot of time around VP→CXO transitions and am building Starting Monday around what strong searches actually require. Worth a conversation?',
      ],
    },
    {
      title: 'Accepted Connection Follow-Up',
      context: 'Send immediately after they accept. Offer value, not a pitch. 2-3 sentences max.',
      body: [
        'Thanks for connecting. I spend most of my time around senior technology transitions and see coaches doing the same research for their clients multiple times per week. Built a platform that handles that piece — daily monitoring, prep briefs, pipeline view — so coaches can focus on strategy. Would a 15-minute demo be worth your time? No obligation.',
        '[Name] — happy to connect. I work with coaches who are tired of rebuilding context before every session. Starting Monday gives your clients the research infrastructure so you can focus on the strategy and relationship work. Quick demo worth your time?',
        'Appreciate the connection. For coaches working with executives in transition, there is usually a gap between sessions: your client is stuck on research, prep work, or just tracking where things stand. Built a tool that fills that gap. Would a short walkthrough be useful?',
      ],
    },
    {
      title: 'Demo Follow-Up (No Response)',
      context: 'After 3 days with no response to your first follow-up message.',
      body: [
        'Happy to share a short demo video if a call does not fit your schedule right now. Totally understand if the timing is not right.',
      ],
    },
    {
      title: 'Final Follow-Up (No Response)',
      context: 'After 7 days total with no response. This is the last touch.',
      body: [
        'No worries if the timing is not right — just let me know if anything changes and we can revisit.',
      ],
    },
    {
      title: 'Positive Response Next Step',
      context: 'They said yes or asked a question. Move quickly to a demo or brief call.',
      body: [
        'Great — would [tomorrow at 10 AM or Thursday at 2 PM] work for a 15-minute walkthrough? I can share my screen and show you exactly how coaches are using it with their clients.',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard/admin" className="text-[13px] font-semibold text-slate-900 hover:text-orange-600 transition-colors">
            ← Admin
          </Link>
          <h1 className="text-[18px] font-bold text-slate-900">Executive Coach Outreach</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Overview */}
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <h2 className="text-[18px] font-bold text-slate-900">Channel Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px] text-slate-600 leading-relaxed">
            <div>
              <p className="font-semibold text-slate-900 mb-1">The Target</p>
              <p>Independent executive coaches (1-10 person firms) who work with VP/CXO clients in transition.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">The Value</p>
              <p>One coach with 15 active clients on Active tier = $597/month recurring commission. No enrollment fees, no minimums.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Success Rate</p>
              <p>Target: 15-20% response rate. High NPS potential because coaches already know when executives are in motion.</p>
            </div>
          </div>
        </section>

        {/* Sales Navigator Filters */}
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <h2 className="text-[18px] font-bold text-slate-900">Sales Navigator Search Filters</h2>
          <p className="text-[13px] text-slate-600">Use these exact filters to build your prospect list:</p>
          {filters.map((filterSet, i) => (
            <div key={i} className="border-t border-slate-100 pt-4">
              <p className="text-[14px] font-semibold text-slate-900 mb-3">{filterSet.title}</p>
              <ul className="space-y-2">
                {filterSet.filters.map((f, j) => (
                  <li key={j} className="flex gap-3 text-[13px] text-slate-600">
                    <span className="shrink-0 text-slate-400">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Outreach Steps */}
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <h2 className="text-[18px] font-bold text-slate-900">6-Step Outreach Process</h2>
          <p className="text-[13px] text-slate-600">Execute these steps in order. Track everything in a spreadsheet (see template below).</p>
          <div className="space-y-4 pt-4">
            {outreachSteps.map((step, i) => (
              <div key={i} className="border-l-3 border-orange-500 pl-4">
                <p className="text-[13px] font-bold text-slate-900">{step.title}</p>
                <p className="text-[13px] text-slate-600 mt-1.5">{step.action}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Follow-Up Sequence */}
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <h2 className="text-[18px] font-bold text-slate-900">Follow-Up Sequence & Decision Tree</h2>
          <p className="text-[13px] text-slate-600">Use this sequence to manage responses and non-responses:</p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-[12px] text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2.5 font-semibold text-slate-900">Timeline</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-900">Event</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-900">Your Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {followUpSequence.map((seq, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">Day {seq.day}</td>
                    <td className="px-4 py-3 text-slate-700">{seq.action}</td>
                    <td className="px-4 py-3 text-slate-700">{seq.condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Message Templates */}
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
          <h2 className="text-[18px] font-bold text-slate-900">Message Templates</h2>
          <p className="text-[13px] text-slate-600">
            Do not use these verbatim. Personalize each message with details from their profile, recent posts, or conference talks. Generic templates get lower response rates.
          </p>
          <div className="space-y-8 pt-4">
            {messageTemplates.map((template, i) => (
              <div key={i} className="border-t border-slate-100 pt-6">
                <p className="text-[13px] font-bold tracking-[0.1em] uppercase text-orange-600 mb-2">{template.title}</p>
                <p className="text-[12px] text-slate-500 mb-4">{template.context}</p>
                <ul className="space-y-4">
                  {template.body.map((line, j) => (
                    <li key={j} className="bg-slate-50 border border-slate-200 rounded p-3.5 text-[13px] text-slate-700 leading-relaxed">
                      "{line}"
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Tracking Setup */}
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <h2 className="text-[18px] font-bold text-slate-900">Lead Tracking Spreadsheet</h2>
          <p className="text-[13px] text-slate-600 mb-4">
            Create a simple Google Sheet with these columns to track every prospect:
          </p>
          <div className="space-y-3 text-[13px] text-slate-600">
            <div className="flex gap-3">
              <span className="shrink-0 font-mono bg-slate-100 text-slate-900 w-6 h-6 rounded flex items-center justify-center font-bold">1</span>
              <div>
                <p className="font-semibold text-slate-900">Coach Name</p>
                <p className="text-[12px]">First and last name</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 font-mono bg-slate-100 text-slate-900 w-6 h-6 rounded flex items-center justify-center font-bold">2</span>
              <div>
                <p className="font-semibold text-slate-900">LinkedIn URL</p>
                <p className="text-[12px]">Link to their profile</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 font-mono bg-slate-100 text-slate-900 w-6 h-6 rounded flex items-center justify-center font-bold">3</span>
              <div>
                <p className="font-semibold text-slate-900">Connection Request Sent</p>
                <p className="text-[12px]">Date (YYYY-MM-DD)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 font-mono bg-slate-100 text-slate-900 w-6 h-6 rounded flex items-center justify-center font-bold">4</span>
              <div>
                <p className="font-semibold text-slate-900">Connection Request Note</p>
                <p className="text-[12px]">First 50 characters of what you said</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 font-mono bg-slate-100 text-slate-900 w-6 h-6 rounded flex items-center justify-center font-bold">5</span>
              <div>
                <p className="font-semibold text-slate-900">Status</p>
                <p className="text-[12px]">Pending | Connected | Responded | Demo Scheduled | Demo Completed | Passed</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 font-mono bg-slate-100 text-slate-900 w-6 h-6 rounded flex items-center justify-center font-bold">6</span>
              <div>
                <p className="font-semibold text-slate-900">Response Date</p>
                <p className="text-[12px]">When they responded (if applicable)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 font-mono bg-slate-100 text-slate-900 w-6 h-6 rounded flex items-center justify-center font-bold">7</span>
              <div>
                <p className="font-semibold text-slate-900">Response Type</p>
                <p className="text-[12px]">Positive | Neutral | Declined | Silent</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="shrink-0 font-mono bg-slate-100 text-slate-900 w-6 h-6 rounded flex items-center justify-center font-bold">8</span>
              <div>
                <p className="font-semibold text-slate-900">Notes</p>
                <p className="text-[12px]">What they said, follow-up needed, anything relevant</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded p-4 mt-6">
            <p className="text-[12px] text-orange-900 leading-relaxed">
              <span className="font-semibold">Key insight:</span> Update the spreadsheet immediately after each touch. Do not rely on memory. This becomes your lead database and follow-up system.
            </p>
          </div>
        </section>

        {/* Success Metrics */}
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <h2 className="text-[18px] font-bold text-slate-900">Success Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[12px] font-bold text-slate-900 mb-1">Connection Acceptance Rate</p>
              <p className="text-[18px] font-bold text-orange-600">40-60%</p>
              <p className="text-[12px] text-slate-500 mt-1">of cold connection requests should be accepted</p>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[12px] font-bold text-slate-900 mb-1">Response Rate (To Follow-Up)</p>
              <p className="text-[18px] font-bold text-orange-600">15-20%</p>
              <p className="text-[12px] text-slate-500 mt-1">should respond to your first follow-up message</p>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[12px] font-bold text-slate-900 mb-1">Demo-to-Signup Rate</p>
              <p className="text-[18px] font-bold text-orange-600">25-35%</p>
              <p className="text-[12px] text-slate-500 mt-1">should sign up after seeing a demo</p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded p-4 mt-6">
            <p className="text-[12px] text-slate-700 leading-relaxed mb-3">
              <span className="font-semibold">If your response rate is below 15%:</span> The messaging is likely the issue, not the effort level. Pause new outreach, review responses from the past 10 contacts, and refine your message before continuing. Generic language and product-focused openings perform poorly.
            </p>
            <p className="text-[12px] text-slate-700 leading-relaxed">
              <span className="font-semibold">Target outreach volume:</span> 10-15 new connection requests per day. This is sustainable, high-personalization outreach, not spray-and-pray.
            </p>
          </div>
        </section>

        {/* Link Strategy */}
        <section className="bg-orange-50 border border-orange-200 rounded-lg p-6 space-y-4">
          <h2 className="text-[18px] font-bold text-orange-900">Should You Include Links in Outreach Messages?</h2>
          <div className="space-y-4 text-[13px] text-orange-900">
            <div>
              <p className="font-semibold mb-1">Short answer: No links in the cold connection request. Yes link in the accepted follow-up.</p>
            </div>
            <div className="border-t border-orange-100 pt-4">
              <p className="font-semibold mb-1">Why no link in the connection request:</p>
              <ul className="space-y-1 pl-4 list-disc text-[12px]">
                <li>LinkedIn penalizes messages with URLs as spam</li>
                <li>They have not yet decided to engage; a link feels presumptuous</li>
                <li>You want them to accept the connection first, then offer next steps</li>
              </ul>
            </div>
            <div className="border-t border-orange-100 pt-4">
              <p className="font-semibold mb-1">When to include links (in the accepted follow-up):</p>
              <ul className="space-y-1 pl-4 list-disc text-[12px]">
                <li>
                  Link to /for-coaches page: "Here's an overview of what other coaches are doing with it: <code>startingmonday.app/for-coaches</code>"
                </li>
                <li>
                  Link to a 2-min demo video (if you have one) is better than a link to a page, because it feels more personal
                </li>
                <li>Never send the partner dashboard link — it's internal only</li>
              </ul>
            </div>
            <div className="border-t border-orange-100 pt-4">
              <p className="font-semibold mb-1">Best practice:</p>
              <p className="text-[12px]">
                "Would a 15-minute demo be worth your time? I can walk through how your clients would use it, then you can reach out to your own network." This way, you're selling the demo itself, not the link. The /for-coaches page acts as backup if they ask "what is this?"
              </p>
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <h2 className="text-[18px] font-bold text-slate-900">Related Resources</h2>
          <div className="space-y-2">
            <Link href="/for-coaches" className="flex items-center gap-2 text-[13px] font-semibold text-orange-600 hover:text-orange-700 transition-colors">
              Public coach landing page
              <span className="text-[10px]">→</span>
            </Link>
            <Link href="/coaches-guide" className="flex items-center gap-2 text-[13px] font-semibold text-orange-600 hover:text-orange-700 transition-colors">
              Coach partner guide
              <span className="text-[10px]">→</span>
            </Link>
            <Link href="/partners" className="flex items-center gap-2 text-[13px] font-semibold text-orange-600 hover:text-orange-700 transition-colors">
              General partner application
              <span className="text-[10px]">→</span>
            </Link>
            <Link href="/dashboard/partner" className="flex items-center gap-2 text-[13px] font-semibold text-orange-600 hover:text-orange-700 transition-colors">
              Partner dashboard (for tracking commissions)
              <span className="text-[10px]">→</span>
            </Link>
          </div>
        </section>

      </main>
    </div>
  )
}
