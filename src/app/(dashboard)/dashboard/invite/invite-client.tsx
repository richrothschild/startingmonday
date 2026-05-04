'use client'
import { useState } from 'react'

export function InviteClient({
  userId,
  existingUrl,
  referralCount,
  firstName,
}: {
  userId: string
  existingUrl: string | null
  referralCount: number
  firstName: string | null
}) {
  const [url, setUrl] = useState(existingUrl)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function getLink() {
    if (url) return
    setLoading(true)
    try {
      const res = await fetch('/api/invite')
      const data = await res.json()
      if (data.url) setUrl(data.url)
    } finally {
      setLoading(false)
    }
  }

  async function copyLink() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white border border-slate-200 rounded p-6 mb-6">
      <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-4">Your invite link</p>

      {url ? (
        <>
          <div className="flex items-center gap-2 mb-4">
            <input
              readOnly
              value={url}
              className="flex-1 border border-slate-200 rounded px-3 py-2.5 text-[13px] text-slate-600 bg-slate-50 focus:outline-none"
            />
            <button
              type="button"
              onClick={copyLink}
              className="shrink-0 text-[13px] font-semibold text-white bg-slate-900 border-0 rounded px-4 py-2.5 cursor-pointer hover:bg-slate-700 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {referralCount > 0 && (
            <p className="text-[13px] text-slate-500">
              <span className="font-semibold text-slate-700">{referralCount}</span>{' '}
              {referralCount === 1 ? 'person has' : 'people have'} signed up through your link.
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400">Share via</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={`mailto:?subject=You should check out Starting Monday&body=I've been using Starting Monday to run my executive search — it monitors target companies, surfaces roles before they're posted, and generates prep briefs in 60 seconds. Thought you'd find it useful.%0A%0A${encodeURIComponent(url)}`}
                className="text-[12px] font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:bg-slate-50 transition-colors"
              >
                Email
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:bg-slate-50 transition-colors"
              >
                LinkedIn
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=I've been using Starting Monday for my executive search — monitors target companies and generates prep briefs in 60 seconds.&url=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:bg-slate-50 transition-colors"
              >
                X / Twitter
              </a>
            </div>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={getLink}
          disabled={loading}
          className="text-[13px] font-semibold text-white bg-slate-900 border-0 rounded px-5 py-2.5 cursor-pointer hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Generating…' : 'Generate my invite link'}
        </button>
      )}
    </div>
  )
}
