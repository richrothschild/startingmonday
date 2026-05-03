'use client'
import { useState, useRef } from 'react'

type Props = {
  resumeText: string
  initialJobDescription?: string
  companyName?: string
  companyId?: string
  defaultTargetTitle?: string
}

type Parsed = {
  tailored: string
  keywords: string
  changes: string
}

function parseOutput(raw: string): Parsed {
  const tailoredMatch = raw.match(/## TAILORED RESUME\s*([\s\S]*?)(?=## KEYWORD ANALYSIS|$)/)
  const keywordsMatch = raw.match(/## KEYWORD ANALYSIS\s*([\s\S]*?)(?=## KEY CHANGES|$)/)
  const changesMatch  = raw.match(/## KEY CHANGES\s*([\s\S]*)$/)
  return {
    tailored:  tailoredMatch?.[1]?.trim() ?? '',
    keywords:  keywordsMatch?.[1]?.trim() ?? '',
    changes:   changesMatch?.[1]?.trim()  ?? '',
  }
}

async function downloadDocx(text: string, companyName: string) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx')

  const lines = text.split('\n')
  const children = lines.map(line => {
    const trimmed = line.trim()
    if (!trimmed) {
      return new Paragraph({ children: [new TextRun('')], spacing: { after: 100 } })
    }
    // ALL-CAPS section headers (e.g. EXPERIENCE, EDUCATION, SKILLS)
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !/^\d/.test(trimmed)) {
      return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: trimmed, bold: true })],
        spacing: { before: 280, after: 120 },
      })
    }
    // Bullet lines
    if (/^[-*•]/.test(trimmed)) {
      return new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun({ text: trimmed.replace(/^[-*•]\s*/, ''), size: 22 })],
        spacing: { after: 60 },
      })
    }
    return new Paragraph({
      children: [new TextRun({ text: trimmed, size: 22 })],
      spacing: { after: 80 },
    })
  })

  const doc = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = companyName ? `Resume - ${companyName}.docx` : 'Resume - Tailored.docx'
  a.click()
  URL.revokeObjectURL(url)
}

export function ResumeTailor({ resumeText, initialJobDescription = '', companyName = '', defaultTargetTitle = '' }: Props) {
  const [jd, setJd]               = useState(initialJobDescription)
  const [targetTitle, setTargetTitle] = useState(defaultTargetTitle)
  const [output, setOutput]       = useState('')
  const [streaming, setStreaming] = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')
  const [copied, setCopied]       = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const parsed = done ? parseOutput(output) : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (streaming) return

    setStreaming(true)
    setDone(false)
    setOutput('')
    setError('')
    setCopied(false)

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription: jd, companyName, targetTitle }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json.error ?? 'Something went wrong.')
        setStreaming(false)
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let isDone = false

      while (!isDone) {
        const { value, done: d } = await reader.read()
        isDone = d
        if (value) setOutput(prev => prev + decoder.decode(value, { stream: !isDone }))
      }

      setDone(true)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Connection lost. Try again.')
      }
    } finally {
      setStreaming(false)
    }
  }

  function handleCopy() {
    if (!parsed?.tailored) return
    navigator.clipboard.writeText(parsed.tailored)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const canSubmit = jd.trim().length >= 100 && !streaming

  return (
    <div className="flex flex-col gap-6">

      {/* Input form */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <div className="px-6 py-[18px] border-b border-slate-200">
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Job Description</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 pt-5 pb-3">
            <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
              Target title <span className="text-slate-300 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={targetTitle}
              onChange={e => setTargetTitle(e.target.value)}
              disabled={streaming}
              placeholder="VP of Engineering"
              className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 disabled:opacity-60"
            />
          </div>
          <div className="px-6 pb-3">
            <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-1.5">
              Job description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={jd}
              onChange={e => setJd(e.target.value)}
              disabled={streaming}
              placeholder="Paste the full job description here..."
              rows={10}
              className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-800 placeholder:text-slate-300 resize-none focus:outline-none focus:border-slate-400 leading-relaxed disabled:opacity-60"
            />
          </div>
          <div className="px-6 pb-5 flex items-center justify-between gap-4">
            <span className="text-[12px] text-slate-400">
              {jd.length > 0 ? `${jd.length.toLocaleString()} characters` : 'Min. 100 characters'}
            </span>
            <button
              type="submit"
              disabled={!canSubmit}
              className="text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-700 px-5 py-2.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {streaming ? 'Tailoring...' : 'Tailor my resume'}
            </button>
          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded px-5 py-3">
          <p className="text-[13px] text-red-700">{error}</p>
        </div>
      )}

      {/* Streaming / output */}
      {(output || streaming) && !done && (
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Tailoring</span>
            {streaming && <span className="text-[11px] text-slate-400 animate-pulse">Working...</span>}
          </div>
          <div className="px-6 py-6">
            <pre className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">{output}</pre>
          </div>
        </div>
      )}

      {/* Parsed output */}
      {done && parsed && (
        <>
          {/* Tailored resume */}
          {parsed.tailored && (
            <div className="bg-white border border-slate-200 rounded overflow-hidden">
              <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Tailored Resume</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopy}
                    className="text-[12px] font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:border-slate-400 transition-colors cursor-pointer bg-transparent"
                  >
                    {copied ? 'Copied!' : 'Copy text'}
                  </button>
                  <button
                    onClick={() => downloadDocx(parsed.tailored, companyName)}
                    className="text-[12px] font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded px-3 py-1.5 transition-colors cursor-pointer border-0"
                  >
                    Download .docx
                  </button>
                </div>
              </div>
              <div className="px-6 py-6">
                <pre className="text-[13px] text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">{parsed.tailored}</pre>
              </div>
            </div>
          )}

          {/* Keyword analysis */}
          {parsed.keywords && (
            <div className="bg-white border border-slate-200 rounded overflow-hidden">
              <div className="px-6 py-[18px] border-b border-slate-200">
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Keyword Analysis</span>
              </div>
              <div className="px-6 py-5">
                {parsed.keywords.split('\n').filter(Boolean).map((line, i) => {
                  const isPresent = line.toLowerCase().startsWith('present:')
                  const isMissing = line.toLowerCase().startsWith('missing:')
                  const label = isPresent ? 'Present' : isMissing ? 'Missing' : null
                  const content = line.replace(/^(present|missing):\s*/i, '').trim()
                  if (!label) return <p key={i} className="text-[13px] text-slate-600 leading-relaxed">{line}</p>
                  return (
                    <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                      <span className={`text-[11px] font-bold tracking-[0.06em] uppercase px-2 py-0.5 rounded shrink-0 mt-0.5 ${isPresent ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {label}
                      </span>
                      <p className="text-[13px] text-slate-700 leading-relaxed">{content}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Key changes */}
          {parsed.changes && (
            <div className="bg-white border border-slate-200 rounded overflow-hidden">
              <div className="px-6 py-[18px] border-b border-slate-200">
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Key Changes</span>
              </div>
              <div className="px-6 py-5">
                {parsed.changes.split('\n').filter(Boolean).map((line, i) => (
                  <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                    <span className="text-slate-300 shrink-0 mt-0.5">-</span>
                    <p className="text-[13px] text-slate-700 leading-relaxed">
                      {line.replace(/^[-*•]\s*/, '')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Retailor */}
          <div className="flex justify-center pb-2">
            <button
              onClick={() => { setDone(false); setOutput('') }}
              className="text-[12px] text-slate-400 hover:text-slate-700 transition-colors cursor-pointer bg-transparent border-0"
            >
              Update job description and retailor
            </button>
          </div>
        </>
      )}
    </div>
  )
}
