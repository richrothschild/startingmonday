'use client'

import { useEffect, useMemo, useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'reached_out', label: 'Reached Out' },
  { value: 'in_conversation', label: 'In Conversation' },
  { value: 'meeting_scheduled', label: 'Meeting Set' },
  { value: 'closed', label: 'Closed' },
]

const CHANNEL_OPTIONS = [
  { value: 'executives', label: 'Executives' },
  { value: 'search_firms', label: 'Search Firms' },
  { value: 'coaches', label: 'Coaches' },
  { value: 'outplacement_firms', label: 'Outplacement Firms' },
] as const

const CONFIDENCE_OPTIONS = [
  { value: 'high', label: 'High Confidence' },
  { value: 'medium', label: 'Medium Confidence' },
  { value: 'low', label: 'Low Confidence' },
  { value: 'all', label: 'All Confidence' },
] as const

type ProspectRow = {
  fullName: string
  roleBucket: string
  company: string
  email: string
  emailConfidence: 'high' | 'medium' | 'low'
  status: string
  emailOpening: string
  emailBodyCore: string
  defaultSubject: string
  defaultBody: string
  outreachChannel: 'executives' | 'search_firms' | 'coaches' | 'outplacement_firms'
  fitTier: 'strong' | 'medium'
  personaFocus: string
  campaignTag?: 'coach_day1_60'
}

type Props = {
  rows: ProspectRow[]
  fromAddressLabel: string
}

type ErrorDisplay = {
  title: string
  detail: string
  rawReason?: string
}

function parseJsonObject(value: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    return null
  } catch {
    return null
  }
}

function toStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : []
}

async function readApiPayload(response: Response): Promise<{ payload: Record<string, unknown>; fallbackError: string }> {
  const fallbackError = `Request failed (${response.status})`
  const rawText = await response.text().catch(() => '')

  if (!rawText.trim()) {
    return { payload: {}, fallbackError }
  }

  const parsed = parseJsonObject(rawText)
  if (parsed) {
    return { payload: parsed, fallbackError }
  }

  return {
    payload: { error: `${fallbackError}: ${rawText.trim().slice(0, 220)}` },
    fallbackError,
  }
}

export function formatOutreachErrorMessage(error: string | null | undefined, sendMode: 'dry_run' | 'test_to_self' | 'live'): ErrorDisplay {
  const normalized = (error ?? '').trim()

  if (!normalized) {
    return {
      title: 'Email was not sent',
      detail: sendMode === 'test_to_self'
        ? 'The test email did not go out. Review the message and try again.'
        : 'The outreach message did not go out. Review the details below and try again.',
    }
  }

  if (normalized.toLowerCase().startsWith('blocked by email council gate:')) {
    return {
      title: 'Send blocked before delivery',
      detail: 'This draft did not meet the live email quality gate, so no email was sent. Tighten the copy and run a test to yourself before sending live.',
      rawReason: normalized,
    }
  }

  if (normalized === 'Recipient is suppressed. Remove suppression before sending.') {
    return {
      title: 'Recipient is suppressed',
      detail: 'This contact is currently blocked from outreach. Remove the suppression entry before trying again.',
    }
  }

  if (normalized === 'Could not resolve test recipient email.') {
    return {
      title: 'Test send could not start',
      detail: 'Your account email could not be resolved for Send Test To Me. Confirm your signed-in user has a valid email address.',
    }
  }

  if (normalized === 'OUTREACH_FROM_ADDRESS must use richard@startingmonday.app.') {
    return {
      title: 'Sender configuration error',
      detail: 'The outreach sender is misconfigured in the environment. No email was sent.',
    }
  }

  return {
    title: 'Email was not sent',
    detail: sendMode === 'test_to_self'
      ? 'The test email failed before delivery.'
      : 'The outreach email failed before delivery.',
    rawReason: normalized,
  }
}

function firstNameOf(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0]
  return first && first.length > 0 ? first : 'there'
}

function day1Message10Draft(fullName: string): { subject: string; body: string } {
  const firstName = firstNameOf(fullName)
  return {
    subject: 'Would it be unreasonable to test this with 2 clients?',
    body: [
      `Hi ${firstName},`,
      '',
      'We built Starting Monday for coaches supporting senior executives in transition. The goal is simple: less admin drag, better-prepared clients, stronger sessions.',
      '',
      'Would it be unreasonable to run a 30-day test with 2 clients and keep it only if outcomes improve?',
      '',
      'If yes, I will send the setup checklist.',
      '',
      'Rich',
    ].join('\n'),
  }
}

function prefillForRow(row: ProspectRow, indexInFiltered: number): { subject: string; body: string } {
  if (row.campaignTag === 'coach_day1_60' && (indexInFiltered + 1) % 5 === 0) {
    return day1Message10Draft(row.fullName)
  }

  return {
    subject: row.defaultSubject,
    body: row.defaultBody,
  }
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
  const [confidenceFilter, setConfidenceFilter] = useState<'all' | 'high' | 'medium' | 'low'>('high')
  const [activeChannel, setActiveChannel] = useState<'executives' | 'search_firms' | 'coaches' | 'outplacement_firms'>('executives')
  const [activeCampaign, setActiveCampaign] = useState<'all' | 'coach_day1_60'>('all')
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [subject, setSubject] = useState(rows[0]?.defaultSubject ?? '')
  const [messageText, setMessageText] = useState(rows[0]?.defaultBody ?? '')
  const [sendMode, setSendMode] = useState<'dry_run' | 'test_to_self' | 'live'>('dry_run')
  const [confirmLive, setConfirmLive] = useState(false)
  const [sending, setSending] = useState(false)
  const [suppressing, setSuppressing] = useState(false)
  const [saveBusyEmail, setSaveBusyEmail] = useState<string | null>(null)
  const [error, setError] = useState<ErrorDisplay | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [guardrailWarnings, setGuardrailWarnings] = useState<string[]>([])
  const [guardrailViolations, setGuardrailViolations] = useState<string[]>([])
  const [googleFollowUp3Url, setGoogleFollowUp3Url] = useState<string | null>(null)
  const [googleFollowUp7Url, setGoogleFollowUp7Url] = useState<string | null>(null)

  // Load current Supabase contact status for all rows on mount
  useEffect(() => {
    const emails = rows.map(r => r.email)
    if (emails.length === 0) return

    fetch('/api/outreach/current-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails }),
    })
      .then(res => res.json())
      .then(data => {
        const statusByEmail = data.statusByEmail ?? {}
        const merged = rows.map(r => {
          const dbStatus = statusByEmail[r.email]
          return {
            ...r,
            status: dbStatus?.outreach_status ?? r.status,
          }
        })
        setItems(merged)
      })
      .catch(err => console.error('Failed to fetch current statuses:', err))
  }, [rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((r) => {
      const matchesChannel = r.outreachChannel === activeChannel
      const matchesCampaign = activeCampaign === 'all' || r.campaignTag === activeCampaign
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      const matchesConfidence = confidenceFilter === 'all' || r.emailConfidence === confidenceFilter
      const matchesQuery = !q
        || r.fullName.toLowerCase().includes(q)
        || r.company.toLowerCase().includes(q)
        || r.roleBucket.toLowerCase().includes(q)
        || r.email.toLowerCase().includes(q)
      return matchesChannel && matchesCampaign && matchesStatus && matchesConfidence && matchesQuery
    })
  }, [items, search, statusFilter, confidenceFilter, activeChannel, activeCampaign])

  const selected = filtered[selectedIndex] ?? filtered[0] ?? null

  useEffect(() => {
    const row = filtered[selectedIndex] ?? filtered[0]
    if (!row) return
    const idx = filtered[selectedIndex] ? selectedIndex : 0
    const prefill = prefillForRow(row, idx)
    setSubject(prefill.subject)
    setMessageText(prefill.body)
  }, [filtered, selectedIndex])

  function resetComposerFor(index: number) {
    const next = filtered[index]
    if (!next) return
    setSelectedIndex(index)
    const prefill = prefillForRow(next, index)
    setSubject(prefill.subject)
    setMessageText(prefill.body)
    setError(null)
    setSuccess(null)
    setGuardrailWarnings([])
    setGuardrailViolations([])
    setGoogleFollowUp3Url(null)
    setGoogleFollowUp7Url(null)
    setConfirmLive(false)
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
    const { payload, fallbackError } = await readApiPayload(res)

    setSaveBusyEmail(null)

    if (!res.ok) {
      setError({
        title: 'Status update failed',
        detail: (payload.error as string) ?? fallbackError,
      })
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
    setGuardrailWarnings([])
    setGuardrailViolations([])

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
        mode: sendMode,
        outreachChannel: selected.outreachChannel,
        fitTier: selected.fitTier,
        personaFocus: selected.personaFocus,
      }),
    })

    const { payload: data, fallbackError } = await readApiPayload(res)
    setSending(false)

    if (!res.ok) {
      const violations = toStringList(data.violations)
      const warnings = toStringList(data.warnings)
      setGuardrailViolations(violations)
      setGuardrailWarnings(warnings)
      const resolvedError = typeof data.error === 'string' && data.error.trim().length > 0
        ? data.error
        : fallbackError
      setError(formatOutreachErrorMessage(resolvedError, sendMode))
      return
    }

    const warnings = toStringList(data.warnings)
    setGuardrailWarnings(warnings)

    const maybeGoogle3 = typeof data.googleFollowUp3Url === 'string' ? data.googleFollowUp3Url : null
    const maybeGoogle7 = typeof data.googleFollowUp7Url === 'string' ? data.googleFollowUp7Url : null
    setGoogleFollowUp3Url(maybeGoogle3)
    setGoogleFollowUp7Url(maybeGoogle7)

    if (sendMode === 'live') {
      setItems(prev => prev.map((r) => (r.email === selected.email ? { ...r, status: 'reached_out' } : r)))
      setSuccess(`Sent live to ${selected.fullName} from ${fromAddressLabel}.`)
      setConfirmLive(false)
    } else if (sendMode === 'test_to_self') {
      setSuccess('Test email sent to your own inbox. Review rendering and tone before live send.')
    } else {
      setSuccess('Dry run complete. No email was sent.')
    }
  }

  async function suppressSelected() {
    if (!selected || suppressing) return

    setSuppressing(true)
    setError(null)
    setSuccess(null)

    const res = await fetch('/api/outreach/suppression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: selected.email,
        reason: 'manual suppression from outreach hub',
        source: 'manual',
      }),
    })
    const { payload, fallbackError } = await readApiPayload(res)

    setSuppressing(false)

    if (!res.ok) {
      setError({
        title: 'Suppression update failed',
        detail: (payload.error as string) ?? fallbackError,
      })
      return
    }

    setItems(prev => prev.map((r) => (r.email === selected.email ? { ...r, status: 'closed' } : r)))
    setSuccess(`Suppressed ${selected.fullName}. Future sends are blocked until unsuppressed.`)
  }

  const liveBlocked = sendMode === 'live' && !confirmLive

  return (
    <section className="bg-white border border-slate-200 rounded overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-[16px] font-bold text-slate-900">Send Queue</h2>
        <p className="text-[12px] text-slate-500 mt-1">Defaults to high-confidence emails. Filter by confidence and status, review content, then send from {fromAddressLabel}.</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {CHANNEL_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setActiveChannel(option.value)
                setActiveCampaign('all')
                setSelectedIndex(0)
                setSearch('')
              }}
              className={[
                'text-[12px] font-semibold px-3 py-1.5 rounded border transition-colors',
                activeChannel === option.value
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400',
              ].join(' ')}
            >
              {option.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setActiveChannel('coaches')
              setActiveCampaign('coach_day1_60')
              setSelectedIndex(0)
              setSearch('')
            }}
            className={[
              'text-[12px] font-semibold px-3 py-1.5 rounded border transition-colors',
              activeChannel === 'coaches' && activeCampaign === 'coach_day1_60'
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400',
            ].join(' ')}
          >
            Day 1 Coach List (60)
          </button>
        </div>
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
            <select
              aria-label="Filter prospects by email confidence"
              title="Filter prospects by email confidence"
              value={confidenceFilter}
              onChange={(e) => {
                setConfidenceFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')
                setSelectedIndex(0)
              }}
              className="border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 bg-white"
            >
              {CONFIDENCE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-[13px] text-slate-400">No prospects match this channel, confidence, and status filter.</div>
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
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">{row.outreachChannel.replace('_', ' ')}</span>
                      <span className={[
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                        row.fitTier === 'strong' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700',
                      ].join(' ')}>
                        {row.fitTier}
                      </span>
                      <span className={[
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase',
                        row.emailConfidence === 'high'
                          ? 'bg-emerald-50 text-emerald-700'
                          : row.emailConfidence === 'medium'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-rose-50 text-rose-700',
                      ].join(' ')}>
                        {row.emailConfidence}
                      </span>
                    </div>
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
                <p className="text-[12px] text-slate-500 mt-1">Channel: {selected.outreachChannel.replace('_', ' ')} · Fit: {selected.fitTier}</p>
                <p className="text-[12px] text-slate-500 mt-1">Email confidence: {selected.emailConfidence}</p>
                <p className="text-[12px] text-slate-500 mt-1">Persona focus: {selected.personaFocus}</p>
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

              <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2">
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">Send Mode</label>
                <select
                  aria-label="Select send mode"
                  title="Select send mode"
                  value={sendMode}
                  onChange={(e) => {
                    const next = e.target.value as 'dry_run' | 'test_to_self' | 'live'
                    setSendMode(next)
                    if (next !== 'live') setConfirmLive(false)
                  }}
                  className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 bg-white"
                >
                  <option value="dry_run">Dry Run (no send)</option>
                  <option value="test_to_self">Send Test To Me</option>
                  <option value="live">Send Live To Prospect</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Start with Dry Run, then Send Test To Me, then Send Live.
                </p>
                {sendMode === 'live' && (
                  <label className="flex items-start gap-2 text-[12px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={confirmLive}
                      onChange={(e) => setConfirmLive(e.target.checked)}
                      className="mt-0.5"
                    />
                    I reviewed this message and confirm it is personalized and ready for live send.
                  </label>
                )}
              </div>

              {guardrailViolations.length > 0 && (
                <div className="border border-red-200 bg-red-50 rounded p-3">
                  <p className="text-[12px] font-semibold text-red-700 mb-1">Guardrail violations</p>
                  <ul className="text-[12px] text-red-700 list-disc ml-5 space-y-1">
                    {guardrailViolations.map((v, i) => <li key={`v-${i}`}>{v}</li>)}
                  </ul>
                </div>
              )}

              {guardrailWarnings.length > 0 && (
                <div className="border border-amber-200 bg-amber-50 rounded p-3">
                  <p className="text-[12px] font-semibold text-amber-800 mb-1">Quality warnings</p>
                  <ul className="text-[12px] text-amber-800 list-disc ml-5 space-y-1">
                    {guardrailWarnings.map((w, i) => <li key={`w-${i}`}>{w}</li>)}
                  </ul>
                </div>
              )}

              {error && (
                <div className="border border-red-200 bg-red-50 rounded p-3">
                  <p className="text-[12px] font-semibold text-red-700">{error.title}</p>
                  <p className="text-[12px] text-red-700 mt-1">{error.detail}</p>
                  {error.rawReason && (
                    <p className="text-[11px] text-red-800 mt-2">Reason: {error.rawReason}</p>
                  )}
                </div>
              )}
              {success && <p className="text-[12px] text-green-700">{success}</p>}

              {(googleFollowUp3Url || googleFollowUp7Url) && (
                <div className="border border-slate-200 bg-slate-50 rounded p-3">
                  <p className="text-[12px] font-semibold text-slate-700 mb-2">Follow-up reminders created</p>
                  <div className="flex flex-wrap gap-2">
                    {googleFollowUp3Url && (
                      <a href={googleFollowUp3Url} target="_blank" rel="noreferrer" className="text-[12px] font-semibold text-slate-900 border border-slate-300 rounded px-2.5 py-1.5 hover:border-slate-500">
                        Add Follow-up 1 to Google Calendar
                      </a>
                    )}
                    {googleFollowUp7Url && (
                      <a href={googleFollowUp7Url} target="_blank" rel="noreferrer" className="text-[12px] font-semibold text-slate-900 border border-slate-300 rounded px-2.5 py-1.5 hover:border-slate-500">
                        Add Follow-up 2 to Google Calendar
                      </a>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={sendSelected}
                disabled={sending || !subject.trim() || !messageText.trim() || liveBlocked}
                className="w-full bg-slate-900 text-white text-[13px] font-semibold py-2 rounded disabled:opacity-50"
              >
                {sending ? 'Processing...' : sendMode === 'dry_run' ? 'Run Dry Run Check' : sendMode === 'test_to_self' ? 'Send Test To Me' : `Send Live To ${selected.fullName}`}
              </button>

              <button
                type="button"
                onClick={suppressSelected}
                disabled={suppressing}
                className="w-full bg-white border border-slate-300 text-slate-700 text-[13px] font-semibold py-2 rounded disabled:opacity-50"
              >
                {suppressing ? 'Updating...' : `Suppress ${selected.fullName}`}
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
