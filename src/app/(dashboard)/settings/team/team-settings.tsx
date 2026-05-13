'use client'
import { useState, useCallback } from 'react'

type SeatStatus = {
  profileDone: boolean
  companyAdded: boolean
  briefGenerated: boolean
}

type Seat = {
  id: string
  member_email: string
  member_user_id: string | null
  status: 'pending' | 'accepted'
  invited_at: string
  accepted_at: string | null
  seatStatus: SeatStatus | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Dot({ done }: { done: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
  )
}

export function TeamSettings({ seats: initialSeats }: { seats: Seat[] }) {
  const [seats, setSeats] = useState(initialSeats)
  const [email, setEmail] = useState('')
  const [bulkInput, setBulkInput] = useState('')
  const [sending, setSending] = useState(false)
  const [bulkSending, setBulkSending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [bulkSummary, setBulkSummary] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [removing, setRemoving] = useState<string | null>(null)

  const handleRemove = useCallback(async (seatId: string) => {
    if (!confirm('Remove this member? They will lose access immediately.')) return
    setRemoving(seatId)
    try {
      const res = await fetch(`/api/team/seat/${seatId}`, { method: 'DELETE' })
      if (!res.ok) { setError('Failed to remove member.'); return }
      setSeats(prev => prev.filter(s => s.id !== seatId))
    } catch {
      setError('Something went wrong.')
    } finally {
      setRemoving(null)
    }
  }, [])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    setSentTo(null)
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Invite failed.'); return }
      setSentTo(email.trim())
      setEmail('')
    } catch {
      setError('Something went wrong.')
    } finally {
      setSending(false)
    }
  }

  async function handleBulkInvite(e: React.FormEvent) {
    e.preventDefault()
    setBulkSending(true)
    setError('')
    setSentTo(null)
    setBulkSummary(null)

    const emails = [...new Set(
      bulkInput
        .split(/[\n,;]+/)
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    )]

    if (emails.length === 0) {
      setError('Add at least one email for bulk invite.')
      setBulkSending(false)
      return
    }

    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? 'Bulk invite failed.')
        return
      }

      const invitedCount = Number(data?.invitedCount ?? 0)
      const duplicateCount = Number(data?.duplicateCount ?? 0)
      const failedCount = Number(data?.failedCount ?? 0)
      setBulkSummary(`Invited ${invitedCount}. Duplicates ${duplicateCount}. Failed ${failedCount}.`)
      setBulkInput('')
    } catch {
      setError('Something went wrong.')
    } finally {
      setBulkSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-slate-200 rounded p-6">
        <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-4">
          Invite a member
        </p>
        <form onSubmit={handleInvite} className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="colleague@company.com"
            required
            className="flex-1 border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
          />
          <button
            type="submit"
            disabled={sending || !email.trim()}
            className="bg-slate-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded cursor-pointer border-0 disabled:opacity-50 shrink-0"
          >
            {sending ? 'Sending...' : 'Send invite'}
          </button>
        </form>
        {sentTo && <p className="mt-2.5 text-[12px] text-emerald-600">Invite sent to {sentTo}.</p>}
        {error && <p className="mt-2.5 text-[12px] text-red-600">{error}</p>}
      </div>

      <div className="bg-white border border-slate-200 rounded p-6">
        <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-2">
          Bulk invite
        </p>
        <p className="text-[12px] text-slate-500 mb-3">
          Paste one email per line, or separate with commas.
        </p>
        <form onSubmit={handleBulkInvite} className="flex flex-col gap-3">
          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder={'client1@company.com\nclient2@company.com'}
            rows={5}
            className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
          />
          <div>
            <button
              type="submit"
              disabled={bulkSending || !bulkInput.trim()}
              className="bg-slate-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded cursor-pointer border-0 disabled:opacity-50"
            >
              {bulkSending ? 'Sending...' : 'Send bulk invites'}
            </button>
          </div>
        </form>
        {bulkSummary && <p className="mt-2.5 text-[12px] text-emerald-600">{bulkSummary}</p>}
        {error && <p className="mt-2.5 text-[12px] text-red-600">{error}</p>}
      </div>

      {seats.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-6 py-3.5 border-b border-slate-100">
            <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">
              Members ({seats.length})
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {seats.map(seat => (
              <div key={seat.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900 truncate">{seat.member_email}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {seat.status === 'accepted' && seat.accepted_at
                      ? `Joined ${formatDate(seat.accepted_at)}`
                      : `Invited ${formatDate(seat.invited_at)}`}
                  </p>
                </div>
                {seat.status === 'accepted' && seat.seatStatus ? (
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Dot done={seat.seatStatus.profileDone} />Profile
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Dot done={seat.seatStatus.companyAdded} />Company
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Dot done={seat.seatStatus.briefGenerated} />Brief
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded shrink-0">
                    Pending
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(seat.id)}
                  disabled={removing === seat.id}
                  className="shrink-0 text-[11px] font-semibold text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors ml-2"
                >
                  {removing === seat.id ? 'Removing…' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded px-6 py-10 text-center">
          <p className="text-[14px] text-slate-500">No members yet. Invite your first member above.</p>
        </div>
      )}
    </div>
  )
}
