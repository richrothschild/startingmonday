'use client'
import Link from 'next/link'
import { useState, useRef, Suspense } from 'react'

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
        <h2 key={i} className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mt-8 mb-3 first:mt-0 pb-2 border-b border-slate-100">
          {line.slice(3)}
        </h2>
      )
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <div key={i} className="flex gap-2.5 text-[14px] text-slate-700 leading-relaxed mb-2.5">
          <span className="text-slate-300 shrink-0 select-none mt-0.5">-</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      )
    }
    if (line.trim() === '') return <div key={i} className="h-1.5" />
    return (
      <p key={i} className="text-[14px] text-slate-700 leading-relaxed mb-2.5">
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
    <div className="min-h-screen bg-slate-900 font-sans">
      {/* Nav */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors">Log in</Link>
            <Link href="/signup?from=demo" className="text-[13px] font-semibold text-slate-900 bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors">
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-slate-900 px-4 sm:px-6 pt-14 sm:pt-18 pb-10 sm:pb-14">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-400 mb-3">Live demo</p>
          <h1 className="text-[32px] sm:text-[42px] font-bold text-white leading-tight mb-4">
            See the brief that changes the conversation.
          </h1>
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-xl mb-6">
            Before a high-stakes executive conversation, most candidates walk in under-prepared. Starting Monday generates a role-specific prep brief in under 60 seconds.
          </p>

          {/* Differentiators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Context before it is posted', body: 'Signal monitoring detects role formation before most candidates know to look.' },
              { label: 'Brief in 60 seconds', body: 'Company-specific, role-specific, grounded in your background. Not generic.' },
              { label: 'Objections handled', body: 'Likely pushbacks and how to counter them, specific to the search context.' },
            ].map(item => (
              <div key={item.label} className="border border-slate-700 rounded-lg p-4">
                <p className="text-[12px] font-bold text-orange-400 mb-1.5">{item.label}</p>
                <p className="text-[13px] text-slate-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>

          {/* Visual: timing gap inline mini-chart */}
          <div className="border border-slate-700 rounded-lg bg-slate-950/50 p-4 mb-2">
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-2">Opportunity window</p>
            <svg viewBox="0 0 420 60" className="w-full h-[52px]" aria-label="Opportunity window timing" role="img">
              <line x1="20" y1="28" x2="400" y2="28" stroke="#334155" strokeWidth="2" />
              {['Signal','Shape','Outreach','Open','Interviews','Start'].map((label, i) => {
                const x = 20 + i * 76
                return (
                  <g key={label}>
                    <circle cx={x} cy="28" r="4" fill="#64748b" />
                    <text x={x} y="50" fill="#64748b" fontSize="9" textAnchor="middle">{label}</text>
                  </g>
                )
              })}
              <line x1="96" y1="10" x2="96" y2="24" stroke="#22c55e" strokeWidth="3" />
              <polygon points="96,28 91,18 101,18" fill="#22c55e" />
              <text x="100" y="12" fill="#86efac" fontSize="9" fontWeight="700">SM enters here</text>
              <line x1="248" y1="10" x2="248" y2="24" stroke="#f97316" strokeWidth="3" />
              <polygon points="248,28 243,18 253,18" fill="#f97316" />
              <text x="252" y="12" fill="#fdba74" fontSize="9" fontWeight="700">Typical</text>
            </svg>
          </div>
          <p className="text-[11px] text-slate-500 text-center mb-8">Entering before the role opens materially improves shortlist odds.</p>

          {/* Anchor CTA */}
          <a href="#run-demo" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-slate-900 text-[14px] font-bold px-6 py-3 rounded transition-colors">
            Run the demo ↓
          </a>
        </div>
      </header>

      {/* Demo section */}
      <section id="run-demo" className="bg-white px-4 sm:px-6 py-12 sm:py-16" ref={briefRef}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[22px] font-bold text-slate-900 mb-1">Generate a prep brief</h2>
          <p className="text-[13px] text-slate-500 mb-6">
            Showing a brief for <span className="font-semibold text-slate-700">{DEMO_COMPANY}</span>. Select a role below.
            {runCount > 0 && runsLeft > 0 && (
              <span className="ml-2 text-slate-400">{runsLeft} run{runsLeft !== 1 ? 's' : ''} remaining in this demo.</span>
            )}
          </p>

          <form onSubmit={handleGenerate} className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col gap-4 mb-8">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
                Role
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                disabled={loading}
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-slate-500 bg-white"
              >
                {DEMO_ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {exhausted ? (
              <div className="bg-slate-50 border border-slate-200 rounded p-5">
                <p className="text-[14px] font-semibold text-slate-900 mb-2">Demo limit reached.</p>
                <p className="text-[13px] text-slate-500 mb-4 leading-relaxed">
                  You have run {MAX_RUNS} briefs. Create a free account to generate unlimited briefs for your own target companies, with your background woven in.
                </p>
                <Link href="/signup?from=demo" className="inline-block bg-orange-500 text-white text-[13px] font-semibold px-6 py-2.5 rounded hover:bg-orange-600 transition-colors">
                  Start free — 30 days, no card
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
                <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 mb-8">
                  {renderBrief(content, loading)}
                </div>
              )}
              {content && !loading && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                  <p className="text-[15px] font-semibold text-slate-900 mb-1.5">Ready to run briefs for your targets?</p>
                  <p className="text-[13px] text-slate-500 mb-5 leading-relaxed">
                    Your account generates briefs with your background, your companies, and your narrative woven in.
                  </p>
                  <Link href="/signup?from=demo" className="inline-block bg-orange-500 text-white text-[14px] font-semibold px-7 py-3 rounded hover:bg-orange-600 transition-colors">
                    Start free trial
                  </Link>
                  <p className="text-[12px] text-slate-400 mt-3">30 days free. No credit card.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer strip */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-5 flex-wrap justify-center">
            <Link href="/pricing" className="text-[12px] text-slate-500 hover:text-slate-300 transition-colors">Pricing</Link>
            <Link href="/privacy" className="text-[12px] text-slate-500 hover:text-slate-300 transition-colors">Privacy</Link>
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
