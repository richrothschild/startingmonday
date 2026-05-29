'use client'

import { useRouter } from 'next/navigation'
import { useRef } from 'react'

interface Props {
  q: string
  stage: string
  stages: Array<{ key: string; label: string }>
}

export function PipelineFilter({ q, stage, stages }: Props) {
  const router = useRouter()
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const qRef = useRef(q)
  const stageRef = useRef(stage)

  function navigate(newQ: string, newStage: string) {
    const params = new URLSearchParams()
    if (newQ) params.set('q', newQ)
    if (newStage) params.set('stage', newStage)
    params.set('page', '0')
    const qs = params.toString()
    router.push(`/dashboard${qs ? '?' + qs : ''}`)
  }

  function onQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    clearTimeout(timer.current)
    const val = e.target.value
    qRef.current = val
    timer.current = setTimeout(() => navigate(val, stageRef.current), 350)
  }

  function onStageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    clearTimeout(timer.current)
    const val = e.target.value
    stageRef.current = val
    navigate(qRef.current, val)
  }

  const hasFilters = !!(q || stage)

  return (
    <div className="px-4 sm:px-6 py-3 border-b border-slate-100">
      <div className="flex items-center gap-2 flex-wrap">
        <input
          key={`q-${q}`}
          type="text"
          defaultValue={q}
          onChange={onQueryChange}
          placeholder="Search companies…"
          className="flex-1 min-w-[120px] border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
        />
        <select
          key={`stage-${stage}`}
          defaultValue={stage}
          onChange={onStageChange}
          aria-label="Filter by stage"
          className="border border-slate-200 rounded px-2.5 py-2 text-[13px] text-slate-700 focus:outline-none focus:border-slate-400 bg-white"
        >
          <option value="">All stages</option>
          {stages.map(({ key, label }) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        {hasFilters && (
          <a href="/dashboard" className="text-[12px] text-slate-400 hover:text-slate-700">
            Clear
          </a>
        )}
      </div>
    </div>
  )
}
