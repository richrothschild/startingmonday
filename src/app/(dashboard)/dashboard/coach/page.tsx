'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Client = {
  seatId: string
  userId: string | null
  email: string
  name: string | null
  momentumScore: number | null
  persona: string | null
  onboarded: boolean
  activeCompanies: number
  overdueActions: number
  joinedAt: string | null
}

function MomentumBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[12px] text-slate-400">—</span>
  const color = score >= 70 ? 'text-green-700 bg-green-50' : score >= 40 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'
  return <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full tabular-nums ${color}`}>{score}</span>
}

const PERSONA_LABELS: Record<string, string> = {
  csuite: 'C-Suite',
  vp: 'VP/SVP',
  director: 'Director',
  board: 'Board',
}

export default function CoachDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSent, setInviteSent] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/coach/clients')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setClients(data)
        else setError('Could not load client data.')
      })
      .catch(() => setError('Could not load client data.'))
      .finally(() => setLoading(false))
  }, [])

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

  const atRisk = clients.filter(c => c.onboarded && (c.momentumScore ?? 100) < 40)
  const overdue = clients.filter(c => c.overdueActions > 0)

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link href="/dashboard" className="text-[13px] text-slate-300 hover:text-white transition-colors">
            &larr; Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-6">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-1">Coach</div>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Your Clients</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            {clients.length} client{clients.length !== 1 ? 's' : ''} under your account.
          </p>
        </div>

        {/* Alerts */}
        {!loading && (atRisk.length > 0 || overdue.length > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-amber-700 mb-2">Needs Attention</p>
            {atRisk.length > 0 && (
              <p className="text-[13px] text-slate-700 mb-1">
                <span className="font-semibold">{atRisk.length}</span> client{atRisk.length !== 1 ? 's' : ''} with low momentum (&lt;40).
              </p>
            )}
            {overdue.length > 0 && (
              <p className="text-[13px] text-slate-700">
                <span className="font-semibold">{overdue.length}</span> client{overdue.length !== 1 ? 's' : ''} with overdue actions.
              </p>
            )}
          </div>
        )}

        {/* Client table */}
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
                  <th className="text-left text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 px-6 py-3">Client</th>
                  <th className="text-left text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 px-4 py-3">Level</th>
                  <th className="text-center text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 px-4 py-3">Momentum</th>
                  <th className="text-center text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 px-4 py-3">Active</th>
                  <th className="text-center text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 px-4 py-3">Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clients.map(client => (
                  <tr key={client.seatId} className={client.overdueActions > 0 || (client.momentumScore ?? 100) < 40 ? 'bg-amber-50/40' : ''}>
                    <td className="px-6 py-4">
                      <p className="text-[14px] font-semibold text-slate-900">{client.name ?? '(not onboarded)'}</p>
                      <p className="text-[12px] text-slate-400">{client.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[12px] text-slate-500">{client.persona ? (PERSONA_LABELS[client.persona] ?? client.persona) : '—'}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <MomentumBadge score={client.momentumScore} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-[13px] font-semibold text-slate-700 tabular-nums">{client.activeCompanies}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {client.overdueActions > 0
                        ? <span className="text-[12px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full tabular-nums">{client.overdueActions}</span>
                        : <span className="text-[12px] text-slate-300">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Invite client */}
        <div className="bg-white border border-slate-200 rounded p-6">
          <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">Invite a client</p>
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
            <p className="text-[12px] text-green-700 mt-2">Invite sent to {inviteSent}.</p>
          )}
          {inviteError && (
            <p className="text-[12px] text-red-600 mt-2">{inviteError}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-3">
            Your client will receive an email to create their account under your coaching relationship. Up to {10 - clients.length} seat{(10 - clients.length) !== 1 ? 's' : ''} remaining.
          </p>
        </div>

      </main>
    </div>
  )
}
