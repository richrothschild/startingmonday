'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

type Status = 'idle' | 'uploading' | 'streaming' | 'done' | 'error'

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

export default function OptimizePage() {
  const [text, setText] = useState('')
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
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
          <Link href="/" className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600 hover:text-slate-400 transition-colors">
            Starting Monday
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[12px] text-slate-500 hover:text-slate-300 transition-colors">Sign in</Link>
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

          <form onSubmit={handleSubmit}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={'Paste your LinkedIn profile text here — About section, Experience, Skills, Headline...\n\nOn LinkedIn: click "More" on your profile → "Save to PDF" → open the PDF → select all text → paste here.'}
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
          </div>
        )}

      </main>
    </div>
  )
}
