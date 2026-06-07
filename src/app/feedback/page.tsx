'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const PROMPT_STARTERS = [
  'Starting Monday helped me focus on the right companies sooner.',
  'The daily cadence made my search more consistent and less reactive.',
  'I felt better prepared for executive conversations each week.',
]

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

  function applyStarter(textValue: string) {
    if (state === 'submitting') return
    setText(textValue)
  }

  const remaining = 1000 - text.length

  return (
    <div className="w-full max-w-2xl">
      <section className="mb-6">
        <h2 className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-500 mb-4">
          Starting Monday Feedback
        </h2>
        {state === 'done' ? (
          <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
            <h1 className="text-[28px] font-bold text-slate-900 mb-2">Thank you.</h1>
            <p className="text-[16px] text-slate-600 leading-relaxed">
              Your feedback is in. We use notes like this to sharpen what we build next.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
            <h1 className="text-[30px] font-bold text-slate-900 mb-3 leading-tight">One sentence is enough.</h1>
            <p className="text-[17px] text-slate-600 leading-relaxed max-w-[58ch]">
              If Starting Monday helped, share one sentence you would feel good sending to another manager or executive in search.
            </p>
            <p className="text-[14px] text-slate-500 mt-3">Clear and honest beats polished.</p>

            <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-2">Quick starter (optional)</h2>
              <div className="flex flex-wrap gap-2">
                {PROMPT_STARTERS.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => applyStarter(starter)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[12px] text-slate-700 hover:border-slate-400 hover:bg-slate-100 transition-colors"
                  >
                    Use this
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-1">How this is used</h2>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                We use short quotes to improve product messaging. We do not publish private details from your account unless you explicitly approve public use.
              </p>
            </section>

            <form onSubmit={handleSubmit} className="mt-5">
              <label htmlFor="feedback-text" className="block text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500 mb-2">
                Your one sentence
              </label>
              <textarea
                id="feedback-text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Starting Monday helped me..."
                rows={5}
                maxLength={1000}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-300/50 resize-none bg-white"
              />

              <div className="flex items-center justify-between mt-2 mb-4">
                <p className="text-[11px] text-slate-500">Stays confidential unless you approve otherwise.</p>
                <p className="text-[11px] text-slate-500">{remaining} chars left</p>
              </div>

              {state === 'error' && (
                <p className="text-[12px] text-red-600 mb-3">Something went wrong. Please try again.</p>
              )}

              <button
                type="submit"
                disabled={!text.trim() || state === 'submitting'}
                className="w-full bg-slate-900 text-white text-[15px] font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {state === 'submitting' ? 'Submitting feedback...' : 'Submit feedback'}
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  )
}

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(120%_140%_at_100%_0%,#dbeafe_0%,#e2e8f0_45%,#f8fafc_100%)] font-sans flex items-center justify-center px-4 py-10">
      <Suspense>
        <FeedbackForm />
      </Suspense>
    </div>
  )
}
