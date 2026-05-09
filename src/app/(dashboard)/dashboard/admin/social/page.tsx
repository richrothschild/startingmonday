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

  // Post history — last 30 days
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data: history } = await admin
    .from('social_posts')
    .select('id, post_date, pillar, is_posted, posted_at, draft_text')
    .gte('post_date', since30d)
    .order('post_date', { ascending: false })

  const posts = (history ?? []) as {
    id: string
    post_date: string
    pillar: string
    is_posted: boolean
    posted_at: string | null
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
            Today&apos;s draft — review, edit, copy, and mark posted.
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
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-4">Daily Workflow</p>
          <ol className="flex flex-col gap-2.5">
            {[
              'Open this page each weekday morning from the calendar invite link.',
              'Read the draft. Edit any line directly in the text box.',
              'Click "Copy to LinkedIn" to copy the full post to your clipboard.',
              'Open LinkedIn, start a new post, paste, and publish.',
              'Return here and click "Mark posted" to record it.',
              'Check LinkedIn for replies and comments — respond within 24 hours.',
            ].map((step, i) => (
              <li key={i} className="flex gap-3 text-[13px] text-slate-600">
                <span className="shrink-0 w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[12px] text-slate-400">
              Calendar invite link: <span className="font-mono text-slate-600">https://startingmonday.app/dashboard/admin/social</span>
            </p>
          </div>
        </div>

      </main>
    </div>
  )
}
