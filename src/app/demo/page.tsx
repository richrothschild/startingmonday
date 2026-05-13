'use client'
import Link from 'next/link'
import { useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

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

function renderBrief(text: string, isStreaming: boolean) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
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
  }).concat(
    isStreaming ? [
      <span key="cursor" className="inline-block w-0.5 h-4 bg-slate-400 animate-pulse ml-0.5 align-middle" />
    ] : []
  )
}

function secondHeaderIndex(text: string): number {
  let count = 0
  let pos = 0
  while (pos < text.length) {
    const idx = text.indexOf('## ', pos)
    if (idx === -1) break
    count++
    if (count === 2) return idx
    pos = idx + 3
  }
  return -1
}

function DemoContent() {
  const searchParams = useSearchParams()
  const noGate = searchParams.get('full') === '1'

  const [company,  setCompany]  = useState('')
  const [role,     setRole]     = useState('')
  const [content,  setContent]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [revealed, setRevealed] = useState(false)
  const [email,    setEmail]    = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [emailError, setEmailError] = useState('')
  const briefRef = useRef<HTMLDivElement>(null)

  const gateIdx   = secondHeaderIndex(content)
  const gateReady = gateIdx !== -1
  const gated     = gateReady && !revealed && !noGate

  const visibleContent = gated ? content.slice(0, gateIdx).trimEnd() : content

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!company.trim() || !role.trim() || loading) return
    setContent('')
    setError('')
    setRevealed(false)
    setLoading(true)
    try {
      const res = await fetch('/api/demo-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: company.trim(), role: role.trim() }),
      })
      if (!res.ok || !res.body) {
        setError('Something went wrong. Please try again.')
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setContent(full)
      }
      if (full.startsWith('__ERROR__')) {
        setError('Something went wrong. Please try again.')
        setContent('')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || submitting) return
    setEmailError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/demo-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), company: company.trim(), role: role.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setEmailError('Please enter a valid email address.')
        return
      }
      setRevealed(true)
    } catch {
      setEmailError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-500'
  const labelCls = 'block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5'

  return (
    <div className="min-h-screen bg-white font-sans">

      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-[13px] font-semibold text-white bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors"
            >
              Try free
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-2">Live demo</p>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight mb-2">
            Know the room before you walk in.
          </h1>
          <p className="text-[14px] text-slate-500 leading-relaxed">
            Enter any company and role. See the same prep brief Starting Monday generates before every interview in your search &mdash; live, in real time, from your actual target.
          </p>
        </div>

        <section className="border border-slate-200 rounded-lg p-5 sm:p-6 mb-8 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500 mb-3">Before you run the demo</p>
          <div className="space-y-4">
            <div>
              <p className="text-[13px] font-semibold text-slate-900 mb-1">Why this company context matters</p>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Executive searches are won on context quality, not volume. This brief is designed to help you walk in with a point of view on the company, likely objections, and the questions that signal peer-level understanding.
              </p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-900 mb-1">How signal windows are identified</p>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                We track executive moves, disclosures, company announcements, and career page changes. When signals cluster, the platform flags likely transition windows before broad-market posting channels catch up.
              </p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-900 mb-1">Typical week of signals</p>
              <ul className="space-y-1.5 text-[13px] text-slate-600 leading-relaxed">
                <li>- Monday: leadership or org-change disclosures</li>
                <li>- Wednesday: career page role and language updates</li>
                <li>- Friday: follow-through opportunities for outreach priority</li>
              </ul>
            </div>
          </div>
          <p className="text-[12px] text-slate-500 mt-4">
            Pilot snapshot (Jan-May 2026): 81% reached first interview in 30 days, denominator 27 executives.{' '}
            <Link href="/blog/how-we-estimate-early-role-signals" className="underline underline-offset-2 hover:text-slate-800 transition-colors">
              Method and sources
            </Link>
            {' '}·{' '}
            <Link href="/references" className="underline underline-offset-2 hover:text-slate-800 transition-colors">
              Evidence and references
            </Link>
            .
          </p>
        </section>

        {/* Input form */}
        <form onSubmit={handleGenerate} className="bg-white border border-slate-200 rounded p-6 flex flex-col gap-4 mb-8">
          <div>
            <label className={labelCls}>Company <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Salesforce"
              required
              disabled={loading}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Role <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="Chief Information Officer"
              required
              disabled={loading}
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            disabled={!company.trim() || !role.trim() || loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-white text-[13px] font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer border-0 disabled:cursor-not-allowed self-start"
          >
            {loading ? 'Generating...' : content ? 'Regenerate' : 'Generate prep brief'}
          </button>
          {error && <p className="text-[13px] text-red-600">{error}</p>}
        </form>

        {/* Brief */}
        {(content || loading) && (
          <div className="relative" ref={briefRef}>
            {/* Visible content */}
            <div className="bg-white border border-slate-200 rounded p-6 sm:p-8">
              {renderBrief(visibleContent, loading)}
              {loading && !content && (
                <div className="flex items-center gap-2 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse inline-block [animation-delay:300ms]" />
                </div>
              )}
            </div>

            {/* Email gate */}
            {gated && (
              <div className="mt-0">
                {/* Fade */}
                <div className="h-16 bg-gradient-to-b from-transparent to-slate-50 -mt-16 relative z-10 pointer-events-none" />

                {/* Gate panel */}
                <div className="bg-slate-50 border border-slate-200 border-t-0 rounded-b px-6 sm:px-8 py-8">
                  <p className="text-[15px] font-semibold text-slate-900 mb-1.5">
                    The brief continues.
                  </p>
                  <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
                    See the questions they'll ask about your track record, the objections to get ahead of, and the five things only a peer would think to raise. Enter your email to unlock the full brief.
                  </p>
                  <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="flex-1 border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={!email.trim() || submitting}
                      className="bg-slate-900 hover:bg-slate-700 disabled:opacity-30 text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors cursor-pointer border-0 disabled:cursor-not-allowed shrink-0"
                    >
                      {submitting ? 'One moment...' : 'See the full brief'}
                    </button>
                  </form>
                  {emailError && <p className="mt-2 text-[12px] text-red-600">{emailError}</p>}
                  <p className="mt-3 text-[11px] text-slate-400">Free 30-day trial. No credit card.</p>
                </div>
              </div>
            )}

            {/* Post-reveal CTA */}
            {revealed && !loading && content && (
              <div className="mt-6 bg-slate-900 rounded px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-white mb-0.5">
                    Get this before every interview. Know when the search opens before anyone posts it.
                  </p>
                  <p className="text-[12px] text-slate-400">
                    Starting Monday monitors your target companies for executive departures, board changes, and funding signals. When patterns point to an opening, you know before a search firm is ever engaged.
                  </p>
                </div>
                <Link
                  href="/signup"
                  className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors"
                >
                  Start free trial &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Pre-generation context */}
        {!content && !loading && (
          <div className="border-t border-slate-100 pt-8">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-5">What you get with a full account</p>
            <div className="flex flex-col gap-3">
              {[
                'This brief, auto-generated for every company in your pipeline before every interview',
                'Signal intelligence on every target company - exec moves, 8-K filings, funding rounds, and career pages, with pattern alerts before roles are ever posted',
                'Contact tracker with outreach drafting and recruiter firm grouping',
                'Daily morning briefing with your signals, open actions, and pending matches',
                'AI career advisor with full visibility into your pipeline',
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-orange-500 font-bold text-[11px] shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 items-start">
              <Link
                href="/signup"
                className="inline-block bg-orange-500 text-white text-[13px] font-semibold px-6 py-2.5 rounded hover:bg-orange-600 transition-colors"
              >
                Start free trial &rarr;
              </Link>
              <p className="text-[12px] text-slate-400 sm:mt-2.5">30 days free. No credit card.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default function DemoPage() {
  return (
    <Suspense fallback={null}>
      <DemoContent />
    </Suspense>
  )
}
