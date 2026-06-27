'use client'
import Link from 'next/link'
import { useState, useRef, Suspense } from 'react'
import { isEnabledFlag } from '@/lib/feature-flags'

const MAX_RUNS = 5

const DEMO_COMPANY = 'Salesforce'

const DEMO_ROLES = [
  'Chief Information Officer',
  'Chief Technology Officer',
  'Chief Information Security Officer',
  'VP of Engineering',
  'VP of Technology',
]

function renderInline(str: string) {
  return str.split(/\*\*(.+?)\*\*/g).map((chunk, index) =>
    index % 2 === 1 ? <strong key={index}>{chunk}</strong> : <span key={index}>{chunk}</span>
  )
}

function renderBrief(text: string, isStreaming: boolean) {
  const lines = text.split('\n')
  const nodes = lines.map((line, i) => {
    if (line.startsWith('# ')) return null
    if (line.trim() === '---' || line.trim() === '***') return null
    if (line.startsWith('## ')) {
      return (
        <h2 key={i} className="text-[11px] font-bold tracking-[0.1em] uppercase text-orange-300 mt-8 mb-3 first:mt-0 pb-2 border-b border-white/10">
          {line.slice(3)}
        </h2>
      )
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <div key={i} className="flex gap-2.5 text-[14px] text-slate-200 leading-relaxed mb-2.5">
          <span className="text-slate-500 shrink-0 select-none mt-0.5">–</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      )
    }
    if (line.trim() === '') return <div key={i} className="h-1.5" />
    return (
      <p key={i} className="text-[14px] text-slate-200 leading-relaxed mb-2.5">
        {renderInline(line)}
      </p>
    )
  })
  if (isStreaming) {
    nodes.push(<span key="cursor" className="inline-block w-0.5 h-4 bg-slate-400 animate-pulse ml-0.5 align-middle" />)
  }
  return nodes
}

type DemoContentProps = {
  bypassGate?: boolean
  initialCompany?: string
  initialRole?: string
  autoGenerate?: boolean
}

export function DemoContent({
  bypassGate: _bypassGate = false,
  initialCompany: _initialCompany = '',
  initialRole: _initialRole = '',
  autoGenerate: _autoGenerate = false,
}: DemoContentProps = {}) {
  const premiumEnabled = isEnabledFlag(process.env.NEXT_PUBLIC_LUXURY_PHASE3_ENABLED)
  const [role, setRole] = useState(DEMO_ROLES[0])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [runCount, setRunCount] = useState(0)
  const briefRef = useRef<HTMLDivElement>(null)

  const runsLeft = MAX_RUNS - runCount
  const exhausted = runCount >= MAX_RUNS

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (loading || exhausted) return

    setContent('')
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/demo-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: DEMO_COMPANY, role }),
      })

      if (!res.ok || !res.body) {
        if (res.status === 429) {
          setError('Rate limit reached. Please try again in a moment.')
        } else {
          setError('Something went wrong. Please try again.')
        }
        return
      }

      setRunCount(c => c + 1)

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

      setTimeout(() => {
        briefRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen font-sans overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(circle_at_top_left,_rgba(193,127,59,0.18),_transparent_40%),linear-gradient(180deg,_rgba(9,14,26,0.98)_0%,_rgba(10,15,28,0.98)_100%)]" />
      {/* Nav */}
      <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/72 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[13px] text-slate-200 hover:text-white transition-colors">Log in</Link>
            <Link href="/signup?from=demo" className="text-[13px] font-semibold text-slate-900 bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors">
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-4 sm:px-6 pt-16 sm:pt-24 pb-14 sm:pb-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-orange-300 mb-5">Live demo</p>
          <h1 className="font-serif text-[2.6rem] sm:text-[3.6rem] leading-[1.02] tracking-tight text-white mb-7 max-w-2xl">
            The brief. Before the conversation that matters.
          </h1>
          <p className="text-[16px] text-slate-300 leading-relaxed max-w-xl mb-10">
            Generated in under a minute. The preparation a top executive coach produces — specific to this company, this role, and how your background positions you in this room.
          </p>

          {/* Credential strip */}
          <div className="flex flex-wrap gap-x-7 gap-y-3 mb-10 border-t border-white/10 pt-7">
            {[
              'Win thesis',
              'Objections with exact counters',
              'Peer-level questions',
              'What not to say',
              'How to close',
            ].map((item) => (
              <span key={item} className="text-[13px] text-slate-400 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-orange-500/60 shrink-0" />
                {item}
              </span>
            ))}
          </div>

          {/* Anchor CTA */}
          <a href="#run-demo" className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-3 text-[14px] font-semibold text-slate-950 transition-colors hover:bg-orange-600">
            Generate the brief
          </a>
          <p className="mt-4 text-[12px] text-slate-500">Free for 30 days. No credit card. Usually ready in about a minute.</p>
        </div>
      </header>

      {/* Demo section */}
      <section id="run-demo" className="bg-slate-950/70 border-t border-white/10 px-4 sm:px-6 py-12 sm:py-16" ref={briefRef}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[22px] font-bold mb-1 text-white">Generate a prep brief</h2>
          <p className="text-[13px] mb-6 text-slate-300">
            Showing a brief for <span className="font-semibold text-slate-700">{DEMO_COMPANY}</span>. Select a role below.
            {runCount > 0 && runsLeft > 0 && (
              <span className="ml-2 text-slate-200">{runsLeft} run{runsLeft !== 1 ? 's' : ''} remaining in this demo.</span>
            )}
          </p>

          <form onSubmit={handleGenerate} className="bg-white/[0.07] border border-white/12 shadow-[0_16px_52px_rgba(15,23,42,0.16)] backdrop-blur-sm rounded-lg p-6 flex flex-col gap-4 mb-8">
            <div>
              <label className={`block text-[11px] font-bold tracking-[0.07em] uppercase mb-1.5 ${premiumEnabled ? 'text-slate-100' : 'text-slate-200'}`}>
                Role
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                disabled={loading}
                aria-label="Demo role selector"
                className="w-full border border-white/15 rounded-lg px-3 py-2.5 text-[14px] text-white focus:outline-none focus:border-orange-400/50 focus:ring-1 focus:ring-orange-400/20 bg-slate-900"
              >
                {DEMO_ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {exhausted ? (
              <div className={`${premiumEnabled ? 'bg-slate-950/64 border border-white/12' : 'bg-slate-50 border border-slate-200'} rounded p-5`}>
                <p className={`text-[14px] font-semibold mb-2 ${premiumEnabled ? 'text-white' : 'text-slate-900'}`}>Demo limit reached.</p>
                <p className={`text-[13px] mb-4 leading-relaxed ${premiumEnabled ? 'text-slate-200' : 'text-slate-500'}`}>
                  You have run {MAX_RUNS} briefs. Create a free account to generate unlimited briefs for your own target companies, with your background woven in.
                </p>
                <Link href="/signup?from=demo" className="inline-block bg-orange-500 text-white text-[13px] font-semibold px-6 py-2.5 rounded hover:bg-orange-600 transition-colors">
                  Start free - 30 days, no card
                </Link>
              </div>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-[13px] font-semibold px-6 py-2.5 rounded transition-colors cursor-pointer border-0 disabled:cursor-not-allowed self-start"
              >
                {loading ? 'Building brief…' : content ? 'Regenerate brief' : 'Generate brief'}
              </button>
            )}

            {error && <p className="text-[13px] text-red-600">{error}</p>}
          </form>

          {/* Brief output */}
          {(content || loading) && (
            <div>
              {loading && !content && (
                <div className="flex items-center gap-2 py-6 justify-center">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse [animation-delay:300ms]" />
                  <span className="text-[13px] text-slate-500 ml-2">Building brief…</span>
                </div>
              )}
              {content && (
                <div className="bg-white/[0.06] border border-white/12 shadow-[0_16px_52px_rgba(15,23,42,0.22)] backdrop-blur-sm rounded-lg p-6 sm:p-8 mb-8">
                  {renderBrief(content, loading)}
                </div>
              )}
              {content && !loading && (
                <div className="bg-slate-950/64 border border-white/12 rounded-lg p-6 text-center">
                  <p className="text-[15px] font-semibold mb-1.5 text-white">Ready to run briefs for your targets?</p>
                  <p className="text-[13px] mb-5 leading-relaxed text-slate-300">
                    Your account generates briefs with your background, your companies, and your narrative woven in.
                  </p>
                  <Link href="/signup?from=demo" className="inline-block bg-orange-500 text-white text-[14px] font-semibold px-7 py-3 rounded hover:bg-orange-600 transition-colors">
                    Start free trial
                  </Link>
                  <p className={`text-[12px] mt-3 ${premiumEnabled ? 'text-slate-200' : 'text-slate-200'}`}>30 days free. No credit card.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer strip */}
      <footer className={premiumEnabled ? 'border-t border-white/10 bg-slate-950/78 px-4 sm:px-6 py-6 backdrop-blur-xl' : 'bg-slate-950 border-t border-slate-800 px-4 sm:px-6 py-6'}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-5 flex-wrap justify-center">

            <Link href="/privacy" className="text-[12px] text-slate-500 hover:text-slate-200 transition-colors">Privacy</Link>
            <Link href="/signup?from=demo" className="text-[12px] font-semibold text-orange-400 hover:text-orange-300 transition-colors">Start free trial →</Link>
          </div>
        </div>
      </footer>
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
