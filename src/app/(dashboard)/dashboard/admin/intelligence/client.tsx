'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/lib/toast'

type Token = { id: string; label: string | null; expires_at: string | null; created_at: string }
type IntelCompany = {
  slug: string
  company_name: string
  sector: string | null
  website: string | null
  is_featured: boolean
  signalCount: number
  tokens: Token[]
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 bg-white'

export function IntelligenceAdminClient({
  companies: initial,
  appUrl,
}: {
  companies: IntelCompany[]
  appUrl: string
}) {
  const showToast = useToast()
  const [companies, setCompanies] = useState(initial)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tokenLoading, setTokenLoading] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Add company form state
  const [newName, setNewName]     = useState('')
  const [newDesc, setNewDesc]     = useState('')
  const [newSector, setNewSector] = useState('')
  const [newWebsite, setNewWebsite] = useState('')

  // B2B finder state
  const [finderQuery, setFinderQuery] = useState('')
  const [finderResults, setFinderResults] = useState<{ name: string; domain: string; industry: string; size: string }[]>([])
  const [finding, setFinding] = useState(false)

  async function handleAddCompany(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/intelligence/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: newName.trim(),
          description: newDesc.trim() || undefined,
          sector: newSector.trim() || undefined,
          website: newWebsite.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? 'Failed to add company', 'error'); return }

      const newEntry: IntelCompany = {
        slug: data.slug,
        company_name: newName.trim(),
        sector: newSector.trim() || null,
        website: newWebsite.trim() || null,
        is_featured: false,
        signalCount: 0,
        tokens: [],
      }
      setCompanies(c => [newEntry, ...c])
      setNewName(''); setNewDesc(''); setNewSector(''); setNewWebsite('')
      setAddOpen(false)
      showToast(`${newEntry.company_name} added to intelligence.`)
    } finally {
      setSaving(false)
    }
  }

  async function generateToken(slug: string, companyName: string) {
    setTokenLoading(slug)
    try {
      const label = `${companyName} - B2B demo ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      const res = await fetch('/api/intelligence/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, label, expiresInDays: 30 }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? 'Failed to generate link', 'error'); return }

      const url = `${appUrl}/intelligence/${slug}?t=${data.tokenId}`
      await navigator.clipboard.writeText(url)
      setCopiedId(data.tokenId)
      setTimeout(() => setCopiedId(null), 3000)

      const newToken: Token = {
        id: data.tokenId,
        label,
        expires_at: new Date(Date.now() + 30 * 86400_000).toISOString(),
        created_at: new Date().toISOString(),
      }
      setCompanies(cs =>
        cs.map(c => c.slug === slug ? { ...c, tokens: [newToken, ...c.tokens] } : c)
      )
      showToast('Link copied to clipboard. Valid for 30 days.')
    } finally {
      setTokenLoading(null)
    }
  }

  async function handleFinder(e: React.FormEvent) {
    e.preventDefault()
    if (!finderQuery.trim()) return
    setFinding(true)
    setFinderResults([])
    try {
      // Use our search API to look up companies by sector/keyword
      const res = await fetch(`/api/search?q=${encodeURIComponent(finderQuery)}`)
      const data = await res.json()
      // Map companies from our DB as B2B prospects
      const results = (data.companies ?? []).map((c: { name: string; sector?: string }) => ({
        name: c.name,
        domain: '',
        industry: c.sector ?? 'Unknown',
        size: '',
      }))
      setFinderResults(results)
      if (results.length === 0) showToast('No companies found. Try a different keyword.', 'info')
    } finally {
      setFinding(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin" className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400 hover:text-white">
              Admin
            </Link>
            <span className="text-slate-700">/</span>
            <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-orange-500">
              Intelligence
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900">Company Intelligence</h1>
            <p className="text-[13px] text-slate-500 mt-1">Manage public intelligence pages and generate ungated links for B2B demos.</p>
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors cursor-pointer border-0"
          >
            + Add company
          </button>
        </div>

        {/* Add company modal */}
        {addOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50"
            onMouseDown={e => { if (e.target === e.currentTarget) setAddOpen(false) }}
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
              <h2 className="text-[17px] font-bold text-slate-900 mb-5">Add company to intelligence</h2>
              <form onSubmit={handleAddCompany} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">Company name *</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} required placeholder="Accenture" className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">Description</label>
                  <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} placeholder="One-line description for the public page..." className={inputCls + ' resize-none'} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">Sector</label>
                    <input value={newSector} onChange={e => setNewSector(e.target.value)} placeholder="Consulting" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">Website</label>
                    <input value={newWebsite} onChange={e => setNewWebsite(e.target.value)} placeholder="accenture.com" className={inputCls} />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-2">
                  <button type="button" onClick={() => setAddOpen(false)} className="text-[13px] text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer">Cancel</button>
                  <button
                    type="submit"
                    disabled={saving || !newName.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors cursor-pointer border-0"
                  >
                    {saving ? 'Saving...' : 'Add company'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Companies list */}
        {companies.length > 0 && (
          <div className="flex flex-col gap-4 mb-10">
            {companies.map(co => (
              <div key={co.slug} className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="text-[16px] font-bold text-slate-900">{co.company_name}</span>
                      {co.sector && <span className="text-[11px] text-slate-400">{co.sector}</span>}
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {co.signalCount} signals
                      </span>
                    </div>
                    {co.website && (
                      <a href={co.website.startsWith('http') ? co.website : `https://${co.website}`} target="_blank" rel="noopener noreferrer" className="text-[12px] text-slate-400 hover:text-slate-700">
                        {co.website}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/intelligence/${co.slug}`}
                      target="_blank"
                      className="text-[12px] font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 rounded px-3 py-1.5 transition-colors"
                    >
                      View public &nearr;
                    </Link>
                    <button
                      type="button"
                      onClick={() => generateToken(co.slug, co.company_name)}
                      disabled={tokenLoading === co.slug}
                      className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-[12px] font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer border-0"
                    >
                      {tokenLoading === co.slug ? 'Generating...' : 'Generate ungated link'}
                    </button>
                  </div>
                </div>

                {/* Token list */}
                {co.tokens.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-2">Active links</div>
                    <div className="flex flex-col gap-1.5">
                      {co.tokens.map(tok => {
                        const url = `${appUrl}/intelligence/${co.slug}?t=${tok.id}`
                        const expired = tok.expires_at && new Date(tok.expires_at) < new Date()
                        return (
                          <div key={tok.id} className={['flex items-center gap-3 text-[12px] rounded px-3 py-2', expired ? 'opacity-40' : 'bg-slate-50'].join(' ')}>
                            <span className="flex-1 truncate text-slate-600">{tok.label ?? url}</span>
                            {tok.expires_at && (
                              <span className="text-slate-400 shrink-0">
                                {expired ? 'Expired' : `Exp. ${new Date(tok.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={async () => {
                                await navigator.clipboard.writeText(url)
                                setCopiedId(tok.id)
                                setTimeout(() => setCopiedId(null), 2000)
                              }}
                              className="shrink-0 text-[11px] font-semibold text-slate-500 hover:text-slate-900 bg-transparent border-0 cursor-pointer"
                            >
                              {copiedId === tok.id ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {companies.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-lg px-6 py-12 text-center mb-10">
            <p className="text-[15px] font-semibold text-slate-900 mb-2">No companies added yet</p>
            <p className="text-[13px] text-slate-500 mb-4">Add companies to create public intelligence pages and generate ungated demo links.</p>
          </div>
        )}

        {/* B2B client finder */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-[14px] font-bold text-slate-900 mb-1">B2B prospect finder</h2>
            <p className="text-[13px] text-slate-500">Search companies in your pipeline as potential Starting Monday customers. Add them above to build a demo intelligence page.</p>
          </div>
          <form onSubmit={handleFinder} className="flex gap-3 mb-4">
            <input
              value={finderQuery}
              onChange={e => setFinderQuery(e.target.value)}
              placeholder="Search by company name or sector..."
              className={inputCls + ' flex-1'}
            />
            <button
              type="submit"
              disabled={finding || !finderQuery.trim()}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors cursor-pointer border-0 shrink-0"
            >
              {finding ? 'Searching...' : 'Search'}
            </button>
          </form>

          {finderResults.length > 0 && (
            <div className="flex flex-col gap-2">
              {finderResults.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-3 py-2.5 bg-slate-50 rounded-lg">
                  <div>
                    <span className="text-[14px] font-semibold text-slate-900">{r.name}</span>
                    {r.industry && <span className="text-[12px] text-slate-400 ml-2">{r.industry}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setSaving(true)
                      try {
                        const res = await fetch('/api/intelligence/companies', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ company_name: r.name, sector: r.industry || undefined }),
                        })
                        const data = await res.json()
                        if (!res.ok) { showToast(data.error ?? 'Failed', 'error'); return }
                        const entry: IntelCompany = {
                          slug: data.slug,
                          company_name: r.name,
                          sector: r.industry || null,
                          website: null,
                          is_featured: false,
                          signalCount: 0,
                          tokens: [],
                        }
                        setCompanies(c => [entry, ...c])
                        showToast(`${r.name} added to intelligence.`)
                      } finally {
                        setSaving(false)
                      }
                    }}
                    disabled={saving || companies.some(c => c.company_name.toLowerCase() === r.name.toLowerCase())}
                    className="text-[12px] font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-40 bg-transparent border-0 cursor-pointer shrink-0"
                  >
                    {companies.some(c => c.company_name.toLowerCase() === r.name.toLowerCase()) ? 'Added' : '+ Add to intel'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
