import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Feedback Admin - Dashboard',
  description: 'Manage user feedback, track SLAs, and update statuses.',
  robots: { index: false, follow: false },
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-slate-100 text-slate-700',
  under_review: 'bg-blue-100 text-blue-700',
  planned: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-orange-100 text-orange-700',
  shipped: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
}

const CATEGORY_EMOJIS: Record<string, string> = {
  bug: '🐛',
  feature_request: '✨',
  ui_ux: '🎨',
  performance: '⚡',
  other: '💭',
}

type FeedbackMetric = {
  id: string
  title: string
  category: string
  status: string
  vote_count: number
  created_at: string
  user_profiles?: { full_name?: string | null } | null
  feedback_comments?: Array<{ count?: number | null }> | null
  first_staff_response_at?: string | null
  status_decided_at?: string | null
  hoursOld: number
  timeToFirstResponse: number | null
  timeToDecision: number | null
  exceeds24h: boolean
  exceeds7d: boolean
}

export default async function FeedbackAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check staff status
  const staffQuery = supabase.from('staff_members') as any
  const { data: staffMember } = await staffQuery
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!staffMember) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Access denied. Staff only.</p>
          <Link href="/dashboard" className="text-orange-600 hover:text-orange-700 mt-4 inline-block">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Fetch feedback items with stats
  const result = await supabase
    .from('feedback_items')
    .select(`
      *,
      user_profiles:user_id(full_name, email),
      feedback_comments(count),
      feedback_status_history(count)
    `)
    .order('created_at', { ascending: false })
    .limit(100) as any

  const { data: feedbackItems, error } = result

  if (error) {
    console.error('Error fetching feedback:', error)
  }

  // Calculate SLA metrics
  const now = new Date()
  const metrics: FeedbackMetric[] = (feedbackItems || []).map((item: any) => {
    const createdAt = new Date(item.created_at)
    const hoursOld = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

    const firstResponseAt = item.first_staff_response_at ? new Date(item.first_staff_response_at) : null
    const timeToFirstResponse = firstResponseAt
      ? (firstResponseAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
      : null

    const statusDecidedAt = item.status_decided_at ? new Date(item.status_decided_at) : null
    const timeToDecision = statusDecidedAt
      ? (statusDecidedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
      : null

    return {
      ...item,
      hoursOld,
      timeToFirstResponse,
      timeToDecision,
      exceeds24h: item.status === 'new' && hoursOld > 24,
      exceeds7d: item.status !== 'shipped' && item.status !== 'declined' && hoursOld > 168,
    }
  })

  // Count items by status
  const statusCounts = {
    new: metrics.filter((m) => m.status === 'new').length,
    under_review: metrics.filter((m) => m.status === 'under_review').length,
    planned: metrics.filter((m) => m.status === 'planned').length,
    in_progress: metrics.filter((m) => m.status === 'in_progress').length,
    shipped: metrics.filter((m) => m.status === 'shipped').length,
    declined: metrics.filter((m) => m.status === 'declined').length,
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard/admin" className="text-[13px] font-semibold text-slate-900 hover:text-orange-600 transition-colors">
            ← Admin
          </Link>
          <h1 className="text-[18px] font-bold text-slate-900">Feedback Management</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* SLA Summary Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'New', count: statusCounts.new, color: 'bg-slate-50 text-slate-700 border-slate-200' },
            { label: 'Under Review', count: statusCounts.under_review, color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { label: 'Planned', count: statusCounts.planned, color: 'bg-purple-50 text-purple-700 border-purple-200' },
            { label: 'In Progress', count: statusCounts.in_progress, color: 'bg-orange-50 text-orange-700 border-orange-200' },
            { label: 'Shipped', count: statusCounts.shipped, color: 'bg-green-50 text-green-700 border-green-200' },
            { label: 'Declined', count: statusCounts.declined, color: 'bg-red-50 text-red-700 border-red-200' },
          ].map((stat) => (
            <div key={stat.label} className={`border rounded-lg p-3 ${stat.color}`}>
              <p className="text-[11px] font-semibold uppercase mb-1 opacity-75">{stat.label}</p>
              <p className="text-[24px] font-bold">{stat.count}</p>
            </div>
          ))}
        </section>

        {/* SLA Alerts */}
        <section className="space-y-3">
          {metrics.filter((m) => m.exceeds24h || m.exceeds7d).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              <p className="text-[13px] font-bold text-red-900">🚨 SLA Breaches</p>
              <ul className="text-[12px] text-red-800 space-y-1">
                {metrics.filter((m) => m.exceeds24h).map((m) => (
                  <li key={m.id}>
                    "{m.title}" - No response for {Math.round(m.hoursOld)} hours
                  </li>
                ))}
                {metrics.filter((m) => m.exceeds7d).map((m) => (
                  <li key={m.id}>
                    "{m.title}" - No decision for {Math.round(m.hoursOld / 24)} days
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Feedback Items Table */}
        <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-900">Title</th>
                  <th className="px-4 py-3 font-semibold text-slate-900">Category</th>
                  <th className="px-4 py-3 font-semibold text-slate-900">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-900">User</th>
                  <th className="px-4 py-3 font-semibold text-slate-900 text-right">Age</th>
                  <th className="px-4 py-3 font-semibold text-slate-900 text-right">Votes</th>
                  <th className="px-4 py-3 font-semibold text-slate-900 text-right">Comments</th>
                  <th className="px-4 py-3 font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                      No feedback items yet
                    </td>
                  </tr>
                ) : (
                  metrics.map((item: FeedbackMetric) => (
                    <tr key={item.id} className={`hover:bg-slate-50 ${item.exceeds24h || item.exceeds7d ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3 max-w-xs truncate">
                        <span className="font-medium text-slate-900">{item.title}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px]">{CATEGORY_EMOJIS[item.category] || '•'} {item.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-[11px] font-semibold ${STATUS_COLORS[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px]">
                        {item.user_profiles?.full_name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={item.exceeds24h ? 'text-red-600 font-bold' : ''}>
                          {Math.round(item.hoursOld)}h
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {item.vote_count}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.feedback_comments?.[0]?.count || 0}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/admin/feedback/${item.id}`}
                          className="text-orange-600 hover:text-orange-700 font-semibold text-[11px]"
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
