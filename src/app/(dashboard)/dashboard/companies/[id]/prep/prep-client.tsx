'use client'
import Link from 'next/link'
import { useState, useRef, useEffect, useMemo } from 'react'
import { getRelevantResources, getDefaultResources, type Resource } from '@/lib/resources'
import {
  PREP_PROVENANCE_VERSION,
  buildPrepClaimProvenance,
  type ClaimOriginClass,
} from '@/lib/prep-provenance'
import { scorePrepBriefConfidence } from '@/lib/prep-confidence'
import { PREP_ROLE_MODES, type PrepRoleMode } from '@/lib/prep-role-modes'
import { BriefRating } from '@/components/BriefRating'
import type { InterviewStage } from '@/lib/prompts'

const STAGE_OPTIONS: { value: InterviewStage; label: string }[] = [
  { value: 'informal_meeting',    label: 'Informal Meeting' },
  { value: 'first_interview',     label: 'First Interview' },
  { value: 'executive_interview', label: 'Executive Interview' },
  { value: 'board_presentation',  label: 'Board Presentation' },
  { value: 'final_round',         label: 'Final Round' },
]

const DEFAULT_INTERVIEW_STAGE: Record<string, InterviewStage> = {
  watching:    'executive_interview',
  researching: 'executive_interview',
  applied:     'informal_meeting',
  interviewing:'first_interview',
  offer:       'final_round',
}

const ROLE_MODE_OPTIONS: { value: PrepRoleMode; label: string }[] = [
  { value: 'cio', label: 'CIO' },
  { value: 'cto', label: 'CTO' },
  { value: 'ciso', label: 'CISO' },
  { value: 'vp_to_cxo', label: 'VP to CXO' },
]

function inferInitialRoleMode(roleType: string | null): PrepRoleMode {
  if (PREP_ROLE_MODES.includes((roleType ?? '').toLowerCase() as PrepRoleMode)) {
    return roleType!.toLowerCase() as PrepRoleMode
  }
  return 'vp_to_cxo'
}

function BoldText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return (
    <>
      {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
    </>
  )
}

function normalizeClaimText(line: string) {
  return line
    .replace(/^[-*]\s+/, '')
    .replace(/^\d+[.)]\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function originClassLabel(originClass: ClaimOriginClass) {
  if (originClass === 'user_provided') return 'User Provided'
  if (originClass === 'system_detected') return 'System Detected'
  return 'Inferred'
}

function originClassClassName(originClass: ClaimOriginClass) {
  if (originClass === 'user_provided') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (originClass === 'system_detected') return 'bg-blue-50 text-blue-700 border-blue-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

function buildClaimOriginLookup(text: string): Record<string, ClaimOriginClass> {
  const lookup: Record<string, ClaimOriginClass> = {}
  const claims = buildPrepClaimProvenance(text)
  for (const claim of claims) {
    lookup[claim.claimText] = claim.originClass
  }
  return lookup
}

function TraceLabel({ originClass }: { originClass: ClaimOriginClass }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-[1px] text-[10px] font-semibold tracking-[0.04em] uppercase ${originClassClassName(originClass)}`}
      title={`Trace source: ${originClassLabel(originClass)}`}
      aria-label={`Trace source ${originClassLabel(originClass)}`}
    >
      {originClassLabel(originClass)}
    </span>
  )
}

function SourceLegend() {
  return (
    <div className="mb-5 rounded border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-2">Source Legend</p>
      <div className="flex flex-wrap gap-2">
        <TraceLabel originClass="user_provided" />
        <TraceLabel originClass="system_detected" />
        <TraceLabel originClass="inferred" />
      </div>
    </div>
  )
}

function renderBrief(text: string) {
  const claimOriginLookup = buildClaimOriginLookup(text)
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
      const claimText = normalizeClaimText(line)
      const originClass = claimOriginLookup[claimText] ?? 'inferred'
      return (
        <div key={i} className="mb-3">
          <div className="mb-1.5">
            <TraceLabel originClass={originClass} />
          </div>
          <div className="flex gap-2.5 text-[14px] text-slate-700 leading-relaxed">
          <span className="text-slate-300 shrink-0 select-none mt-0.5">-</span>
          <BoldText text={line.slice(2)} />
          </div>
        </div>
      )
    }
    if (line.trim() === '') return <div key={i} className="h-1.5" />
    const claimText = normalizeClaimText(line)
    const originClass = claimOriginLookup[claimText] ?? 'inferred'
    return (
      <div key={i} className="mb-3">
        <div className="mb-1.5">
          <TraceLabel originClass={originClass} />
        </div>
        <p className="text-[14px] text-slate-700 leading-relaxed mb-0">
          <BoldText text={line} />
        </p>
      </div>
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
        Further Reading
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

async function streamResponse(res: Response, onChunk: (text: string) => void) {
  if (!res.body) throw new Error('No body')
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value, { stream: true }))
  }
}

async function saveBrief(type: string, text: string, companyId?: string, sectionName?: string): Promise<string | null> {
  try {
    const isPrepType = type === 'prep' || type === 'prep_section'
    const claimProvenance = isPrepType ? buildPrepClaimProvenance(text) : undefined
    const res = await fetch('/api/briefs/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        text,
        company_id: companyId,
        section_name: sectionName,
        provenance_version: isPrepType ? PREP_PROVENANCE_VERSION : undefined,
        claim_provenance: claimProvenance,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.id ?? null
  } catch {
    return null
  }
}

function useOnDemand(url: string, companyId: string, sectionName: string) {
  const [content, setContent] = useState('')
  const [briefId, setBriefId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true)
    setContent('')
    setBriefId(null)
    setError('')
    try {
      const res = await fetch(url)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body?.error ?? `Request failed (${res.status})`)
        return
      }
      let fullText = ''
      await streamResponse(res, chunk => { fullText += chunk; setContent(fullText) })
      if (fullText.startsWith('__ERROR__')) {
        setError(fullText.slice(9))
        setContent('')
      } else {
        const id = await saveBrief('prep_section', fullText, companyId, sectionName)
        setBriefId(id)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return { content, briefId, loading, error, generate }
}

function OnDemandPanel({
  title,
  description,
  content,
  briefId,
  loading,
  error,
  onGenerate,
}: {
  title: string
  description: string
  content: string
  briefId: string | null
  loading: boolean
  error: string
  onGenerate: () => void
}) {
  return (
    <div className="bg-white border border-slate-200 rounded mb-4">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400">{title}</p>
          {!content && !loading && (
            <p className="text-[12px] text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="shrink-0 text-[12px] font-semibold text-slate-500 border border-slate-200 rounded px-3 py-1.5 hover:border-slate-400 hover:text-slate-700 bg-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Generating…' : content ? 'Regenerate' : 'Generate'}
        </button>
      </div>
      {loading && !content && (
        <div className="px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block [animation-delay:300ms]" />
          </div>
        </div>
      )}
      {error && !content && (
        <div className="px-6 py-4 text-[13px] text-red-600">{error}</div>
      )}
      {(content || (loading && content)) && (
        <div className="px-6 py-5">
          <SourceLegend />
          {renderBrief(content)}
          {loading && (
            <span className="inline-block w-0.5 h-4 bg-slate-400 animate-pulse ml-0.5 align-middle" />
          )}
          {!loading && (
            <p className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              AI-generated — use as input, not advice. Verify facts before any conversation.
            </p>
          )}
        </div>
      )}
      {briefId && !loading && content && (
        <div className="px-6 pb-4 flex justify-end">
          <BriefRating briefId={briefId} />
        </div>
      )}
    </div>
  )
}

const NO_NOTES_MESSAGES: Record<string, string> = {
  coo:       'COO briefs require operational context. Add notes on the specific challenge this company is navigating - what phase, what broke, what the CEO cannot do alone.',
  ciso:      'CISO briefs improve significantly with sector and regulatory context. Add notes on recent events in their space, board security posture, or why the role opened.',
  cpo:       'CPO briefs improve with product context. Add notes on the current product situation - engagement vs acquisition problem, what created this opening.',
  cdo_data:  'CDO briefs need data mandate context. Add notes on the company data maturity and whether this is a governance or analytics mandate.',
  cdo_digital: 'Chief Digital Officer briefs improve with transformation context. Add notes on the digital agenda and internal dynamics.',
  cto:       'CTO briefs improve with engineering context. Add notes on tech debt posture, team maturity, and what triggered this search.',
  cio:       'CIO briefs improve with transformation context. Add notes on the agenda, the current CIO situation, and board technology appetite.',
}

export function PrepClient({
  companyId,
  companyName,
  companyStage,
  stageLabel,
  hasContacts,
  hasNotes,
  hasInterviewNotes,
  roleType,
  hasCareerHistory,
  hasPositioning,
  hasTargetTitles,
  profileScore,
  firstCompany = false,
  initialStage,
}: {
  companyId: string
  companyName: string
  companyStage: string
  stageLabel: string
  hasContacts: boolean
  hasNotes: boolean
  hasInterviewNotes: boolean
  roleType: string | null
  hasCareerHistory: boolean
  hasPositioning: boolean
  hasTargetTitles: boolean
  profileScore: number
  firstCompany?: boolean
  initialStage?: InterviewStage
}) {
  const [brief, setBrief] = useState('')
  const [briefId, setBriefId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [refineInput, setRefineInput] = useState('')
  const [refining, setRefining] = useState(false)
  const [postingUrl, setPostingUrl] = useState('')
  const [interviewStage, setInterviewStage] = useState<InterviewStage>(
    initialStage ?? DEFAULT_INTERVIEW_STAGE[companyStage] ?? 'executive_interview'
  )
  const [roleMode, setRoleMode] = useState<PrepRoleMode>(inferInitialRoleMode(roleType))
  const [outreachDraft, setOutreachDraft] = useState('')
  const [outreachLoading, setOutreachLoading] = useState(false)
  const [outreachError, setOutreachError] = useState('')
  const [outreachCopied, setOutreachCopied] = useState(false)
  const [outreachLogged, setOutreachLogged] = useState(false)
  const [outreachLogLoading, setOutreachLogLoading] = useState(false)
  const [lowConfidenceAcknowledged, setLowConfidenceAcknowledged] = useState(false)
  // Chat state
  type ChatMessage = { role: 'user' | 'assistant'; content: string }
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const refineRef = useRef<HTMLTextAreaElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const autoStarted = useRef(false)

  useEffect(() => {
    if (firstCompany && !autoStarted.current) {
      autoStarted.current = true
      handleGenerate()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const background   = useOnDemand(`/api/prep/${companyId}/background`,  companyId, 'background')
  const leadership   = useOnDemand(`/api/prep/${companyId}/leadership`,  companyId, 'leadership')
  const priorities   = useOnDemand(`/api/prep/${companyId}/priorities`,  companyId, 'priorities')
  const challenges   = useOnDemand(`/api/prep/${companyId}/challenges`,  companyId, 'challenges')
  const competitive  = useOnDemand(`/api/prep/${companyId}/competitive`, companyId, 'competitive')
  const wins         = useOnDemand(`/api/prep/${companyId}/wins`,        companyId, 'wins')
  const techStack    = useOnDemand(`/api/prep/${companyId}/tech-stack`,  companyId, 'tech_stack')
  const whyHere      = useOnDemand(`/api/prep/${companyId}/why-here`,    companyId, 'why_here')
  const questions    = useOnDemand(`/api/prep/${companyId}/questions`,   companyId, 'questions')

  async function handleGenerate() {
    setLoading(true)
    setBrief('')
    setBriefId(null)
    setLowConfidenceAcknowledged(false)
    setError('')
    try {
      const url = new URL(`/api/prep/${companyId}`, window.location.origin)
      if (postingUrl.trim()) url.searchParams.set('posting_url', postingUrl.trim())
      url.searchParams.set('interview_stage', interviewStage)
      url.searchParams.set('role_mode', roleMode)
      const res = await fetch(url.toString())
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body?.error ?? `Request failed (${res.status})`)
        return
      }
      let fullText = ''
      await streamResponse(res, chunk => { fullText += chunk; setBrief(fullText) })
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
    setLowConfidenceAcknowledged(false)
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
      await streamResponse(res, chunk => { fullText += chunk; setBrief(fullText) })
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

  async function handleLogOutreach() {
    setOutreachLogLoading(true)
    try {
      await fetch(`/api/prep/${companyId}/outreach/log`, { method: 'POST' })
      setOutreachLogged(true)
    } catch {
      // non-critical - silently fail
    } finally {
      setOutreachLogLoading(false)
    }
  }

  async function handleGenerateOutreach() {
    setOutreachLoading(true)
    setOutreachDraft('')
    setOutreachError('')
    setOutreachCopied(false)
    setOutreachLogged(false)
    try {
      const res = await fetch(`/api/prep/${companyId}/outreach`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setOutreachError(body?.error ?? `Request failed (${res.status})`)
        return
      }
      let fullText = ''
      await streamResponse(res, chunk => { fullText += chunk; setOutreachDraft(fullText) })
      if (fullText.startsWith('__ERROR__')) {
        setOutreachError(fullText.slice(9))
        setOutreachDraft('')
      }
    } catch (e) {
      setOutreachError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setOutreachLoading(false)
    }
  }

  function handleCopyOutreach() {
    navigator.clipboard.writeText(outreachDraft).then(() => {
      setOutreachCopied(true)
      setTimeout(() => setOutreachCopied(false), 2000)
    }).catch(() => {})
  }

  async function handleChat() {
    const message = chatInput.trim()
    if (!message || chatLoading || loading) return
    const userMsg: ChatMessage = { role: 'user', content: message }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)
    try {
      const res = await fetch(`/api/prep/${companyId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          brief: brief.slice(0, 6000),
          companyName,
          history: chatMessages.slice(-8).map(m => ({ role: m.role, content: m.content })),
        }),
      })
      let fullText = ''
      setChatMessages(prev => [...prev, { role: 'assistant', content: '' }])
      if (res.ok) {
        await streamResponse(res, chunk => {
          fullText += chunk
          setChatMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'assistant', content: fullText }
            return updated
          })
        })
      } else {
        setChatMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: 'Unable to answer right now.' }
          return updated
        })
      }
    } catch {
      setChatMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'Unable to answer right now.' }
        return updated
      })
    } finally {
      setChatLoading(false)
    }
  }

  async function handleDownload() {
    if (downloading || !brief) return
    setDownloading(true)
    try {
      const title = `${companyName} - Prep Brief`
      const res = await fetch('/api/briefs/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: brief, title }),
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${companyName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-prep-brief.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // silently fail - user can retry
    } finally {
      setDownloading(false)
    }
  }

  const busy = loading || refining
  const briefConfidence = useMemo(() => {
    if (!brief) return null
    return scorePrepBriefConfidence(brief)
  }, [brief])
  const isLowConfidence = briefConfidence?.band === 'low'
  const exportBlockedByConfidence = isLowConfidence && !lowConfidenceAcknowledged

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900 no-print">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link
            href={`/dashboard/companies/${companyId}`}
            className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← {companyName}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-6 sm:mb-8 no-print">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-5">
            <div>
              <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Interview Prep</h1>
              <p className="text-[13px] text-slate-500 mt-1.5">{companyName} · {stageLabel}</p>
            </div>
            <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
              <input
                type="url"
                value={postingUrl}
                onChange={e => setPostingUrl(e.target.value)}
                placeholder="Paste job posting URL (optional)"
                disabled={busy}
                className="text-[12px] text-slate-700 placeholder-slate-400 border border-slate-200 rounded px-3 py-2 w-full sm:w-72 focus:outline-none focus:border-slate-400 disabled:opacity-50"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={busy}
                  className="flex-1 bg-slate-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating…' : brief ? 'Regenerate' : 'Generate prep brief'}
                </button>
                {brief && !busy && (
                  <>
                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={downloading || exportBlockedByConfidence}
                      className="shrink-0 text-[13px] font-semibold text-slate-600 border border-slate-200 rounded px-4 py-2.5 hover:border-slate-400 hover:text-slate-800 bg-white cursor-pointer transition-colors disabled:opacity-40"
                      title="Download as Word document"
                    >
                      {downloading ? '…' : 'Word'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!exportBlockedByConfidence) window.print()
                      }}
                      disabled={exportBlockedByConfidence}
                      className="shrink-0 text-[13px] font-semibold text-slate-600 border border-slate-200 rounded px-4 py-2.5 hover:border-slate-400 hover:text-slate-800 bg-white cursor-pointer transition-colors"
                      title="Save as PDF"
                    >
                      PDF
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Interview stage</p>
            <div className="flex flex-wrap gap-1.5">
              {STAGE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setInterviewStage(opt.value)}
                  disabled={busy}
                  className={`text-[12px] font-medium px-3 py-1.5 rounded border transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                    interviewStage === opt.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Role mode</p>
            <div className="flex flex-wrap gap-1.5">
              {ROLE_MODE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRoleMode(opt.value)}
                  disabled={busy}
                  className={`text-[12px] font-medium px-3 py-1.5 rounded border transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                    roleMode === opt.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {firstCompany && !brief && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded px-6 py-5">
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-1">Your first intelligence brief</p>
            <p className="text-[14px] font-semibold text-slate-900 mb-1">
              {loading ? `Building your brief on ${companyName}...` : `Ready to brief you on ${companyName}.`}
            </p>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {loading
                ? 'Scanning public signals, leadership context, strategic priorities, and likely objections. This takes about 20 seconds.'
                : 'We scanned public signals, leadership context, and strategic priorities. Your brief is ready.'}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded text-[13px] text-red-700">
            {error}
          </div>
        )}

        {!brief && !busy && (() => {
          const warnings: { key: string; label: string; message: string; href: string; cta: string }[] = []
          if (!hasCareerHistory) warnings.push({
            key: 'career',
            label: 'No career history',
            message: 'The brief cannot personalize your background. Add verified career history on your profile.',
            href: '/dashboard/profile',
            cta: 'Add career history',
          })
          if (!hasPositioning) warnings.push({
            key: 'positioning',
            label: 'No positioning summary',
            message: 'Win Thesis will be less differentiated without a positioning statement.',
            href: '/dashboard/profile',
            cta: 'Add positioning',
          })
          if (!hasTargetTitles) warnings.push({
            key: 'targets',
            label: 'No target roles set',
            message: 'The brief cannot calibrate to your targets without at least one target title.',
            href: '/dashboard/profile',
            cta: 'Set targets',
          })
          if (!hasNotes) warnings.push({
            key: 'notes',
            label: 'No company notes',
            message: (roleType && NO_NOTES_MESSAGES[roleType]) ?? 'Company notes are the single biggest lever for brief quality.',
            href: `/dashboard/companies/${companyId}`,
            cta: 'Add notes',
          })
          if (warnings.length === 0) return null
          return (
            <div className="mb-4 flex flex-col gap-2">
              {warnings.map(w => (
                <div key={w.key} className="px-4 py-3 bg-amber-50 border border-amber-200 rounded flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold text-amber-700 mb-0.5">{w.label}</p>
                    <p className="text-[12px] text-amber-600">{w.message}</p>
                  </div>
                  <Link href={w.href} className="shrink-0 text-[11px] font-semibold text-amber-700 border border-amber-300 rounded px-2.5 py-1 hover:bg-amber-100 transition-colors whitespace-nowrap">
                    {w.cta}
                  </Link>
                </div>
              ))}
            </div>
          )
        })()}

        {!brief && !busy && !error && (
          <div className="bg-white border border-slate-200 rounded p-8 sm:p-10 text-center">
            <p className="text-[14px] text-slate-400">
              Generates an elite brief using your pipeline data, company notes, scan results, and known contacts.
            </p>
          </div>
        )}

        {!brief && !busy && error && (
          <div className="bg-white border border-slate-200 rounded p-8 sm:p-10 text-center">
            <p className="text-[14px] text-slate-400">
              Click Generate to try again.
            </p>
          </div>
        )}

        {busy && !brief && (
          <div className="bg-white border border-slate-200 rounded p-5 sm:p-8">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {brief && profileScore < 50 && !busy && (
          <div className="mb-4 px-5 py-4 bg-amber-50 border border-amber-200 rounded flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-amber-900">
                This brief used limited profile data.
              </p>
              <p className="text-[12px] text-amber-700 mt-1 leading-relaxed">
                Adding your resume unlocks significantly more specific talking points, win thesis, and pushback prep. The brief you just generated is a starting point.
              </p>
            </div>
            <Link
              href="/dashboard/profile#section-resume"
              className="shrink-0 text-[12px] font-semibold text-amber-900 border border-amber-300 hover:border-amber-500 px-3 py-1.5 rounded transition-colors"
            >
              Add resume →
            </Link>
          </div>
        )}

        {brief && briefConfidence && !busy && (
          <div className={`mb-4 rounded border px-5 py-4 ${isLowConfidence ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500">Brief confidence</p>
                <p className="text-[14px] font-semibold text-slate-900 mt-1">
                  Score: {briefConfidence.score}/100 ({briefConfidence.band})
                </p>
              </div>
              <div className="text-[12px] text-slate-600">
                Sections: {briefConfidence.factors.structuredSections}/5 · Inferred penalty: -{briefConfidence.factors.inferredSharePenalty}
              </div>
            </div>
            {isLowConfidence && (
              <div className="mt-3 pt-3 border-t border-amber-200">
                <p className="text-[12px] font-semibold text-amber-800 mb-1.5">Low confidence remediation required before export</p>
                <ul className="text-[12px] text-amber-700 space-y-1.5">
                  {briefConfidence.remediation.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setLowConfidenceAcknowledged(true)}
                  className="mt-3 text-[12px] font-semibold text-amber-900 border border-amber-300 rounded px-3 py-1.5 hover:bg-amber-100 transition-colors"
                >
                  Acknowledge and allow export
                </button>
              </div>
            )}
          </div>
        )}

        {brief && (
          <div className="bg-white border border-slate-200 rounded p-5 sm:p-8 mb-4">
            <SourceLegend />
            {renderBrief(brief)}
            {busy && (
              <span className="inline-block w-0.5 h-4 bg-slate-400 animate-pulse ml-0.5 align-middle" />
            )}
            {!busy && (
              <p className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                AI-generated — use as input, not advice. Verify facts before any conversation.
              </p>
            )}
          </div>
        )}

        {briefId && !busy && (
          <div className="mb-4 flex justify-end no-print">
            <BriefRating briefId={briefId} />
          </div>
        )}

        {brief && !busy && (() => {
          const nudges: { href: string; cta: string; message: string }[] = []
          if (!hasInterviewNotes && (companyStage === 'interviewing' || companyStage === 'offer')) nudges.push({
            message: 'Add post-interview notes to sharpen the next brief based on what was actually asked.',
            href: `/dashboard/companies/${companyId}`,
            cta: 'Add interview notes',
          })
          if (!hasCareerHistory) nudges.push({
            message: 'Verified career history would make the Win Thesis and Talking Points significantly more specific.',
            href: '/dashboard/profile',
            cta: 'Add career history',
          })
          if (!hasPositioning) nudges.push({
            message: 'A positioning summary sharpens the Win Thesis and Bottom Line.',
            href: '/dashboard/profile',
            cta: 'Add positioning',
          })
          if (!hasNotes) nudges.push({
            message: 'Company notes are the single biggest lever. Add intel before the next regenerate.',
            href: `/dashboard/companies/${companyId}`,
            cta: 'Add notes',
          })
          const top = nudges.slice(0, 2)
          if (top.length === 0) return null
          return (
            <div className="mb-4 bg-white border border-slate-200 rounded p-5 no-print">
              <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">What would sharpen the next brief</p>
              <div className="flex flex-col gap-2.5">
                {top.map((n, i) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <p className="text-[13px] text-slate-600">{n.message}</p>
                    <Link href={n.href} className="shrink-0 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded px-2.5 py-1 hover:border-slate-400 transition-colors whitespace-nowrap">
                      {n.cta}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {brief && !loading && (
          <div className="no-print">
            <OnDemandPanel
              title="Your Background Match"
              description="How your specific experience connects to this company's challenges. Generate this before you walk in."
              content={background.content}
              briefId={background.briefId}
              loading={background.loading}
              error={background.error}
              onGenerate={background.generate}
            />
            <OnDemandPanel
              title="Leadership Team"
              description="Who is in the room, what they care about, and how to win with each of them."
              content={leadership.content}
              briefId={leadership.briefId}
              loading={leadership.loading}
              error={leadership.error}
              onGenerate={leadership.generate}
            />
            <OnDemandPanel
              title="Strategic Priorities"
              description="What this company is actually focused on right now - and how to align your narrative."
              content={priorities.content}
              briefId={priorities.briefId}
              loading={priorities.loading}
              error={priorities.error}
              onGenerate={priorities.generate}
            />
            <OnDemandPanel
              title="Pain Points"
              description="The real challenges they are dealing with - and how to demonstrate you understand them."
              content={challenges.content}
              briefId={challenges.briefId}
              loading={challenges.loading}
              error={challenges.error}
              onGenerate={challenges.generate}
            />
            <OnDemandPanel
              title="Competitive Landscape"
              description="Who they compete with, how they position, and how to use it in the room."
              content={competitive.content}
              briefId={competitive.briefId}
              loading={competitive.loading}
              error={competitive.error}
              onGenerate={competitive.generate}
            />
            <OnDemandPanel
              title="Recent Wins"
              description="What to acknowledge and reference to show you did the homework."
              content={wins.content}
              briefId={wins.briefId}
              loading={wins.loading}
              error={wins.error}
              onGenerate={wins.generate}
            />
            <OnDemandPanel
              title="Tech Stack"
              description="What systems they are likely running and what to know before you walk in."
              content={techStack.content}
              briefId={techStack.briefId}
              loading={techStack.loading}
              error={techStack.error}
              onGenerate={techStack.generate}
            />
            <OnDemandPanel
              title="Why Here"
              description="A personalized statement for when they ask why you want this role."
              content={whyHere.content}
              briefId={whyHere.briefId}
              loading={whyHere.loading}
              error={whyHere.error}
              onGenerate={whyHere.generate}
            />
            <OnDemandPanel
              title="Likely Interview Questions"
              description="The questions they will ask you - with coaching on how to answer each."
              content={questions.content}
              briefId={questions.briefId}
              loading={questions.loading}
              error={questions.error}
              onGenerate={questions.generate}
            />
          </div>
        )}

        {brief && !loading && <div className="no-print"><ResourcePanel brief={brief} /></div>}

        {brief && !loading && (
          <div className="bg-white border border-slate-200 rounded p-6 mb-4 no-print">
            <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-3">
              Ask about this brief
            </p>
            {chatMessages.length > 0 && (
              <div className="flex flex-col gap-3 mb-4 max-h-80 overflow-y-auto">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-800'
                    }`}>
                      {msg.content}
                      {msg.role === 'assistant' && msg.content === '' && chatLoading && (
                        <span className="inline-flex gap-1 ml-1">
                          <span className="w-1 h-1 rounded-full bg-slate-400 animate-pulse inline-block" />
                          <span className="w-1 h-1 rounded-full bg-slate-400 animate-pulse inline-block [animation-delay:150ms]" />
                          <span className="w-1 h-1 rounded-full bg-slate-400 animate-pulse inline-block [animation-delay:300ms]" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 items-end">
              <textarea
                ref={chatInputRef}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat() }
                }}
                placeholder={chatMessages.length === 0
                  ? 'Ask anything — "What should I ask about their CFO transition?" or "Role-play their opening question"'
                  : 'Ask a follow-up...'}
                rows={2}
                disabled={chatLoading || loading}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleChat}
                disabled={chatLoading || loading || !chatInput.trim()}
                className="shrink-0 bg-slate-900 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {chatLoading ? '…' : 'Ask'}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-300">Enter to send · Shift+Enter for new line</p>
          </div>
        )}

        {brief && !loading && (
          <div className="bg-white border border-slate-200 rounded p-6 no-print">
            <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-3">
              Refine this brief
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                'Make the pushback counters more aggressive',
                'Add a first 30/60/90 day plan',
                "Assume they'll challenge my industry experience",
              ].map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => { setRefineInput(chip); refineRef.current?.focus() }}
                  className="text-[12px] text-slate-500 border border-slate-200 rounded-full px-3 py-1 hover:border-slate-400 hover:text-slate-700 bg-transparent cursor-pointer transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
            <div className="flex gap-3 items-end">
              <textarea
                ref={refineRef}
                value={refineInput}
                onChange={e => setRefineInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRefine() }
                }}
                placeholder="Or type your own refinement request..."
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

        {brief && (
          <div className="mt-6 bg-slate-900 rounded px-6 py-5 no-print">
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className="text-[13px] text-slate-300 font-semibold">
                Draft outreach from this brief
              </p>
              {!outreachDraft && !outreachLoading && (
                <button
                  type="button"
                  onClick={handleGenerateOutreach}
                  disabled={outreachLoading}
                  className="shrink-0 text-[12px] font-semibold text-white border border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded transition-colors cursor-pointer bg-transparent disabled:opacity-50"
                >
                  Generate →
                </button>
              )}
            </div>

            {outreachLoading && !outreachDraft && (
              <p className="text-[13px] text-slate-400 italic">Drafting outreach…</p>
            )}

            {outreachError && (
              <p className="text-[13px] text-red-400">{outreachError}</p>
            )}

            {outreachDraft && (
              <div>
                <p className="text-[14px] text-slate-200 leading-relaxed whitespace-pre-wrap mb-4">
                  {outreachDraft}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopyOutreach}
                    className="text-[12px] font-semibold text-white border border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded transition-colors cursor-pointer bg-transparent"
                  >
                    {outreachCopied ? 'Copied!' : 'Copy'}
                  </button>
                  {hasContacts && !outreachLogged && (
                    <button
                      type="button"
                      onClick={handleLogOutreach}
                      disabled={outreachLogLoading}
                      className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 border border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded transition-colors cursor-pointer bg-transparent disabled:opacity-50"
                    >
                      {outreachLogLoading ? 'Logging…' : 'Log as sent'}
                    </button>
                  )}
                  {outreachLogged && (
                    <span className="text-[12px] font-semibold text-green-400">Logged</span>
                  )}
                  <button
                    type="button"
                    onClick={handleGenerateOutreach}
                    disabled={outreachLoading}
                    className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded transition-colors cursor-pointer bg-transparent border-0 disabled:opacity-50"
                  >
                    Regenerate
                  </button>
                  {!hasContacts && (
                    <Link
                      href={`/dashboard/companies/${companyId}`}
                      className="text-[12px] text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Add a contact to log this →
                    </Link>
                  )}
                </div>
              </div>
            )}

            {!outreachDraft && !outreachLoading && !outreachError && (
              <p className="text-[12px] text-slate-500">
                Generates a 3-sentence message grounded in this company&apos;s signals and your prep brief.
                {!hasContacts && ' Add a contact at ' + companyName + ' to log the outreach after.'}
              </p>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
