'use client'

import { useState } from 'react'

export function CopyCommandButton({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-[11px] font-semibold border border-emerald-300/30 bg-emerald-500/15 text-emerald-100 hover:border-emerald-200 px-2 py-1 rounded transition-colors"
    >
      {copied ? 'Copied' : 'Copy command'}
    </button>
  )
}