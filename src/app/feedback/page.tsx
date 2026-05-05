'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function FeedbackPage() {
  const searchParams = useSearchParams()
  const inviteCode = searchParams.get('code') ?? ''

  const [text, setText] = useState('')
  const [state, setState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || state === 'submitting') return
    setState('submitting')

    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, invite_code: inviteCode }),
    })

    setState(res.ok ? 'done' : 'error')
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="mb-8">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 mb-4">
            Starting Monday
          </p>
          {state === 'done' ? (
            <>
              <h1 className="text-[22px] font-bold text-slate-900 mb-2">Thank you.</h1>
              <p className="text-[14px] text-slate-500 leading-relaxed">
                That means a lot. Good luck with what comes next.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-[22px] font-bold text-slate-900 mb-2">One sentence.</h1>
              <p className="text-[14px] text-slate-500 leading-relaxed">
                If Starting Monday was useful, write one sentence you would feel comfortable sharing with someone else in search. That is all we are asking for.
              </p>
            </>
          )}
        </div>

        {state !== 'done' && (
          <form onSubmit={handleSubmit}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Starting Monday helped me..."
              rows={4}
              maxLength={1000}
              className="w-full border border-slate-200 rounded px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none mb-4 bg-white"
            />
            {state === 'error' && (
              <p className="text-[12px] text-red-600 mb-3">Something went wrong. Please try again.</p>
            )}
            <button
              type="submit"
              disabled={!text.trim() || state === 'submitting'}
              className="w-full bg-slate-900 text-white text-[13px] font-bold py-3 rounded hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {state === 'submitting' ? 'Sending...' : 'Submit'}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
