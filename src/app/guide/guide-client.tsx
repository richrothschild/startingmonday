'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type GuideSection = {
  id: string
  title: string
  body: string
}

type ChatSource = {
  id: string
  title: string
  url: string
  score: number
  type: string
  snippet?: string
}

type ChatResponse = {
  answer: string
  sources: ChatSource[]
  intent?: string
  confidence?: number
  conservative?: boolean
  queryId?: string | null
}

function toAnchorId(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function GuideClient({ sections, initialQuestion = '' }: { sections: GuideSection[]; initialQuestion?: string }) {
  const [query, setQuery] = useState('')
  const [question, setQuestion] = useState(initialQuestion)
  const [chatResult, setChatResult] = useState<ChatResponse | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const [chatLoading, setChatLoading] = useState(false)
  const [feedbackState, setFeedbackState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [feedbackNote, setFeedbackNote] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sections
    return sections.filter((section) => {
      return section.title.toLowerCase().includes(q) || section.body.toLowerCase().includes(q)
    })
  }, [query, sections])

  async function askGuideChat() {
    const trimmed = question.trim()
    if (!trimmed || chatLoading) return

    setChatLoading(true)
    setChatError(null)

    try {
      const response = await fetch('/api/guide/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Guide chat is unavailable right now.')
      }

      const payload = (await response.json()) as ChatResponse
      setChatResult(payload)
      setFeedbackState('idle')
      setFeedbackNote('')
    } catch (error) {
      setChatResult(null)
      setChatError(error instanceof Error ? error.message : 'Unable to get an answer right now.')
    } finally {
      setChatLoading(false)
    }
  }

  async function sendFeedback(rating: 'helpful' | 'not_helpful') {
    if (!chatResult?.queryId || feedbackState === 'sending') return
    setFeedbackState('sending')

    try {
      const response = await fetch('/api/guide/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryId: chatResult.queryId,
          rating,
          note: feedbackNote.trim() || undefined,
        }),
      })

      if (!response.ok) throw new Error('feedback failed')
      setFeedbackState('sent')
    } catch {
      setFeedbackState('error')
    }
  }

  function renderBody(body: string) {
    const lines = body.split('\n').map((line) => line.trim()).filter(Boolean)

    return lines.map((line, index) => {
      const markdownLink = line.match(/^[-*]\s*\[([^\]]+)\]\(([^)]+)\)\s*-?\s*(.*)$/)
      if (markdownLink) {
        const [, label, url, rest] = markdownLink
        return (
          <p key={`${line}-${index}`} className="text-[13px] leading-relaxed text-slate-700">
            <a href={url} className="font-semibold text-slate-900 hover:text-slate-700 hover:underline">{label}</a>
            {rest ? <span className="text-slate-600"> - {rest}</span> : null}
          </p>
        )
      }

      return (
        <p key={`${line}-${index}`} className="text-[13px] leading-relaxed text-slate-700">
          {line}
        </p>
      )
    })
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400"><span className="text-white">Starting </span><span className="text-orange-500">Monday</span></span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/help" className="text-[13px] text-slate-300 hover:text-white transition-colors">Help</Link>
            <Link href="/dashboard" className="text-[13px] text-slate-300 hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-slate-900">Starting Monday Career Guide</h1>
          <p className="text-[13px] text-slate-500 mt-1">Find features fast, follow practical how-to steps, and ask guide chat for source-linked answers.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 mb-5">
          <label htmlFor="guide-search" className="block text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Search all guide sections</label>
          <input
            id="guide-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search features, onboarding steps, APIs, and articles..."
            className="w-full text-[14px] border border-slate-300 rounded px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-300"
          />
          <p className="text-[12px] text-slate-400 mt-2">Showing {filtered.length} of {sections.length} sections.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded p-4 sm:p-5 mb-6">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Career Guide Chat</p>
          <p className="text-[13px] text-slate-300 mb-3">Ask anything about features, setup, workflows, or articles. You will get an answer plus source links.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="guide-chat"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void askGuideChat()
                }
              }}
              placeholder="Example: How do I get started and set up my profile?"
              className="w-full text-[14px] border border-slate-700 rounded px-3 py-2 bg-slate-950 text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-slate-500"
            />
            <button
              type="button"
              onClick={() => {
                void askGuideChat()
              }}
              disabled={chatLoading || !question.trim()}
              className="sm:w-auto px-4 py-2 text-[13px] font-semibold rounded bg-orange-500 text-black hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {chatLoading ? 'Searching...' : 'Ask'}
            </button>
          </div>

          {chatError ? <p className="text-[12px] text-rose-300 mt-3">{chatError}</p> : null}

          {chatResult ? (
            <div className="mt-4 p-4 rounded border border-slate-700 bg-slate-950">
              <p className="text-[13px] text-slate-200 whitespace-pre-wrap">{chatResult.answer}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">intent: {chatResult.intent ?? 'general'}</span>
                <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">confidence: {Math.round((chatResult.confidence ?? 0) * 100)}%</span>
                {chatResult.conservative ? <span className="px-2 py-1 rounded bg-amber-900/30 text-amber-300">source-first mode</span> : null}
              </div>

              {chatResult.sources.length > 0 ? (
                <div className="mt-3 space-y-1">
                  <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">Sources</p>
                  {chatResult.sources.map((source) => (
                    <div key={source.id}>
                      <a href={source.url} className="block text-[13px] text-orange-300 hover:text-orange-200 hover:underline">
                        {source.title}
                      </a>
                      {source.snippet ? <p className="text-[12px] text-slate-400">{source.snippet}</p> : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {chatResult.queryId ? (
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-2">Was this helpful?</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { void sendFeedback('helpful') }}
                      disabled={feedbackState === 'sending' || feedbackState === 'sent'}
                      className="px-3 py-1.5 text-[12px] font-semibold rounded bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-60"
                    >
                      Helpful
                    </button>
                    <button
                      type="button"
                      onClick={() => { void sendFeedback('not_helpful') }}
                      disabled={feedbackState === 'sending' || feedbackState === 'sent'}
                      className="px-3 py-1.5 text-[12px] font-semibold rounded bg-slate-700 text-slate-100 hover:bg-slate-600 disabled:opacity-60"
                    >
                      Not helpful
                    </button>
                    <input
                      type="text"
                      value={feedbackNote}
                      onChange={(event) => setFeedbackNote(event.target.value)}
                      placeholder="Optional: what was missing?"
                      className="min-w-[240px] flex-1 text-[12px] border border-slate-700 rounded px-2.5 py-1.5 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                  {feedbackState === 'sent' ? <p className="text-[11px] text-emerald-300 mt-2">Thanks. Feedback captured.</p> : null}
                  {feedbackState === 'error' ? <p className="text-[11px] text-rose-300 mt-2">Could not save feedback right now.</p> : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 mb-6">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Section index</p>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filtered.map((section) => (
                <a key={section.id} href={`#${toAnchorId(section.id)}`} className="text-[13px] text-slate-700 hover:text-slate-900 hover:underline">
                  {section.title}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-slate-500">No sections match this search yet. Clear search to browse all guide sections.</p>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((section) => (
              <section key={section.id} id={toAnchorId(section.id)} className="bg-white border border-slate-200 rounded p-5">
                <h2 className="text-[18px] font-bold text-slate-900 mb-2">{section.title}</h2>
                <div className="space-y-1">{renderBody(section.body.trim())}</div>
              </section>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded p-5">
            <p className="text-[14px] font-semibold text-slate-900">No guide sections found for this search.</p>
            <p className="text-[13px] text-slate-600 mt-1">Try a broader keyword like onboarding, profile, companies, briefing, or outreach.</p>
          </div>
        )}
      </main>
    </div>
  )
}
