'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type CommandCenterClient = {
  user_id: string
  name: string | null
  email: string | null
  persona: string | null
  accepted_at: string | null
  last_activity_at: string | null
  risk_score: number
  urgency: 'high' | 'medium' | 'low'
  risk_inputs: {
    momentum_score: number | null
    overdue_actions: number
    days_since_activity: number
    active_pipeline_companies: number
  }
  next_action: {
    action: string | null
    due_date: string | null
    owner: string | null
    status: string | null
  } | null
}

type CommandCenterResponse = {
  portfolio: {
    total_clients: number
    urgency: { high: number; medium: number; low: number }
    average_risk_score: number
  }
  freshness_sla: {
    stale_clients: number
  }
  pagination: {
    page: number
    page_size: number
    total_clients: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
  monitoring: {
    route: string
    budget_ms: number
    fetch_ms: number
    payload_clients: number
    payload_sessions: number
  }
  upcoming_sessions: Array<{
    user_id: string
    name: string | null
    email: string | null
    scheduled_for: string | null
    owner: string | null
    action: string | null
    urgency: 'high' | 'medium' | 'low'
  }>
  clients: CommandCenterClient[]
}

const PERSONA_LABELS: Record<string, string> = {
  csuite: 'C-Suite',
  vp: 'VP/SVP',
  director: 'Director',
  board: 'Board',
}

export default function CoachDashboard() {
  const [commandCenter, setCommandCenter] = useState<CommandCenterResponse | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSent, setInviteSent] = useState<string | null>(null)
  const [homeLoadMs, setHomeLoadMs] = useState<number | null>(null)

  useEffect(() => {
    const startedAt = performance.now()
    setLoading(true)
    fetch(`/api/coach/command-center?page=${page}&pageSize=25`)
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data.clients) && data.portfolio) {
          setCommandCenter(data)
          setHomeLoadMs(Math.round(performance.now() - startedAt))
        }
        else setError('Could not load client data.')
      })
      .catch(() => setError('Could not load client data.'))
      .finally(() => setLoading(false))
  }, [page])

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim() || inviting) return
    setInviting(true)
    setInviteError('')
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })
      if (res.ok) {
        setInviteSent(inviteEmail.trim())
        setInviteEmail('')
      } else {
        const json = await res.json().catch(() => ({}))
        setInviteError(json.error ?? 'Failed to send invite.')
      }
    } catch {
      setInviteError('Something went wrong.')
    } finally {
      setInviting(false)
    }
  }

  const clients = commandCenter?.clients ?? []
  const atRisk = clients.filter(c => c.urgency === 'high')
  const overdue = clients.filter(c => c.risk_inputs.overdue_actions > 0)
  const actionQueue = clients
    .filter(c => c.next_action?.action)
    .sort((a, b) => {
      const urgencyWeight = { high: 3, medium: 2, low: 1 }
      const urgencyDelta = urgencyWeight[b.urgency] - urgencyWeight[a.urgency]
      if (urgencyDelta !== 0) return urgencyDelta
      const dueA = a.next_action?.due_date ?? '9999-12-31'
      const dueB = b.next_action?.due_date ?? '9999-12-31'
      return dueA.localeCompare(dueB)
    })
    .slice(0, 8)

  function urgencyClass(urgency: 'high' | 'medium' | 'low') {
    if (urgency === 'high') return 'text-red-700 bg-red-50 border-red-200'
    if (urgency === 'medium') return 'text-amber-700 bg-amber-50 border-amber-200'
    return 'text-green-700 bg-green-50 border-green-200'
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link href="/dashboard" className="text-[13px] text-slate-300 hover:text-white transition-colors">
            &larr; Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6">
          <div className="text-[13px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-1">Coach</div>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Portfolio Command Center</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            {clients.length} client{clients.length !== 1 ? 's' : ''} under your account.
          </p>
        </div>

        {!loading && commandCenter && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white border border-slate-200 rounded p-3">
              <p className="text-[13px] font-bold tracking-[0.08em] uppercase text-slate-400">Total clients</p>
              <p className="text-[24px] font-bold text-slate-900 mt-1 tabular-nums">{commandCenter.portfolio.total_clients}</p>
            </div>
            <div className="bg-white border border-red-200 rounded p-3">
              <p className="text-[13px] font-bold tracking-[0.08em] uppercase text-red-500">High risk</p>
              <p className="text-[24px] font-bold text-red-700 mt-1 tabular-nums">{commandCenter.portfolio.urgency.high}</p>
            </div>
            <div className="bg-white border border-amber-200 rounded p-3">
              <p className="text-[13px] font-bold tracking-[0.08em] uppercase text-amber-600">Stale data</p>
              <p className="text-[24px] font-bold text-amber-700 mt-1 tabular-nums">{commandCenter.freshness_sla.stale_clients}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded p-3">
              <p className="text-[13px] font-bold tracking-[0.08em] uppercase text-slate-400">Avg risk</p>
              <p className="text-[24px] font-bold text-slate-900 mt-1 tabular-nums">{commandCenter.portfolio.average_risk_score}</p>
            </div>
          </div>
        )}

        {!loading && commandCenter?.monitoring && (
          <div className="bg-white border border-slate-200 rounded p-4 mb-6">
            <p className="text-[13px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-2">Route performance</p>
            <div className="grid sm:grid-cols-5 gap-3">
              <div>
                <p className="text-[13px] uppercase tracking-[0.08em] text-slate-400">Route fetch</p>
                <p className="text-[14px] font-semibold text-slate-800 tabular-nums">{commandCenter.monitoring.fetch_ms}ms</p>
              </div>
              <div>
                <p className="text-[13px] uppercase tracking-[0.08em] text-slate-400">Home load</p>
                <p className="text-[14px] font-semibold text-slate-800 tabular-nums">{homeLoadMs ?? '-'}ms</p>
              </div>
              <div>
                <p className="text-[13px] uppercase tracking-[0.08em] text-slate-400">Budget</p>
                <p className="text-[14px] font-semibold text-slate-800 tabular-nums">{commandCenter.monitoring.budget_ms}ms</p>
              </div>
              <div>
                <p className="text-[13px] uppercase tracking-[0.08em] text-slate-400">Client rows</p>
                <p className="text-[14px] font-semibold text-slate-800 tabular-nums">{commandCenter.monitoring.payload_clients}</p>
              </div>
              <div>
                <p className="text-[13px] uppercase tracking-[0.08em] text-slate-400">Upcoming rows</p>
                <p className="text-[14px] font-semibold text-slate-800 tabular-nums">{commandCenter.monitoring.payload_sessions}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && (atRisk.length > 0 || overdue.length > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6">
            <p className="text-[13px] font-bold tracking-[0.1em] uppercase text-amber-700 mb-2">Needs Attention</p>
            {atRisk.length > 0 && (
              <p className="text-[13px] text-slate-700 mb-1">
                <span className="font-semibold">{atRisk.length}</span> client{atRisk.length !== 1 ? 's' : ''} in high-risk status.
              </p>
            )}
            {overdue.length > 0 && (
              <p className="text-[13px] text-slate-700">
                <span className="font-semibold">{overdue.length}</span> client{overdue.length !== 1 ? 's' : ''} with overdue actions.
              </p>
            )}
          </div>
        )}

        {!loading && commandCenter && (
          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded p-4">
              <p className="text-[13px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">Upcoming sessions</p>
              {commandCenter.upcoming_sessions.length === 0 ? (
                <p className="text-[13px] text-slate-500">No upcoming sessions or due touchpoints in the current window.</p>
              ) : (
                <div className="space-y-3">
                  {commandCenter.upcoming_sessions.slice(0, 6).map(session => (
                    <div key={`${session.user_id}-${session.scheduled_for}`} className="border border-slate-100 rounded p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[13px] font-semibold text-slate-900 truncate">{session.name ?? session.email ?? 'Client'}</p>
                        <span className={`text-[13px] font-bold uppercase tracking-[0.08em] border rounded px-2 py-0.5 ${urgencyClass(session.urgency)}`}>{session.urgency}</span>
                      </div>
                      <p className="text-[13px] text-slate-500 mt-0.5">Due {session.scheduled_for ?? 'TBD'}{session.owner ? ` · Owner: ${session.owner}` : ''}</p>
                      {session.action && <p className="text-[13px] text-slate-700 mt-1">{session.action}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded p-4">
              <p className="text-[13px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">Priority action queue</p>
              {actionQueue.length === 0 ? (
                <p className="text-[13px] text-slate-500">No open actions. Weekly review queue is clear.</p>
              ) : (
                <div className="space-y-3">
                  {actionQueue.map(client => (
                    <div key={client.user_id} className="border border-slate-100 rounded p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[13px] font-semibold text-slate-900 truncate">{client.name ?? client.email ?? 'Client'}</p>
                        <span className={`text-[13px] font-bold uppercase tracking-[0.08em] border rounded px-2 py-0.5 ${urgencyClass(client.urgency)}`}>{client.urgency}</span>
                      </div>
                      <p className="text-[13px] text-slate-700 mt-1">{client.next_action?.action}</p>
                      <p className="text-[13px] text-slate-500 mt-0.5">Due {client.next_action?.due_date ?? 'TBD'}{client.next_action?.owner ? ` · Owner: ${client.next_action.owner}` : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded overflow-hidden mb-8">
          {loading ? (
            <div className="px-6 py-10 text-center text-[13px] text-slate-400">Loading clients...</div>
          ) : error ? (
            <div className="px-6 py-10 text-center text-[13px] text-red-600">{error}</div>
          ) : clients.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-[14px] text-slate-500 mb-1">No clients yet.</p>
              <p className="text-[13px] text-slate-400">Invite a client below to get started.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[13px] font-bold tracking-[0.1em] uppercase text-slate-400 px-6 py-3">Client</th>
                  <th className="text-left text-[13px] font-bold tracking-[0.1em] uppercase text-slate-400 px-4 py-3">Level</th>
                  <th className="text-center text-[13px] font-bold tracking-[0.1em] uppercase text-slate-400 px-4 py-3">Risk</th>
                  <th className="text-center text-[13px] font-bold tracking-[0.1em] uppercase text-slate-400 px-4 py-3">Urgency</th>
                  <th className="text-center text-[13px] font-bold tracking-[0.1em] uppercase text-slate-400 px-4 py-3">Overdue</th>
                  <th className="text-left text-[13px] font-bold tracking-[0.1em] uppercase text-slate-400 px-4 py-3">Next action + activity</th>
                  <th className="text-right text-[13px] font-bold tracking-[0.1em] uppercase text-slate-400 px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clients.map(client => (
                  <tr key={client.user_id} className={client.urgency === 'high' || client.risk_inputs.overdue_actions > 0 ? 'bg-amber-50/40' : ''}>
                    <td className="px-6 py-4">
                      <p className="text-[14px] font-semibold text-slate-900">{client.name ?? '(not onboarded)'}</p>
                      <p className="text-[13px] text-slate-400">{client.email ?? '-'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[13px] text-slate-500">{client.persona ? (PERSONA_LABELS[client.persona] ?? client.persona) : '-'}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-[13px] font-bold text-slate-900 tabular-nums">{client.risk_score}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-[13px] font-bold uppercase tracking-[0.08em] border rounded px-2 py-0.5 ${urgencyClass(client.urgency)}`}>{client.urgency}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {client.risk_inputs.overdue_actions > 0
                        ? <span className="text-[13px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full tabular-nums">{client.risk_inputs.overdue_actions}</span>
                        : <span className="text-[13px] text-slate-300">-</span>
                      }
                    </td>
                    <td className="px-4 py-4">
                      {client.next_action?.action ? (
                        <div className="space-y-0.5">
                          <p className="text-[13px] font-semibold text-slate-800 truncate max-w-[220px]">{client.next_action.action}</p>
                          <p className="text-[13px] text-slate-500">
                            {client.next_action.owner ? `Owner: ${client.next_action.owner}` : 'Owner: unassigned'}
                          </p>
                          <p className={`text-[13px] ${client.next_action.due_date && client.next_action.due_date < new Date().toISOString().split('T')[0] ? 'text-red-600' : 'text-slate-500'}`}>
                            Due {client.next_action.due_date ?? 'TBD'}{client.next_action.status ? ` · ${client.next_action.status}` : ''}
                          </p>
                          <p className="text-[13px] text-slate-400">
                            Last activity {client.last_activity_at ? client.last_activity_at.slice(0, 10) : 'none'} · lag {client.risk_inputs.days_since_activity}d
                          </p>
                        </div>
                      ) : (
                        <span className="text-[13px] text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {client.user_id ? (
                        <Link
                          href={`/dashboard/coach/${client.user_id}`}
                          className="text-[13px] font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-2"
                        >
                          View Data
                        </Link>
                      ) : (
                        <span className="text-[13px] text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && commandCenter?.pagination && commandCenter.pagination.total_pages > 1 && (
            <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between">
              <p className="text-[13px] text-slate-500">
                Page {commandCenter.pagination.page} of {commandCenter.pagination.total_pages} · {commandCenter.pagination.total_clients} clients
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={!commandCenter.pagination.has_previous}
                  className="text-[13px] font-semibold px-3 py-1.5 rounded border border-slate-200 text-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={!commandCenter.pagination.has_next}
                  className="text-[13px] font-semibold px-3 py-1.5 rounded border border-slate-200 text-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded p-6">
          <p className="text-[13px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">Invite a client</p>
          <form onSubmit={sendInvite} className="flex gap-3 items-start">
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="client@email.com"
              className="flex-1 border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
            />
            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="bg-slate-900 hover:bg-slate-700 disabled:opacity-40 text-white text-[13px] font-semibold px-4 py-2 rounded transition-colors cursor-pointer border-0 shrink-0"
            >
              {inviting ? 'Sending...' : 'Send invite'}
            </button>
          </form>
          {inviteSent && (
            <p className="text-[13px] text-green-700 mt-2">Invite sent to {inviteSent}.</p>
          )}
          {inviteError && (
            <p className="text-[13px] text-red-600 mt-2">{inviteError}</p>
          )}
          <p className="text-[13px] text-slate-400 mt-3">
            Your client will receive an email to create their account under your coaching relationship. Up to {Math.max(0, 10 - clients.length)} seat{Math.max(0, 10 - clients.length) !== 1 ? 's' : ''} remaining.
          </p>
        </div>

      </main>
    </div>
  )
}
