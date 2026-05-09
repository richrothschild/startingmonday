'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type Status = 'idle' | 'uploading' | 'streaming' | 'done' | 'error'

const GRADE_SCORE: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 }
const SCORE_GRADE = ['F', 'D', 'C', 'B', 'A']

function extractOverallGrade(text: string): string | null {
  const matches = [...text.matchAll(/Grade:\s*\[?([A-F])\]?/g)]
  if (!matches.length) return null
  const scores = matches.map(m => GRADE_SCORE[m[1]] ?? 0)
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return SCORE_GRADE[Math.round(avg)] ?? null
}

// Colour-code grades inline: A=green, B=blue, C=amber, D/F=red
function renderOutput(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    // Section headers
    if (line.startsWith('## ')) {
      return (
        <h2 key={i} className="text-[13px] font-bold tracking-[0.1em] uppercase text-slate-400 mt-8 mb-3 first:mt-0 pb-2 border-b border-slate-100">
          {line.slice(3)}
        </h2>
      )
    }
    if (line.startsWith('### ')) {
      return (
        <h3 key={i} className="text-[15px] font-bold text-slate-900 mt-6 mb-2">
          {line.slice(4)}
        </h3>
      )
    }
    // Bold + grade lines like "**Headline** - Grade: [A]"
    if (line.startsWith('**')) {
      const gradeMatch = line.match(/Grade:\s*\[?([A-F])\]?/)
      const grade = gradeMatch?.[1]
      const gradeColor = grade === 'A' ? 'text-green-700 bg-green-50'
        : grade === 'B' ? 'text-blue-700 bg-blue-50'
        : grade === 'C' ? 'text-amber-700 bg-amber-50'
        : 'text-red-700 bg-red-50'

      const label = line.replace(/\*\*/g, '').replace(/\s*[-—]\s*Grade:.*/, '').trim()
      return (
        <div key={i} className="flex items-center gap-3 mt-5 mb-1">
          <span className="text-[14px] font-bold text-slate-900">{label}</span>
          {grade && (
            <span className={`text-[12px] font-bold px-2 py-0.5 rounded ${gradeColor}`}>
              {grade}
            </span>
          )}
        </div>
      )
    }
    if (line.trim() === '') return <div key={i} className="h-2" />
    return (
      <p key={i} className="text-[14px] text-slate-700 leading-relaxed mb-2">
        {line}
      </p>
    )
  })
}

function HelpPopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-5 h-5 rounded-full border border-slate-300 text-[11px] font-bold text-slate-400 hover:border-slate-500 hover:text-slate-600 transition-colors flex items-center justify-center leading-none"
        aria-label="How to get your LinkedIn profile"
      >
        ?
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-50 w-72 bg-white border border-slate-200 rounded shadow-lg p-4 text-[12px] text-slate-600 leading-relaxed">
          <p className="font-semibold text-slate-800 mb-3">How to get your LinkedIn profile text</p>

          <p className="font-semibold text-slate-700 mb-1">Easiest — works on every LinkedIn version:</p>
          <ol className="space-y-0.5 mb-3 pl-0 list-none">
            <li>1. Open your LinkedIn profile in a browser</li>
            <li>2. Press <span className="font-semibold">Ctrl+A</span> (Mac: <span className="font-semibold">Cmd+A</span>) — select all</li>
            <li>3. Press <span className="font-semibold">Ctrl+C</span> (Mac: <span className="font-semibold">Cmd+C</span>) — copy</li>
            <li>4. Paste into the text box</li>
          </ol>

          <p className="font-semibold text-slate-700 mb-1">Or export as PDF — button location varies:</p>
          <ul className="space-y-0.5 list-none pl-0 mb-0">
            <li><span className="font-medium text-slate-600">Resources</span> button &rarr; Save to PDF</li>
            <li><span className="font-medium text-slate-600">More</span> button &rarr; Save to PDF</li>
            <li><span className="font-medium text-slate-600">&hellip;</span> menu &rarr; Save to PDF</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default function OptimizePage() {
  const [text, setText] = useState('')
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (inputRef.current) inputRef.current.value = ''
    setStatus('uploading')
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/linkedin-import/extract', { method: 'POST', body: formData })
    const json = await res.json().catch(() => ({}))
    if (res.ok && json.text) {
      setText(json.text)
      setStatus('idle')
    } else {
      setError(json.error ?? 'Failed to read PDF. Paste the text instead.')
      setStatus('error')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || status === 'streaming') return

    setStatus('streaming')
    setOutput('')
    setError('')

    const res = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? 'Something went wrong.')
      setStatus('error')
      return
    }

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let done = false

    while (!done) {
      const { value, done: d } = await reader.read()
      done = d
      if (value) setOutput(prev => prev + decoder.decode(value, { stream: !done }))
    }

    setStatus('done')
  }

  const canSubmit = text.trim().length >= 100 && status !== 'streaming' && status !== 'uploading'

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      {/* Nav */}
      <header className="bg-slate-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400 hover:text-slate-300 transition-colors">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[12px] text-slate-300 hover:text-white transition-colors">Sign in</Link>
            <Link
              href="/signup"
              className="text-[12px] font-semibold text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="text-[28px] sm:text-[34px] font-bold text-slate-900 leading-tight">
            LinkedIn Profile Grader
          </h1>
          <p className="text-[15px] text-slate-500 mt-3 leading-relaxed max-w-lg mx-auto">
            Paste your LinkedIn profile and get an honest A-F grade by section, specific rewrites for your weakest spots, and a clear plan to fix them.
          </p>
          <p className="text-[12px] text-slate-400 mt-2">Free. No account required. 3 analyses per day.</p>
        </div>

        {/* Input card */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
          <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Your LinkedIn Profile</span>
            <div className="flex items-center gap-2">
              <HelpPopover />
              <label className="cursor-pointer">
                <span className="text-[12px] font-semibold text-slate-500 border border-slate-200 rounded px-3 py-1.5 hover:border-slate-400 transition-colors">
                  {status === 'uploading' ? 'Reading PDF…' : 'Upload PDF'}
                </span>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf"
                  className="sr-only"
                  disabled={status === 'uploading' || status === 'streaming'}
                  onChange={handlePdfUpload}
                />
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={'Paste your LinkedIn profile text here — About section, Experience, Skills, Headline...\n\nQuickest: open your LinkedIn profile, press Ctrl+A (Cmd+A on Mac), then Ctrl+C, and paste here.\n\nOr export a PDF: on your profile look for Resources, More, or the ... menu → Save to PDF → open the PDF → select all text → paste here.'}
              rows={12}
              disabled={status === 'streaming'}
              className="w-full px-6 py-4 text-[14px] text-slate-800 placeholder:text-slate-300 resize-none focus:outline-none leading-relaxed disabled:opacity-60"
            />
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <span className="text-[12px] text-slate-400">
                {text.length > 0 ? `${text.length.toLocaleString()} characters` : 'Min. 100 characters'}
              </span>
              <button
                type="submit"
                disabled={!canSubmit}
                className="text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-700 px-5 py-2.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {status === 'streaming' ? 'Analyzing…' : 'Analyze my profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded px-5 py-3 mb-6">
            <p className="text-[13px] text-red-700">{error}</p>
          </div>
        )}

        {/* Output */}
        {(output || status === 'streaming') && (
          <div className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
            <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Analysis</span>
              {status === 'streaming' && (
                <span className="text-[11px] text-slate-400 animate-pulse">Thinking…</span>
              )}
            </div>
            <div className="px-6 py-6">
              {renderOutput(output)}
            </div>
          </div>
        )}

        {/* Share card — shown after analysis completes */}
        {status === 'done' && (() => {
          const grade = extractOverallGrade(output)
          const shareText = grade
            ? `I just graded my LinkedIn profile on Starting Monday and got a ${grade} overall. Check yours free at startingmonday.app/optimize`
            : 'I just graded my LinkedIn profile on Starting Monday. Free executive career tool at startingmonday.app/optimize'
          const gradeColor = grade === 'A' ? 'text-green-700 bg-green-50'
            : grade === 'B' ? 'text-blue-700 bg-blue-50'
            : grade === 'C' ? 'text-amber-700 bg-amber-50'
            : grade ? 'text-red-700 bg-red-50'
            : ''
          function copyShare() {
            navigator.clipboard.writeText(shareText).catch(() => {})
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }
          return (
            <div className="bg-white border border-slate-200 rounded p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-slate-500">Share your score</span>
                {grade && (
                  <span className={`text-[14px] font-bold px-2.5 py-0.5 rounded ${gradeColor}`}>{grade}</span>
                )}
              </div>
              <button
                type="button"
                onClick={copyShare}
                className="text-[13px] font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded transition-colors cursor-pointer border-0 shrink-0"
              >
                {copied ? 'Copied!' : 'Copy to share'}
              </button>
            </div>
          )
        })()}

        {/* CTA — shown after analysis completes */}
        {status === 'done' && (
          <div className="bg-slate-900 rounded p-6 sm:p-8 text-center">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-3">
              Want to go further?
            </p>
            <h2 className="text-[22px] font-bold text-white leading-tight mb-3">
              Monitor your target companies.<br />Get daily briefings. Land faster.
            </h2>
            <p className="text-[14px] text-slate-400 leading-relaxed mb-6 max-w-sm mx-auto">
              Starting Monday scans your target company career pages, emails you when roles match your profile, and preps you for every interview.
            </p>
            <Link
              href="/signup"
              className="inline-block text-[14px] font-semibold text-slate-900 bg-white hover:bg-slate-100 px-6 py-3 rounded transition-colors"
            >
              Start your free 7-day trial &rarr;
            </Link>
            <p className="text-[11px] text-slate-600 mt-3">No credit card required to start.</p>
            <p className="text-[12px] text-slate-500 mt-4">
              Want to see the platform first?{' '}
              <Link href="/demo" className="text-slate-400 hover:text-white underline transition-colors">
                Explore a live demo &rarr;
              </Link>
            </p>
          </div>
        )}

      <footer className="mt-12 pb-8 text-center">
        <p className="text-[11px] text-slate-400">
          &copy; {new Date().getFullYear()} Starting Monday. All rights reserved. &mdash;{' '}
          <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
          {' '}&middot;{' '}
          <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
        </p>
      </footer>

      </main>
    </div>
  )
}
