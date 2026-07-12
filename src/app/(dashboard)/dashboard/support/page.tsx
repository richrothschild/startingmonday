'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type SupportItem = {
  id: string
  title: string
  body: string
  status: string
  created_at: string
  user_profiles?: { full_name: string | null } | null
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  under_review: 'Under review',
  planned: 'Planned',
  in_progress: 'In progress',
  shipped: 'Resolved',
  declined: 'Closed',
}

export default function SupportPage() {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [items, setItems] = useState<SupportItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/feedback/items?sortBy=recent&limit=50')
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting' || message.trim().length < 10) return
    setStatus('submitting')
    setErrorMessage(null)
    try {
      const res = await fetch('/api/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'question', message: message.trim(), page: '/dashboard/support' }),
      })
      if (res.ok) {
        setStatus('done')
        setMessage('')
        fetchItems()
        return
      }
      const payload = await res.json().catch(() => null)
      setErrorMessage(payload?.error ?? 'Something went wrong. Please try again.')
      setStatus('error')
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-100">

      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top_left,_rgba(193,127,59,0.2),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_34%),linear-gradient(180deg,_rgba(9,14,26,0.98)_0%,_rgba(11,17,30,0.95)_54%,_rgba(10,15,28,0.98)_100%)]" />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/72 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link href="/dashboard" className="text-[13px] text-slate-300 hover:text-white transition-colors">
            &larr; Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-300 mb-2">Customer support</p>
          <h1 className="text-[26px] font-bold text-white leading-tight">How can we help?</h1>
          <p className="text-[13px] text-slate-300 mt-1.5 max-w-[58ch]">
            Ask a question or report an issue. Every message goes straight to the founder and gets a personal reply.
            You can also share product feedback on the <Link href="/dashboard/feedback" className="text-orange-200 underline hover:text-orange-100">feedback board</Link>.
          </p>
        </div>

        <div className="bg-white/5 border border-white/15 rounded-xl p-5 sm:p-8 max-w-xl shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur-md mb-10">
          {status === 'done' ? (
            <div>
              <h2 className="text-[18px] font-bold text-white mb-2">Thank you.</h2>
              <p className="text-[14px] text-slate-300 leading-relaxed mb-4">
                Your question is in. You will get a reply at the email on your account.
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="min-h-[44px] rounded-lg bg-white/5 border border-white/15 px-5 text-[13px] font-semibold text-slate-200 hover:border-white/30 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Ask another question
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label htmlFor="support-message" className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-300 mb-1.5">
                Your question
              </label>
              <textarea
                id="support-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Ask about your account, billing, features, or anything else..."
                className="w-full rounded-lg border border-white/15 bg-slate-900/70 px-3 py-2.5 text-[14px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-300 resize-none"
              />
              {errorMessage && (
                <p role="alert" className="mt-2 text-[12px] text-rose-300">{errorMessage}</p>
              )}
              <button
                type="submit"
                disabled={status === 'submitting' || message.trim().length < 10}
                className="mt-3 min-h-[44px] rounded-lg bg-orange-400 px-6 text-[14px] font-semibold text-slate-950 hover:bg-orange-300 transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? 'Sending...' : 'Send question'}
              </button>
            </form>
          )}
        </div>

        <section>
          <h2 className="text-[13px] font-bold tracking-[0.12em] uppercase text-slate-300 pb-3 border-b border-white/10 mb-4">
            Recent questions and feedback
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-4 animate-pulse backdrop-blur-md">
                  <div className="h-4 w-2/3 bg-white/10 rounded mb-2" />
                  <div className="h-3 w-1/3 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-[13px] text-slate-400">No items yet. Ask the first question.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="text-[14px] font-semibold text-white leading-snug">{item.title}</p>
                    <span className="shrink-0 rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase text-slate-300">
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-300 leading-relaxed line-clamp-2">{item.body}</p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
