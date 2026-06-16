'use client'
import { useState, useCallback } from 'react'
import {
  WHITE_LABEL_DEFAULT_SETTINGS,
  WHITE_LABEL_TIERS,
  WHITE_LABEL_TRACKS,
  formatWhiteLabelTierPrice,
  getWhiteLabelTier,
  getWhiteLabelTrack,
  type WhiteLabelSettings,
} from '@/lib/white-label'
import {
  PARTNER_PROGRAM_IDS,
  SPONSOR_TEMPLATE_VARIANTS,
  WEEKDAY_IDS,
  type PartnerProgramSettings,
} from '@/lib/partner-program-settings'

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

type WhiteLabelFormState = WhiteLabelSettings
type ProgramSettingsFormState = PartnerProgramSettings

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Dot({ done }: { done: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
  )
}

export function TeamSettings({
  seats: initialSeats,
  whiteLabel: initialWhiteLabel,
  programSettings: initialProgramSettings,
}: {
  seats: Seat[]
  whiteLabel: WhiteLabelSettings | null
  programSettings: PartnerProgramSettings | null
}) {
  const [seats, setSeats] = useState(initialSeats)
  const [email, setEmail] = useState('')
  const [bulkInput, setBulkInput] = useState('')
  const [sending, setSending] = useState(false)
  const [bulkSending, setBulkSending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [bulkSummary, setBulkSummary] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [removing, setRemoving] = useState<string | null>(null)
  const [whiteLabel, setWhiteLabel] = useState<WhiteLabelFormState | null>(initialWhiteLabel)
  const [whiteLabelSaving, setWhiteLabelSaving] = useState(false)
  const [whiteLabelMessage, setWhiteLabelMessage] = useState<string | null>(null)
  const [whiteLabelError, setWhiteLabelError] = useState('')
  const [programSettings, setProgramSettings] = useState<ProgramSettingsFormState | null>(initialProgramSettings)
  const [programSaving, setProgramSaving] = useState(false)
  const [programMessage, setProgramMessage] = useState<string | null>(null)
  const [programError, setProgramError] = useState('')

  async function handleWhiteLabelSave(e: React.FormEvent) {
    e.preventDefault()
    if (!whiteLabel) return

    setWhiteLabelSaving(true)
    setWhiteLabelMessage(null)
    setWhiteLabelError('')

    try {
      const res = await fetch('/api/team/white-label', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(whiteLabel),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setWhiteLabelError(data?.error ?? 'Failed to save white-label settings.')
        return
      }

      setWhiteLabel(data.data as WhiteLabelFormState)
      setWhiteLabelMessage('White-label settings saved.')
    } catch {
      setWhiteLabelError('Something went wrong.')
    } finally {
      setWhiteLabelSaving(false)
    }
  }

  async function handleProgramSettingsSave(e: React.FormEvent) {
    e.preventDefault()
    if (!programSettings) return

    setProgramSaving(true)
    setProgramMessage(null)
    setProgramError('')

    try {
      const res = await fetch('/api/team/program-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(programSettings),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setProgramError(data?.error ?? 'Failed to save program settings.')
        return
      }

      setProgramSettings(data.data as ProgramSettingsFormState)
      setProgramMessage('Program settings saved.')
    } catch {
      setProgramError('Something went wrong.')
    } finally {
      setProgramSaving(false)
    }
  }

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
      <div className="bg-white border border-orange-200 rounded p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-orange-500 mb-2">
          White-label admin
        </p>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[18px] font-bold text-slate-900 leading-tight">
              Brand, track, and pricing settings for partner delivery
            </h2>
            <p className="text-[13px] text-slate-500 mt-1">
              Adjust the delivery brand and program tier without changing the shared core product.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:max-w-2xl">
            {(whiteLabel ? [
              { label: 'Brand', value: whiteLabel.brandName },
              { label: 'Track', value: getWhiteLabelTrack(whiteLabel.trackId).label },
              { label: 'Tier', value: getWhiteLabelTier(whiteLabel.tierId).name },
            ] : [
              { label: 'Brand', value: WHITE_LABEL_DEFAULT_SETTINGS.brandName },
              { label: 'Track', value: getWhiteLabelTrack(WHITE_LABEL_DEFAULT_SETTINGS.trackId).label },
              { label: 'Tier', value: getWhiteLabelTier(WHITE_LABEL_DEFAULT_SETTINGS.tierId).name },
            ]).map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">{item.label}</p>
                <p className="mt-1 text-[13px] font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {whiteLabel ? (
          <form onSubmit={handleWhiteLabelSave} className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Brand name</label>
                <input
                  value={whiteLabel.brandName}
                  onChange={(event) => setWhiteLabel((current) => current ? { ...current, brandName: event.target.value } : current)}
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[13px] focus:outline-none focus:border-slate-400"
                  placeholder="Nash Transition Group"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Support email</label>
                <input
                  type="email"
                  value={whiteLabel.supportEmail}
                  onChange={(event) => setWhiteLabel((current) => current ? { ...current, supportEmail: event.target.value } : current)}
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[13px] focus:outline-none focus:border-slate-400"
                  placeholder="support@example.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Track</label>
                <select
                  title="White-label track"
                  value={whiteLabel.trackId}
                  onChange={(event) => setWhiteLabel((current) => current ? { ...current, trackId: event.target.value as WhiteLabelSettings['trackId'] } : current)}
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:border-slate-400"
                >
                  {WHITE_LABEL_TRACKS.map((track) => (
                    <option key={track.id} value={track.id}>{track.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Tier</label>
                <select
                  title="White-label tier"
                  value={whiteLabel.tierId}
                  onChange={(event) => setWhiteLabel((current) => current ? { ...current, tierId: event.target.value as WhiteLabelSettings['tierId'] } : current)}
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:border-slate-400"
                >
                  {WHITE_LABEL_TIERS.map((tier) => (
                    <option key={tier.id} value={tier.id}>{tier.name} · {formatWhiteLabelTierPrice(tier)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Primary color</label>
                <input
                  type="text"
                  value={whiteLabel.primaryColor}
                  onChange={(event) => setWhiteLabel((current) => current ? { ...current, primaryColor: event.target.value } : current)}
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[13px] focus:outline-none focus:border-slate-400"
                  placeholder="#0f172a"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Accent color</label>
                <input
                  type="text"
                  value={whiteLabel.accentColor}
                  onChange={(event) => setWhiteLabel((current) => current ? { ...current, accentColor: event.target.value } : current)}
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[13px] focus:outline-none focus:border-slate-400"
                  placeholder="#f97316"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Logo URL</label>
                <input
                  type="url"
                  value={whiteLabel.logoUrl ?? ''}
                  onChange={(event) => setWhiteLabel((current) => current ? { ...current, logoUrl: event.target.value } : current)}
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-[13px] focus:outline-none focus:border-slate-400"
                  placeholder="https://example.com/logo.svg"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Preview</p>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-[12px] font-semibold text-slate-900">{whiteLabel.brandName || WHITE_LABEL_DEFAULT_SETTINGS.brandName}</p>
                  <p className="text-[12px] text-slate-500 mt-1">{getWhiteLabelTrack(whiteLabel.trackId).summary}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">{whiteLabel.primaryColor}</span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">{whiteLabel.accentColor}</span>
                    <span>{whiteLabel.supportEmail}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Selected tier includes</p>
                <ul className="space-y-1.5">
                  {getWhiteLabelTier(whiteLabel.tierId).inclusions.map((item) => (
                    <li key={item} className="text-[12px] text-slate-600">• {item}</li>
                  ))}
                </ul>
              </div>
              <button
                type="submit"
                disabled={whiteLabelSaving}
                className="bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded cursor-pointer border-0 disabled:opacity-50"
              >
                {whiteLabelSaving ? 'Saving...' : 'Save white-label settings'}
              </button>
              {whiteLabelMessage && <p className="text-[12px] text-emerald-600">{whiteLabelMessage}</p>}
              {whiteLabelError && <p className="text-[12px] text-red-600">{whiteLabelError}</p>}
            </div>
          </form>
        ) : (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-[13px] text-slate-500">
            White-label settings will appear once a partner workspace is linked to this account.
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded p-6">
        <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-2">
          Program settings
        </p>
        <p className="text-[12px] text-slate-500 mb-4">
          Configure tenant defaults for outplacement program mapping and sponsor report template behavior.
        </p>

        {programSettings ? (
          <form onSubmit={handleProgramSettingsSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Default program</label>
              <select
                title="Default outplacement program"
                value={programSettings.defaultProgram}
                onChange={(event) => setProgramSettings((current) => current ? { ...current, defaultProgram: event.target.value as PartnerProgramSettings['defaultProgram'] } : current)}
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:border-slate-400"
              >
                {PARTNER_PROGRAM_IDS.map((programId) => (
                  <option key={programId} value={programId}>{programId.replace('outplacement_', '').replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Sponsor template</label>
              <select
                title="Sponsor report template"
                value={programSettings.sponsorTemplateVariant}
                onChange={(event) => setProgramSettings((current) => current ? { ...current, sponsorTemplateVariant: event.target.value as PartnerProgramSettings['sponsorTemplateVariant'] } : current)}
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:border-slate-400"
              >
                {SPONSOR_TEMPLATE_VARIANTS.map((variant) => (
                  <option key={variant} value={variant}>{variant.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Weekly summary day</label>
              <select
                title="Weekly summary day"
                value={programSettings.weeklySummaryDay}
                onChange={(event) => setProgramSettings((current) => current ? { ...current, weeklySummaryDay: event.target.value as PartnerProgramSettings['weeklySummaryDay'] } : current)}
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:border-slate-400"
              >
                {WEEKDAY_IDS.map((day) => (
                  <option key={day} value={day}>{day[0].toUpperCase() + day.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Cohort naming prefix</label>
              <input
                type="text"
                value={programSettings.cohortNamingPrefix ?? ''}
                onChange={(event) => setProgramSettings((current) => current ? { ...current, cohortNamingPrefix: event.target.value } : current)}
                placeholder="NTG"
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[13px] focus:outline-none focus:border-slate-400"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={programSaving}
                className="bg-slate-900 hover:bg-slate-700 text-white text-[13px] font-semibold px-4 py-2 rounded cursor-pointer border-0 disabled:opacity-50"
              >
                {programSaving ? 'Saving...' : 'Save program settings'}
              </button>
              {programMessage && <p className="text-[12px] text-emerald-600">{programMessage}</p>}
              {programError && <p className="text-[12px] text-red-600">{programError}</p>}
            </div>
          </form>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-[13px] text-slate-500">
            Program settings will appear once a partner workspace is linked to this account.
          </div>
        )}
      </div>

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
