import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember } from '@/lib/staff'
import { SocialClient } from './social-client'

const PILLAR_LABELS: Record<string, string> = {
  search_craft:  'Search Craft',
  market_intel:  'Market Intelligence',
  behind_build:  'Behind the Build',
  user_story:    'User Story',
  engagement:    'Engagement',
}

export default async function SocialAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const admin = createAdminClient()

  // Post history - last 30 days
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data: history } = await admin
    .from('social_posts')
    .select('id, post_date, pillar, is_posted, posted_at, buffer_scheduled_at, draft_text')
    .gte('post_date', since30d)
    .order('post_date', { ascending: false })

  const posts = (history ?? []) as {
    id: string
    post_date: string
    pillar: string
    is_posted: boolean
    posted_at: string | null
    buffer_scheduled_at: string | null
    draft_text: string
  }[]

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">← Admin</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">LinkedIn Social</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">
            Daily weekday draft by audience - review, edit, copy, and mark posted.
          </p>
        </div>

        <SocialClient />

        {/* Post history */}
        {posts.length > 0 && (
          <div className="mt-10">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-4">Post History (30 days)</p>
            <div className="bg-white border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-left">
                    <th className="px-5 py-3 font-semibold text-slate-400">Date</th>
                    <th className="px-4 py-3 font-semibold text-slate-400">Pillar</th>
                    <th className="px-4 py-3 font-semibold text-slate-400">Status</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 hidden sm:table-cell">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {posts.map(p => (
                    <tr key={p.id}>
                      <td className="px-5 py-3 font-semibold text-slate-900 whitespace-nowrap">
                        {new Date(p.post_date + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {PILLAR_LABELS[p.pillar] ?? p.pillar}
                      </td>
                      <td className="px-4 py-3">
                        {p.is_posted ? (
                          <span className="text-[11px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded">Posted</span>
                        ) : p.buffer_scheduled_at ? (
                          <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Queued</span>
                        ) : (
                          <span className="text-[11px] font-bold bg-slate-100 text-slate-400 px-2 py-0.5 rounded">Draft</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden sm:table-cell max-w-xs truncate">
                        {p.draft_text.split('\n')[0].slice(0, 80)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Liz instructions */}
        <div className="mt-10 bg-white border border-slate-200 rounded p-6">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-4">Daily Workflow — Monday Through Friday</p>

          <div className="mb-6 border border-blue-200 bg-blue-50/40 rounded p-4">
            <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-blue-700 mb-2">Executive Coach Outreach Guide For Liz</p>
            <p className="text-[13px] text-slate-700 leading-relaxed mb-3">
              The full step-by-step guide, coach-finding criteria, and message options are in:
              {' '}
              <span className="font-mono text-slate-800">docs/liz-executive-coach-linkedin-guide.md</span>
            </p>
            <p className="text-[12px] text-slate-600 mb-2">Send-ready email draft:</p>
            <div className="bg-white border border-blue-100 rounded p-3 text-[12px] text-slate-700 leading-relaxed">
              <p><span className="font-semibold text-slate-900">Subject:</span> Executive coach outreach guide now live</p>
              <p className="mt-2">Hi Liz,</p>
              <p className="mt-1">
                I published the daily executive coach outreach guide. It mirrors the Social page operating style and includes: coach-finding filters, persona criteria, objection tags, connection note options, and the 7-touch follow-up sequence.
              </p>
              <p className="mt-1">
                Please start with this file: docs/liz-executive-coach-linkedin-guide.md
              </p>
              <p className="mt-1">Thanks, Rich</p>
            </div>
            <a
              href="mailto:?subject=Executive%20coach%20outreach%20guide%20now%20live&body=Hi%20Liz%2C%0A%0AI%20published%20the%20daily%20executive%20coach%20outreach%20guide.%20It%20mirrors%20the%20Social%20page%20operating%20style%20and%20includes%3A%20coach-finding%20filters%2C%20persona%20criteria%2C%20objection%20tags%2C%20connection%20note%20options%2C%20and%20the%207-touch%20follow-up%20sequence.%0A%0APlease%20start%20with%20this%20file%3A%20docs%2Fliz-executive-coach-linkedin-guide.md%0A%0AThanks%2C%0ARich"
              className="inline-block mt-3 text-[12px] font-semibold text-blue-700 border border-blue-200 rounded px-3 py-2 hover:border-blue-400 hover:text-blue-800 transition-colors"
            >
              Open email draft
            </a>
          </div>

          <ol className="flex flex-col gap-5">
            {[
              {
                title: 'Open this page before 8:30 AM CT on post days.',
                body: 'Posts now go out every weekday with audience rotation: executives, search firms, executive coaches, and outplacement firms. The page will say "No post scheduled today" on weekends. A cron job auto-posts if you have not posted first, so open this before 8:30 AM CT if you want a manual review pass.',
              },
              {
                title: 'Read the draft carefully. Check three things.',
                body: '(a) Does it sound like Rich: direct, short sentences, no corporate filler? (b) Is it under 3,000 characters? The count appears below the text box. (c) Does it land one clear point with a sharp ending? If the draft is off, click "Regenerate" in the top-right of the date card.',
              },
              {
                title: 'Edit anything that needs fixing.',
                body: 'Click anywhere in the text box and type directly. Changes save automatically when you click somewhere else on the page — you\'ll see "Unsaved edits" in amber if a save is still pending. Do not close the tab while it says that.',
              },
              {
                title: 'Post it. Two options.',
                body: 'Option A: Click "Post to LinkedIn" — this fires immediately through the LinkedIn API. The status updates to confirm. This is the preferred method. Option B: Click "Copy to clipboard," go to linkedin.com, create a new post, paste the text, and publish it yourself. Then come back here and click "Mark posted (manual)" so the record stays accurate. Use Option B only if Option A throws an error.',
              },
              {
                title: 'Track engagement in the Notes field.',
                body: 'After the post has been live for a few hours, note: total likes, total comments, any specific people who commented (name and what they said), and anyone Rich should follow up with. Paste notable comments verbatim if they\'re worth keeping. This feeds the weekly digest and helps identify warm leads for outreach.',
              },
            ].map((step, i) => (
              <li key={i} className="flex gap-3 text-[13px] text-slate-600">
                <span className="shrink-0 w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-slate-800 mb-1">{step.title}</p>
                  <p className="leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">CIO Outreach - Accepted Connection Follow-Up</p>
            <p className="text-[12px] text-slate-500 mb-3">Use these when a CIO accepts the connection request. Pick one subject and one two-sentence body, then send same day.</p>
            <div className="bg-slate-50 border border-slate-200 rounded p-4">
              <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-2">Version A - Direct And Memorable</p>
              <p className="text-[12px] text-slate-800 mb-2"><span className="font-semibold">Subject:</span> Most CIO searches stall between sessions.</p>
              <p className="text-[13px] text-slate-700 leading-relaxed">
                [Name], thanks for connecting. Most CIO searches lose momentum between sessions, so we built Starting Monday to keep execution tight with company signals, prep briefs, and a live pipeline view; open to a 15-minute walkthrough?
              </p>
            </div>
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded p-4">
              <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-2">Version B - Relationship First</p>
              <p className="text-[12px] text-slate-800 mb-2"><span className="font-semibold">Subject:</span> You run strategy. We handle the between-session execution.</p>
              <p className="text-[13px] text-slate-700 leading-relaxed">
                [Name], appreciate the connection. The quiet middle of a CIO transition is where searches drift, so Starting Monday gives candidates a daily operating rhythm that keeps research, outreach, and interview prep moving; open to a short 15-minute walkthrough?
              </p>
            </div>
            <div className="mt-3 text-[12px] text-slate-600 leading-relaxed">
              <p><span className="font-semibold text-slate-800">If no response after 3 days:</span> Happy to send a short demo video if that is easier than a live call.</p>
              <p className="mt-1"><span className="font-semibold text-slate-800">If no response after 7 days:</span> No pressure if timing is not right. If priorities shift, I am happy to reconnect.</p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Executive Coach Outreach - Quick Use</p>
              <p className="text-[12px] text-slate-600 mb-3">
                Steps and message options are now on this page and fully documented in the guide above.
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-[12px] text-slate-700 leading-relaxed">
                <li>Build 10-15 daily prospects in Sales Navigator (1-10 employee firms, active in last 30 days).</li>
                <li>Tag each coach persona (Transition, VP-to-CXO, Search Affiliate, Board).</li>
                <li>Send personalized connection notes the same day.</li>
                <li>Run the 7-touch sequence: day 0, 1, 3, 7, 14, 21, 30.</li>
                <li>Log objections and outcomes after every touch.</li>
              </ol>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Synthetic Council Review - Sales Marketing And Pricing</p>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] text-left border border-slate-200 rounded overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-3 py-2 font-semibold text-slate-900">Member</th>
                      <th className="px-3 py-2 font-semibold text-slate-900">Feedback</th>
                      <th className="px-3 py-2 font-semibold text-slate-900">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-3 py-2 text-slate-800 font-semibold">Dave Gerhardt</td>
                      <td className="px-3 py-2 text-slate-700">Strong opener and good founder-style directness. Version A is punchier and more likely to get a reply.</td>
                      <td className="px-3 py-2 text-slate-900 font-semibold">A-</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-slate-800 font-semibold">April Dunford</td>
                      <td className="px-3 py-2 text-slate-700">Clear who this is for: CIO-level transitions. Positioning is cleaner when centered on the execution gap between sessions.</td>
                      <td className="px-3 py-2 text-slate-900 font-semibold">A</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-slate-800 font-semibold">John McMahon</td>
                      <td className="px-3 py-2 text-slate-700">Pain and urgency are visible. Keep CTA specific at 15 minutes and avoid adding extra links in first follow-up.</td>
                      <td className="px-3 py-2 text-slate-900 font-semibold">A-</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-slate-800 font-semibold">Katelyn Bourgoin</td>
                      <td className="px-3 py-2 text-slate-700">Version B lands emotional reality better. "Quiet middle" language is memorable and human.</td>
                      <td className="px-3 py-2 text-slate-900 font-semibold">A</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-slate-800 font-semibold">Patrick Campbell</td>
                      <td className="px-3 py-2 text-slate-700">Value framing is stronger when outcomes are explicit: sharper conversations and faster search velocity. Good premium signal without pricing friction.</td>
                      <td className="px-3 py-2 text-slate-900 font-semibold">A-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pillar legend */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">What the pillar labels mean</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'Search Craft', desc: 'Practical advice for running a senior executive job search' },
                { label: 'Market Intelligence', desc: 'Data and signals about the executive hiring market' },
                { label: 'Behind the Build', desc: 'The process of building Starting Monday' },
                { label: 'User Story', desc: 'Real experiences from executives in search' },
                { label: 'Engagement', desc: 'Questions and conversation-starters for the audience' },
              ].map(p => (
                <div key={p.label} className="flex gap-2 items-start">
                  <span className="text-[11px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded shrink-0">{p.label}</span>
                  <span className="text-[12px] text-slate-500 mt-0.5">{p.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[12px] text-slate-400">
              This page: <span className="font-mono text-slate-600">https://startingmonday.app/dashboard/admin/social</span>
            </p>
          </div>
        </div>

      </main>
    </div>
  )
}
