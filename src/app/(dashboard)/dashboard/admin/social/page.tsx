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
            Today&apos;s draft - review, edit, copy, and mark posted.
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
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-4">Daily Workflow — Monday, Wednesday, Friday</p>
          <ol className="flex flex-col gap-5">
            {[
              {
                title: 'Open this page before 8:30 AM CT on post days.',
                body: 'Posts go out Monday, Wednesday, and Friday only. The page will say "No post scheduled today" on off days. A cron job auto-posts at 8:30 AM CT if you haven\'t posted first — so if you want to review before it goes out, open this before then. If the status already shows "Posted," the auto-post already fired; just scroll to Notes.',
              },
              {
                title: 'Read the draft carefully. Check three things.',
                body: '(a) Does it sound like Rich — direct, short sentences, no corporate filler? If it sounds like a press release, regenerate. (b) Is it under 3,000 characters? The count appears below the text box. LinkedIn cuts off anything longer. (c) Does it end on a strong note — a question, a point, or a challenge? Weak endings kill engagement. If the draft is off on any of these, click "Regenerate" in the top-right of the date card. You can regenerate as many times as needed until it\'s right.',
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
