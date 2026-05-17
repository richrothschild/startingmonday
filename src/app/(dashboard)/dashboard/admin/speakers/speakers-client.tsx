/* eslint-disable jsx-a11y/no-aria-label */
'use client'

import { useState, useRef } from 'react'

type Appearance = {
  conference_name: string
  conference_year: number
  topic: string | null
  session_type: string | null
}

type Speaker = {
  id: string
  full_name: string
  first_name: string | null
  last_name: string | null
  title: string | null
  company: string | null
  linkedin_url: string | null
  sector: string | null
  notes: string | null
  outreach_status: string
  outreach_date: string | null
  outreach_notes: string | null
  priority: number
  conference_appearances: Appearance[]
}

const STATUS_LABELS: Record<string, string> = {
  not_started:    'Not started',
  contacted:      'Contacted',
  responded:      'Responded',
  converted:      'Converted',
  not_interested: 'Not interested',
  skip:           'Skip',
}

const STATUS_COLORS: Record<string, string> = {
  not_started:    'bg-slate-100 text-slate-500',
  contacted:      'bg-blue-50 text-blue-700',
  responded:      'bg-amber-50 text-amber-700',
  converted:      'bg-green-50 text-green-700',
  not_interested: 'bg-red-50 text-red-500',
  skip:           'bg-slate-50 text-slate-400',
}

const PRIORITY_LABELS: Record<number, string> = { 1: 'High', 2: 'Medium', 3: 'Low' }
const PRIORITY_COLORS: Record<number, string> = {
  1: 'text-orange-600 font-bold',
  2: 'text-slate-700',
  3: 'text-slate-400',
}

export function SpeakersClient({ initialSpeakers }: { initialSpeakers: Speaker[] }) {
  const [speakers, setSpeakers] = useState(initialSpeakers)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = speakers.filter(s => {
    if (statusFilter !== 'all' && s.outreach_status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !s.full_name.toLowerCase().includes(q) &&
        !(s.company ?? '').toLowerCase().includes(q) &&
        !(s.title ?? '').toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  const counts: Record<string, number> = { all: speakers.length }
  for (const s of speakers) {
    counts[s.outreach_status] = (counts[s.outreach_status] ?? 0) + 1
  }

  async function updateStatus(id: string, outreach_status: string) {
    const res = await fetch(`/api/admin/speakers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outreach_status }),
    })
    if (!res.ok) return
    const { speaker } = await res.json()
    setSpeakers(prev => prev.map(s => s.id === id ? { ...s, ...speaker } : s))
  }

  async function updateNotes(id: string, outreach_notes: string) {
    const res = await fetch(`/api/admin/speakers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outreach_notes }),
    })
    if (!res.ok) return
    const { speaker } = await res.json()
    setSpeakers(prev => prev.map(s => s.id === id ? { ...s, ...speaker } : s))
  }

  async function handleImport() {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/speakers', { method: 'POST', body: form })
    const json = await res.json()
    if (!res.ok) {
      setImportResult(`Error: ${json.error}`)
    } else {
      setImportResult(`Imported ${json.speakersUpserted} speakers, ${json.appearancesInserted} appearances.${json.errors?.length ? ` ${json.errors.length} errors.` : ''}`)
      // Refresh the list
      const listRes = await fetch('/api/admin/speakers')
      if (listRes.ok) {
        const { speakers: fresh } = await listRes.json()
        setSpeakers(fresh)
      }
    }
    setImporting(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All' },
          { key: 'not_started', label: 'Not started' },
          { key: 'contacted', label: 'Contacted' },
          { key: 'responded', label: 'Responded' },
          { key: 'converted', label: 'Converted' },
          { key: 'not_interested', label: 'Not interested' },
          { key: 'skip', label: 'Skip' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`text-[12px] font-semibold px-3 py-1.5 rounded border transition-colors ${
              statusFilter === key
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            {label} <span className="ml-1 opacity-60">{counts[key] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Search + import + export toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search name, company, title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 text-[13px] border border-slate-200 rounded px-3 py-2 focus:outline-none focus:border-slate-400"
        />
        <a
          href="/api/admin/speakers/export"
          className="text-[12px] font-semibold text-slate-700 border border-slate-200 bg-white hover:border-slate-400 rounded px-4 py-2 transition-colors whitespace-nowrap"
        >
          Export CSV
        </a>
        <label className="text-[12px] font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded px-4 py-2 transition-colors cursor-pointer whitespace-nowrap">
          {importing ? 'Importing...' : 'Import CSV'}
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={handleImport}
            disabled={importing}
          />
        </label>
      </div>

      {importResult && (
        <div className="mb-4 text-[13px] text-slate-700 bg-slate-50 border border-slate-200 rounded px-4 py-3">
          {importResult}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <div className="px-6 py-[18px] border-b border-slate-200">
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
            Speakers ({filtered.length})
          </span>
        </div>

        {filtered.length === 0 ? (
          <p className="px-6 py-8 text-[13px] text-slate-400">
            No speakers match this filter. Import a CSV to get started.
          </p>
        ) : (
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left">
                <th className="px-6 py-2.5 font-semibold text-slate-400">Name</th>
                <th className="px-4 py-2.5 font-semibold text-slate-400">Company</th>
                <th className="px-4 py-2.5 font-semibold text-slate-400">Conferences</th>
                <th className="px-4 py-2.5 font-semibold text-slate-400">Priority</th>
                <th className="px-4 py-2.5 font-semibold text-slate-400">Status</th>
                <th className="px-4 py-2.5 font-semibold text-slate-400">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(s => {
                const isExpanded = expandedId === s.id
                const appearances = [...(s.conference_appearances ?? [])].sort(
                  (a, b) => b.conference_year - a.conference_year
                )
                return (
                  <>
                    <tr
                      key={s.id}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    >
                      <td className="px-6 py-3">
                        <div className="font-semibold text-slate-900">{s.full_name}</div>
                        {s.title && <div className="text-slate-400 text-[11px] mt-0.5">{s.title}</div>}
                        {s.linkedin_url && (
                          <a
                            href={s.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-[11px] text-blue-600 hover:underline"
                          >
                            LinkedIn
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-700">{s.company ?? '-'}</div>
                        {s.sector && <div className="text-slate-400 text-[11px]">{s.sector}</div>}
                      </td>
                      <td className="px-4 py-3">
                        {appearances.length === 0 ? (
                          <span className="text-slate-300">-</span>
                        ) : (
                          <div className="space-y-0.5">
                            {appearances.slice(0, 2).map(a => (
                              <div key={`${a.conference_name}-${a.conference_year}`} className="text-slate-600">
                                {a.conference_name} <span className="text-slate-400">{a.conference_year}</span>
                              </div>
                            ))}
                            {appearances.length > 2 && (
                              <div className="text-slate-400">+{appearances.length - 2} more</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <label htmlFor={`priority-select-${s.id}`} className="sr-only">Speaker priority</label>
                        <select
                          id={`priority-select-${s.id}`}
                          aria-label="Speaker priority"
                          value={s.priority}
                          onClick={e => e.stopPropagation()}
                          onChange={async e => {
                            const p = parseInt(e.target.value, 10)
                            const res = await fetch(`/api/admin/speakers/${s.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ priority: p }),
                            })
                            if (res.ok) {
                              const { speaker } = await res.json()
                              setSpeakers(prev => prev.map(x => x.id === s.id ? { ...x, ...speaker } : x))
                            }
                          }}
                          className={`bg-transparent border-none cursor-pointer text-[12px] font-semibold ${PRIORITY_COLORS[s.priority]}`}
                        >
                          <option value={1}>High</option>
                          <option value={2}>Medium</option>
                          <option value={3}>Low</option>
                        </select>
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <label htmlFor={`status-select-${s.id}`} className="sr-only">Speaker outreach status</label>
                        <select
                          id={`status-select-${s.id}`}
                          aria-label="Speaker outreach status"
                          value={s.outreach_status}
                          onChange={e => updateStatus(s.id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded border-0 cursor-pointer ${STATUS_COLORS[s.outreach_status]}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                        {s.outreach_date && (
                          <div className="text-slate-400 text-[11px] mt-0.5">{s.outreach_date}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]" onClick={e => e.stopPropagation()}>
                        <OutreachNotesCell
                          speakerId={s.id}
                          notes={s.outreach_notes}
                          onSave={notes => updateNotes(s.id, notes)}
                        />
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${s.id}-expand`} className="bg-slate-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">All Appearances</div>
                              {appearances.length === 0 ? (
                                <p className="text-[12px] text-slate-400">None recorded.</p>
                              ) : (
                                <table className="w-full text-[12px]">
                                  <thead>
                                    <tr className="text-left text-slate-400">
                                      <th className="pb-1 font-semibold">Conference</th>
                                      <th className="pb-1 font-semibold">Year</th>
                                      <th className="pb-1 font-semibold">Type</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {appearances.map(a => (
                                      <tr key={`${a.conference_name}-${a.conference_year}`}>
                                        <td className="py-1.5 text-slate-700">{a.conference_name}</td>
                                        <td className="py-1.5 text-slate-500">{a.conference_year}</td>
                                        <td className="py-1.5 text-slate-400 capitalize">{a.session_type ?? '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                            {s.notes && (
                              <div>
                                <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Notes</div>
                                <p className="text-[12px] text-slate-600 leading-relaxed">{s.notes}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* CSV format hint */}
      <div className="mt-6 bg-white border border-slate-200 rounded p-5">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-2">CSV Import Format</div>
        <p className="text-[12px] text-slate-500 mb-2">
          Header row required. Columns (all optional except full_name):
        </p>
        <code className="block text-[11px] text-slate-600 bg-slate-50 rounded p-3 font-mono leading-relaxed">
          full_name, first_name, last_name, title, company, linkedin_url, sector, notes, priority (1-3),
          conference_name, year, topic, session_type (keynote/panel/workshop/fireside/lightning/other)
        </code>
        <p className="text-[12px] text-slate-400 mt-2">
          Multiple rows per speaker are allowed (one row per appearance). Speakers are matched by linkedin_url
          when present, otherwise by (full_name, company).
        </p>
      </div>
    </div>
  )
}

function OutreachNotesCell({
  speakerId,
  notes,
  onSave,
}: {
  speakerId: string
  notes: string | null
  onSave: (notes: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(notes ?? '')

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor="speaker-notes" className="sr-only">Speaker notes</label>
        <textarea
          id="speaker-notes"
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={2}
          aria-label="Speaker notes"
          className="text-[12px] border border-slate-300 rounded px-2 py-1 w-full resize-none focus:outline-none focus:border-slate-500"
        />
        <div className="flex gap-2">
          <button
            onClick={() => { onSave(value); setEditing(false) }}
            className="text-[11px] font-semibold text-white bg-slate-900 rounded px-2 py-0.5"
          >
            Save
          </button>
          <button
            onClick={() => { setValue(notes ?? ''); setEditing(false) }}
            className="text-[11px] text-slate-400 hover:text-slate-600"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-left text-slate-500 hover:text-slate-900 transition-colors w-full"
    >
      {notes
        ? <span className="line-clamp-2 text-[11px]">{notes}</span>
        : <span className="text-slate-300 text-[11px] italic">Add notes</span>
      }
    </button>
  )
}
