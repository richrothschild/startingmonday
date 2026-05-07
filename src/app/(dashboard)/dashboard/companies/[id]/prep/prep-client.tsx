'use client'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { getRelevantResources, getDefaultResources, type Resource } from '@/lib/resources'
import { BriefRating } from '@/components/BriefRating'
import type { InterviewStage } from '@/lib/prompts'

const STAGE_OPTIONS: { value: InterviewStage; label: string }[] = [
  { value: 'recruiter_screen',    label: 'Recruiter Screen' },
  { value: 'first_interview',     label: 'First Interview' },
  { value: 'executive_interview', label: 'Executive Interview' },
  { value: 'board_presentation',  label: 'Board Presentation' },
  { value: 'final_round',         label: 'Final Round' },
]

const DEFAULT_INTERVIEW_STAGE: Record<string, InterviewStage> = {
  watching:    'executive_interview',
  researching: 'executive_interview',
  applied:     'recruiter_screen',
  interviewing:'first_interview',
  offer:       'final_round',
}

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
          <span className="text-slate-300 shrink-0 select-none mt-0.5">-</span>
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

async function saveBrief(type: string, text: string, companyId?: string): Promise<string | null> {
  try {
    const res = await fetch('/api/briefs/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, text, company_id: companyId }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.id ?? null
  } catch {
    return null
  }
}

function useOnDemand(url: string, companyId: string) {
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
        const id = await saveBrief('prep_section', fullText, companyId)
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
          {renderBrief(content)}
          {loading && (
            <span className="inline-block w-0.5 h-4 bg-slate-400 animate-pulse ml-0.5 align-middle" />
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
  coo:       'COO briefs require operational context. Add notes on the specific challenge this company is navigating — what phase, what broke, what the CEO cannot do alone.',
  ciso:      'CISO briefs improve significantly with sector and regulatory context. Add notes on recent events in their space, board security posture, or why the role opened.',
  cpo:       'CPO briefs improve with product context. Add notes on the current product situation — engagement vs acquisition problem, what created this opening.',
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
}) {
  const [brief, setBrief] = useState('')
  const [briefId, setBriefId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [refineInput, setRefineInput] = useState('')
  const [refining, setRefining] = useState(false)
  const [postingUrl, setPostingUrl] = useState('')
  const [interviewStage, setInterviewStage] = useState<InterviewStage>(
    DEFAULT_INTERVIEW_STAGE[companyStage] ?? 'executive_interview'
  )
  const refineRef = useRef<HTMLTextAreaElement>(null)

  const leadership   = useOnDemand(`/api/prep/${companyId}/leadership`,  companyId)
  const priorities   = useOnDemand(`/api/prep/${companyId}/priorities`,  companyId)
  const challenges   = useOnDemand(`/api/prep/${companyId}/challenges`,  companyId)
  const competitive  = useOnDemand(`/api/prep/${companyId}/competitive`, companyId)
  const wins         = useOnDemand(`/api/prep/${companyId}/wins`,        companyId)
  const techStack    = useOnDemand(`/api/prep/${companyId}/tech-stack`,  companyId)
  const whyHere      = useOnDemand(`/api/prep/${companyId}/why-here`,    companyId)
  const questions    = useOnDemand(`/api/prep/${companyId}/questions`,   companyId)

  async function handleGenerate() {
    setLoading(true)
    setBrief('')
    setBriefId(null)
    setError('')
    try {
      const url = new URL(`/api/prep/${companyId}`, window.location.origin)
      if (postingUrl.trim()) url.searchParams.set('posting_url', postingUrl.trim())
      url.searchParams.set('interview_stage', interviewStage)
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

  const busy = loading || refining

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
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

        <div className="mb-6 sm:mb-8">
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
              <button
                type="button"
                onClick={handleGenerate}
                disabled={busy}
                className="bg-slate-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating…' : brief ? 'Regenerate' : 'Generate prep brief'}
              </button>
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
        </div>

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

        {brief && (
          <div className="bg-white border border-slate-200 rounded p-5 sm:p-8 mb-4">
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
            <div className="mb-4 bg-white border border-slate-200 rounded p-5">
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
          <>
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
              description="What this company is actually focused on right now — and how to align your narrative."
              content={priorities.content}
              briefId={priorities.briefId}
              loading={priorities.loading}
              error={priorities.error}
              onGenerate={priorities.generate}
            />
            <OnDemandPanel
              title="Pain Points"
              description="The real challenges they are dealing with — and how to demonstrate you understand them."
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
              description="The questions they will ask you — with coaching on how to answer each."
              content={questions.content}
              briefId={questions.briefId}
              loading={questions.loading}
              error={questions.error}
              onGenerate={questions.generate}
            />
          </>
        )}

        {brief && !loading && <ResourcePanel brief={brief} />}

        {brief && !loading && (
          <div className="bg-white border border-slate-200 rounded p-6">
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

        {brief && !hasContacts && (
          <div className="mt-6 bg-slate-900 rounded px-6 py-4 flex items-center justify-between gap-4">
            <p className="text-[13px] text-slate-300">
              Add a contact at {companyName} to track your outreach alongside this brief.
            </p>
            <Link
              href={`/dashboard/companies/${companyId}`}
              className="shrink-0 text-[12px] font-semibold text-white border border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded transition-colors"
            >
              Add contact
            </Link>
          </div>
        )}

      </main>
    </div>
  )
}
