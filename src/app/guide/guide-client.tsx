'use client'

import { useMemo, useState } from 'react'

type GuideSection = {
  id: string
  title: string
  body: string
}

function toAnchorId(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function GuideClient({ sections }: { sections: GuideSection[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sections
    return sections.filter((section) => {
      return section.title.toLowerCase().includes(q) || section.body.toLowerCase().includes(q)
    })
  }, [query, sections])

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400"><span className="text-white">Starting </span><span className="text-orange-500">Monday</span></span>
          <a href="/dashboard/admin" className="text-[13px] text-slate-300 hover:text-white transition-colors">Admin</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-slate-900">Automation Guide</h1>
          <p className="text-[13px] text-slate-500 mt-1">Searchable operational guide for product, engineering, marketing, sales, customer ops, and SRE.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 mb-6">
          <label htmlFor="guide-search" className="block text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Search guide</label>
          <input
            id="guide-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search feature, API, schema, monitoring, pricing, SRE..."
            className="w-full text-[14px] border border-slate-300 rounded px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-300"
          />
          <p className="text-[12px] text-slate-400 mt-2">Showing {filtered.length} of {sections.length} sections.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 mb-6">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Section index</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filtered.map((section) => (
              <a key={section.id} href={`#${toAnchorId(section.id)}`} className="text-[13px] text-slate-700 hover:text-slate-900 hover:underline">
                {section.title}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((section) => (
            <section key={section.id} id={toAnchorId(section.id)} className="bg-white border border-slate-200 rounded p-5">
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">{section.title}</h2>
              <pre className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700 font-sans">{section.body.trim()}</pre>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
