'use client'
import Link from 'next/link'
import { useState } from 'react'

const GOALS = [
  'Request a 20-minute exploratory call',
  'Ask about open roles at their company',
  'Request an introduction to someone they know',
  'Follow up after an introduction or referral',
  'Follow up after a meeting or event',
  'Express interest in a specific role',
  'Ask for advice or a perspective on my search',
]

type Contact = {
  id: string
  name: string
  title: string | null
  firm: string | null
  channel: string | null
  notes: string | null
  company_name: string | null
}

export function OutreachClient({ contact }: { contact: Contact }) {
  const [goal, setGoal] = useState(GOALS[0])
  const [customGoal, setCustomGoal] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const subtitle = [contact.title, contact.firm ?? contact.company_name].filter(Boolean).join(' · ')

  async function handleGenerate() {
    setLoading(true)
    setDraft('')
    setCopied(false)
    try {
      const res = await fetch('/api/outreach/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contact.id,
          goal: customGoal.trim() || goal,
          additionalContext: additionalContext.trim() || undefined,
        }),
      })
      if (!res.ok || !res.body) {
        const text = await res.text()
        setDraft(`Error: ${text}`)
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setDraft(text)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">Starting Monday</span>
          <Link href="/dashboard/contacts" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">
            ← Contacts
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-slate-900">Draft outreach</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            To <span className="font-semibold text-slate-700">{contact.name}</span>
            {subtitle ? <span className="text-slate-400"> · {subtitle}</span> : null}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-6 mb-4">
          <div className="mb-4">
            <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-2">
              Goal
            </label>
            <select
              value={goal}
              onChange={e => { setGoal(e.target.value); setCustomGoal('') }}
              className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 bg-white focus:outline-none focus:border-slate-400"
            >
              {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              <option value="custom">Custom goal…</option>
            </select>
            {(goal === 'custom') && (
              <input
                type="text"
                value={customGoal}
                onChange={e => setCustomGoal(e.target.value)}
                placeholder="Describe what you want to accomplish"
                className="w-full mt-2 border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
              />
            )}
          </div>

          <div className="mb-5">
            <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-2">
              Additional context <span className="font-normal text-slate-300">(optional)</span>
            </label>
            <textarea
              value={additionalContext}
              onChange={e => setAdditionalContext(e.target.value)}
              placeholder="e.g. We met at the CFO Summit last month, they mentioned a transformation role opening up in Q3…"
              rows={3}
              className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || (goal === 'custom' && !customGoal.trim())}
            className="bg-slate-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded cursor-pointer border-0 disabled:opacity-50"
          >
            {loading ? 'Drafting…' : draft ? 'Regenerate' : 'Generate draft'}
          </button>
        </div>

        {draft && (
          <div className="bg-white border border-slate-200 rounded p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400">Draft</p>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[12px] font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 rounded px-3 py-1 cursor-pointer bg-white"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="text-[14px] text-slate-800 leading-relaxed whitespace-pre-wrap">{draft}</div>
          </div>
        )}
      </main>
    </div>
  )
}
