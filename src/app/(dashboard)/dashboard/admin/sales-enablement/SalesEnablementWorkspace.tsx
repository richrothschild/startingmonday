'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ADMIN_DARK_FIELD_MD,
  ADMIN_DARK_FIELD_SM,
  ADMIN_DARK_SECTION_CARD,
  ADMIN_DARK_SUB_CARD,
  ADMIN_DARK_TABLE_PANEL,
} from '../admin-dark-theme'

type DeliveryModel = 'agency' | 'freelancer' | 'hybrid'
type OptionStatus = 'active' | 'hold' | 'pass' | 'new'

type VendorOption = {
  id: string
  name: string
  model: DeliveryModel
  monthlyCost: number
  status: OptionStatus
  owner: string
  strategicFit: number
  commercialRisk: number
  executionConfidence: number
  day14Target: string
  day30Target: string
  notes: string
}

type WorkspaceState = {
  objective: string
  budgetCeiling: number
  primaryModel: 'done-for-you' | 'done-with-you' | 'hybrid'
  checkpointWindow: 'day-14' | 'day-30' | 'both'
  qualifiedMeetingDefinition: string
  options: VendorOption[]
  todayTopChoice: string
  backupChoice: string
  nextActions: string
}

type SaveState = 'loading' | 'saving' | 'saved' | 'error' | 'read-only'
const LOCAL_FALLBACK_KEY = 'sm-sales-enablement-workspace-v1'

const WEIGHTS = {
  strategicFit: 0.4,
  commercialRisk: 0.35,
  executionConfidence: 0.25,
}

const DEFAULT_STATE: WorkspaceState = {
  objective: 'More qualified meetings',
  budgetCeiling: 5000,
  primaryModel: 'done-for-you',
  checkpointWindow: 'both',
  qualifiedMeetingDefinition: 'Decision-maker or strong influencer, clear pain, timing <= 90 days, and explicit next step scheduled.',
  options: [
    {
      id: 'mauricio',
      name: 'Mauricio',
      model: 'freelancer',
      monthlyCost: 3500,
      status: 'active',
      owner: 'Richard',
      strategicFit: 5,
      commercialRisk: 4,
      executionConfidence: 5,
      day14Target: 'Launch complete + first qualified meetings booked',
      day30Target: '10+ qualified meetings held with show rate >= 80%',
      notes: 'Strong proof of execution and qualification rubric.',
    },
    {
      id: 'justin-power',
      name: 'Justin Power',
      model: 'freelancer',
      monthlyCost: 4500,
      status: 'active',
      owner: 'Richard',
      strategicFit: 4,
      commercialRisk: 3,
      executionConfidence: 4,
      day14Target: 'Dialing live + first qualified bookings',
      day30Target: 'Consistent qualified meetings with QA reporting',
      notes: 'Fast outbound orientation; verify quality and ownership model.',
    },
    {
      id: 'alessandra',
      name: 'Alessandra',
      model: 'freelancer',
      monthlyCost: 5000,
      status: 'hold',
      owner: 'Richard',
      strategicFit: 3,
      commercialRisk: 4,
      executionConfidence: 3,
      day14Target: 'Process and CRM framework ready',
      day30Target: 'Manager cadence and messaging framework fully operational',
      notes: 'Great enablement depth; less immediate meeting velocity.',
    },
    {
      id: 'revit',
      name: 'Revit',
      model: 'agency',
      monthlyCost: 3400,
      status: 'new',
      owner: 'Richard',
      strategicFit: 0,
      commercialRisk: 0,
      executionConfidence: 0,
      day14Target: 'Pending scope',
      day30Target: 'Pending proposal details',
      notes: 'Need scope, KPI, and qualification terms.',
    },
    {
      id: 'winning-by-design',
      name: 'Winning by Design',
      model: 'agency',
      monthlyCost: 0,
      status: 'new',
      owner: 'Richard',
      strategicFit: 0,
      commercialRisk: 0,
      executionConfidence: 0,
      day14Target: 'Pending first meeting',
      day30Target: 'Pending proposal details',
      notes: 'Initial response received; formal evaluation not started.',
    },
  ],
  todayTopChoice: 'Mauricio',
  backupChoice: 'Justin Power',
  nextActions: '1) Finalize qualified meeting definition. 2) Day-14 checkpoint terms in writing. 3) Lock day-30 success thresholds before kickoff.',
}

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(5, value))
}

function weightedScore(option: VendorOption): number {
  const total =
    option.strategicFit * WEIGHTS.strategicFit +
    option.commercialRisk * WEIGHTS.commercialRisk +
    option.executionConfidence * WEIGHTS.executionConfidence
  return Math.round(total * 20)
}

function scoreClass(score: number): string {
  if (score >= 80) return 'text-green-100 bg-green-500/15 border-green-300/25'
  if (score >= 60) return 'text-amber-100 bg-amber-500/15 border-amber-300/25'
  return 'text-slate-300 bg-white/10 border-white/10'
}

export function SalesEnablementWorkspace() {
  const [state, setState] = useState<WorkspaceState>(DEFAULT_STATE)
  const [loaded, setLoaded] = useState(false)
  const [canEdit, setCanEdit] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>('loading')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadFromServer() {
      try {
        const res = await fetch('/api/admin/sales-enablement/workspace', { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed to load workspace (${res.status})`)
        const payload = await res.json() as { workspace?: unknown; role?: string }
        if (!isMounted) return

        const role = payload.role === 'viewer' ? 'viewer' : 'editor'
        const editable = role !== 'viewer'
        setCanEdit(editable)
        setSaveState(editable ? 'saved' : 'read-only')

        if (payload.workspace && typeof payload.workspace === 'object') {
          const incoming = payload.workspace as Partial<WorkspaceState>
          setState({
            ...DEFAULT_STATE,
            ...incoming,
            options: Array.isArray(incoming.options) ? incoming.options : DEFAULT_STATE.options,
          })
        }
      } catch {
        if (!isMounted) return
        try {
          const cached = localStorage.getItem(LOCAL_FALLBACK_KEY)
          if (cached) {
            const parsed = JSON.parse(cached) as Partial<WorkspaceState>
            setState({
              ...DEFAULT_STATE,
              ...parsed,
              options: Array.isArray(parsed.options) ? parsed.options : DEFAULT_STATE.options,
            })
          }
        } catch {
          // Keep defaults if fallback cache is unavailable.
        }
        setCanEdit(true)
        setSaveState('error')
      } finally {
        if (isMounted) setLoaded(true)
      }
    }

    void loadFromServer()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!loaded || !canEdit) return

    try {
      localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(state))
    } catch {
      // Ignore local cache failures.
    }

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSaveState('saving')

    saveTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/sales-enablement/workspace', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspace: state }),
        })
        setSaveState(res.ok ? 'saved' : 'error')
      } catch {
        setSaveState('error')
      }
    }, 700)

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [state, loaded, canEdit])

  const ranked = useMemo(() => {
    return [...state.options]
      .map((option) => ({ option, score: weightedScore(option) }))
      .sort((a, b) => b.score - a.score)
  }, [state.options])

  function updateOption(id: string, patch: Partial<VendorOption>) {
    setState((prev) => ({
      ...prev,
      options: prev.options.map((option) => (option.id === id ? { ...option, ...patch } : option)),
    }))
  }

  function resetWorkspace() {
    if (!canEdit) return
    setState(DEFAULT_STATE)
    try {
      localStorage.removeItem(LOCAL_FALLBACK_KEY)
    } catch {
      // Ignore local cache failures.
    }
  }

  const statusLabel =
    saveState === 'loading' ? 'Loading shared workspace...' :
    saveState === 'saving' ? 'Saving...' :
    saveState === 'saved' ? 'Saved to team workspace' :
    saveState === 'read-only' ? 'Read-only access (viewer role)' :
    'Save failed. Check auth or retry.'

  const fieldMdClass = ADMIN_DARK_FIELD_MD
  const fieldSmClass = ADMIN_DARK_FIELD_SM
  const sectionCardClass = ADMIN_DARK_SECTION_CARD.replace(' mb-6', '')
  const tablePanelClass = ADMIN_DARK_TABLE_PANEL.replace(' mb-6', '')
  const subCardClass = ADMIN_DARK_SUB_CARD

  return (
    <div className="space-y-6">
      <section className={sectionCardClass}>
        <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-3">Decision Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
          <label className="flex flex-col gap-1.5">
            <span className="text-slate-300">Primary objective</span>
            <input
              value={state.objective}
              onChange={(event) => setState((prev) => ({ ...prev, objective: event.target.value }))}
              disabled={!canEdit}
              className={fieldMdClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-slate-300">Budget ceiling (monthly)</span>
            <input
              type="number"
              min={0}
              value={state.budgetCeiling}
              onChange={(event) => setState((prev) => ({ ...prev, budgetCeiling: Number(event.target.value || 0) }))}
              disabled={!canEdit}
              className={fieldMdClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-slate-300">Execution mode</span>
            <select
              value={state.primaryModel}
              onChange={(event) => setState((prev) => ({ ...prev, primaryModel: event.target.value as WorkspaceState['primaryModel'] }))}
              disabled={!canEdit}
              className={fieldMdClass}
            >
              <option value="done-for-you">Done-for-you</option>
              <option value="done-with-you">Done-with-you</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-slate-300">Checkpoint window</span>
            <select
              value={state.checkpointWindow}
              onChange={(event) => setState((prev) => ({ ...prev, checkpointWindow: event.target.value as WorkspaceState['checkpointWindow'] }))}
              disabled={!canEdit}
              className={fieldMdClass}
            >
              <option value="day-14">Day 14</option>
              <option value="day-30">Day 30</option>
              <option value="both">Day 14 and Day 30</option>
            </select>
          </label>
        </div>

        <label className="mt-4 block text-[13px]">
          <span className="text-slate-300 block mb-1.5">Qualified meeting definition</span>
          <textarea
            value={state.qualifiedMeetingDefinition}
            onChange={(event) => setState((prev) => ({ ...prev, qualifiedMeetingDefinition: event.target.value }))}
            disabled={!canEdit}
            className={`${fieldMdClass} w-full min-h-[88px]`}
          />
        </label>
      </section>

      <section className={tablePanelClass}>
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Option Scorecard</h2>
          <p className="text-[12px] text-slate-300">Weighted score = Fit 40% + Commercial 35% + Execution 25%</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px] min-w-[1180px]">
            <thead>
              <tr className="bg-slate-950/60 border-b border-white/10 text-left">
                <th className="px-4 py-2.5 font-semibold text-slate-400">Option</th>
                <th className="px-4 py-2.5 font-semibold text-slate-400">Model</th>
                <th className="px-4 py-2.5 font-semibold text-slate-400">Cost</th>
                <th className="px-4 py-2.5 font-semibold text-slate-400">Status</th>
                <th className="px-4 py-2.5 font-semibold text-slate-400">Fit</th>
                <th className="px-4 py-2.5 font-semibold text-slate-400">Commercial</th>
                <th className="px-4 py-2.5 font-semibold text-slate-400">Execution</th>
                <th className="px-4 py-2.5 font-semibold text-slate-400">Day 14 target</th>
                <th className="px-4 py-2.5 font-semibold text-slate-400">Day 30 target</th>
                <th className="px-4 py-2.5 font-semibold text-slate-400 text-right">Weighted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {state.options.map((option) => {
                const total = weightedScore(option)
                return (
                  <tr key={option.id}>
                    <td className="px-4 py-2 align-top">
                      <input
                        value={option.name}
                        onChange={(event) => updateOption(option.id, { name: event.target.value })}
                        aria-label={`${option.id}-name`}
                        title="Option name"
                        disabled={!canEdit}
                        className={`${fieldSmClass} w-[170px]`}
                      />
                    </td>
                    <td className="px-4 py-2 align-top">
                      <select
                        value={option.model}
                        onChange={(event) => updateOption(option.id, { model: event.target.value as DeliveryModel })}
                        aria-label={`${option.id}-model`}
                        title="Delivery model"
                        disabled={!canEdit}
                        className={fieldSmClass}
                      >
                        <option value="freelancer">Freelancer</option>
                        <option value="agency">Agency</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 align-top">
                      <input
                        type="number"
                        min={0}
                        value={option.monthlyCost}
                        onChange={(event) => updateOption(option.id, { monthlyCost: Number(event.target.value || 0) })}
                        aria-label={`${option.id}-monthly-cost`}
                        title="Monthly cost"
                        disabled={!canEdit}
                        className={`${fieldSmClass} w-[110px]`}
                      />
                    </td>
                    <td className="px-4 py-2 align-top">
                      <select
                        value={option.status}
                        onChange={(event) => updateOption(option.id, { status: event.target.value as OptionStatus })}
                        aria-label={`${option.id}-status`}
                        title="Evaluation status"
                        disabled={!canEdit}
                        className={fieldSmClass}
                      >
                        <option value="active">Active</option>
                        <option value="hold">Hold</option>
                        <option value="pass">Pass</option>
                        <option value="new">New</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 align-top">
                      <input
                        type="number"
                        min={0}
                        max={5}
                        step={1}
                        value={option.strategicFit}
                        onChange={(event) => updateOption(option.id, { strategicFit: clampScore(Number(event.target.value)) })}
                        aria-label={`${option.id}-strategic-fit`}
                        title="Strategic fit score"
                        disabled={!canEdit}
                        className={`${fieldSmClass} w-[68px]`}
                      />
                    </td>
                    <td className="px-4 py-2 align-top">
                      <input
                        type="number"
                        min={0}
                        max={5}
                        step={1}
                        value={option.commercialRisk}
                        onChange={(event) => updateOption(option.id, { commercialRisk: clampScore(Number(event.target.value)) })}
                        aria-label={`${option.id}-commercial-score`}
                        title="Commercial score"
                        disabled={!canEdit}
                        className={`${fieldSmClass} w-[68px]`}
                      />
                    </td>
                    <td className="px-4 py-2 align-top">
                      <input
                        type="number"
                        min={0}
                        max={5}
                        step={1}
                        value={option.executionConfidence}
                        onChange={(event) => updateOption(option.id, { executionConfidence: clampScore(Number(event.target.value)) })}
                        aria-label={`${option.id}-execution-confidence`}
                        title="Execution confidence score"
                        disabled={!canEdit}
                        className={`${fieldSmClass} w-[68px]`}
                      />
                    </td>
                    <td className="px-4 py-2 align-top">
                      <input
                        value={option.day14Target}
                        onChange={(event) => updateOption(option.id, { day14Target: event.target.value })}
                        aria-label={`${option.id}-day14-target`}
                        title="Day 14 target"
                        disabled={!canEdit}
                        className={`${fieldSmClass} w-[230px]`}
                      />
                    </td>
                    <td className="px-4 py-2 align-top">
                      <input
                        value={option.day30Target}
                        onChange={(event) => updateOption(option.id, { day30Target: event.target.value })}
                        aria-label={`${option.id}-day30-target`}
                        title="Day 30 target"
                        disabled={!canEdit}
                        className={`${fieldSmClass} w-[230px]`}
                      />
                    </td>
                    <td className="px-4 py-2 align-top text-right">
                      <span className={`inline-flex items-center border px-2 py-1 rounded font-semibold ${scoreClass(total)}`}>
                        {total}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={sectionCardClass}>
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-3">Live Ranking</h2>
          <div className="space-y-2">
            {ranked.map(({ option, score }, index) => (
              <div key={option.id} className={`${subCardClass} px-3 py-2.5 flex items-center justify-between gap-3`}>
                <div>
                  <p className="text-[13px] font-semibold text-white">{index + 1}. {option.name}</p>
                  <p className="text-[12px] text-slate-300">{option.model} • ${option.monthlyCost.toLocaleString()} / mo • {option.status}</p>
                </div>
                <span className={`inline-flex items-center border px-2 py-1 rounded text-[12px] font-semibold ${scoreClass(score)}`}>
                  {score}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${sectionCardClass} space-y-4`}>
          <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Decision Summary</h2>
          <label className="block text-[13px]">
            <span className="text-slate-300 block mb-1.5">Top choice today</span>
            <input
              value={state.todayTopChoice}
              onChange={(event) => setState((prev) => ({ ...prev, todayTopChoice: event.target.value }))}
              disabled={!canEdit}
              className={`${fieldMdClass} w-full`}
            />
          </label>

          <label className="block text-[13px]">
            <span className="text-slate-300 block mb-1.5">Backup choice</span>
            <input
              value={state.backupChoice}
              onChange={(event) => setState((prev) => ({ ...prev, backupChoice: event.target.value }))}
              disabled={!canEdit}
              className={`${fieldMdClass} w-full`}
            />
          </label>

          <label className="block text-[13px]">
            <span className="text-slate-300 block mb-1.5">Next actions</span>
            <textarea
              value={state.nextActions}
              onChange={(event) => setState((prev) => ({ ...prev, nextActions: event.target.value }))}
              disabled={!canEdit}
              className={`${fieldMdClass} w-full min-h-[110px]`}
            />
          </label>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-slate-400">{statusLabel}</p>
            <button
              type="button"
              onClick={resetWorkspace}
              disabled={!canEdit}
              className="text-[12px] font-semibold text-slate-300 hover:text-white"
            >
              Reset workspace
            </button>
          </div>
        </div>
      </section>

      <section className={sectionCardClass}>
        <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-3">Agency vs Freelancer guardrails</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px] text-slate-300">
          <div className={`${subCardClass} p-4`}>
            <p className="text-[12px] font-semibold text-slate-100 mb-1.5">When agency is better</p>
            <p>Use when you need immediate multi-channel coverage, specialist bandwidth, and redundancy if one operator is unavailable.</p>
          </div>
          <div className={`${subCardClass} p-4`}>
            <p className="text-[12px] font-semibold text-slate-100 mb-1.5">When freelancer is better</p>
            <p>Use when you need fast iteration, direct operator access, tighter budget control, and high accountability to one owner metric.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

