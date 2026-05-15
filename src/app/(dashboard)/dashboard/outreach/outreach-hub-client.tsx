'use client'

import { useMemo, useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'reached_out', label: 'Reached Out' },
  { value: 'in_conversation', label: 'In Conversation' },
  { value: 'meeting_scheduled', label: 'Meeting Set' },
  { value: 'closed', label: 'Closed' },
]

type ProspectRow = {
  fullName: string
  roleBucket: string
  company: string
  email: string
  status: string
  emailOpening: string
  emailBodyCore: string
  defaultSubject: string
  defaultBody: string
}

type Props = {
  rows: ProspectRow[]
  fromAddressLabel: string
}

function statusBadge(status: string): string {
  if (status === 'reached_out') return 'bg-blue-50 text-blue-700'
  if (status === 'in_conversation') return 'bg-amber-50 text-amber-700'
  if (status === 'meeting_scheduled') return 'bg-green-50 text-green-700'
  if (status === 'closed') return 'bg-slate-200 text-slate-600'
  return 'bg-slate-100 text-slate-600'
}

function statusText(status: string): string {
  const hit = STATUS_OPTIONS.find(s => s.value === status)
  return hit?.label ?? 'Prospect'
}

export function OutreachHubClient({ rows, fromAddressLabel }: Props) {
  const [items, setItems] = useState(rows)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [subject, setSubject] = useState(rows[0]?.defaultSubject ?? '')
  const [messageText, setMessageText] = useState(rows[0]?.defaultBody ?? '')
  const [sending, setSending] = useState(false)
  const [saveBusyEmail, setSaveBusyEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((r) => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      const matchesQuery = !q
        || r.fullName.toLowerCase().includes(q)
        || r.company.toLowerCase().includes(q)
        || r.roleBucket.toLowerCase().includes(q)
        || r.email.toLowerCase().includes(q)
      return matchesStatus && matchesQuery
    })
  }, [items, search, statusFilter])

  const selected = filtered[selectedIndex] ?? filtered[0] ?? null

  function resetComposerFor(index: number) {
    const next = filtered[index]
    if (!next) return
    setSelectedIndex(index)
    setSubject(next.defaultSubject)
    setMessageText(next.defaultBody)
    setError(null)
    setSuccess(null)
  }

  async function updateStatus(email: string, fullName: string, company: string, status: string) {
    setSaveBusyEmail(email)
    setError(null)
    setSuccess(null)

    const res = await fetch('/api/outreach/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName, company, status }),
    })

    setSaveBusyEmail(null)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Could not update status.')
      return
    }

    setItems(prev => prev.map((r) => (r.email === email ? { ...r, status } : r)))
    setSuccess(`Updated status for ${fullName}.`)
  }

  async function sendSelected() {
    if (!selected || sending) return

    setSending(true)
    setError(null)
    setSuccess(null)

    const res = await fetch('/api/outreach/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: selected.fullName,
        company: selected.company,
        roleBucket: selected.roleBucket,
        emailTo: selected.email,
        subject,
        messageText,
        statusAfter: 'reached_out',
      }),
    })

    setSending(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Email send failed.')
      return
    }

    setItems(prev => prev.map((r) => (r.email === selected.email ? { ...r, status: 'reached_out' } : r)))
    setSuccess(`Sent to ${selected.fullName} from ${fromAddressLabel}.`)
  }

  return (
    <section className="bg-white border border-slate-200 rounded overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-[16px] font-bold text-slate-900">Send Queue</h2>
        <p className="text-[12px] text-slate-500 mt-1">Filter by status, review content, and send from {fromAddressLabel}.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] min-h-[640px]">
        <div className="border-r border-slate-100">
          <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSelectedIndex(0)
              }}
              placeholder="Search name, company, role, email"
              className="flex-1 min-w-[220px] border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-slate-400"
            />
            <select
              aria-label="Filter prospects by status"
              title="Filter prospects by status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setSelectedIndex(0)
              }}
              className="border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 bg-white"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-[13px] text-slate-400">No prospects match the current filter.</div>
            )}

            {filtered.map((row, idx) => (
              <button
                key={`${row.email}-${idx}`}
                onClick={() => resetComposerFor(idx)}
                className={[
                  'w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors',
                  selected?.email === row.email ? 'bg-slate-50' : 'bg-white',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900">{row.fullName}</p>
                    <p className="text-[12px] text-slate-500 mt-0.5">{row.roleBucket} · {row.company}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{row.email}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${statusBadge(row.status)}`}>
                    {statusText(row.status)}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <select
                    aria-label={`Set status for ${row.fullName}`}
                    title={`Set status for ${row.fullName}`}
                    value={row.status}
                    onChange={(e) => updateStatus(row.email, row.fullName, row.company, e.target.value)}
                    disabled={saveBusyEmail === row.email}
                    className="text-[11px] border border-slate-200 rounded px-2 py-1 text-slate-700 bg-white"
                  >
                    {STATUS_OPTIONS.filter(s => s.value !== 'all').map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-400">Review and send on right</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {selected ? (
            <>
              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <p className="text-[11px] text-slate-500">To</p>
                <p className="text-[13px] font-semibold text-slate-900">{selected.fullName} ({selected.email})</p>
                <p className="text-[12px] text-slate-500 mt-1">From: {fromAddressLabel}</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">Subject</label>
                <input
                  aria-label="Email subject"
                  title="Email subject"
                  placeholder="Subject line"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">Message</label>
                <textarea
                  aria-label="Email message"
                  title="Email message"
                  placeholder="Review and edit message before sending"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={16}
                  className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              {error && <p className="text-[12px] text-red-600">{error}</p>}
              {success && <p className="text-[12px] text-green-700">{success}</p>}

              <button
                type="button"
                onClick={sendSelected}
                disabled={sending || !subject.trim() || !messageText.trim()}
                className="w-full bg-slate-900 text-white text-[13px] font-semibold py-2 rounded disabled:opacity-50"
              >
                {sending ? 'Sending...' : `Send To ${selected.fullName}`}
              </button>
            </>
          ) : (
            <p className="text-[13px] text-slate-400">Select a person to review and send.</p>
          )}
        </div>
      </div>
    </section>
  )
}
