'use client'
import { useState } from 'react'

export function DraftPanel({ draft }: { draft: { subject: string; body: string } }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    const text = `Subject: ${draft.subject}\n\n${draft.body}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <details className="mt-2">
      <summary className="text-[12px] text-orange-600 font-semibold cursor-pointer list-none hover:text-orange-800">
        Draft ready &#8595;
      </summary>
      <div className="mt-2 border border-orange-100 rounded p-3 bg-orange-50">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Subject</p>
        <p className="text-[13px] font-semibold text-slate-800 mb-3">{draft.subject}</p>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Body</p>
        <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap mb-3">{draft.body}</p>
        <button
          onClick={copy}
          className="text-[11px] font-semibold text-orange-700 border border-orange-200 bg-white hover:bg-orange-50 px-3 py-1 rounded transition-colors cursor-pointer"
        >
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
      </div>
    </details>
  )
}
