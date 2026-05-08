'use client'
import { useTransition } from 'react'
import { updateProspectStage } from './actions'
import type { STAGES } from './page'

type Props = {
  id: string
  stage: string
  stages: typeof STAGES
  cls: string
}

export default function StageSelect({ id, stage, stages, cls }: Props) {
  const [, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStage = e.target.value
    const formData = new FormData()
    formData.set('id', id)
    formData.set('stage', newStage)
    startTransition(() => { updateProspectStage(formData) })
  }

  return (
    <select
      value={stage}
      onChange={handleChange}
      className={`text-[11px] font-semibold rounded-full px-2.5 py-1 border-0 cursor-pointer appearance-none ${cls}`}
    >
      {stages.map(s => (
        <option key={s.key} value={s.key}>{s.label}</option>
      ))}
    </select>
  )
}
