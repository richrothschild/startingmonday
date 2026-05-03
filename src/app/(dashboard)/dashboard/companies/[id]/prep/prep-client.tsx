'use client'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { getRelevantResources, getDefaultResources, type Resource } from '@/lib/resources'
import { BriefRating } from '@/components/BriefRating'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderInline(str: string): string {
  return escapeHtml(str).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

function renderBrief(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('# ')) return null
    if (line.trim() === '---' || line.trim() === '***') return null
    if (line.startsWith('## ')) {
      return (
        <h2 key={i} className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mt-10 mb-4 first:mt-0 pb-2 border-b border-slate-100">
          {line.slice(3)}
        </h2>
      )
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <div key={i} className="flex gap-2.5 text-[14px] text-slate-700 leading-relaxed mb-2.5">
          <span className="text-slate-300 shrink-0 select-none mt-0.5">–</span>
          <span dangerouslySetInnerHTML={{ __html: renderInline(line.slice(2)) }} />
        </div>
      )
    }
    if (line.trim() === '') return <div key={i} className="h-1.5" />
    return (
      <p
        key={i}
        className="text-[14px] text-slate-700 leading-relaxed mb-2.5"
        dangerouslySetInnerHTML={{ __html: renderInline(line) }}
      />
    )
  })
}

function ResourcePanel({ brief }: { brief: string }) {
  const resources: Resource[] = brief.length > 0
    ? getRelevantResources(brief, 3)
    : getDefaultResources(2)

  if (resources.length === 0) return null

  return (
    <div className="bg-white border border-slate-200 rounded p-6 mb-4">
      <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-4">
        Further Reading — Career Tools
      </p>
      <div className="flex flex-col gap-3">
        {resources.map(r => (
          <a
            key={r.url + r.title}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 no-underline"
          >
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-slate-900 group-hover:text-slate-600 transition-colors">
                {r.title}
                <span className="ml-1.5 text-[11px] font-normal text-slate-400">{r.source} ↗</span>
              </div>
              <div className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{r.description}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

async function stream(res: Response, onChunk: (text: string) => void) {
  if (!res.body) throw new Error('No body')
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value, { stream: true }))
  }
}

async function saveBrief(type: string, text: string, companyId?: string, contactId?: string): Promise<string | null> {
  try {
    const res = await fetch('/api/briefs/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, text, company_id: companyId, contact_id: contactId }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.id ?? null
  } catch {
    return null
  }
}

export function PrepClient({
  companyId,
  companyName,
  stageLabel,
}: {
  companyId: string
  companyName: string
  stageLabel: string
}) {
  const [brief, setBrief] = useState('')
  const [briefId, setBriefId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [refineInput, setRefineInput] = useState('')
  const [refining, setRefining] = useState(false)
  const refineRef = useRef<HTMLTextAreaElement>(null)

  async function handleGenerate() {
    setLoading(true)
    setBrief('')
    setBriefId(null)
    setError('')
    try {
      const res = await fetch(`/api/prep/${companyId}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body?.error ?? `Request failed (${res.status})`)
        return
      }
      let fullText = ''
      await stream(res, chunk => { fullText += chunk; setBrief(fullText) })
      if (fullText.startsWith('__ERROR__')) {
        setError(fullText.slice(9))
        setBrief('')
      } else {
        const id = await saveBrief('prep', fullText, companyId)
        setBriefId(id)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function handleRefine() {
    const request = refineInput.trim()
    if (!request || refining || loading) return
    setRefining(true)
    setBrief('')
    setBriefId(null)
    setError('')
    try {
      const res = await fetch(`/api/prep/${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, request }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body?.error ?? `Request failed (${res.status})`)
        return
      }
      let fullText = ''
      await stream(res, chunk => { fullText += chunk; setBrief(fullText) })
      if (fullText.startsWith('__ERROR__')) {
        setError(fullText.slice(9))
        setBrief('')
      } else {
        setRefineInput('')
        const id = await saveBrief('prep', fullText, companyId)
        setBriefId(id)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setRefining(false)
    }
  }

  const busy = loading || refining

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
          <Link
            href={`/dashboard/companies/${companyId}`}
            className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← {companyName}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Interview Prep</h1>
            <p className="text-[13px] text-slate-500 mt-1.5">{companyName} · {stageLabel}</p>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={busy}
            className="shrink-0 bg-slate-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating…' : brief ? 'Regenerate' : 'Generate prep brief'}
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded text-[13px] text-red-700">
            {error}
          </div>
        )}

        {!brief && !busy && !error && (
          <div className="bg-white border border-slate-200 rounded p-10 text-center">
            <p className="text-[14px] text-slate-400">
              Generates an elite brief using your pipeline data, company notes, scan results, and known contacts.
            </p>
          </div>
        )}

        {!brief && !busy && error && (
          <div className="bg-white border border-slate-200 rounded p-10 text-center">
            <p className="text-[14px] text-slate-400">
              Click Generate to try again.
            </p>
          </div>
        )}

        {busy && !brief && (
          <div className="bg-white border border-slate-200 rounded p-8">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {brief && (
          <div className="bg-white border border-slate-200 rounded p-8 mb-4">
            {renderBrief(brief)}
            {busy && (
              <span className="inline-block w-0.5 h-4 bg-slate-400 animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        )}

        {briefId && !busy && (
          <div className="mb-4 flex justify-end">
            <BriefRating briefId={briefId} />
          </div>
        )}

        {brief && !loading && <ResourcePanel brief={brief} />}

        {brief && !loading && (
          <div className="bg-white border border-slate-200 rounded p-6">
            <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-3">
              Refine this brief
            </p>
            <div className="flex gap-3 items-end">
              <textarea
                ref={refineRef}
                value={refineInput}
                onChange={e => setRefineInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRefine() }
                }}
                placeholder="e.g. 'Make the pushback counters more aggressive' · 'Add a first 30/60/90 day plan' · 'Rewrite the narrative for a COO audience' · 'Assume they'll challenge my public sector experience'"
                rows={2}
                disabled={refining}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleRefine}
                disabled={refining || !refineInput.trim()}
                className="shrink-0 bg-slate-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {refining ? 'Refining…' : 'Refine'}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-300">Enter to submit · Shift+Enter for new line</p>
          </div>
        )}

      </main>
    </div>
  )
}
