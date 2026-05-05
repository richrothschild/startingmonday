'use client'
import Link from 'next/link'
import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { moveCompanyStage } from './actions'

type Company = {
  id: string
  name: string
  sector: string | null
  fit_score: number | null
  stage: string
}

const STAGES: { key: string; label: string }[] = [
  { key: 'watching',     label: 'Watching' },
  { key: 'researching',  label: 'Researching' },
  { key: 'applied',      label: 'In Process' },
  { key: 'interviewing', label: 'Interviewing' },
  { key: 'offer',        label: 'Offer' },
]

const STAGE_ACCENT: Record<string, string> = {
  watching:     'border-slate-200',
  researching:  'border-blue-200',
  applied:      'border-indigo-200',
  interviewing: 'border-amber-200',
  offer:        'border-green-200',
}

const STAGE_HEADER: Record<string, string> = {
  watching:     'text-slate-500',
  researching:  'text-blue-600',
  applied:      'text-indigo-600',
  interviewing: 'text-amber-600',
  offer:        'text-green-600',
}

function CompanyCard({ company, isDragging = false }: { company: Company; isDragging?: boolean }) {
  return (
    <Link
      href={`/dashboard/companies/${company.id}`}
      onClick={e => { if (isDragging) e.preventDefault() }}
      className={`block bg-white border rounded p-3.5 shadow-sm hover:shadow-md transition-shadow ${isDragging ? 'opacity-50 rotate-1 shadow-lg' : 'border-slate-200'}`}
    >
      <p className="text-[13px] font-semibold text-slate-900 leading-tight truncate">{company.name}</p>
      {company.sector && (
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{company.sector}</p>
      )}
      {company.fit_score !== null && (
        <p className="text-[12px] font-bold text-slate-700 mt-2">Fit: {company.fit_score}</p>
      )}
    </Link>
  )
}

function DraggableCard({ company }: { company: Company }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: company.id,
    data: { company },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
      <CompanyCard company={company} isDragging={isDragging} />
    </div>
  )
}

function DroppableColumn({
  stage,
  companies,
  isOver,
}: {
  stage: { key: string; label: string }
  companies: Company[]
  isOver: boolean
}) {
  const { setNodeRef } = useDroppable({ id: stage.key })
  const accent = STAGE_ACCENT[stage.key] ?? 'border-slate-200'
  const header = STAGE_HEADER[stage.key] ?? 'text-slate-500'

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded border-t-2 ${accent} bg-slate-50 min-h-[400px] transition-colors ${isOver ? 'bg-slate-100 ring-2 ring-slate-300 ring-inset' : ''}`}
    >
      <div className="px-3 py-3 flex items-center justify-between border-b border-slate-200 bg-white rounded-t">
        <span className={`text-[11px] font-bold tracking-[0.1em] uppercase ${header}`}>
          {stage.label}
        </span>
        <span className="text-[11px] text-slate-400">{companies.length}</span>
      </div>
      <div className="flex flex-col gap-2.5 p-3 flex-1">
        {companies.map(co => (
          <DraggableCard key={co.id} company={co} />
        ))}
        {companies.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[12px] text-slate-300">Drop here</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function KanbanBoard({ initialCompanies }: { initialCompanies: Company[] }) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overColumn, setOverColumn] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const activeCompany = activeId ? companies.find(c => c.id === activeId) : null

  const byStage = useCallback((key: string) => companies.filter(c => c.stage === key), [companies])

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragOver({ over }: { over: DragEndEvent['over'] }) {
    setOverColumn(over ? (over.id as string) : null)
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    setOverColumn(null)
    if (!over) return

    const companyId = active.id as string
    const newStage  = over.id as string
    const company   = companies.find(c => c.id === companyId)
    if (!company || company.stage === newStage) return

    setCompanies(prev =>
      prev.map(c => c.id === companyId ? { ...c, stage: newStage } : c)
    )

    const result = await moveCompanyStage(companyId, newStage)
    if (!result.ok) {
      setCompanies(prev =>
        prev.map(c => c.id === companyId ? { ...c, stage: company.stage } : c)
      )
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-5 gap-3">
        {STAGES.map(stage => (
          <DroppableColumn
            key={stage.key}
            stage={stage}
            companies={byStage(stage.key)}
            isOver={overColumn === stage.key}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCompany ? <CompanyCard company={activeCompany} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
