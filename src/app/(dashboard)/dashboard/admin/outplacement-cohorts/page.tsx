'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Cohort = {
  cohortId: string
  partnerId: string
  partnerName: string
  cohortKey: string
  program: string
  rosterSize: number
  milestones: Array<{ id: string; label: string; completionRate: number; completedUsers: number }>
  sponsorSnapshot: {
    status: 'on_track' | 'needs_attention' | 'at_risk'
    fields: {
      roster_size: number
      active_seats: number
      milestone_completion_rate: number
      cadence_adherence_rate: number
    }
  }
}

type CohortResponse = {
  ok: boolean
  summary: {
    cohort_count: number
    roster_users: number
    on_track: number
    needs_attention: number
    at_risk: number
  }
  cohorts: Cohort[]
}

export default function OutplacementCohortsAdminPage() {
  const [data, setData] = useState<CohortResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [cohortForm, setCohortForm] = useState({ partnerId: '', partnerName: '', cohortKey: '' })

  async function loadCohorts() {
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/automation/reporting/outplacement-cohort-admin', { method: 'GET' })
      const json = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(json.error ?? 'Failed to load cohorts')
      setData(json)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load cohorts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCohorts()
  }, [])

  async function createCohort(event: React.FormEvent) {
    event.preventDefault()
    if (!cohortForm.partnerId.trim() || !cohortForm.cohortKey.trim()) return

    setCreating(true)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/automation/reporting/outplacement-cohort-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_cohort',
          cohortId: `${cohortForm.partnerId.trim()}-${cohortForm.cohortKey.trim()}`,
          partnerId: cohortForm.partnerId.trim(),
          partnerName: cohortForm.partnerName.trim() || 'Manual cohort',
          cohortKey: cohortForm.cohortKey.trim(),
          note: 'Created from admin console',
        }),
      })

      const json = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(json.error ?? 'Failed to create cohort')

      setData((current) => current ? { ...current, cohorts: json.cohorts, summary: json.summary } : current)
      setCohortForm({ partnerId: '', partnerName: '', cohortKey: '' })
      setMessage('Cohort created and audited.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create cohort')
    } finally {
      setCreating(false)
    }
  }

  async function markMilestone(c: Cohort, milestoneId: string) {
    const completedUsers = c.rosterSize
    const response = await fetch('/api/admin/automation/reporting/outplacement-cohort-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_milestone',
        cohortId: c.cohortId,
        milestoneId,
        completedUsers,
        note: `Set ${milestoneId} to full completion from admin console`,
      }),
    })

    const json = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(json.error ?? 'Failed to update milestone')
      return
    }

    setData((current) => current ? { ...current, cohorts: json.cohorts, summary: json.summary } : current)
    setMessage(`Milestone ${milestoneId} updated.`)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard/admin" className="text-[13px] text-slate-700 hover:text-slate-900">← Admin</Link>
          <h1 className="text-[16px] font-bold text-slate-900">Outplacement Cohorts</h1>
          <button
            type="button"
            onClick={() => void loadCohorts()}
            className="text-[12px] font-semibold text-slate-700 border border-slate-300 rounded px-3 py-1.5"
          >
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {message && <div className="text-[13px] text-slate-700 bg-white border border-slate-200 rounded p-3">{message}</div>}

        <section className="bg-white border border-slate-200 rounded p-4 grid sm:grid-cols-5 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-slate-400">Cohorts</p>
            <p className="text-[24px] font-bold text-slate-900">{data?.summary.cohort_count ?? 0}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-slate-400">Roster users</p>
            <p className="text-[24px] font-bold text-slate-900">{data?.summary.roster_users ?? 0}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-slate-400">On track</p>
            <p className="text-[24px] font-bold text-green-700">{data?.summary.on_track ?? 0}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-slate-400">Needs attention</p>
            <p className="text-[24px] font-bold text-amber-700">{data?.summary.needs_attention ?? 0}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-slate-400">At risk</p>
            <p className="text-[24px] font-bold text-red-700">{data?.summary.at_risk ?? 0}</p>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded p-4">
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-3">Create cohort</p>
          <form className="grid sm:grid-cols-4 gap-3" onSubmit={createCohort}>
            <input
              value={cohortForm.partnerId}
              onChange={(event) => setCohortForm((current) => ({ ...current, partnerId: event.target.value }))}
              placeholder="partner_id"
              className="border border-slate-200 rounded px-3 py-2 text-[13px]"
            />
            <input
              value={cohortForm.partnerName}
              onChange={(event) => setCohortForm((current) => ({ ...current, partnerName: event.target.value }))}
              placeholder="partner_name"
              className="border border-slate-200 rounded px-3 py-2 text-[13px]"
            />
            <input
              value={cohortForm.cohortKey}
              onChange={(event) => setCohortForm((current) => ({ ...current, cohortKey: event.target.value }))}
              placeholder="YYYY-MM"
              className="border border-slate-200 rounded px-3 py-2 text-[13px]"
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-slate-900 text-white text-[13px] font-semibold rounded px-3 py-2 disabled:opacity-40"
            >
              {creating ? 'Creating...' : 'Create cohort'}
            </button>
          </form>
        </section>

        <section className="bg-white border border-slate-200 rounded overflow-hidden">
          {loading ? (
            <div className="px-4 py-8 text-[13px] text-slate-500 text-center">Loading cohorts...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-2 text-left text-[10px] uppercase tracking-[0.08em] text-slate-500">Cohort</th>
                  <th className="px-4 py-2 text-left text-[10px] uppercase tracking-[0.08em] text-slate-500">Program</th>
                  <th className="px-4 py-2 text-center text-[10px] uppercase tracking-[0.08em] text-slate-500">Roster</th>
                  <th className="px-4 py-2 text-center text-[10px] uppercase tracking-[0.08em] text-slate-500">Completion</th>
                  <th className="px-4 py-2 text-center text-[10px] uppercase tracking-[0.08em] text-slate-500">Status</th>
                  <th className="px-4 py-2 text-right text-[10px] uppercase tracking-[0.08em] text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.cohorts ?? []).map((cohort) => (
                  <tr key={cohort.cohortId} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-semibold text-slate-900">{cohort.partnerName}</p>
                      <p className="text-[12px] text-slate-500">{cohort.cohortKey}</p>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-slate-700">{cohort.program}</td>
                    <td className="px-4 py-3 text-center text-[13px] font-semibold text-slate-900 tabular-nums">{cohort.rosterSize}</td>
                    <td className="px-4 py-3 text-center text-[13px] font-semibold text-slate-900 tabular-nums">{cohort.sponsorSnapshot.fields.milestone_completion_rate.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] uppercase tracking-[0.08em] px-2 py-0.5 rounded border ${
                        cohort.sponsorSnapshot.status === 'on_track'
                          ? 'text-green-700 border-green-200 bg-green-50'
                          : cohort.sponsorSnapshot.status === 'needs_attention'
                            ? 'text-amber-700 border-amber-200 bg-amber-50'
                            : 'text-red-700 border-red-200 bg-red-50'
                      }`}>
                        {cohort.sponsorSnapshot.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void markMilestone(cohort, 'prep_ready')}
                        className="text-[12px] font-semibold text-slate-700 underline underline-offset-2"
                      >
                        Mark prep ready
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  )
}
