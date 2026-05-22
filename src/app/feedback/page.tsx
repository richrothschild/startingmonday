'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function FeedbackForm() {
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
    <div className="w-full max-w-md">
      <section className="mb-8">
        <h2 className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 mb-4">
          Starting Monday
        </h2>
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
      </section>

      {state !== 'done' && (
        <section className="mb-4 rounded border border-slate-200 bg-white/70 p-3">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-1">How this is used</h2>
          <p className="text-[12px] text-slate-500 leading-relaxed">
            We use short quotes to improve product messaging. We do not publish private details from your account.
          </p>
          <p className="text-[12px] text-slate-500 leading-relaxed mt-1">
            Trust and confidentiality: your note stays confidential unless you explicitly approve public use.
          </p>
          <p className="text-[12px] text-slate-500 leading-relaxed mt-1">
            Outcome metric: one sentence each week directly shapes what we ship in the next 7-day sprint.
          </p>
        </section>
      )}

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
            {state === 'submitting' ? 'Sending...' : 'Get started now'}
          </button>
          <p className="text-[11px] text-slate-400 mt-2">CTA: get started now and submit one sentence.</p>
        </form>
      )}
    </div>
  )
}

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-slate-100 font-sans flex items-center justify-center px-4">
      <Suspense>
        <FeedbackForm />
      </Suspense>
    </div>
  )
}
