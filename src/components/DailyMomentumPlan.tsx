'use client'

import Link from 'next/link'
import { usePostHog } from 'posthog-js/react'
import { useEffect, useRef, useState } from 'react'

export type DailyMomentumAction = {
  body: string
  cta: string
  effortMinutes: number
  href: string
  id: string
  title: string
  track: 'relationship' | 'readiness' | 'focus'
}

type DailyMomentumPlanProps = {
  actions: DailyMomentumAction[]
  dateKey: string
  status: 'low' | 'medium' | 'strong'
}

type DailyMomentumState = {
  completed: Record<string, boolean>
  notes: Record<string, string>
  reflection: string
}

const STATUS_COPY: Record<DailyMomentumPlanProps['status'], { chip: string; accent: string; body: string }> = {
  low: {
    chip: 'Low momentum',
    accent: 'border-slate-300/35 bg-white/10 text-slate-100',
    body: 'Keep today narrow. Finish two actions and leave the rest for tomorrow.',
  },
  medium: {
    chip: 'Medium momentum',
    accent: 'border-amber-300/40 bg-amber-500/10 text-amber-100',
    body: 'You have enough signal to move. Protect the top three actions before opening more tabs.',
  },
  strong: {
    chip: 'Strong momentum',
    accent: 'border-emerald-300/40 bg-emerald-500/10 text-emerald-100',
    body: 'The pipeline is giving you something to work with. Convert it into clean follow-through today.',
  },
}

function buildInitialState(actions: DailyMomentumAction[]): DailyMomentumState {
  return {
    completed: Object.fromEntries(actions.map((action) => [action.id, false])),
    notes: Object.fromEntries(actions.map((action) => [action.id, ''])),
    reflection: '',
  }
}

export function DailyMomentumPlan({ actions, dateKey, status }: DailyMomentumPlanProps) {
  const ph = usePostHog()
  const storageKey = `sm_daily_momentum_plan:${dateKey}`
  const [state, setState] = useState<DailyMomentumState>(() => buildInitialState(actions))
  const [hydrated, setHydrated] = useState(false)
  const loadedEventSent = useRef(false)
  const submittedReflections = useRef<Set<string>>(new Set())

  useEffect(() => {
    const nextState = buildInitialState(actions)
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) {
        setState(nextState)
        setHydrated(true)
        return
      }

      const parsed = JSON.parse(raw) as Partial<DailyMomentumState>
      setState({
        completed: { ...nextState.completed, ...(parsed.completed ?? {}) },
        notes: { ...nextState.notes, ...(parsed.notes ?? {}) },
        reflection: typeof parsed.reflection === 'string' ? parsed.reflection : '',
      })
    } catch {
      setState(nextState)
    } finally {
      setHydrated(true)
    }
  }, [actions, storageKey])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(storageKey, JSON.stringify(state))
  }, [hydrated, state, storageKey])

  useEffect(() => {
    if (!hydrated || loadedEventSent.current) return
    loadedEventSent.current = true

    const properties = {
      action_count: actions.length,
      date_key: dateKey,
      momentum_status: status,
    }

    try {
      ph?.capture('emi_daily_loop_loaded', properties)
    } catch {
      // never block the dashboard
    }

    try {
      void fetch('/api/events/daily-momentum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName: 'emi_daily_loop_loaded', properties }),
        keepalive: true,
      })
    } catch {
      // never block the dashboard
    }
  }, [actions.length, dateKey, hydrated, ph, status])

  const completedCount = actions.filter((action) => state.completed[action.id]).length
  const isDayComplete = completedCount >= 2
  const statusCopy = STATUS_COPY[status]

  function emitActionCompleted(action: DailyMomentumAction, nextCompletedCount: number) {
    const properties = {
      action_id: action.id,
      action_track: action.track,
      completed_count: nextCompletedCount,
      date_key: dateKey,
      effort_minutes: action.effortMinutes,
      momentum_status: status,
      note_present: Boolean(state.notes[action.id]?.trim()),
    }

    try {
      ph?.capture('emi_action_completed', properties)
    } catch {
      // never block the dashboard
    }

    try {
      void fetch('/api/events/daily-momentum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName: 'emi_action_completed', properties }),
        keepalive: true,
      })
    } catch {
      // never block the dashboard
    }
  }

  function emitReflectionSubmitted(reflection: string) {
    const trimmed = reflection.trim()
    if (!trimmed) return
    const signature = `${dateKey}:${trimmed}`
    if (submittedReflections.current.has(signature)) return
    submittedReflections.current.add(signature)

    const properties = {
      completed_count: completedCount,
      date_key: dateKey,
      momentum_status: status,
      reflection_length: trimmed.length,
    }

    try {
      ph?.capture('emi_daily_reflection_submitted', properties)
    } catch {
      // never block the dashboard
    }

    try {
      void fetch('/api/events/daily-momentum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName: 'emi_daily_reflection_submitted', properties }),
        keepalive: true,
      })
    } catch {
      // never block the dashboard
    }
  }

  return (
    <section id="daily-momentum-plan" className="mb-6 rounded-2xl overflow-hidden border border-white/15 bg-white/5 shadow-[0_22px_66px_rgba(15,23,42,0.18)] backdrop-blur-md">
      <div className="px-5 py-5 sm:px-6 sm:py-6 border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.2),_transparent_34%),linear-gradient(180deg,_rgba(15,23,42,0.98)_0%,_rgba(15,23,42,0.94)_100%)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-[42rem]">
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-2">Today&apos;s Momentum Plan</p>
            <h2 className="text-[20px] font-bold text-white leading-tight mb-2">Three actions. One screen. No extra sprawl.</h2>
            <p className="text-[13px] text-slate-200 leading-relaxed">{statusCopy.body}</p>
            <p className="mt-2 text-[12px] text-slate-300">Your daily three map to the same tenets: roles, relationships, and plan.</p>
          </div>
          <div className={`inline-flex items-center self-start rounded-full border px-3 py-1 text-[11px] font-semibold ${statusCopy.accent}`}>
            {statusCopy.chip}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] text-slate-300">
          <span>{completedCount} of 3 actions complete</span>
          <span>Day complete when two or more actions are done.</span>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid grid-cols-1 gap-4">
          {actions.map((action, index) => {
            const done = Boolean(state.completed[action.id])
            return (
              <article
                key={action.id}
                className={`rounded-2xl border p-4 sm:p-5 transition-colors ${done ? 'border-emerald-300/40 bg-emerald-500/10' : 'border-white/15 bg-white/5'}`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-slate-950">{index + 1}</span>
                      <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-200">
                        {action.track}
                      </span>
                      <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-200">
                        {action.effortMinutes} min
                      </span>
                    </div>
                    <h3 className="text-[16px] font-semibold text-white mb-1">{action.title}</h3>
                    <p className="text-[13px] leading-relaxed text-slate-200">{action.body}</p>
                  </div>

                  <div className="flex flex-col gap-3 lg:w-[15rem] lg:items-end">
                    <button
                      type="button"
                      onClick={() => setState((current) => {
                        const nextDone = !current.completed[action.id]
                        const nextState = {
                          ...current,
                          completed: {
                            ...current.completed,
                            [action.id]: nextDone,
                          },
                        }

                        if (nextDone) {
                          const nextCompletedCount = actions.filter((candidate) => (
                            candidate.id === action.id ? true : Boolean(nextState.completed[candidate.id])
                          )).length
                          emitActionCompleted(action, nextCompletedCount)
                        }

                        return nextState
                      })}
                      className={`inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 py-2 text-[12px] font-semibold transition-colors ${done ? 'border-emerald-300/40 bg-emerald-500/10 text-emerald-100' : 'border-white/25 bg-white/5 text-slate-100 hover:border-white/40'}`}
                    >
                      {done ? 'Completed' : 'Mark complete'}
                    </button>
                    <Link
                      href={action.href}
                      className="inline-flex h-[44px] items-center justify-center rounded-full bg-orange-500 px-4 text-[12px] font-semibold text-slate-950 transition-colors hover:bg-orange-400"
                    >
                      {action.cta}
                    </Link>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300 mb-2" htmlFor={`daily-note-${action.id}`}>
                    Optional note
                  </label>
                  <input
                    id={`daily-note-${action.id}`}
                    value={state.notes[action.id] ?? ''}
                    onChange={(event) => setState((current) => ({
                      ...current,
                      notes: {
                        ...current.notes,
                        [action.id]: event.target.value,
                      },
                    }))}
                    placeholder="What will make this easier to finish?"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-[13px] text-slate-100 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-300/60"
                  />
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
          <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300 mb-2" htmlFor="daily-reflection-prompt">
              End-of-day reflection
            </label>
            <textarea
              id="daily-reflection-prompt"
              value={state.reflection}
              onChange={(event) => setState((current) => ({ ...current, reflection: event.target.value }))}
              onBlur={(event) => emitReflectionSubmitted(event.target.value)}
              placeholder="What moved? What got stuck? What needs a simpler recovery tomorrow?"
              className="min-h-[112px] w-full resize-y rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-[13px] text-slate-100 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-300/60"
            />
          </div>

          <div className={`rounded-2xl border px-4 py-4 ${isDayComplete ? 'border-emerald-300/40 bg-emerald-500/10' : 'border-amber-300/40 bg-amber-500/10'}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${isDayComplete ? 'text-emerald-100' : 'text-amber-100'}`}>
              {isDayComplete ? 'Day complete' : 'Recovery rule'}
            </p>
            <p className={`mt-2 text-[13px] leading-relaxed ${isDayComplete ? 'text-emerald-100' : 'text-amber-100'}`}>
              {isDayComplete
                ? 'You cleared the daily gate. Leave the rest alone unless it is already in motion.'
                : 'If today slips, keep tomorrow to one relationship action, one readiness action, and one optional focus action again.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}