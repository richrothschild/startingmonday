import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember } from '@/lib/staff'

type OutreachLogRow = {
  sent_at: string
  delivery_status: string | null
  outreach_channel: string | null
  send_mode: string | null
  recipient_email: string | null
  recipient_name: string | null
  subject: string | null
}

type ContactRow = {
  outreach_status: string | null
}

type SocialPostRow = {
  post_date: string
  is_posted: boolean
  notes: string | null
  like_count: number
  comment_count: number
  impression_count: number
  engagement_synced_at: string | null
  linkedin_post_urn: string | null
}

type UserRow = {
  id: string
  email: string | null
  created_at: string
  subscription_status: string
  subscription_tier: string | null
  signup_source: string | null
}

function channelLabel(value: string | null): string {
  const map: Record<string, string> = {
    executives: 'Executives',
    search_firms: 'Search Firms',
    coaches: 'Coaches',
    outplacement_firms: 'Outplacement',
  }
  return map[value ?? ''] ?? (value ?? 'Unknown')
}

function parseEngagementFromNotes(notes: string | null): { likes: number; comments: number } | null {
  if (!notes) return null
  const likesMatch = notes.match(/(\d+)\s*likes?/i)
  const commentsMatch = notes.match(/(\d+)\s*comments?/i)
  if (!likesMatch && !commentsMatch) return null
  return {
    likes: likesMatch ? Number(likesMatch[1]) : 0,
    comments: commentsMatch ? Number(commentsMatch[1]) : 0,
  }
}

export default async function OutreachAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const admin = createAdminClient()
  const now = new Date()
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: outreach7d },
    { data: outreach30d },
    { data: contacts },
    { data: socialPosts },
    { data: newUsers30d },
    { count: trialingCount },
    { count: activeCount },
    { count: activeMonitorCount },
    { count: activeSearchCount },
    { count: activeExecutiveCount },
  ] = await Promise.all([
    admin
      .from('outreach_logs')
      .select('sent_at, delivery_status, outreach_channel, send_mode, recipient_email, recipient_name, subject')
      .gte('sent_at', since7d)
      .order('sent_at', { ascending: false })
      .limit(5000),
    admin
      .from('outreach_logs')
      .select('sent_at, delivery_status, outreach_channel, send_mode, recipient_email, recipient_name, subject')
      .gte('sent_at', since30d)
      .order('sent_at', { ascending: false })
      .limit(5000),
    admin
      .from('contacts')
      .select('outreach_status')
      .eq('status', 'active')
      .limit(10000),
    admin
      .from('social_posts')
      .select('post_date, is_posted, notes, like_count, comment_count, impression_count, engagement_synced_at, linkedin_post_urn')
      .gte('post_date', since30d.slice(0, 10))
      .order('post_date', { ascending: true })
      .limit(200),
    admin
      .from('users')
      .select('id, email, created_at, subscription_status, subscription_tier, signup_source')
      .gte('created_at', since30d)
      .order('created_at', { ascending: false })
      .limit(5000),
    admin.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'trialing'),
    admin.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    admin.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active').eq('subscription_tier', 'passive'),
    admin.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active').eq('subscription_tier', 'active'),
    admin.from('users').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active').eq('subscription_tier', 'executive'),
  ])

  const typed7d = (outreach7d ?? []) as unknown as OutreachLogRow[]
  const typed30d = (outreach30d ?? []) as unknown as OutreachLogRow[]
  const typedContacts = (contacts ?? []) as ContactRow[]
  const typedSocial = (socialPosts ?? []) as unknown as SocialPostRow[]
  const typedUsers30d = (newUsers30d ?? []) as UserRow[]

  const live7d = typed7d.filter(r => r.send_mode === 'live')
  const delivered7d = live7d.filter(r => r.delivery_status === 'email.delivered').length
  const bounced7d = live7d.filter(r => r.delivery_status === 'email.bounced' || r.delivery_status === 'email.complained').length
  const sent7d = live7d.length
  const unconfirmed7d = live7d.filter(r => r.delivery_status === 'sent' && r.sent_at < since24h).length
  const deliveryRate7d = sent7d > 0 ? Math.round((delivered7d / sent7d) * 100) : 0

  const channelMap = new Map<string, { sent: number; delivered: number; bounced: number }>()
  for (const row of live7d) {
    const key = row.outreach_channel ?? 'unknown'
    const agg = channelMap.get(key) ?? { sent: 0, delivered: 0, bounced: 0 }
    agg.sent += 1
    if (row.delivery_status === 'email.delivered') agg.delivered += 1
    if (row.delivery_status === 'email.bounced' || row.delivery_status === 'email.complained') agg.bounced += 1
    channelMap.set(key, agg)
  }
  const channelRows = Array.from(channelMap.entries())
    .map(([channel, values]) => ({ channel, ...values }))
    .sort((a, b) => b.sent - a.sent)

  const byStatus = {
    prospect: typedContacts.filter(c => (c.outreach_status ?? 'prospect') === 'prospect').length,
    reached_out: typedContacts.filter(c => c.outreach_status === 'reached_out').length,
    in_conversation: typedContacts.filter(c => c.outreach_status === 'in_conversation').length,
    meeting_scheduled: typedContacts.filter(c => c.outreach_status === 'meeting_scheduled').length,
    closed: typedContacts.filter(c => c.outreach_status === 'closed').length,
  }

  const contactedTotal = byStatus.reached_out + byStatus.in_conversation + byStatus.meeting_scheduled + byStatus.closed
  const responsesTotal = byStatus.in_conversation + byStatus.meeting_scheduled
  const responseRate = contactedTotal > 0 ? Math.round((responsesTotal / contactedTotal) * 100) : 0
  const meetingRate = contactedTotal > 0 ? Math.round((byStatus.meeting_scheduled / contactedTotal) * 100) : 0

  const postedSocial = typedSocial.filter(p => p.is_posted)
  const postsWithUrn = postedSocial.filter(p => p.linkedin_post_urn)
  const postsSynced = postedSocial.filter(p => p.engagement_synced_at)
  const totalLikes = postedSocial.reduce((sum, p) => sum + (p.like_count ?? 0), 0)
  const totalComments = postedSocial.reduce((sum, p) => sum + (p.comment_count ?? 0), 0)
  const totalImpressions = postedSocial.reduce((sum, p) => sum + (p.impression_count ?? 0), 0)
  const avgEngagementRate = postsSynced.length > 0
    ? Math.round(postsSynced.reduce((sum, p) => {
        const imp = p.impression_count ?? 0
        if (imp === 0) return sum
        return sum + ((p.like_count + p.comment_count) / imp) * 100
      }, 0) / postsSynced.filter(p => (p.impression_count ?? 0) > 0).length * 10) / 10
    : 0

  // Engagement trend chart data (last 30d posted, ascending order)
  const chartPosts = postedSocial.slice(-20)
  const maxEngagement = Math.max(...chartPosts.map(p => (p.like_count ?? 0) + (p.comment_count ?? 0)), 1)

  // Fallback: parse manual notes only when API data not yet synced
  let parsedLikes = 0
  let parsedComments = 0
  let parsedEngagementPosts = 0
  const unsynced = postedSocial.filter(p => !p.engagement_synced_at)
  for (const post of unsynced) {
    const parsed = parseEngagementFromNotes(post.notes)
    if (!parsed) continue
    parsedEngagementPosts += 1
    parsedLikes += parsed.likes
    parsedComments += parsed.comments
  }

  const newTrialUsers30d = typedUsers30d.filter(u => u.subscription_status === 'trialing').length
  const newPaidUsers30d = typedUsers30d.filter(u => u.subscription_status === 'active').length
  const newPaidByTier = {
    monitor: typedUsers30d.filter(u => u.subscription_status === 'active' && u.subscription_tier === 'passive').length,
    search: typedUsers30d.filter(u => u.subscription_status === 'active' && u.subscription_tier === 'active').length,
    executive: typedUsers30d.filter(u => u.subscription_status === 'active' && u.subscription_tier === 'executive').length,
  }

  const outreachEmails30d = new Set(
    typed30d
      .filter(r => r.send_mode === 'live')
      .map(r => (r.recipient_email ?? '').trim().toLowerCase())
      .filter(Boolean),
  )

  const outreachAttributed30d = typedUsers30d.filter(u => {
    const email = (u.email ?? '').trim().toLowerCase()
    return email && outreachEmails30d.has(email)
  }).length

  const topSignupSources = Object.entries(
    typedUsers30d.reduce<Record<string, number>>((acc, userRow) => {
      const source = (userRow.signup_source ?? 'direct').trim() || 'direct'
      acc[source] = (acc[source] ?? 0) + 1
      return acc
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const recentFailures = live7d
    .filter(r => r.delivery_status === 'email.bounced' || r.delivery_status === 'email.complained')
    .slice(0, 20)

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Admin</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Outreach Performance</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">Single-view operating dashboard for outbound performance, response funnel, customer growth, and LinkedIn execution.</p>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded p-5">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">Live Sends (7d)</p>
            <p className="text-[24px] font-bold text-slate-900">{sent7d}</p>
            <p className="text-[12px] text-slate-500 mt-1">Delivery rate: {deliveryRate7d}%</p>
          </div>
          <div className="bg-white border border-slate-200 rounded p-5">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">Delivery Issues (7d)</p>
            <p className="text-[24px] font-bold text-slate-900">{bounced7d + unconfirmed7d}</p>
            <p className="text-[12px] text-slate-500 mt-1">Bounced: {bounced7d} · Unconfirmed: {unconfirmed7d}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded p-5">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">Response Rate</p>
            <p className="text-[24px] font-bold text-slate-900">{responseRate}%</p>
            <p className="text-[12px] text-slate-500 mt-1">In conversation + meetings / contacted</p>
          </div>
          <div className="bg-white border border-slate-200 rounded p-5">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">Meetings Set Rate</p>
            <p className="text-[24px] font-bold text-slate-900">{meetingRate}%</p>
            <p className="text-[12px] text-slate-500 mt-1">Meetings / contacted</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">Outreach Funnel</p>
            </div>
            <div className="px-5 py-4 text-[13px] text-slate-700 grid grid-cols-2 gap-y-2">
              <p>Prospects</p><p className="font-semibold text-right">{byStatus.prospect}</p>
              <p>Reached out</p><p className="font-semibold text-right">{byStatus.reached_out}</p>
              <p>In conversation</p><p className="font-semibold text-right">{byStatus.in_conversation}</p>
              <p>Meetings scheduled</p><p className="font-semibold text-right">{byStatus.meeting_scheduled}</p>
              <p>Closed</p><p className="font-semibold text-right">{byStatus.closed}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">Sends by Channel (7d)</p>
            </div>
            <div className="px-5 py-4">
              {channelRows.length === 0 ? (
                <p className="text-[13px] text-slate-500">No live sends in the last 7 days.</p>
              ) : (
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-left text-slate-400">
                      <th className="pb-2 font-semibold">Channel</th>
                      <th className="pb-2 font-semibold text-right">Sent</th>
                      <th className="pb-2 font-semibold text-right">Delivered</th>
                      <th className="pb-2 font-semibold text-right">Bounced</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {channelRows.map(row => (
                      <tr key={row.channel}>
                        <td className="py-2 text-slate-700">{channelLabel(row.channel)}</td>
                        <td className="py-2 text-right text-slate-900 font-semibold">{row.sent}</td>
                        <td className="py-2 text-right text-slate-900 font-semibold">{row.delivered}</td>
                        <td className="py-2 text-right text-slate-900 font-semibold">{row.bounced}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">New Customers (30d)</p>
            </div>
            <div className="px-5 py-4 text-[13px] text-slate-700 grid grid-cols-2 gap-y-2">
              <p>New trial users</p><p className="font-semibold text-right">{newTrialUsers30d}</p>
              <p>New paid users</p><p className="font-semibold text-right">{newPaidUsers30d}</p>
              <p>New paid · Intelligence</p><p className="font-semibold text-right">{newPaidByTier.monitor}</p>
              <p>New paid · Search</p><p className="font-semibold text-right">{newPaidByTier.search}</p>
              <p>New paid · Executive</p><p className="font-semibold text-right">{newPaidByTier.executive}</p>
              <p>Potential outreach-attributed signups</p><p className="font-semibold text-right">{outreachAttributed30d}</p>
            </div>
            <div className="px-5 pb-4 text-[11px] text-slate-400">Outreach attribution is email-match based (recipient_email to user email) and directional, not deterministic.</div>
          </div>

          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">Current Customer Base</p>
            </div>
            <div className="px-5 py-4 text-[13px] text-slate-700 grid grid-cols-2 gap-y-2">
              <p>Trialing now</p><p className="font-semibold text-right">{trialingCount ?? 0}</p>
              <p>Active paid now</p><p className="font-semibold text-right">{activeCount ?? 0}</p>
              <p>Active · Intelligence</p><p className="font-semibold text-right">{activeMonitorCount ?? 0}</p>
              <p>Active · Search</p><p className="font-semibold text-right">{activeSearchCount ?? 0}</p>
              <p>Active · Executive</p><p className="font-semibold text-right">{activeExecutiveCount ?? 0}</p>
            </div>

            <div className="px-5 pb-4">
              <p className="text-[11px] text-slate-400 mb-2">Top signup sources (30d)</p>
              <div className="flex flex-wrap gap-2">
                {topSignupSources.length === 0 ? (
                  <span className="text-[12px] text-slate-500">No recent signups.</span>
                ) : topSignupSources.map(([source, count]) => (
                  <span key={source} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded">{source}: {count}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">LinkedIn Engagement (30d)</p>
              {postsSynced.length > 0 && (
                <span className="text-[10px] text-emerald-600 font-semibold">API synced</span>
              )}
            </div>
            <div className="px-5 py-4 text-[13px] text-slate-700 grid grid-cols-2 gap-y-2">
              <p>Posts published</p><p className="font-semibold text-right">{postedSocial.length}</p>
              <p>Posts with LinkedIn URN</p><p className="font-semibold text-right">{postsWithUrn.length}</p>
              <p>Posts with API engagement</p><p className="font-semibold text-right">{postsSynced.length}</p>
              <p>Total likes</p><p className="font-semibold text-right">{totalLikes + parsedLikes}</p>
              <p>Total comments</p><p className="font-semibold text-right">{totalComments + parsedComments}</p>
              {totalImpressions > 0 && (
                <>
                  <p>Total impressions</p><p className="font-semibold text-right">{totalImpressions.toLocaleString()}</p>
                  <p>Avg engagement rate</p><p className="font-semibold text-right">{avgEngagementRate}%</p>
                </>
              )}
              {parsedEngagementPosts > 0 && (
                <>
                  <p className="text-slate-400">Manual notes (unsynced)</p>
                  <p className="font-semibold text-right text-slate-400">{parsedEngagementPosts} posts</p>
                </>
              )}
            </div>
            {postsWithUrn.length === 0 && (
              <div className="px-5 pb-4 text-[11px] text-amber-600">
                No LinkedIn URNs stored yet. Update your Make.com scenario to return{' '}
                <code className="font-mono">&#123;&quot;linkedin_post_urn&quot;: &quot;urn:li:ugcPost:...&quot;&#125;</code>{' '}
                in the HTTP response module, then add <code className="font-mono">LINKEDIN_ACCESS_TOKEN</code> to env.
              </div>
            )}
            {postsWithUrn.length > 0 && postsSynced.length === 0 && (
              <div className="px-5 pb-4 text-[11px] text-amber-600">
                URNs stored but no sync yet. Add <code className="font-mono">LINKEDIN_ACCESS_TOKEN</code> env var
                (requires <code className="font-mono">r_member_social</code> or <code className="font-mono">r_organization_social</code> scope).
              </div>
            )}
          </div>

          {/* Engagement trend bar chart — inline SVG, no client bundle needed */}
          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">Engagement Trend (last 20 posts)</p>
            </div>
            <div className="px-5 py-5">
              {chartPosts.length === 0 ? (
                <p className="text-[13px] text-slate-500">No posted data yet.</p>
              ) : (
                <svg viewBox={`0 0 ${chartPosts.length * 22} 80`} className="w-full h-20">
                  {chartPosts.map((p, i) => {
                    const total = (p.like_count ?? 0) + (p.comment_count ?? 0)
                    const likeH = Math.round(((p.like_count ?? 0) / maxEngagement) * 64)
                    const commentH = Math.round(((p.comment_count ?? 0) / maxEngagement) * 64)
                    const barH = Math.max(likeH + commentH, total > 0 ? 2 : 0)
                    const x = i * 22 + 3
                    return (
                      <g key={p.post_date}>
                        {barH > 0 && (
                          <>
                            <rect x={x} y={72 - likeH} width={16} height={likeH} fill="#6366f1" rx={2} />
                            <rect x={x} y={72 - likeH - commentH} width={16} height={commentH} fill="#f97316" rx={2} />
                          </>
                        )}
                        {barH === 0 && (
                          <rect x={x} y={71} width={16} height={1} fill="#e2e8f0" />
                        )}
                        <text x={x + 8} y={80} textAnchor="middle" fontSize={7} fill="#94a3b8">
                          {p.post_date.slice(5)}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              )}
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span className="inline-block w-3 h-3 rounded-sm bg-indigo-500" />Likes
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span className="inline-block w-3 h-3 rounded-sm bg-orange-500" />Comments
                </span>
                {postsSynced.length === 0 && (
                  <span className="text-[11px] text-slate-400 ml-auto">Awaiting API sync</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4">
          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">Recent Delivery Failures (7d)</p>
            </div>
            <div className="px-5 py-4">
              {recentFailures.length === 0 ? (
                <p className="text-[13px] text-slate-500">No bounced or complaint events in the last 7 days.</p>
              ) : (
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-left text-slate-400">
                      <th className="pb-2 font-semibold">Recipient</th>
                      <th className="pb-2 font-semibold">Channel</th>
                      <th className="pb-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentFailures.map((row, idx) => (
                      <tr key={`${row.recipient_email ?? 'na'}-${idx}`}>
                        <td className="py-2 text-slate-700">{row.recipient_name || row.recipient_email || 'Unknown'}</td>
                        <td className="py-2 text-slate-700">{channelLabel(row.outreach_channel)}</td>
                        <td className="py-2 text-slate-900 font-semibold">{row.delivery_status ?? 'unknown'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/dashboard/outreach" className="bg-white border border-slate-200 rounded p-4 hover:border-slate-300 transition-colors">
            <p className="text-[13px] font-semibold text-slate-900">Open Outreach Hub</p>
            <p className="text-[12px] text-slate-500 mt-1">Manage queue, send messages, and update statuses.</p>
          </Link>
          <Link href="/dashboard/admin/social" className="bg-white border border-slate-200 rounded p-4 hover:border-slate-300 transition-colors">
            <p className="text-[13px] font-semibold text-slate-900">Open LinkedIn Social</p>
            <p className="text-[12px] text-slate-500 mt-1">Review drafts, posting history, and engagement notes.</p>
          </Link>
          <Link href="/dashboard/admin/customers" className="bg-white border border-slate-200 rounded p-4 hover:border-slate-300 transition-colors">
            <p className="text-[13px] font-semibold text-slate-900">Open Customers</p>
            <p className="text-[12px] text-slate-500 mt-1">Inspect trial and paid customer details.</p>
          </Link>
        </section>
      </main>
    </div>
  )
}

