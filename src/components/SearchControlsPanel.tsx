'use client'

import { useMemo, useState } from 'react'
import { TrackLink } from '@/components/TrackLink'

type BriefingFrequency = 'daily' | 'weekly'

export function SearchControlsPanel({
  initialFrequency,
  initialBriefingTime,
  isPaused,
}: {
  initialFrequency: BriefingFrequency
  initialBriefingTime: string | null
  isPaused: boolean
}) {
  const [days, setDays] = useState(14)
  const [pausing, setPausing] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [pauseMessage, setPauseMessage] = useState<string | null>(null)
  const [pauseError, setPauseError] = useState<string | null>(null)

  const [frequency, setFrequency] = useState<BriefingFrequency>(initialFrequency)
  const [briefingTime, setBriefingTime] = useState(initialBriefingTime?.slice(0, 5) ?? '07:00')
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [prefsMessage, setPrefsMessage] = useState<string | null>(null)
  const [prefsError, setPrefsError] = useState<string | null>(null)

  const isDirty = useMemo(() => {
    const sameFreq = frequency === initialFrequency
    const sameTime = (initialBriefingTime?.slice(0, 5) ?? '07:00') === briefingTime
    return !(sameFreq && sameTime)
  }, [frequency, initialFrequency, briefingTime, initialBriefingTime])

  async function handlePause() {
    setPausing(true)
    setPauseMessage(null)
    setPauseError(null)
    try {
      const res = await fetch('/api/billing/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) throw new Error(data.error ?? 'Could not pause search right now.')
      setPauseMessage(`Search paused for ${days} days. Major alerts and digest stay on.`)
      window.location.reload()
    } catch (err) {
      setPauseError(err instanceof Error ? err.message : 'Could not pause search right now.')
    } finally {
      setPausing(false)
    }
  }

  async function handleResume() {
    setResuming(true)
    setPauseMessage(null)
    setPauseError(null)
    try {
      const res = await fetch('/api/billing/resume', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) throw new Error(data.error ?? 'Could not resume search right now.')
      setPauseMessage('Search resumed. Daily workflows are active again.')
      window.location.reload()
    } catch (err) {
      setPauseError(err instanceof Error ? err.message : 'Could not resume search right now.')
    } finally {
      setResuming(false)
    }
  }

  async function saveBriefingPrefs() {
    setSavingPrefs(true)
    setPrefsMessage(null)
    setPrefsError(null)
    try {
      const res = await fetch('/api/preferences/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefingFrequency: frequency, briefingTime }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) throw new Error(data.error ?? 'Could not save preferences.')
      setPrefsMessage('Briefing preferences saved.')
    } catch (err) {
      setPrefsError(err instanceof Error ? err.message : 'Could not save preferences.')
    } finally {
      setSavingPrefs(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded p-5 mb-6 sm:mb-8">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">Search controls</p>
        <TrackLink
          href="/settings/billing"
          event="search_controls_clicked"
          properties={{ target: 'billing' }}
          className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors"
        >
          Billing &amp; settings -&gt;
        </TrackLink>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-slate-200 rounded p-4">
          <p className="text-[12px] font-semibold text-slate-900 mb-2">Pause search</p>
          <p className="text-[12px] text-slate-500 leading-relaxed mb-3">
            Keep major alerts and low-frequency digest active while you take a break.
          </p>
          {!isPaused ? (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={days}
                onChange={e => setDays(Number(e.target.value))}
                className="border border-slate-200 rounded px-2.5 py-2 text-[12px] text-slate-700 bg-white"
                disabled={pausing}
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
              <button
                type="button"
                onClick={handlePause}
                disabled={pausing}
                className="text-[12px] font-semibold text-slate-700 border border-slate-200 rounded px-3 py-2 hover:border-slate-400 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {pausing ? 'Pausing...' : 'Pause search'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResume}
              disabled={resuming}
              className="text-[12px] font-semibold text-white bg-slate-900 rounded px-3 py-2 hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer border-0"
            >
              {resuming ? 'Resuming...' : 'Resume search'}
            </button>
          )}
          {pauseMessage && <p className="text-[12px] text-green-700 mt-2">{pauseMessage}</p>}
          {pauseError && <p className="text-[12px] text-red-700 mt-2">{pauseError}</p>}
        </div>

        <div className="border border-slate-200 rounded p-4">
          <p className="text-[12px] font-semibold text-slate-900 mb-2">Digest preferences</p>
          <div className="flex items-center gap-3 mb-3">
            <label className="text-[12px] text-slate-600">
              <input
                type="radio"
                name="frequency"
                checked={frequency === 'daily'}
                onChange={() => setFrequency('daily')}
                className="mr-1"
              />
              Daily briefing
            </label>
            <label className="text-[12px] text-slate-600">
              <input
                type="radio"
                name="frequency"
                checked={frequency === 'weekly'}
                onChange={() => setFrequency('weekly')}
                className="mr-1"
              />
              Weekly digest
            </label>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[12px] text-slate-500">Time:</span>
            <input
              type="time"
              value={briefingTime}
              onChange={e => setBriefingTime(e.target.value)}
              disabled={frequency === 'weekly'}
              className="border border-slate-200 rounded px-2 py-1.5 text-[12px] text-slate-700 bg-white disabled:text-slate-300"
            />
          </div>
          <button
            type="button"
            onClick={saveBriefingPrefs}
            disabled={savingPrefs || !isDirty}
            className="text-[12px] font-semibold text-slate-700 border border-slate-200 rounded px-3 py-2 hover:border-slate-400 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {savingPrefs ? 'Saving...' : 'Save preferences'}
          </button>
          {prefsMessage && <p className="text-[12px] text-green-700 mt-2">{prefsMessage}</p>}
          {prefsError && <p className="text-[12px] text-red-700 mt-2">{prefsError}</p>}
        </div>
      </div>

      <div className="mt-4 border border-slate-200 rounded p-4">
        <p className="text-[12px] font-semibold text-slate-900 mb-2">Power views</p>
        <div className="flex flex-wrap gap-2">
          <TrackLink href="/dashboard?stage=interviewing" event="power_view_clicked" properties={{ target: 'interviewing' }} className="text-[12px] text-slate-700 border border-slate-200 rounded px-2.5 py-1.5 hover:border-slate-400 transition-colors">
            Interviewing pipeline
          </TrackLink>
          <TrackLink href="/dashboard?stage=applied" event="power_view_clicked" properties={{ target: 'applied' }} className="text-[12px] text-slate-700 border border-slate-200 rounded px-2.5 py-1.5 hover:border-slate-400 transition-colors">
            Applied pipeline
          </TrackLink>
          <TrackLink href="/dashboard/briefing?mode=focused" event="power_view_clicked" properties={{ target: 'briefing_focused' }} className="text-[12px] text-slate-700 border border-slate-200 rounded px-2.5 py-1.5 hover:border-slate-400 transition-colors">
            Focused briefing
          </TrackLink>
        </div>
      </div>
    </div>
  )
}
