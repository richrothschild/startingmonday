'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

type RefCompany = {
  id: number
  slug: string
  name: string
  description: string | null
  hq_location: string | null
  industries: string[] | null
  cb_rank: number
}

export function CompanySearchInput({ defaultValue }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue ?? '')
  const [results, setResults] = useState<RefCompany[]>([])
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.length < 2) { setResults([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/companies/reference/search?q=${encodeURIComponent(q)}`)
        if (!res.ok) return
        const data: RefCompany[] = await res.json()
        setResults(data)
        setOpen(data.length > 0)
        setActiveIdx(-1)
      } catch {}
    }, 200)
  }, [])

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectCompany(company: RefCompany) {
    setQuery(company.name)
    setOpen(false)
    setResults([])
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      selectCompany(results[activeIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        name="name"
        type="text"
        required
        autoFocus
        autoComplete="off"
        value={query}
        onChange={e => { setQuery(e.target.value); search(e.target.value) }}
        onKeyDown={handleKeyDown}
        placeholder="Search or type a company name"
        className="w-full border border-white/15 rounded px-3 py-2.5 text-[14px] text-slate-100 bg-slate-900/70 placeholder:text-slate-500 focus:outline-none focus:border-orange-300"
      />
      {open && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-slate-950 border border-white/15 rounded shadow-lg max-h-60 overflow-auto">
          {results.map((c, i) => (
            <li
              key={c.id}
              onMouseDown={() => selectCompany(c)}
              className={`px-3 py-2.5 cursor-pointer ${i === activeIdx ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <div className="text-[13px] font-semibold text-slate-100">{c.name}</div>
              {c.hq_location && (
                <div className="text-[11px] text-slate-400 mt-0.5">{c.hq_location}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
