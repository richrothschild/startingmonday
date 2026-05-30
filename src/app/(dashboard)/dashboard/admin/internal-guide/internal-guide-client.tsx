'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

type GuideSection = {
  id: string
  title: string
  body: string
}

type ChatSource = {
  id: string
  title: string
  ref: string
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
}

function toAnchorId(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

export function InternalGuideClient({
  sections,
  initialQuestion = '',
  staffRole,
}: {
  sections: GuideSection[]
  initialQuestion?: string
  staffRole: string
}) {
  const [query, setQuery] = useState('')
  const [question, setQuestion] = useState(initialQuestion)
  const [chatResult, setChatResult] = useState<ChatResponse | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const [chatLoading, setChatLoading] = useState(false)
  const [showOverview, setShowOverview] = useState(false)
  const [showStartHere, setShowStartHere] = useState(false)
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sections
    return sections.filter((section) => section.title.toLowerCase().includes(q) || section.body.toLowerCase().includes(q))
  }, [query, sections])

  const topics = useMemo(() => {
    return sections.map((section) => ({
      id: section.id,
      title: section.title,
      summary: section.body.split('\n').find((line) => line.trim())?.replace(/^-\s*/, '').slice(0, 180) ?? 'No summary available.',
    }))
  }, [sections])

  const activeTopic = useMemo(() => {
    if (!activeTopicId) return null
    return sections.find((section) => section.id === activeTopicId) ?? null
  }, [activeTopicId, sections])

  const startHereTopics = useMemo(() => {
    const wanted = ['architecture', 'api', 'data', 'infra', 'features']
    const selected: GuideSection[] = []
    for (const key of wanted) {
      const match = sections.find((section) => section.title.toLowerCase().includes(key))
      if (match && !selected.includes(match)) selected.push(match)
    }
    if (selected.length < 3) {
      for (const section of sections) {
        if (selected.includes(section)) continue
        selected.push(section)
        if (selected.length >= 3) break
      }
    }
    return selected.slice(0, 4)
  }, [sections])

  async function askInternalChat() {
    const trimmed = question.trim()
    if (!trimmed || chatLoading) return

    setChatLoading(true)
    setChatError(null)

    try {
      const response = await fetch('/api/admin/internal-guide/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Internal guide chat is unavailable right now.')
      }

      const payload = (await response.json()) as ChatResponse
      setChatResult(payload)
    } catch (error) {
      setChatResult(null)
      setChatError(error instanceof Error ? error.message : 'Unable to get an answer right now.')
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400"><span className="text-white">Starting </span><span className="text-orange-500">Monday</span></span>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-400 uppercase tracking-[0.12em]">{staffRole}</span>
            <Link href="/dashboard/admin" className="text-[13px] text-slate-300 hover:text-white transition-colors">Admin</Link>
            <Link href="/guide" className="text-[13px] text-slate-300 hover:text-white transition-colors">User Guide</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-slate-900">Starting Monday Internal Engineering Guide</h1>
          <p className="text-[13px] text-slate-500 mt-1">Admin/owner handbook for features, code paths, infrastructure, docs, and integration boundaries.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setShowOverview((current) => !current)
                if (!showOverview && topics.length > 0 && !activeTopicId) setActiveTopicId(topics[0]!.id)
              }}
              className="inline-flex min-h-[40px] items-center rounded-full border border-slate-300 bg-white px-4 text-[12px] font-semibold text-slate-700 hover:border-slate-400"
            >
              Get an overview
            </button>
            <button
              type="button"
              onClick={() => setShowStartHere((current) => !current)}
              className="inline-flex min-h-[40px] items-center rounded-full border border-slate-300 bg-white px-4 text-[12px] font-semibold text-slate-700 hover:border-slate-400"
            >
              Start here
            </button>
          </div>
        </div>

        {showStartHere ? (
          <section className="bg-white border border-slate-200 rounded p-4 mb-6">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Start here</p>
            <div className="space-y-2">
              {startHereTopics.map((topic, index) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    setShowOverview(true)
                    setActiveTopicId(topic.id)
                    const target = document.getElementById(toAnchorId(topic.id))
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className="w-full text-left rounded border border-slate-200 hover:border-slate-300 px-3 py-2"
                >
                  <p className="text-[12px] font-semibold text-slate-900">{index + 1}. {topic.title}</p>
                  <p className="text-[12px] text-slate-500 mt-1">{topic.body.split('\n').find((line) => line.trim())?.replace(/^-\s*/, '').slice(0, 150) ?? 'Open this section for details.'}</p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {showOverview ? (
          <section className="bg-white border border-slate-200 rounded p-4 mb-6">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Engineering overview</p>
            <p className="text-[13px] text-slate-600 mb-3">Choose a topic for the next level of detail.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setActiveTopicId(topic.id)}
                  className={`text-left rounded border px-3 py-2 ${activeTopicId === topic.id ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                >
                  <p className="text-[12px] font-semibold text-slate-900">{topic.title}</p>
                  <p className="text-[12px] text-slate-500 mt-1">{topic.summary}</p>
                </button>
              ))}
            </div>

            {activeTopic ? (
              <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3">
                <p className="text-[12px] font-semibold text-slate-900">{activeTopic.title}</p>
                <p className="text-[12px] text-slate-600 mt-1 whitespace-pre-wrap">{activeTopic.body.split('\n').slice(0, 8).join('\n')}</p>
                <a href={`#${toAnchorId(activeTopic.id)}`} className="inline-block mt-2 text-[12px] font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-2">
                  Open full section
                </a>
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="bg-slate-900 border border-slate-800 rounded p-4 sm:p-5 mb-6">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Internal Engineering Chat</p>
          <p className="text-[13px] text-slate-300 mb-3">Ask about internals: feature behavior, route handlers, scripts, migrations, or architecture links.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void askInternalChat()
                }
              }}
              placeholder="Example: Which route handles onboarding events and what tables does it touch?"
              className="w-full text-[14px] border border-slate-700 rounded px-3 py-2 bg-slate-950 text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-slate-500"
            />
            <button
              type="button"
              onClick={() => { void askInternalChat() }}
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
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">Internal Sources</p>
                  {chatResult.sources.map((source) => (
                    <div key={source.id} className="text-[13px]">
                      <p className="text-orange-300">{source.title}</p>
                      <p className="text-[12px] text-slate-400">ref: {source.ref}</p>
                      {source.snippet ? <p className="text-[12px] text-slate-400">{source.snippet}</p> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 mb-5">
          <label htmlFor="internal-guide-search" className="block text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Search internal guide sections</label>
          <input
            id="internal-guide-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search architecture, route names, modules, scripts, migrations, docs..."
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
